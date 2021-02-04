import { browser } from 'webextension-polyfill-ts';

// defines an api for interacting with webextension APIs from userscripts
// webextensions-polyfill-ts doesn't include definitions for this method at the moment
// @ts-expect-error
browser.userScripts.onBeforeScript.addListener(
    (script: {
        defineGlobals: (arg0: {
            GM_getSettings(): Promise<any>;
            GM_getSiteData(url: string): Promise<any>;
            GM_sendMessage(msg: { [key: string]: string }): Promise<any>;
        }) => void;
        export: (arg0: { settings?: { [s: string]: any }; text?: string }) => any;
    }) => {
        script.defineGlobals({
            async GM_getSettings() {
                const { settings } = await browser.storage.local.get('automatic');
                return script.export({
                    settings,
                });
            },
            async GM_getSiteData(url: string) {
                return script.export({
                    text: await (await fetch(url)).text(),
                });
            },
            async GM_sendMessage(msg: { [key: string]: string }) {
                return await browser.runtime.sendMessage(msg);
            },
        });
    }
);
