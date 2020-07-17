// Command palette UI and control

/* OVERVIEW OF HTML STRUCTURE

All class names begin with kestrel- to prevent conflict with existing class names.
This may be rendered moot by changing the type of stylesheet injection in the /background/main.js file
See CSSOrigin property in https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/insertCSS for more information.

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

let kestrel;
let commandInp;
let commandIndex = 0;

// taita instance
const cpal = new Taita(commands, {
	sort: 'alphabetical'
});

let commandsChanged = cpal.matchedCommands.changed();

let port;

// generates command palette and logic
function buildUI() {
	importSettings().then(data => {
		settings = data;

		Object.entries(settings.commands).forEach(item => {
			if (item[1].on === false) {
				cpal.removeCommands(item[0])
			}
		});

		updateCommands();
	});

	kestrel = buildElement('div', '', {
		'className': 'kestrel kestrel-hidden'
	});

	commandInp = buildElement('input', '', {
		'type': 'text',
		'placeholder': 'Search Kestrel commands...',
		'className': 'kestrel-command-input'
	});

	commandInp.addEventListener('input', updateCommands);

	commandInp.addEventListener('focus', updateCommands);

	commandInp.addEventListener('keydown', listen);

	connectPort();

	kestrel.appendChild(commandInp);
	showKestrel()

	commandInp.focus();
}

// gets settings
const importSettings = async () => {
	return await browser.storage.local.get(null);
}

// updates list of commands and corresponding html
let commandList;
const updateCommands = () => { // Updates list of commands, adds event listeners to command elements
	commandInp.focus();
	cpal.listen(commandInp.value);
	commandIndex = 0;
	if (commandList && commandsChanged) {
		clearCommands();
	} else {
		commandList = buildElement('div', '', {
			'className': 'kestrel-commands-container'
		});

		kestrel.appendChild(commandList);
	}

	cpal.matchedCommands.commands.forEach(item => {
		let commandItem = buildElement('p', item, {
			'className': 'kestrel-command-item'
		});

		commandItem.addEventListener('click', () => {
			cpal.execute(commandItem.innerText, cmdFunctions);
		});

		commandItem.addEventListener('mouseover', () => {
			Object.values(commandList.children).forEach(child => child.classList.remove('kestrel-command-item-focused'));
			commandItem.classList.add('kestrel-command-item-focused');
		})

		commandList.appendChild(commandItem);
	});

	if (commandList.firstChild) { commandList.firstChild.classList.add('kestrel-command-item-focused') };
}

// updates command list html
function listen(event) {
	if (event.keyCode == 13 && commandList) {
		Object.values(commandList.children).forEach(child => {
			if (child.classList.contains('kestrel-command-item-focused')) {
				cpal.execute(child.innerText, cmdFunctions);
			}
		});
		commandInp.value = '';
		updateCommands();
	} else if (event.keyCode == 38) { // up arrow key
		Object.values(commandList.children).forEach(child => child.classList.remove('kestrel-command-item-focused'));
		if (commandIndex <= 0) {
			commandList.children[commandList.children.length - 1].classList.add('kestrel-command-item-focused')
			commandIndex = commandList.children.length - 1;
			commandList.scrollTo(0, commandList.clientHeight);
		} else {
			commandIndex -= 1;
			commandList.children[commandIndex].classList.add('kestrel-command-item-focused');
			commandList.scrollTo(0, parseInt(getComputedStyle(commandList.children[commandIndex]).height) * commandIndex);
		}
	} else if (event.keyCode == 40) { // down arrow key
		Object.values(commandList.children).forEach(child => child.classList.remove('kestrel-command-item-focused'));
		if (commandIndex >= commandList.children.length - 1) {
			commandList.children[0].classList.add('kestrel-command-item-focused')
			commandIndex = 0;
			commandList.scrollTo(0, 0);
		} else {
			commandIndex += 1;
			commandList.children[commandIndex].classList.add('kestrel-command-item-focused');
			commandList.scrollTo(0, parseInt(getComputedStyle(commandList.children[commandIndex]).height) * commandIndex);
		}
	};
}

const connectPort = () => {
	port = browser.runtime.connect({ // Establish initial connection to background script (background/main.js)
		name: 'kestrel'
	});

	port.onMessage.addListener(msg => { // Messages from background script
		if (msg.kestrel == 'connection-success') {

		} else if (msg.kestrel == 'hide') {
			hideKestrel();
		} else if (msg.kestrel == 'show') {
			connectPort();
			showKestrel();
			commandInp.focus();
		}
	});

	port.onDisconnect.addListener(msg => {
		port = null;
	});
}

let messager;

// sends a message to the background script
// this is for commands that require an API that can only be accessed in a background script
const sendFnEvent = (msg) => {
	return browser.runtime.sendMessage(msg);
}

// hides kestrel ui
const hideKestrel = () => {
	kestrel.classList.add('kestrel-hidden');
	kestrel.remove();
}

// shows kestrel ui
const showKestrel = () => {
	document.body.insertBefore(kestrel, document.body.firstChild);
	kestrel.classList.remove('kestrel-hidden')
};

// removes all command html
function clearCommands() { if (commandList) { Object.values(commandList.children).forEach(child => child.remove()) } }

buildUI();
