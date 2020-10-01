// Command palette UI and control for browser action

/* Structure

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
let input;
let taitaIndex = 0;

let commandsChanged = taita.matchedCommands.changed();

// generates command palette and logic
async function buildUI() {
    let settings = await importSettings();

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

    kestrel = buildElement('div', '', {
        className: 'kestrel',
    });

    input = buildElement('input', '', {
        type: 'text',
        placeholder: 'Search commands...',
        className: 'kestrel-command-input',
    });

    input.addEventListener('input', updateCommands);
    input.addEventListener('focus', updateCommands);
    input.addEventListener('keydown', listen);

    kestrel.appendChild(input);

    updateCommands();

    showKestrel();

    input.focus();
}

// gets settings
const importSettings = () => {
    return browser.storage.local.get(null);
};

// updates list of commands and corresponding html
let list;
const updateCommands = () => {
    // Updates list of commands, adds event listeners to command elements
    input.focus();
    taita.listen(input.value);
    taitaIndex = 0;
    if (list && commandsChanged) {
        clearCommands();
    } else {
        list = buildElement('div', '', {
            className: 'kestrel-commands-container',
        });

        kestrel.appendChild(list);
    }

    taita.matchedCommands.commands.forEach((item) => {
        // generates html for new (matching) commands
        let commandItem = buildElement('p', item, {
            className: 'kestrel-command-item',
        });

        commandItem.addEventListener('click', () => {
            // executes specified command if clicked
            let c = taita.execute(commandItem.innerText, cmdFunctions);
            if (c != false || (c && !c.then)) sendFnEvent({ inject: taita._commandContains(commandItem.innerText) });
            updateCommands();
        });

        commandItem.addEventListener('mouseover', () => {
            // adds focus class
            Object.values(list.children).forEach((child) => child.classList.remove('kestrel-command-item-focused'));
            commandItem.classList.add('kestrel-command-item-focused');

            taitaIndex = Object.values(list.children).findIndex((child) =>
                child.classList.contains('kestrel-command-item-focused')
            );
        });

        list.appendChild(commandItem);
    });

    if (list.firstChild) {
        list.firstChild.classList.add('kestrel-command-item-focused');
    }
};

// updates command list html
function listen(event) {
    if (event.keyCode == 13 && list) {
        Object.values(list.children).forEach((child) => {
            if (child.classList.contains('kestrel-command-item-focused')) {
                let c = taita.execute(child.innerText, cmdFunctions);
                if (c != false || (c && !c.then)) sendFnEvent({ inject: taita._commandContains(child.innerText) });
            }
        });
        input.value = '';
        updateCommands();
    } else if (event.keyCode == 38) {
        // up arrow key
        Object.values(list.children).forEach((child) => child.classList.remove('kestrel-command-item-focused'));
        if (taitaIndex <= 0) {
            list.children[list.children.length - 1].classList.add('kestrel-command-item-focused');
            taitaIndex = list.children.length - 1;
            list.scrollTo(0, list.clientHeight);
        } else {
            taitaIndex -= 1;
            list.children[taitaIndex].classList.add('kestrel-command-item-focused');
            list.scrollTo(0, parseInt(getComputedStyle(list.children[taitaIndex]).height) * taitaIndex);
        }
    } else if (event.keyCode == 40) {
        // down arrow key
        Object.values(list.children).forEach((child) => child.classList.remove('kestrel-command-item-focused'));
        if (taitaIndex >= list.children.length - 1) {
            list.children[0].classList.add('kestrel-command-item-focused');
            taitaIndex = 0;
            list.scrollTo(0, 0);
        } else {
            taitaIndex += 1;
            list.children[taitaIndex].classList.add('kestrel-command-item-focused');
            list.scrollTo(0, parseInt(getComputedStyle(list.children[taitaIndex]).height) * taitaIndex);
        }
    }
}

// sends a message to the background script
// this is for commands that require an API that can only be accessed in a background script
const sendFnEvent = (msg) => {
    return browser.runtime.sendMessage(msg);
};

// hides kestrel ui
const hideKestrel = () => {
    list.classList.add('kestrel-hidden');
};

// shows kestrel ui
const showKestrel = () => {
    document.body.insertBefore(kestrel, document.body.firstChild);
    list.classList.remove('kestrel-hidden');
};

// removes all command html
function clearCommands() {
    if (list) {
        Object.values(list.children).forEach((child) => child.remove());
    }
}

buildUI();

export { sendFnEvent, kestrel, hideKestrel, showKestrel, input, list, listen, updateCommands };
