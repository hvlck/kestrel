// primary background script

// utils
const getActiveTab = () => {
    return browser.tabs
        .query({
            currentWindow: true,
            active: true,
        })
        .then(tabs => {
            return tabs[0];
        })
        .catch(err => console.error(err));
};

// opens settings page once user has installed extension
browser.runtime.onInstalled.addListener(() => {
    browser.tabs.query({}).then(tabs => {
        tabs.forEach(item => {
            browser.pageAction.hide(item.id);
        });
    })
    browser.runtime.openOptionsPage();
    browser.runtime.setUninstallURL(
        "https://ethanjustice.github.io/kestrel/meta/uninstall"
    );
});

// opens page action
browser.commands.onCommand.addListener(command => {
    if (command == 'open_kestrel_page_action') {
        browser.pageAction.openPopup()
    }
});


// storage
let settings;

// keeps track of injected stylesheets [note: NEEDS TO BE SCOPED TO EACH ACTIVE TAB]
let injections = [];

// registered userscripts
let registeredScripts = {};

let runtimes = {
    loader: "document_start",
    minimap: "document_idle",
    linksInSameTab: "document_end",
};

// updates all active userscripts from user settings (browser.storage api)
function updateUserScripts() {
    updateSettings().then(() => {
        Object.entries(settings.automatic).forEach(item => {
            if (item[1] == true) {
                browser.userScripts
                    .register({
                        js: [
                            {
                                file: `../cs/automatic/${item[0]}.js`,
                            },
                        ],
                        matches: ["file://*/*", "https://*/*", "http://*/*"],
                        runAt: runtimes[item[0]],
                        scriptMetadata: { name: item[0] },
                    })
                    .then(data => {
                        registeredScripts[item[0]] = data;
                    });
            } else if (item[1] == false && registeredScripts[item[0]]) {
                registeredScripts[item[0]].unregister();
            }
        });
    });
}

const injectScript = (script) => {
    return browser.tabs.executeScript({ file: script })
}

// controls injection of needed stylesheets
// for now this is just cs/ui.css
const injectStylesheet = sheet => {
    if (!sheet || injections[sheet]) {
        return;
    }
    injections.push(sheet);
    browser.tabs
        .insertCSS({
            // Injects UI stylesheet
            file: sheet,
        })
        .catch(err => {
            console.error(`Failed to inject sheet (${sheet}): ${err}`);
            return err;
        });
};

// removes needed stylesheets from page
// scripts cannot be removed
const removePalette = sheet => {
    injections.splice(injections.indexOf(sheet), 1);
    browser.tabs
        .removeCSS({
            file: sheet,
        })
        .catch(err => console.error(`Failed to remove stylesheet: ${err}`));

    if (contentPort) {
        sendMessage({ kestrel: "hide" });
    }
};

// gets all settings, fills in defaults
function updateSettings() {
    return browser.storage.local
        .get(null)
        .then(userSettings => {
            settings = userSettings;

            if (settings.theme == undefined) settings.theme = "light";
            if (settings.theme != "operating-system-default") {
                injectStylesheet(`../../libs/themes/${settings.theme}.css`);
            }
        })
        .catch(err => console.error(`Failed to load settings: ${err}`));
}

// executes functions that require background script apis
browser.runtime.onMessage.addListener((msg, sender, response) => {
    if (sender.id.startsWith(browser.runtime.id) !== true) {
        return;
    }
    if (msg.fn) {
        if (msg.fn === "tabs") {
            browser.tabs
                .query({})
                .then(tabs =>
                    tabs.forEach(tab => browser.tabs.reload(tab.id, msg.args))
                );
        } else if (msg.fn == "openSettings") {
            browser.runtime.openOptionsPage().catch(err => console.error(err));
        }
    } else if (msg.injectSheet) {
        injectStylesheet(`../injections/${msg.injectSheet}/index.css`);
    } else if (msg.automatic) {
        browser.tabs
            .executeScript({
                file: `../cs/automatic/${msg.fn}.js`,
                runAt: msg.runAt,
            })
            .catch(err => console.error(`Failed to inject script: ${err}`));
    } else if (msg.settings) {
        if (msg.settings == "get-manifest") {
            return new Promise(resolve => resolve(browser.runtime.getManifest()));
        } else if (msg.settings == "unregister-all") {
            Object.values(registeredScripts).forEach(item => {
                item.unregister();
            });

            registeredScripts = {};
        } else if (msg.settings == "update-settings") {
            updateUserScripts();
        } else if (msg.settings == 'popup-true') {
            browser.tabs.query({}).then(tabs => {
                tabs.forEach(item => {
                    browser.pageAction.show(item.id);
                });
            });
        } else if (msg.settings == 'popup-false') {
            browser.tabs.query({}).then(tabs => {
                tabs.forEach(item => {
                    browser.pageAction.hide(item.id);
                });
            });
        }
    } else if (msg.inject) {
        injectScript(`injections/${msg.inject}.js`);
    }
});

// sends message to currently active page
const sendMessage = msg => {
    contentPort.postMessage(msg);
};
