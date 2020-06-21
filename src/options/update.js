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
		options: commands,//browser.storage.local.get('commands')
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
			id: `${item.type == 'divider' ? item.name.toLowerCase() : '' }`
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

			let head = buildElement('thead');
			let headerRow = buildElement('tr');
			item.headers.forEach(header => {
				let headerCell = buildElement('th', header);
				headerRow.appendChild(headerCell);
			});
			
			head.appendChild(headerRow);

			container.appendChild(head);

			Object.values(item.options).forEach(option => {
				let row = buildElement('tr');

				let toggleCell = buildElement('td');
				let toggle = buildElement('input', '', {
					type: 'checkbox'
				});
				toggleCell.appendChild(toggle);

				let descriptionCell = buildElement('td');
				let description = buildElement('p', option.name.split(':')[0]);
				descriptionCell.appendChild(description);

				row.appendChild(descriptionCell);
				row.appendChild(toggleCell);

				container.appendChild(row);
			});

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

build();

function updateSettings(key, value) {
	key = key.toLowerCase().replace(' ', '-');
	value = value.toLowerCase().replace(' ', '-');
	//browser.storage.local.set({ key: value }).catch(err => { return err });
};

// Special functions

function reset() {
	if (confirm('Are you sure?')) {
		browser.storage.local.clear();
	}
}