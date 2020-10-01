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

    saveSession: async (ref) => {
        let tabs = await browser.tabs.query({
            currentWindow: true,
        });

        if (ref.includes('minimal')) {
            let t = [];
            Object.values(tabs).forEach((item) => {
                let tabItem = {};
                Object.keys(item).forEach((key) => {
                    if (key != 'url' && key != 'index') return;
                    tabItem[key] = item[key];
                });
                t.push(tabItem);
            });
            tabs = t;
        }

        return browser.downloads
            .download({
                url: URL.createObjectURL(
                    new Blob([JSON.stringify(tabs)], {
                        type: 'text/json;charset=utf-8',
                    })
                ),
                filename: 'session.json',
            })
            .then(() => {
                return false;
            })
            .catch((err) => {
                console.error(`Failed to download session: ${err}`);
                return false;
            });
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

    setTimer: function (ref) {
        hideKestrel();
        let time;

        input.placeholder = 'For how long?';
        input.pattern = /\d/;
        input.removeEventListener('keydown', listen);

        const addAlarm = async (event) => {
            if (event.keyCode == 13 && input.value) {
                if (!time) {
                    time = await parseAlarm(input.value).catch((e) => console.error(`Failed to parse date: ${e}`));
                    input.value = '';

                    input.pattern = /[a-z]/i;
                    input.placeholder = 'What do you want to name this alarm?';
                } else {
                    browser.alarms.create(input.value, {
                        when: time.getTime(),
                    });

                    input.removeEventListener('keydown', addAlarm);

                    input.value = '';
                    input.placeholder = 'Search commands';
                    input.removeAttribute('pattern');

                    updateCommands();
                    showKestrel();
                    input.focus();
                }
            }
        };

        input.addEventListener('keydown', addAlarm);
        return false;
    },
};

export { cmdFunctions };
