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

const cpal = new CommandPal();
let commandsChanged = cpal.matchedCommands.changed();

let port;

function buildUI() {
	kestrel = buildElement('div', '', {
		'className': 'kestrel'
	});

	document.body.insertBefore(kestrel, document.body.firstChild);

	commandInp = buildElement('input', '', {
		'type': 'text',
		'placeholder': 'Search Kestrel commands...',
		'className': 'kestrel-command-input'
	});

	commandInp.addEventListener('input', () => {
		cpal.listen(commandInp.value);
		updateCommands();
	});

	commandInp.addEventListener('focus', () => {
		cpal.listen(commandInp.value);
		updateCommands();
	});

	commandInp.addEventListener('keydown', event => {
		if (event.keyCode == 13 && commandList) {
			Object.values(commandList.children).forEach(child => {
				if (child.classList.contains('kestrel-command-item-focused')) {
					let callback = cpal.execute(child.innerText);
					cmdFunctions[callback]();
				}
			});
			commandInp.value = '';
			cpal.listen('');
			updateCommands();
		} else if (event.keyCode == 38) {
			if (commandIndex <= 0) { return }
			commandList.children[commandIndex].classList.remove('kestrel-command-item-focused');
			commandIndex -= 1;
			commandList.children[commandIndex].classList.add('kestrel-command-item-focused');
		} else if (event.keyCode == 40) {
			if (commandIndex >= commandList.children.length - 1) { return }
			commandList.children[commandIndex].classList.remove('kestrel-command-item-focused');
			commandIndex += 1;
			commandList.children[commandIndex].classList.add('kestrel-command-item-focused');
		};
	});

	kestrel.appendChild(commandInp);

	commandInp.focus();
}

let commandList;
const updateCommands = () => {
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

		commandList.appendChild(commandItem);
	});

	commandList.firstChild.classList.add('kestrel-command-item-focused');
}

const clearCommands = () => { if (commandList) { Object.values(commandList.children).forEach(child => child.remove()) } }

buildUI();

// Command Callbacks

let cmdFunctions = {
	openSettings: function() {
		return 'e'
		browser.tabs.create({
			active: true,
			url: 'https://google.com'
		}).catch(err => console.error(err));
	},

	togleMiniMap: function() {
		alert('e')
	}
}

