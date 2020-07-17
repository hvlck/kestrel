// generates a loading bar
// may use webRequest API in future for a more responsive loader
// see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest
(function () {
	let num = Math.floor(Math.random() * 999999); // prevent page script interaction for the most part
	if (document.querySelector(`kestrel-loading-bar-${num}`)) { return };

	let loader = buildElement('div', '', {
		id: `kestrel-loading-bar-${num}`,
		style: `
			width: 0%;
			height: ${`${settings.automaticsettings.loader.height}px` || '2px'};

			position: fixed;
			top: 0;
			left: 0;
			background: ${settings.automaticsettings.loader.colour || '#16c581'};
			transition: 300ms linear !important;
			z-index: 999999999;
		`
	});

	window.addEventListener('DOMContentLoaded', () => {
		if (!document.querySelector(`kestrel-loading-bar-${num}`)) {
			document.body.appendChild(loader);
		}

		loader.style.display = '';
		loader.style.width = '50%';
	});

	window.addEventListener('load', () => {
		if (!document.querySelector(`kestrel-loading-bar-${num}`)) {
			document.body.appendChild(loader);
		}

		loader.style.display = '';
		loader.style.width = '100%';
		setTimeout(() => {
			loader.style.display = 'none';
			loader.remove();
		}, 1000);
	});
}());
