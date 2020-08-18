// utils that require elevated permissions
const getActiveTab = () => {
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

// injects a script into the current page
const execute = (file) => {
    return browser.tabs.executeScript({
        file: file,
    });
};

const activeTab = () => {
    return browser.tabs.query({
        currentWindow: true,
        active: true,
    });
};

export { getActiveTab, execute, activeTab };
