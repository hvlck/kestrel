browser.commands.onCommand.addListener(command => {
    if (command === 'activate') {
        browser.tabs.executeScript({
            file: '../contentscripts/ui.js'
        });
        browser.tabs.insertCSS({
            cssOrigin: "author",
            file: "../contentscripts/ui.css"
        })
    }
});