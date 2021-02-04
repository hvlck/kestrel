// Command Callbacks
import b from '../libs/utils';
import { kestrel, sendFnEvent, input, hideKestrel, showKestrel, updateCommands, listen } from './ui.js';
import Taita from 'taita';

// command palette commands
export const functions = {
    disableLinks: {
        name: 'Disable all links',
        callback: () => {},
        on: false,
    },
    openInSameTab: {
        name: 'Open all links in the current tab',
        callback: () => {},
    },
    openSettings: {
        name: 'Open settings page',
        callback: function (ref: string) {
            // opens Kestrel's settings/options page
            sendFnEvent({ fn: 'openSettings' });
            return false;
        },
        on: false,
    },
    refreshTabs: {
        name: 'Refresh all tabs: soft',
        callback: function (ref: string) {
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
        aliases: ['Refresh all tabs: hard'],
        on: false,
    },
    scrollToTop: {
        name: 'Scroll to top of the page',
        callback: () => {},
    },
    scrollToBottom: {
        name: 'Scroll to the bottom of the page',
        callback: () => {},
    },
    scrollToMiddle: {
        name: 'Scroll to the middle of the page',
        callback: () => {},
    },
    scrollToOneFourth: {
        name: 'Scroll to 1/4 of the page',
        callback: () => {},
        on: false,
    },
    scrollToThreeFourths: {
        name: 'Scroll to 3/4 of the page',
        callback: () => {},
        on: false,
    },
    search: {
        name: 'Search',
        callback: function (ref: string, input: HTMLElement) {
            hideKestrel();

            input.setAttribute('placeholder', 'Search...');
            input.removeEventListener('keydown', listen);

            const search = async (event) => {
                return;
                if (event.keyCode == 13 && input.value) {
                    let kql = new KestrelQuery(input.value);
                    let container = b(ElementTag.Div);
                    KestrelQuery.parse(kql.query);
                    kestrel.appendChild(container);
                }
            };

            input.addEventListener('keydown', search);

            return false;
        },
        on: true,
    },
    toggleAnimations: {
        name: 'Toggle animations: off',
        callback: () => {},
    },
    toggleEditPage: {
        name: 'Toggle page editing',
        callback: () => {},
        on: false,
    },
    toggleMedia: {
        name: 'Toggle media',
        callback: () => {},
    },
    toggleVideo: {
        name: 'Toggle video',
        callback: () => {},
    },
    toggleImages: {
        name: 'Toggle images',
        callback: () => {},
    },
    toggleMiniMap: {
        name: 'Toggle minimap',
        callback: function (ref: string) {
            if (this.injectedMiniMap == false) {
                sendFnEvent({ injectSheet: 'minimap' });
                this.injectedMiniMap = true;
            }
        },
        on: false,
    },
    togglePageTheme: {
        name: 'Toggle page theme',
        callback: () => {},
        on: false,
    },
};

export const state = {
    injectedMiniMap: false,
};

// taita instance
export const taita = new Taita(functions, {
    sort: 'alphabetical',
});

// command callbacks, not listed in window object for organization and for preventing conflict
// note: explicit returns of false denote that the function doesn't need access to the window (through injections)
let cmdFunctions = {
    // refreshs all tabs

    // toggles a mini-map, similar to VSCode's
    // see https://css-tricks.com/using-the-little-known-css-element-function-to-create-a-minimap-navigator/
    injectedMiniMap: false,
};
