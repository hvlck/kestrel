// Command palette UI and control

/* OVERVIEW OF HTML STRUCTURE

All class names begin with kestrel- to prevent conflict with existing class names.

Structure

<body>
	// container
	<div class="kestrel"> // always first child
		<input type="text" class="kestrel-command-input" /> // text field to input commands
		<div class="kestrel-commands-container"> // container for all matched commands; any excess children will be wrapped/scrolled
			// Focused is the command with lighter background; this will be set when a command is hovered
			// or navigated to with arrow keys.  The default is the first command.  There can only be one
			// focused command at a time.
			<p class="kestrel-command-item kestrel-command-item-focused">FOCUSED COMMAND NAME</p>
			<p class="kestrel-command-item">COMMAND NAME</p>
			... // more commands
		</div>
	</div>
</body>
*/

import buildElement from '../libs/utils.js';
import { taita } from '../libs/commands.js';
import { cmdFunctions } from './kestrel.js';

let kestrel;
let commandInp;
let commandIndex = 0;

let commandsChanged = taita.matchedCommands.changed();

let port;

let settings;

// generates command palette and logic
function buildUI() {
    importSettings().then((data) => {
        settings = data;

        if (settings.theme && settings.theme != 'operating-system-default') {
            document.head.appendChild(
                buildElement('link', '', {
                    rel: 'stylesheet',
                    type: 'text/css',
                    href: `../libs/themes/${settings.theme}.css`,
                })
            );
        }

        Object.entries(settings.commands).forEach((item) => {
            if (item[1].on === false) {
                taita.removeCommands(item[0]);
            }
        });

        updateCommands();
    });

    kestrel = buildElement('div', '', {
        className: 'kestrel kestrel-hidden',
    });

    commandInp = buildElement('input', '', {
        type: 'text',
        placeholder: 'Search commands...',
        className: 'kestrel-command-input',
    });

    commandInp.addEventListener('input', updateCommands);

    commandInp.addEventListener('focus', updateCommands);

    commandInp.addEventListener('keydown', listen);

    connectPort();

    kestrel.appendChild(commandInp);
    showKestrel();

    commandInp.focus();
}

// gets settings
const importSettings = () => {
    return browser.storage.local.get(null);
};

// updates list of commands and corresponding html
let commandList;
const updateCommands = () => {
    // Updates list of commands, adds event listeners to command elements
    commandInp.focus();
    taita.listen(commandInp.value);
    commandIndex = 0;
    if (commandList && commandsChanged) {
        clearCommands();
    } else {
        commandList = buildElement('div', '', {
            className: 'kestrel-commands-container',
        });

        kestrel.appendChild(commandList);
    }

    taita.matchedCommands.commands.forEach((item) => {
        let commandItem = buildElement('p', item, {
            className: 'kestrel-command-item',
        });

        commandItem.addEventListener('click', () => {
            let c = taita.execute(commandItem.innerText, cmdFunctions);
            if (c != false) sendFnEvent({ inject: taita._commandContains(commandItem.innerText) });
            updateCommands();
        });

        commandItem.addEventListener('mouseover', () => {
            Object.values(commandList.children).forEach((child) =>
                child.classList.remove('kestrel-command-item-focused')
            );
            commandItem.classList.add('kestrel-command-item-focused');

            commandIndex = Object.values(commandList.children).findIndex((child) =>
                child.classList.contains('kestrel-command-item-focused')
            );
        });

        commandList.appendChild(commandItem);
    });

    if (commandList.firstChild) {
        commandList.firstChild.classList.add('kestrel-command-item-focused');
    }
};

// updates command list html
function listen(event) {
    if (event.keyCode == 13 && commandList) {
        Object.values(commandList.children).forEach((child) => {
            if (child.classList.contains('kestrel-command-item-focused')) {
                let c = taita.execute(child.innerText, cmdFunctions);
                if (c != false) sendFnEvent({ inject: taita._commandContains(child.innerText) });
            }
        });
        commandInp.value = '';
        updateCommands();
    } else if (event.keyCode == 38) {
        // up arrow key
        Object.values(commandList.children).forEach((child) => child.classList.remove('kestrel-command-item-focused'));
        if (commandIndex <= 0) {
            commandList.children[commandList.children.length - 1].classList.add('kestrel-command-item-focused');
            commandIndex = commandList.children.length - 1;
            commandList.scrollTo(0, commandList.clientHeight);
        } else {
            commandIndex -= 1;
            commandList.children[commandIndex].classList.add('kestrel-command-item-focused');
            commandList.scrollTo(
                0,
                parseInt(getComputedStyle(commandList.children[commandIndex]).height) * commandIndex
            );
        }
    } else if (event.keyCode == 40) {
        // down arrow key
        Object.values(commandList.children).forEach((child) => child.classList.remove('kestrel-command-item-focused'));
        if (commandIndex >= commandList.children.length - 1) {
            commandList.children[0].classList.add('kestrel-command-item-focused');
            commandIndex = 0;
            commandList.scrollTo(0, 0);
        } else {
            commandIndex += 1;
            commandList.children[commandIndex].classList.add('kestrel-command-item-focused');
            commandList.scrollTo(
                0,
                parseInt(getComputedStyle(commandList.children[commandIndex]).height) * commandIndex
            );
        }
    }
}

const connectPort = () => {
    port = browser.runtime.connect({
        // Establish initial connection to background script (background/main.js)
        name: 'kestrel',
    });

    port.onMessage.addListener((msg) => {
        // Messages from background script
        if (msg.kestrel == 'hide') {
            hideKestrel();
        } else if (msg.kestrel == 'show') {
            connectPort();
            showKestrel();
            commandInp.focus();
        }
    });

    port.onDisconnect.addListener((msg) => {
        port = null;
    });
};

let messager;

// sends a message to the background script
// this is for commands that require an API that can only be accessed in a background script
const sendFnEvent = (msg) => {
    return browser.runtime.sendMessage(msg);
};

// hides kestrel ui
const hideKestrel = () => {
    kestrel.classList.add('kestrel-hidden');
    kestrel.remove();
};

// shows kestrel ui
const showKestrel = () => {
    document.body.insertBefore(kestrel, document.body.firstChild);
    kestrel.classList.remove('kestrel-hidden');
};

// removes all command html
function clearCommands() {
    if (commandList) {
        Object.values(commandList.children).forEach((child) => child.remove());
    }
}

buildUI();

export { sendFnEvent };
