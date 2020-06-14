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
