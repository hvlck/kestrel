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
		name: "Page Minimap",
		description: "Automatically insert a page minimap.",
		type: "bool"
	}
]

const build = () => {
	settings.forEach(item => {
		let div = buildElement('div', '', {
			className: 'settings-item-container'
		});

		let title = buildElement('h3', item.name, {
			className: 'settings-item-header'
		});

		div.appendChild(title);

		let description = buildElement('p', item.description, {
			className: 'settings-item-description'
		});

		div.appendChild(description);

		if (item.type == 'select') {
			let select = buildElement('select', '', {
				className: 'settings-item-select'
			})
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
		}

		main.appendChild(div);
	});
}

build();

function updateSettings(key, value) {
	key = key.toLowerCase().replace(' ', '-');
	value = value.toLowerCase().replace(' ', '-');
	browser.storage.local.set({ key: value }).catch(err => { return err });
}