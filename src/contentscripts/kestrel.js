// Command palette variables
let commands = {
	"openSettings": {
		"name": "Settings",
		"callback": "openSettings"
	},
	"toggleMiniMap": {
		"name": "Toggle Minimap",
		"callback": "toggleMiniMap"
	},
	"toggleEditPage": {
		"name": "Toggle Edit Page",
		"callback": "editPage"
	},
	"disableLinks": {
		"name": "Disable all links",
		"callback": "disableLinks"
	},
	"toggleAnimations": {
		"name": "Toggle animations: off",
		"callback": "toggleAnimations"
	}
};

// Command Callbacks

let cmdFunctions = {
	openSettings: function (ref) {
		sendFnEvent({ fn: 'openSettings' });
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

	disableLinks: function (ref) {
		document.querySelectorAll('a[href]').forEach(item => item.style.pointerEvents = 'none');
	},

	toggleAnimations: function (ref) {
		if (ref.includes('off')) {
			Object.values(document.body.querySelectorAll('*')).forEach(item => {
				if (item.className.includes('kestrel') || item.getAnimations().length == 0) { return }
				else {
					item.getAnimations().forEach(animation =>  animation.pause());
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
