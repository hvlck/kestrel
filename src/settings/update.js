// checks if this is a fresh install, acts if it is
(function () {
	browser.storage.local.get(null).then(data => {
		if (Object.keys(data).length === 0 && !window.location.search) {
			initStorage().then(() => window.location.assign('../fresh/index.html'));
		} else {
			browser.storage.local.get('theme').then(theme => toggleTheme(theme.theme));
		}
	}).then(() => build());
}());

// nav bar
const nav = buildElement('div', '', {
	className: 'nav'
});

// organization of settings
const sections = ['Meta', 'Utilities'];

sections.forEach(item => {
	nav.appendChild(buildElement('a', item, {
		href: `#${item.replace(' ', '-').toLowerCase()}`
	}));
})

// prevent content flashing
document.body.querySelector('.hidden').appendChild(nav);

// generates setting html
const build = () => {
	const main = buildElement('div', '', {
		className: 'main'
	});

	document.body.querySelector('.hidden').appendChild(main);

	settings.forEach(item => {
		let div = buildElement('div', '', {
			className: 'settings-item-container'
		});

		let title = buildElement(`${item.type == 'divider' ? 'h2' : 'h3'}`, item.name, {
			className: 'settings-item-header',
			id: `${item.type == 'divider' ? item.name.toLowerCase() : ''}`
		});

		div.appendChild(title);

		let description = buildElement('p', item.description, {
			className: 'settings-item-description'
		});

		div.appendChild(description);

		if (item.type == 'select') { // select element
			let select = buildElement('select', '', {
				className: 'settings-item-select'
			});

			item.options.forEach(option => {
				let element = buildElement('option', option, {
					className: 'setting-item-select-option'
				});

				select.appendChild(element);
			});

			item.default.then(data => {
				data = Object.values(data)[0].replace(new RegExp(' ', 'g'), '-').toLowerCase() || 'operating-system-default';

				let matches = Object.values(select.querySelectorAll('option')).filter(child => child.innerText.replace(new RegExp(' ', 'g'), '-').toLowerCase() == data)[0];
				if (matches) matches.setAttribute('selected', 'true');

				toggleTheme(data);
			});

			select.addEventListener('input', () => {
				updateSettings(item.name, select.value);
				toggleTheme(select.value);
			});

			div.appendChild(select);
		} else if (item.type == 'toggle') { // checkbox elements
			let container = buildElement('table', '', {
				className: 'settings-item-toggle-container'
			});

			if (typeof item.options == 'object' && item.options.then) {
				item.options.then(data => {
					buildToggle(item, data, container);
				});
			} else { buildToggle(item, container) }


			div.appendChild(container);
		} else if (item.type == 'special') { // various special resets/buttons
			let btn = buildElement('input', '', {
				type: 'reset',
				value: 'Reset settings'
			});

			btn.addEventListener('click', () => window[item.fn]());

			div.appendChild(btn);
		} else if (item.type == 'text') { // text input
			let text = buildElement('input', '', {
				type: 'text',
				placeholder: item.placeholder,
				maxLength: 7,
				disabled: false,
				value: item.default,
				data_automatic_setting: item.dependsOn
			});

			browser.storage.local.get(item.setting).then(data => { text.value = data[item.setting][item.dependsOn] || item.default });
			browser.storage.local.get(item.dependsOnKey).then(data => { text.disabled = !data[item.dependsOnKey][item.dependsOn] });

			text.addEventListener('input', () => {
				if (text.value.length == 7) {
					updateAutomaticSettings();
				}
			});

			div.appendChild(text);
		}

		main.appendChild(div);
	});

	document.body.querySelector('.hidden').classList.remove('hidden');
}

// toggle type html structure
function buildToggle(item, customData, container) {
	let head = buildElement('thead');
	let headerRow = buildElement('tr');
	item.headers.forEach(header => {
		let headerCell = buildElement('th', header);
		headerRow.appendChild(headerCell);
	});

	head.appendChild(headerRow);

	container.appendChild(head);

	if (item.name == 'Commands') {
		Object.values(customData).forEach(option => { // needs to be refactored
			if (Array.isArray(option)) {
				buildToggleHtml(Object.values(option[0]), container, Object.values(customData)[0], 'commands');
			} else { buildToggleHtml(Object.values(option), container, Object.values(customData)[0], 'commands') }
		});
	} else if (item.name == 'Background') {
		buildToggleHtml(Object.keys(customData.automatic), container, '', 'background');
	}
}

// toggle type content html
function buildToggleHtml(iter, container, original, ref) {
	iter.forEach((option, index) => {
		let row = buildElement('tr');

		let toggleCell = buildElement('td');

		if (ref == 'commands') {
			let toggle = buildElement('input', '', {
				type: 'checkbox',
				checked: option.on,
				data_command: Object.entries(original)[index][0]
			});

			toggle.addEventListener('change', () => {
				updateCommands();
			});

			toggleCell.appendChild(toggle);
		} else if (ref == 'background') {
			browser.storage.local.get('automatic').then(status => {
				status = status.automatic;
				let toggle = buildElement('input', '', {
					type: 'checkbox',
					checked: status[option] || false,
					data_background: Object.keys(automaticCommandsList)[index]
				});

				toggle.addEventListener('change', () => {
					updateAutomaticFunctions();
					document.querySelector(`*[data-automatic-setting="${toggle.dataset.background}"]`).disabled = !toggle.checked;
				});

				toggleCell.appendChild(toggle);
			});
		}

		let descriptionCell = buildElement('td');
		if (ref == 'commands') {
			let description = buildElement('p', option.name.split(':')[0]);
			descriptionCell.appendChild(description);
		} else if (ref == 'background') {
			let description = buildElement('p', automaticDescriptions[option]);
			descriptionCell.appendChild(description);
		}

		row.appendChild(descriptionCell);
		row.appendChild(toggleCell);

		container.appendChild(row);
	});
}

// updates settings
function updateSettings(key, value, original) {
	let originalKey = original || key;
	if (key && typeof key !== 'object') key = key.replace(new RegExp(' ', 'g'), '_').replace(new RegExp('-', 'g'), '_').toLowerCase();
	if (value && typeof value !== 'object' && typeof value !== 'boolean') value = value.replace(new RegExp(' ', 'g'), '-').toLowerCase();

	return browser.storage.local.set({ [key]: value }).then(() => {
		success(originalKey);
	}).catch(err => {
		failure(originalKey);
		console.error(`Failed to save data: ${err}`)
	});
};

// generates success notification
const success = (key) => {
	if (document.querySelector('.success')) { document.querySelectorAll('.success').forEach(item => item.remove()) }

	let notification = buildElement('p', `Successfully updated ${key}.`, {
		className: 'success'
	});

	document.body.insertBefore(notification, document.body.lastChild);

	setTimeout(() => {
		notification.remove();
	}, 1000);
}

// generates failure notification
const failure = (key) => {
	if (document.querySelector('.failure')) { document.querySelectorAll('.failure').forEach(item => item.remove()) }

	let notification = buildElement('p', `Successfully updated ${key}.`, {
		className: 'success'
	});

	document.body.insertBefore(notification, document.body.lastChild);

	setTimeout(() => {
		notification.remove();
	}, 1000);
}

// Special functions

// generates storage reset confirmation
function reset() {
	document.querySelector(`input[value="Reset settings"]`).setAttribute('disabled', 'true');

	let container = buildElement('nav', '', { className: 'confirm-reset' });

	let confirmBtn = buildElement('input', '', {
		'type': 'button',
		'value': 'Confirm'
	});

	confirmBtn.addEventListener('click', () => resetAll());

	let cancelBtn = buildElement('input', '', {
		'type': 'button',
		'value': 'Cancel'
	});

	cancelBtn.addEventListener('click', () => {
		container.remove();
		document.querySelector(`input[value="Reset settings"]`).removeAttribute('disabled');
	});

	container.appendChild(cancelBtn);
	container.appendChild(confirmBtn);

	document.querySelector(`input[value="Reset settings"]`).parentElement.appendChild(container);
}

// resets all storage, and initializes it again with default values
function resetAll() {
	browser.storage.local.clear();
	initStorage().then(() => window.location.reload());
}

// updates all commands in storage, based on all configurable settings
const updateCommands = () => {
	let name;
	document.querySelectorAll('input[data-command]').forEach(item => {
		name = item.dataset.command;
		commands[name] = Object.assign(commands[name], { on: item.checked });
	});

	updateSettings('commands', commands);
}

// updates all automatic functions, in memory and storage
const updateAutomaticFunctions = () => {
	let name;
	document.querySelectorAll('input[data-background]').forEach(item => {
		name = item.dataset.background;
		automaticCommandsList[name] = item.checked;
	});

	updateSettings('automatic', automaticCommandsList, name);
}

// updates all automatic task settings
const updateAutomaticSettings = () => {
	let name;
	document.querySelectorAll('input[data-automatic-setting]').forEach(item => {
		name = item.parentElement.querySelector('h3').innerText.toLowerCase();
		let key = item.dataset.automaticSetting;
		automaticSettings[key] = item.value;
	});

	updateSettings('automaticsettings', automaticSettings, name);
}

// fresh install

// default settings
const defaults = {
	'theme': "operating-system-default",
	'automatic': automaticCommandsList,
	'automaticsettings': automaticSettings
};

// creates initial storage data
const initStorage = () => {
	Object.entries(defaults).forEach(item => updateSettings(item[0], item[1]));

	Object.keys(commands).forEach(command => {
		commands[command] = Object.assign({ on: true }, commands[command]);
	});

	return updateSettings('commands', commands);
}

// other

// changes theme
const toggleTheme = (data) => {
	document.querySelectorAll('link[class="custom-theme"]').forEach(item => item.remove());
	data = data.replace(new RegExp(' ', 'g'), '-').toLowerCase();
	if (data != 'operating-system-default') {
		document.head.appendChild(buildElement('link', '', {
			href: `../themes/${data.toLowerCase()}.css`,
			rel: 'stylesheet',
			type: 'text/css',
			className: 'custom-theme'
		}));
	} else if (document.querySelector(`link[href$="../themes"]`)) {
		document.querySelector(`link[href$="../themes"]`).remove();
	}
}

// descriptions of automatic functions
const automaticDescriptions = {
	'loader': 'Enable a loading bar.'
}