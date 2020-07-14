// opens settings page once user has installed extension
browser.runtime.onInstalled.addListener(() => {
    browser.runtime.openOptionsPage();
    browser.runtime.setUninstallURL("https://ethanjustice.github.io/kestrel/meta/uninstall");
});

/*
    If Kestrel is active already, contains ids of tabs and their injection status

    status[tab.id] {
        injected: bool, // determines if needed scripts are injected, so they aren't injected again
        active: bool // determines if kestrel is shown or not
    }
*/

let status = {};

let settings;

let injections = [];

// Listens for commands
browser.commands.onCommand.addListener(command => {
    let actTab = getActiveTab();

    actTab.then(data => {
        browser.storage.local.get(null).then(userSettings => {
            settings = userSettings;

            if (settings.theme == undefined) settings.theme = 'light';
            if (settings.theme != 'operating-system-default') {
                injectStylesheet(`../themes/${settings.theme}.css`);
            }
        }).catch(err => console.error(`Failed to load settings: ${err}`));

        data = data.id;
        if (!status[data]) {
            status[data] = {
                injected: false,
                active: true
            }
        }

        if (command === 'activate' && !status[data].injected) { // Open UI command
            injectScripts();
            status[data] = {
                injected: true,
                active: true
            }
        } else if (status[data].injected == true && status[data].active == true) {
            removePalette(`../contentscripts/ui.css`);
            if (settings.theme !== 'operating-system-default') {
                removePalette(`../themes/${settings.theme}.css`)
            }
            status[data].active = false;
        } else if (status[data].injected == true && status[data].active == false) {
            sendMessage({ kestrel: 'show' })
            injectStylesheet(`../contentscripts/ui.css`);
            status[data].active = true;
        }
    });
});

// returns the currently active tab
const getActiveTab = () => {
    return browser.tabs.query({
        currentWindow: true, active: true
    }).then(tabs => {
        return tabs[0];
    }).catch(err => console.error(err));
}

// critical js
// injected in order of dependence
// if one fails, kestrel cannot work

// note: needs better error handling
const injectScripts = () => {
    injectStylesheet(`../contentscripts/ui.css`);

    browser.tabs.executeScript({ // Injects main UI script
        file: '../libs/taita.js'
    }).then(() => {
        browser.tabs.executeScript({
            file: '../libs/commands.js'
        });
    }).then(() => {
        browser.tabs.executeScript({ // Injects main UI script
            file: '../contentscripts/kestrel.js'
        });
    }).then(() => {
        browser.tabs.executeScript({
            file: '../libs/utils.js'
        })
    }).then(() => {
        browser.tabs.executeScript({ // Injects main UI script
            file: '../contentscripts/ui.js'
        });
    }).catch(injectScripts).finally(() => { return });
}

// controls injection of needed stylesheets
// for now this is just contentscripts/ui.css
const injectStylesheet = (sheet) => {
    if (!sheet || injections[sheet]) { return }
    injections.push(sheet);
    browser.tabs.insertCSS({ // Injects UI stylesheet
        file: sheet
    }).catch((err) => {
        console.error(`Failed to inject sheet (${sheet}): ${err}`);
        return err;
    });
}

// removes needed stylesheets from page
// scripts cannot be removed
const removePalette = (sheet) => {
    injections.splice(injections.indexOf(sheet), 1);
    browser.tabs.removeCSS({
        file: sheet
    }).catch(err => console.error(`Failed to remove stylesheet: ${err}`))

    if (contentPort) {
        sendMessage({ kestrel: 'hide' });
    }
}

let contentPort;
browser.runtime.onConnect.addListener(port => { // Initial port connection to content script
    contentPort = port;
    sender = port.sender.tab.id;
    status[sender] = {
        active: true,
        injected: true
    }
    if (contentPort) { sendMessage({ kestrel: 'connection-success' }) };
    if (port.name === 'kestrel') {
        port.onMessage.addListener(msg => {

        });
    };

    contentPort.onDisconnect.addListener(msg => { // tab is closed, removes tab status
        status[msg.sender.tab.id] = {
            active: false,
            injected: false
        };
    });
});

// executes functions that require background script apis
browser.runtime.onMessage.addListener((msg, sender, response) => {
    if (msg.fn == 'openSettings') {
        browser.runtime.openOptionsPage().catch(err => console.error(err));
    } else if (msg.injectSheet) {
        injectStylesheet(`../injections/${msg.injectSheet}/index.css`);
    } else if (msg.fn === 'tabs') {
        browser.tabs.query({}).then(tabs => tabs.forEach(tab => browser.tabs.reload(tab.id, msg.args)));
    } else if (msg.automatic) {
        browser.tabs.executeScript({
            file: `../contentscripts/automatic/${msg.fn}.js`,
            runAt: "document_start"
        }).catch(err => console.error(`Failed to inject script: ${err}`));
    }
});

// sends message to currently active page
const sendMessage = (msg) => {
    contentPort.postMessage(msg);
}