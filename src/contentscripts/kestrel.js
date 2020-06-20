// Command Callbacks

let cmdFunctions = {
	disableLinks: function (ref) {
		document.querySelectorAll('a[href]').forEach(item => item.style.pointerEvents = 'none');
	},

	openSettings: function (ref) {
		sendFnEvent({ fn: 'openSettings' });
	},

	refreshTabs: function (ref) {
		if (ref.includes('soft')) {
			sendFnEvent({
				fn: 'tabs',
				args: { bypassCache: false }
			})
		} else if (ref.includes('hard')) {
			sendFnEvent({
				fn: 'tabs',
				args: { bypassCache: true }
			});
		}
	},

	scrollTo: function (ref) {
		if (ref.includes('top')) { window.scrollTo(0, 0) }
		else if (ref.includes('middle')) { window.scrollTo(0, document.body.scrollHeight / 2) }
		else if (ref.includes('bottom')) { window.scrollTo(0, document.body.scrollHeight) }
		else if (ref.includes('1/4')) { window.scrollTo(0, document.body.scrollHeight * 0.25) }
		else if (ref.includes('3/4')) { window.scrollTo(0, document.body.scrollHeight * 0.75) }
	},

	toggleMiniMap: function (ref) {
		if (document.querySelector('div[data-kestrel-mini-map][id="kestrel-mini-map"]')) {
			let container = document.querySelector('div[id="kestrel-mini-map-container"]')
			Object.values(container.children).forEach(item => document.body.appendChild(item));

			container.remove()

			document.querySelector('div[data-kestrel-mini-map][id="kestrel-mini-map"]').remove()
		} else {
			sendFnEvent({ injectSheet: 'minimap' });
			let container = buildElement('div', '', {
				id: "kestrel-mini-map-container"
			});

			Object.values(document.body.children).forEach(item => {
				if (!item.className.includes('kestrel')) { container.appendChild(item) }
			});

			document.body.appendChild(container);

			let minimap = buildElement('div', '', {
				data_kestrel_mini_map: true,
				id: "kestrel-mini-map"
			});

			let selection = buildElement('div', '', {
				id: "kestrel-mini-map-slider"
			});

			minimap.appendChild(selection);

			document.body.appendChild(minimap);
		}
	},

	editPage: function (ref) {
		document.querySelectorAll('body > *').forEach(item => {
			if (item.className.includes('kestrel')) { return }
			else {
				if (item.contentEditable == 'inherit' || item.contentEditable == 'false') { item.contentEditable = 'true' }
				else if (item.contentEditable == 'true') { item.contentEditable = 'false' }
			};
		})
	},

	toggleAnimations: function (ref) {
		if (ref.includes('off')) {
			Object.values(document.body.querySelectorAll('*')).forEach(item => {
				if (item.className.includes('kestrel') || item.getAnimations().length == 0) { return }
				else {
					item.getAnimations().forEach(animation => animation.pause());
				}
			});

			cpal.updateCommand({
				'toggleAnimations': {
					name: "Toggle animations: on",
					callback: "toggleAnimations"
				}
			});
		} else {
			Object.values(document.body.querySelectorAll('*')).forEach(item => {
				if (item.className.includes('kestrel') || item.getAnimations().length == 0) { return }
				item.getAnimations().forEach(animation => animation.play());
			});

			cpal.updateCommand({
				'toggleAnimations': {
					name: "Toggle animations: off",
					callback: "toggleAnimations"
				}
			});
		}
	}
}

// Functions that run automatically
