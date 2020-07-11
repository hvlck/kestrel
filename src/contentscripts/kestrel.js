// Command Callbacks

// command callbacks, not listed in window object for organization and for preventing conflict
let cmdFunctions = {
	// prevents all links from working
	// note: there is no enable links function for a purpose; this command is to stop time wasting
	disableLinks: function (ref) {
		document.querySelectorAll('a[href]').forEach(item => item.style.pointerEvents = 'none');
	},

	// edit page using contentEditable
	editPage: function (ref) {
		document.querySelectorAll('body > *').forEach(item => {
			if (item.className.includes('kestrel')) { return }
			else {
				if (item.contentEditable == 'inherit' || item.contentEditable == 'false') { item.contentEditable = 'true' }
				else if (item.contentEditable == 'true') { item.contentEditable = 'false' }
			};
		})
	},

	// hides images and video
	hideMedia: function (ref) {
		if (ref.includes('media')) { document.querySelectorAll('img,video').forEach(item => item.style.display = 'none') }
		else if (ref.includes('video')) { document.querySelectorAll('video').forEach(item => item.style.display = 'none') }
		else if (ref.includes('image')) { document.querySelectorAll('img').forEach(item => item.style.display = 'none') }
	},

	// opens Kestrel's settings/options page
	openSettings: function (ref) {
		sendFnEvent({ fn: 'openSettings' });
	},

	// opens all links in the same tab
	// note: may be made into an automatic function
	openInSameTab: function (ref) {
		document.body.querySelectorAll('a[href]').forEach(link => link.setAttribute('target', '_self'));
	},

	// refreshs all tabs
	refreshTabs: function (ref) {
		// soft refreshing doesn't bypass cache, hard refreshing does
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

	// scrolls to position based on reference
	scrollTo: function (ref) {
		if (ref.includes('top')) { window.scrollTo(0, 0) }
		else if (ref.includes('middle')) { window.scrollTo(0, document.body.scrollHeight / 2) }
		else if (ref.includes('bottom')) { window.scrollTo(0, document.body.scrollHeight) }
		else if (ref.includes('1/4')) { window.scrollTo(0, document.body.scrollHeight * 0.25) }
		else if (ref.includes('3/4')) { window.scrollTo(0, document.body.scrollHeight * 0.75) }
	},

	// opposite of hideMedia
	showMedia: function (ref) {
		if (ref.includes('media')) { document.querySelectorAll('img,video').forEach(item => item.style.display = '') }
		else if (ref.includes('video')) { document.querySelectorAll('video').forEach(item => item.style.display = '') }
		else if (ref.includes('image')) { document.querySelectorAll('img').forEach(item => item.style.display = '') }
	},

	// disables/enables animations
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
	},

	// note: not completed
	// toggles a mini-map, similar to VSCode's
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
	}
}