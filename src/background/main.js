browser.runtime.onInstalled.addListener(() => {
    browser.runtime.openOptionsPage().catch(err => {

    });
});

// Listens for commands
browser.commands.onCommand.addListener(command => {
    console.log(command) // Remove
    if (command === 'activate') { // Open UI command
        browser.tabs.executeScript({ // Injects main UI script
            file: '../contentscripts/ui.js'
        });

        browser.tabs.insertCSS({ // Injects UI stylesheet
            cssOrigin: "author",
            file: "../contentscripts/ui.css"
        })
    }
});