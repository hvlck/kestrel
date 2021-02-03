import { browser } from 'webextension-polyfill-ts';

// utils that require webextension api access

/**
 * utils that require elevated permissions
 */
export const getActiveTab = () => {
    return browser.tabs
        .query({
            currentWindow: true,
            active: true,
        })
        .then((tabs) => {
            return tabs[0];
        })
        .catch((err) => console.error(err));
};

/**
 * injects a script into the current page
 * possibly change file to an enum of approved files
 * @param file The file to inject
 */
export const execute = (file: string) => {
    return browser.tabs.executeScript({
        file: file,
    });
};

/**
 * gets the currently active tab
 */
export const activeTab = () => {
    return browser.tabs.query({
        currentWindow: true,
        active: true,
    });
};
