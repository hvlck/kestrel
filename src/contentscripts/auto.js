// Functions that run automatically
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

let settings;

if (!settings) {
	browser.storage.local.get(null).then(data => {
		settings = data;
	});
}

loader();

function loader() {
	let loader = buildElement('div', '', {
		style: `
			width: 0%;
			height: 2px;

			position: fixed;
			top: 0;
			left: 0;
			background: ${'#16c581' || settings.loader.colour};
			transition: 300ms linear;
			z-index: 999999999;
		`
	});

	window.addEventListener('DOMContentLoaded', () => {
		document.body.appendChild(loader);
		loader.style.display = '';
		loader.style.width = '66%';
	});

	window.addEventListener('load', () => {
		loader.style.display = '';
		loader.style.width = '100%';
		setTimeout(() => {
			loader.style.display = 'none';
		}, 2000);
	});
}