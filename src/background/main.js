// primary background script

// organisation wrapper for meta-information
const meta = {
    runtimes: {
        loader: 'document_start',
        minimap: 'document_idle',
        linksInSameTab: 'document_end',
    },
};

// can't use es6 modules in background scripts without specifiying an (unneccessary) background page
// these functions are contained within utils for organisation
const utils = {
    // hides the page action (url bar)
    hidePageAction: () => {
        browser.tabs.query({}).then((tabs) => {
            tabs.forEach((item) => {
                browser.pageAction.hide(item.id);
            });
        });
    },

    // shows the page action (url bar)
    showPageAction: () => {
        browser.tabs.query({}).then((tabs) => {
            tabs.forEach((item) => {
                browser.pageAction.show(item.id);
            });
        });
    },

    // injects a script into the active tab
    injectScript: (script) => {
        return browser.tabs.executeScript({ file: script });
    },

    // injects stylesheet into  current tab
    injectStylesheet: (sheet) => {
        if (!sheet || injections[sheet]) {
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
        return browser.storage.local.get(null).catch((err) => console.error(`Failed to load settings: ${err}`));
    },
};

// opens settings page once user has installed extension
browser.runtime.onInstalled.addListener(() => {
    browser.runtime.openOptionsPage();
    browser.runtime.setUninstallURL('https://ethanjustice.github.io/kestrel/meta/uninstall');
});

// fires when browser starts up
browser.runtime.onStartup.addListener(async () => {
    let s = await utils.getSettings();
    if (s.browseraction == true) {
        showPageAction();
    }
});

// opens page action
browser.commands.onCommand.addListener(async (command) => {
    if (command == 'open_kestrel_page_action') {
        browser.pageAction.openPopup();
    }
});

// storage
let settings;

// keeps track of injected stylesheets [note: NEEDS TO BE SCOPED TO EACH ACTIVE TAB]
let injections = [];

// registered userscripts
let registeredScripts = {};

// updates all active userscripts from user settings (browser.storage api)
async function updateUserScripts() {
    let settings = await utils.getSettings();

    Object.entries(settings.automatic).forEach((item) => {
        if (item[1] == true) {
            browser.userScripts
                .register({
                    js: [
                        {
                            file: `../cs/automatic/${item[0]}.js`,
                        },
                    ],
                    matches: ['file://*/*', 'https://*/*', 'http://*/*'],
                    runAt: meta.runtimes[item[0]],
                    scriptMetadata: { name: item[0] },
                })
                .then((data) => {
                    registeredScripts[item[0]] = data;
                });
        } else if (item[1] == false && registeredScripts[item[0]]) {
            registeredScripts[item[0]].unregister();
        }
    });
}

// executes functions that require background script apis
browser.runtime.onMessage.addListener((msg, sender, response) => {
    if (sender.id.startsWith(browser.runtime.id) !== true) {
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
    } else if (msg.automatic) {
        browser.tabs
            .executeScript({
                file: `../cs/automatic/${msg.fn}.js`,
                runAt: msg.runAt,
            })
            .catch((err) => console.error(`Failed to inject script: ${err}`));
    } else if (msg.settings) {
        if (msg.settings == 'get-manifest') {
            return new Promise((resolve) => resolve(browser.runtime.getManifest()));
        } else if (msg.settings == 'unregister-all') {
            Object.values(registeredScripts).forEach((item) => {
                item.unregister();
            });

            registeredScripts = {};
        } else if (msg.settings == 'update-settings') {
            updateUserScripts();
        } else if (msg.settings == 'popup-true') {
            utils.showPageAction();
        } else if (msg.settings == 'popup-false') {
            utils.hidePageAction();
        }
    } else if (msg.inject) {
        utils.injectScript(`injections/${msg.inject}.js`);
    }
});
