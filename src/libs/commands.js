// Command palette variables
const commands = {
	"disableLinks": {
		"name": "Disable all links",
		"callback": "disableLinks",
		"on": false
	},
	"openInSameTab": {
		"name": "Open all links in the current tab",
		"callback": "openInSameTab"
	},
	"openSettings": {
		"name": "Settings",
		"callback": "openSettings",
		"on": false
	},
	"refreshTabs": {
		"name": "Refresh all tabs: soft",
		"callback": "refreshTabs",
		"aliases": [
			"Refresh all tabs: hard"
		]
	},
	"scrollTo": {
		"name": "Scroll to top of the page",
		"callback": "scrollTo",
		"aliases": [
			"Scroll to 1/4 of the page",
			"Scroll to middle of the page",
			"Scroll to 3/4 of the page",
			"Scroll to bottom of the page"
		],
	},
	"toggleAnimations": {
		"name": "Toggle animations: off",
		"callback": "toggleAnimations"
	},
	"toggleEditPage": {
		"name": "Toggle Edit Page",
		"callback": "editPage",
		"on": false
	},
	"toggleMedia": {
		"name": "Toggle media",
		"callback": "toggleMedia",
		"aliases": [
			"Toggle images",
			"Toggle video"
		]
	},
	"toggleMiniMap": {
		"name": "Toggle Minimap",
		"callback": "toggleMiniMap"
	}
};
