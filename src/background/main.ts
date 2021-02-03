import { browser } from 'webextension-polyfill-ts';
import { backgroundMetaInformation as meta } from '../libs/constants';
import { RegisteredUserScript, RegisteredUserScriptList } from '../libs/types/firefox';
import { Storage } from '../libs/types/storage';

// primary background script for running the extension

// can't use es6 modules in background scripts without specifiying an (unneccessary) background page
// these functions are contained within utils for organisation
const utils = {
    // hides the page action (url bar)
    hidePageAction: () => {
        browser.tabs.query({}).then((tabs) => {
            tabs.forEach((item) => {
                if (item.id) {
                    browser.pageAction.hide(item.id);
                }
            });
        });
    },

    // shows the page action (url bar)
    showPageAction: () => {
        browser.tabs.query({}).then((tabs) => {
            tabs.forEach((item) => {
                if (item.id) {
                    browser.pageAction.show(item.id);
                }
            });
        });
    },

    // injects a script into the active tab
    injectScript: (script: string) => {
        return browser.tabs.executeScript({ file: script });
    },

    // injects stylesheet into  current tab
    injectStylesheet: (sheet: string) => {
        if (!sheet || injections.indexOf(sheet) != -1) {
            return;
        }
        injections.push(sheet);
        browser.tabs
            .insertCSS({
                file: sheet,
            })
            .catch((err) => {
                console.error(`Failed to inject sheet (${sheet}): ${err}`);
                return err;
            });
    },

    // gets all settings, fills in defaults
    getSettings: () => {
        return browser.storage.local.get(null);
    },
};

// opens settings page once user has installed extension
browser.runtime.onInstalled.addListener(() => {
    utils.hidePageAction();
    browser.runtime.openOptionsPage();
});

// fires when browser starts up
browser.runtime.onStartup.addListener(async () => {
    let s = await utils.getSettings();
    if (s.browseraction == true) {
        utils.showPageAction();
    }
});

// listens for updates to the extension's storage
browser.storage.onChanged.addListener((e) => {
    let items = Object.keys(e);
    if (items.includes('browseraction') && e.browseraction.newValue == true) {
        utils.showPageAction();
    } else if (items.includes('browseraction') && e.browseraction.newValue == false) {
        utils.hidePageAction();
    }
});

// opens page action
browser.commands.onCommand.addListener(async (command) => {
    if (command == 'open_kestrel_page_action') {
        browser.pageAction.openPopup();
    }
});

// storage
let settings = new Storage.StorageManager();

// keeps track of injected stylesheets [note: NEEDS TO BE SCOPED TO EACH ACTIVE TAB]
let injections: string[] = [];

// registered userscripts
let registeredScripts: RegisteredUserScriptList;

// updates all active userscripts from user settings (browser.storage api)
async function updateUserScripts() {
    let settings = await utils.getSettings();

    for (const item in Storage.AutomaticFunctions) {
        if (settings.automatic.enabled.hasOwnFunction(item) == true) {
            // find fix for this
            // @ts-expect-error
            registeredScripts[item] = await browser.userScripts.register({
                js: [
                    {
                        file: `../injections/automatic/${item[0]}.js`,
                    },
                ],
                matches: meta.matches[item[0]] || ['file://*/*', 'https://*/*', 'http://*/*'],
                runAt: meta.runtimes[item[0]],
                scriptMetadata: { name: item[0] },
            });
        } else {
            registeredScripts[item].unregister();
        }
    }
}

// executes functions that require background script apis
browser.runtime.onMessage.addListener((msg, sender) => {
    if (sender.id?.startsWith(browser.runtime.id) !== true) {
        return;
    }

    if (msg.fn) {
        if (msg.fn === 'tabs') {
            browser.tabs.query({}).then((tabs) => tabs.forEach((tab) => browser.tabs.reload(tab.id, msg.args)));
        } else if (msg.fn == 'openSettings') {
            browser.runtime.openOptionsPage().catch((err) => console.error(err));
        }
    } else if (msg.injectSheet) {
        utils.injectStylesheet(`../injections/${msg.injectSheet}/index.css`);
    } else if (msg.inject) {
        utils.injectScript(`injections/commands/${msg.inject}.js`);
    } else if (msg.meta == 'get-manifest') {
        return new Promise((resolve) => resolve(browser.runtime.getManifest()));
    } else if (msg.settings) {
        if (msg.settings == 'update-settings') {
            updateUserScripts();
        } else if (msg.settings == 'unregister-all') {
            Object.values(registeredScripts).forEach((item) => {
                item.unregister();
            });

            registeredScripts = {};
        }
    }
});
