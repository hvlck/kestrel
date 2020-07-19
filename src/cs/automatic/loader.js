// generates a loading bar
(function () {
	const buildElement = (type, text, attributes) => {
		let element = document.createElement(type);
		element.innerText = text || '';
		if (attributes) {
			Object.keys(attributes).forEach(item => {
				if (item.includes('data_')) { element.setAttribute(item.replace(new RegExp('_', 'g'), '-'), attributes[item]) }
				else { element[item] = attributes[item] }
			});
		}
		return element;
	}
	let num = Math.floor(Math.random() * 999999); // prevent page script interaction for the most part
	if (document.querySelector(`kestrel-loading-bar-${num}`)) { return };

	let loader = buildElement('div', '', {
		id: `kestrel-loading-bar-${num}`,
		style: `
			width: 0px;
			height: ${settings.automaticsettings.loader.height ? settings.automaticsettings.loader.height : '2'}px;

			position: fixed;
			top: 0;
			left: 0;
			background: ${settings.automaticsettings.loader.colour ? settings.automaticsettings.loader.colour : '#16c581'};
			transition: 300ms linear !important;
			box-shadow: 0px 0px 5px ${settings.automaticsettings.colour ? settings.automaticsettings.loader.colour : '#16c581'};
			z-index: 999999999;
		`
	});

	document.addEventListener('readystatechange', () => {
		if (document.readyState == 'interactive') {
			if (!document.querySelector(`kestrel-loading-bar-${num}`)) {
				document.body.appendChild(loader);
			}

			loader.style.display = '';
			loader.style.width = `${(50 / 100) * document.body.clientWidth}px`;
		} else if (document.readyState == 'complete') {
			if (!document.querySelector(`kestrel-loading-bar-${num}`)) {
				document.body.appendChild(loader);
			}

			loader.style.display = '';
			loader.style.width = `${document.body.clientWidth}px`;
			if (settings.automaticsettings.loader.persist == false) {
				setTimeout(() => {
					loader.style.display = 'none';
					loader.remove();
				}, 1000);
			}
		}
	});
}());
