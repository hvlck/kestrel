(function () {
	browser.storage.local.get(null).then(data => {
		if (Object.keys(data).length === 0 && !window.location.search) {
			history.replaceState('', document.title, `${window.location}?install=new`);
			initStorage();
		} else {
			history.replaceState('', document.title, window.location.pathname);
		}
	}).then(() => build());
}());

const nav = buildElement('div', '', {
	className: 'nav'
});

const sections = ['Meta', 'Utilities'];

sections.forEach(item => {
	nav.appendChild(buildElement('a', item, {
		href: `#${item.replace(' ', '-').toLowerCase()}`
	}));
})

document.body.appendChild(nav);

const main = buildElement('div', '', {
	className: 'main'
});

document.body.appendChild(main);

const settings = [
	{
		name: "Meta",
		description: "Meta settings",
		type: "divider"
	},
	{
		name: "Default Theme",
		description: "Set the default theme Kestrel uses.",
		type: "select",
		options: [
			"Dark",
			"Light",
			"Operating System Default"
		]
	},
	{
		name: "Utilities",
		description: "Settings for Kestrel utilities",
		type: "divider"
	},
	{
		name: "Page Minimap",
		description: "Automatically insert a page minimap.",
		type: "bool"
	},
	{
		name: "Commands",
		description: "Select commands that you want to use",
		type: "toggle",
		options: browser.storage.local.get('commands'),
		headers: [
			"Name",
			"On/Off"
		]
	},
	{
		name: "Reset settings",
		description: "Reset all settings to default",
		type: "special",
		fn: "reset"
	}
]

const build = () => {
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

		if (item.type == 'select') {
			let select = buildElement('select', '', {
				className: 'settings-item-select'
			});

			item.options.forEach(option => {
				let element = buildElement('option', option, {
					className: 'setting-item-select-option'
				});

				select.appendChild(element);
			});

			select.addEventListener('change', updateSettings(item.name, select.value));

			div.appendChild(select);
		} else if (item.type == 'bool') {
			let select = buildElement('select', '', {
				className: 'settings-item-select'
			});

			let vals = ['True', 'False'];
			vals.forEach(val => {
				let element = buildElement('option', val, {
					className: 'setting-item-select-option'
				});

				select.appendChild(element);
			});

			select.addEventListener('change', updateSettings(item.name, select.value));

			div.appendChild(select);
		} else if (item.type == 'toggle') {
			let container = buildElement('table', '', {
				className: 'settings-item-toggle-container'
			});

			if (typeof item.options == 'object' && item.options.then) {
				item.options.then(data => {
					buildToggle(item, data, container);
				});
			} else { buildToggle(item, container) }


			div.appendChild(container);
		} else if (item.type == 'special') {
			let btn = buildElement('input', '', {
				type: 'reset',
				value: 'Reset settings'
			});

			btn.addEventListener('click', () => window[item.fn]());

			div.appendChild(btn);
		}

		main.appendChild(div);
	});
}

function buildToggle(item, customData, container) {
	let head = buildElement('thead');
	let headerRow = buildElement('tr');
	item.headers.forEach(header => {
		let headerCell = buildElement('th', header);
		headerRow.appendChild(headerCell);
	});

	head.appendChild(headerRow);

	container.appendChild(head);

	Object.values(customData).forEach(option => { // needs to be refactored
		if (Array.isArray(option)) {
			buildToggleHtml(Object.values(option[0]), container, Object.values(customData)[0]);
		} else { buildToggleHtml(Object.values(option), container, Object.values(customData)[0]) }
	});
}

function buildToggleHtml(iter, container, original) {
	iter.forEach((option, index) => {
		let row = buildElement('tr');

		let toggleCell = buildElement('td');

		let toggle = buildElement('input', '', {
			type: 'checkbox',
			checked: option.on,
			data_command: Object.entries(original)[index][0]
		});

		toggle.addEventListener('change', () => {
			updateCommands();
		});

		toggleCell.appendChild(toggle);

		let descriptionCell = buildElement('td');
		let description = buildElement('p', option.name.split(':')[0]);
		descriptionCell.appendChild(description);

		row.appendChild(descriptionCell);
		row.appendChild(toggleCell);

		container.appendChild(row);
	});
}

function updateSettings(key, value) {
	if (key && typeof key !== 'object') key = key.toLowerCase().replace(' ', '_');
	if (value && typeof value !== 'object' && typeof value !== 'boolean') value = value.toLowerCase().replace(' ', '-');

	if (typeof key == 'object') browser.storage.local.set({ [key]: value }).catch(err => { console.error(`Failed to save data: ${err}`) });
	else browser.storage.local.set({ [key]: value }).catch(err => { console.error(`Failed to save data: ${err}`) });
};

// Special functions

function reset() {
	if (confirm('Are you sure?')) {
		browser.storage.local.clear();
		window.location.reload();
	}
}

const updateCommands = () => {
	document.querySelectorAll('input[data-command]').forEach(item => {
		let name = item.dataset.command;
		commands[name] = Object.assign({ on: item.checked }, commands[name]);
	});

	updateSettings('commands', commands);
}

// fresh install

const initStorage = () => {
	Object.keys(commands).forEach(command => {
		commands[command] = Object.assign({ on: true }, commands[command]);
	});
	updateSettings('commands', commands);
}