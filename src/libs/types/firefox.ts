// firefox-only types since webextensions-polyfill-ts is somewhat incomplete

// custom list of registered userscripts
export interface RegisteredUserScriptList {
    [index: string]: RegisteredUserScript;
}

export interface RegisteredUserScript {
    unregister(): void;
}
