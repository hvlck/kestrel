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
		settings = data.automatic;

		if (settings) {
			Object.entries(data.automatic).filter(item => item[1] == true).forEach(fn => {
				browser.runtime.sendMessage({
					automatic: true,
					fn: fn[0],
				});
			});
		}
	});
}
