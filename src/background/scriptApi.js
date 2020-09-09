// defines an api for interacting with webextension APIs from userscripts
browser.userScripts.onBeforeScript.addListener((script) => {
    script.defineGlobals({
        async GM_getSettings() {
            const request = await browser.storage.local.get('automaticsettings');
            return script.export({
                settings: request,
            });
        },
        async GM_getSiteData(url) {
            return script.export({
                text: await (await fetch(url)).text(),
            });
        },
        async GM_sendMessage(msg) {
            return await browser.runtime.sendMessage(msg);
        },
    });
});
