// utils that require elevated permissions
const getActiveTab = () => {
    return browser.tabs
        .query({
            currentWindow: true,
            active: true,
        })
        .then(tabs => {
            return tabs[0];
        })
        .catch(err => console.error(err));
};

export { getActiveTab }