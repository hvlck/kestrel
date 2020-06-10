// Utilities
const buildElement = (type, text, attributes) => {
	let element = document.createElement(type);
	element.innerText = text;
	if (attributes) {
		Object.keys(attributes).forEach(item => {
			if (item.includes('data_')) { element.dataset[item.slice(4)] = attributes[item] }
			else { element[item] = attributes[item] }
		});
	}
	return element;
}

// Command palette UI and control
let kestrel;
let commandInp;
let commandIndex = 0;

const cpal = new CommandPal(commands, {
	'sort': 'alphabetical'
});
let commandsChanged = cpal.matchedCommands.changed();

let port;

function buildUI() {
	kestrel = buildElement('div', '', {
		'className': 'kestrel kestrel-hidden'
	});

	document.body.insertBefore(kestrel, document.body.firstChild);

	commandInp = buildElement('input', '', {
		'type': 'text',
		'placeholder': 'Search Kestrel commands...',
		'className': 'kestrel-command-input'
	});

	commandInp.addEventListener('input', () => {
		updateCommands();
	});

	commandInp.addEventListener('focus', () => {
		updateCommands();
	});

	commandInp.addEventListener('keydown', event => {
		if (event.keyCode == 13 && commandList) {
			Object.values(commandList.children).forEach(child => {
				if (child.classList.contains('kestrel-command-item-focused')) {
					cpal.execute(child.innerText, cmdFunctions);
				}
			});
			commandInp.value = '';
			updateCommands();
		} else if (event.keyCode == 38) {
			Object.values(commandList.children).forEach(child => child.classList.remove('kestrel-command-item-focused'));
			if (commandIndex <= 0) {
				commandList.children[commandList.children.length - 1].classList.add('kestrel-command-item-focused')
				commandIndex = commandList.children.length - 1;
			} else {
				commandIndex -= 1;
				commandList.children[commandIndex].classList.add('kestrel-command-item-focused');				
			}
		} else if (event.keyCode == 40) {
			Object.values(commandList.children).forEach(child => child.classList.remove('kestrel-command-item-focused'));
			if (commandIndex >= commandList.children.length - 1) {
				commandList.children[0].classList.add('kestrel-command-item-focused')
				commandIndex = 0;
			} else {
				commandIndex += 1;
				commandList.children[commandIndex].classList.add('kestrel-command-item-focused');
			}
		};
	});

	connectPort();

	kestrel.appendChild(commandInp);
	kestrel.classList.remove('kestrel-hidden');

	commandInp.focus();
}

let commandList;
const updateCommands = () => {
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

	commandList.firstChild.classList.add('kestrel-command-item-focused');
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
			document.body.insertBefore(kestrel, document.body.firstChild);
			connectPort();
			kestrel.classList.remove('kestrel-hidden');
			commandInp.focus();
		}
	});

	port.onDisconnect.addListener(msg => {
		port = null;
	});
}

const hideKestrel = () => {
	kestrel.remove();
}

const clearCommands = () => { if (commandList) { Object.values(commandList.children).forEach(child => child.remove()) } }

buildUI();

const sendFnEvent = (msg) => {
	port.postMessage(msg);
}
