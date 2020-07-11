browser.runtime.onInstalled.addListener(() => {
    browser.runtime.openOptionsPage();
});

let status = {}; // If Kestrel is active already

// Listens for commands
browser.commands.onCommand.addListener(command => {
    let actTab = getActiveTab();
    actTab.then(data => {
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
            removePalette();
            status[data].active = false;
        } else if (status[data].injected == true && status[data].active == false) {
            sendMessage({ kestrel: 'show' })
            injectStylesheet();
            status[data].active = true;
        }
    });
});

const getActiveTab = () => {
    return browser.tabs.query({
        currentWindow: true, active: true
    }).then(tabs => {
        return tabs[0];
    }).catch(err => console.error(err));
}

const injectScripts = () => {
    injectStylesheet();

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

const injectStylesheet = () => {
    browser.tabs.insertCSS({ // Injects UI stylesheet
        file: "../contentscripts/ui.css"
    }).catch(injectStylesheet).finally(() => { return });
}

const removePalette = () => {
    browser.tabs.removeCSS({
        file: "../contentscripts/ui.css"
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

    contentPort.onDisconnect.addListener(msg => {
        status[msg.sender.tab.id] = {
            active: false,
            injected: false
        };
    });
});

browser.runtime.onMessage.addListener((msg, sender, response) => {
    if (msg.fn == 'openSettings') {
        browser.runtime.openOptionsPage().catch(err => console.error(err));
    } else if (msg.injectSheet) {
        browser.tabs.insertCSS({
            file: `../injections/${msg.injectSheet}/index.css`,
            cssOrigin: "user"
        });
    } else if (msg.fn === 'tabs') {
        browser.tabs.query({}).then(tabs => tabs.forEach(tab => browser.tabs.reload(tab.id, msg.args)));
    }
});

const sendMessage = (msg) => {
    contentPort.postMessage(msg);
}