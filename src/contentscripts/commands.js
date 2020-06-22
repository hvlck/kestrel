// Command palette variables
const commands = {
	"disableLinks": {
		"name": "Disable all links",
		"callback": "disableLinks"
	},
	"hideMedia": {
		"name": "Hide media",
		"callback": "hideMedia",
		"aliases": [
			"Hide images",
			"Hide video"
		]
	},
	"openInSameTab": {
		"name": "Open all links in the current tab",
		"callback": "openInSameTab"
	},
	"openSettings": {
		"name": "Settings",
		"callback": "openSettings"
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
		]
	},
	"showMedia": {
		"name": "Show media",
		"callback": "showMedia",
		"aliases": [
			"Show images",
			"Show video"
		]
	},
	"toggleAnimations": {
		"name": "Toggle animations: off",
		"callback": "toggleAnimations"
	},
	"toggleEditPage": {
		"name": "Toggle Edit Page",
		"callback": "editPage"
	},
	"toggleMiniMap": {
		"name": "Toggle Minimap",
		"callback": "toggleMiniMap"
	}
};
