// Command Callbacks

import { sendFnEvent } from './ui.js';

// command callbacks, not listed in window object for organization and for preventing conflict
// note: explicit returns of false denote that the function doesn't need access to the window (through injections)
let cmdFunctions = {
    // opens Kestrel's settings/options page
    openSettings: function (ref) {
        sendFnEvent({ fn: "openSettings" });
        return false;
    },

    // refreshs all tabs
    refreshTabs: function (ref) {
        // soft refreshing doesn't bypass cache, hard refreshing does
        if (ref.includes("soft")) {
            sendFnEvent({
                fn: "tabs",
                args: { bypassCache: false },
            });
        } else if (ref.includes("hard")) {
            sendFnEvent({
                fn: "tabs",
                args: { bypassCache: true },
            });
        }

        return false;
    },

    // toggles a mini-map, similar to VSCode's
    // see https://css-tricks.com/using-the-little-known-css-element-function-to-create-a-minimap-navigator/
    injectedMiniMap: false,
    toggleMiniMap: function (ref) {
        if (this.injectedMiniMap == false) {
            sendFnEvent({ injectSheet: "minimap" });
            this.injectedMiniMap = true;
        }
    },
};

export default cmdFunctions;