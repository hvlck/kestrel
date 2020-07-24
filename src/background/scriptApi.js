browser.userScripts.onBeforeScript.addListener(script => {
    script.defineGlobals({
        async GM_getSettings() {
            const request = await browser.storage.local.get(
                "automaticsettings"
            );
            return script.export({
                settings: request,
            });
        },
        async GM_sendMessage(msg) {
            return await browser.runtime.sendMessage(msg);
        },
    });
});
