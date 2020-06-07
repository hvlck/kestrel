browser.runtime.onInstalled.addListener(() => {
    browser.runtime.openOptionsPage();
});

let active = false; // If Kestrel is active already
// Listens for commands
browser.commands.onCommand.addListener(command => {
    if (command === 'activate' && !active) { // Open UI command
        injectScripts();
    } else {
        removePalette();
    }
});

const injectScripts = () => {
    browser.tabs.executeScript({ // Injects main UI script
        file: '../libs/commandpal.js'
    }).then(() => {
        browser.tabs.executeScript({ // Injects main UI script
            file: '../contentscripts/ui.js'
        });
    }).catch(injectScripts)

    browser.tabs.insertCSS({ // Injects UI stylesheet
        cssOrigin: "author",
        file: "../contentscripts/ui.css"
    })
}

const removePalette = () => {
    browser.tabs.removeCSS({
        file: "../contentscripts/ui.css"
    });

    // Do something with js
}