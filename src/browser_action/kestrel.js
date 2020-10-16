// Command Callbacks
import buildElement from '../libs/utils.js';
import KestrelQuery from '../libs/kql.js';
import { kestrel, sendFnEvent, input, hideKestrel, showKestrel, updateCommands, listen } from './ui.js';

const parseAlarm = (v) => {
    return new Promise((resolve, reject) => {
        if (!v.includes(':')) {
            let d = new Date();
            d.setMinutes(v);
            resolve(d);
        } else if (v.includes(':') && v.split(':').length == 2) {
            let d = new Date();
            resolve(
                new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), v.split(':')[0], v.split(':')[1])
            );
        } else {
            reject(`Invalid user input.`);
        }
    });
};

// command callbacks, not listed in window object for organization and for preventing conflict
// note: explicit returns of false denote that the function doesn't need access to the window (through injections)
let cmdFunctions = {
    // opens Kestrel's settings/options page
    openSettings: function (ref) {
        sendFnEvent({ fn: 'openSettings' });
        return false;
    },

    // refreshs all tabs
    refreshTabs: function (ref) {
        // soft refreshing doesn't bypass cache, hard refreshing does
        if (ref.includes('soft')) {
            sendFnEvent({
                fn: 'tabs',
                args: { bypassCache: false },
            });
        } else if (ref.includes('hard')) {
            sendFnEvent({
                fn: 'tabs',
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
            sendFnEvent({ injectSheet: 'minimap' });
            this.injectedMiniMap = true;
        }
    },

    search: function () {
        hideKestrel();

        input.placeholder = 'Search...';
        input.removeEventListener('keydown', listen);

        const search = async (event) => {
            if (event.keyCode == 13 && input.value) {
                let kql = new KestrelQuery(input.value);
                let container = buildElement('div');
                KestrelQuery.parse(kql.query);
                /*
                .getResults()
                    .forEach((item) => {
                        let result = buildElement('p', item);
                        container.appendChild(result);
                    });
*/
                kestrel.appendChild(container);
            }
        };

        input.addEventListener('keydown', search);

        return false;
    },
};

export { cmdFunctions };
