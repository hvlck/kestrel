browser.runtime.onMessage.addListener((msg, sender) => {
    if (msg.start === true) {
        browser.runtime.sendMessage({ info: `init` });
    }
});
