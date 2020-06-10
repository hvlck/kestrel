browser.runtime.onInstalled.addListener(() => {
    browser.runtime.openOptionsPage();
});

let status = {
    injected: false,
    active: false
}; // If Kestrel is active already

// Listens for commands
browser.commands.onCommand.addListener(command => {
    if (command === 'activate' && !status.injected) { // Open UI command
        injectScripts();
        status = {
            injected: true,
            active: true
        }
    } else if (status.injected == true && status.active == true) {
        removePalette();
        status.active = false;
    } else if (status.injected == true && status.active == false) {
        contentPort.postMessage({ kestrel: 'show' })
        injectStylesheet();
        status.active = true;
    }
});

const injectScripts = () => {
    injectStylesheet();

    browser.tabs.executeScript({ // Injects main UI script
        file: '../libs/commandpal.js'
    }).then(() => {
        browser.tabs.executeScript({ // Injects main UI script
            file: '../contentscripts/kestrel.js'
        });
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
        contentPort.postMessage({ kestrel: 'hide' });
    }
}

let contentPort;
browser.runtime.onConnect.addListener(port => { // Initial port connection to content script
    contentPort = port;
    if (contentPort) { contentPort.postMessage({ kestrel: 'connection-success' }) };
    if (port.name === 'kestrel') {
        port.onMessage.addListener(msg => {
            if (msg.fn == 'openSettings') {
                browser.runtime.openOptionsPage().catch(err => console.error(err));
            } else if (msg.injectSheet) {
                browser.tabs.insertCSS({
                    file: `../injections/${msg.injectSheet}/index.css`
                });
            } else if (msg.kestrel == 'not-injected') {
                status = {
                    active: false,
                    injected: false
                }
            }
        });
    };

    contentPort.onDisconnect.addListener(msg => {
        contentPort = null;
    })
})