// Command palette variables
let commands = {
	"openSettings": {
		"name": "Settings",
		"callback": "openSettings"
	},
	"toggleMiniMap": {
		"name": "Toggle minimap",
		"callback": "toggleMiniMap"
	},
	"toggleEditPage": {
		"name": "Toggle Edit Page",
		"callback": "editPage"
	},
	"disableLinks": {
		"name": "Disable all links",
		"callback": "disableLinks"
	}
};

// Command Callbacks

let cmdFunctions = {
	openSettings: function (ref) {
		sendFnEvent({ fn: 'openSettings' });
	},

	toggleMiniMap: function (ref) {
		sendFnEvent({ injectSheet: 'minimap' })
	},

	editPage: function (ref) {
		document.querySelectorAll('body > *').forEach(item => {
			if (item.className.includes('kestrel')) { return }
			else {
				console.log(item.contentEditable)
				if (item.contentEditable == 'inherit' || item.contentEditable == 'false') { item.contentEditable = 'true' }
				else if (item.contentEditable == 'true') { item.contentEditable = 'false' }
			};
		})
	},

	disableLinks: function (ref) {
		document.querySelectorAll('a[href]').forEach(item => item.style.pointerEvents = 'none');
	}
}

// Functions that run automatically
