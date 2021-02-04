import { automaticCommandsList, automaticSettings, commands } from '../../libs/commands.js';
import b from '../../libs/utils.js';
import build from './build.js';
import { toggleTheme } from './settings.js';

// handles updating storage, some visual (confirm/fail) notifcations, etc.

// checks if this is a fresh install, acts if it is
(function () {
    browser.storage.local
        .get(null)
        .then((data) => {
            // fresh install
            if (Object.keys(data).length === 0 && !window.location.hash) {
                initStorage().then(() => window.location.assign('../guide/index.html'));
            } else if (window.location.hash == '#reset') {
                // settings being reset
                history.replaceState('', 'Kestrel | Settings', window.location.href.split(window.location.hash)[0]);
                initStorage().then(() => window.location.reload());
            } else {
                browser.storage.local.get(null).then((data) => {
                    browser.runtime.sendMessage({ settings: `popup-${data.browseraction}` });
                    toggleTheme(data.theme);
                });
            }
        })
        .then(() => build());
})();

// updates settings
function updateSettings(key, value, original) {
    let originalKey = original || key;
    if (key && typeof key !== 'object')
        key = key.replace(new RegExp(' ', 'g'), '_').replace(new RegExp('-', 'g'), '_').toLowerCase();
    if (value && typeof value !== 'object' && typeof value !== 'boolean')
        value = value.replace(new RegExp(' ', 'g'), '-').toLowerCase();

    return browser.storage.local
        .set({ [key]: value })
        .then(() => {
            success(originalKey);
        })
        .catch((err) => {
            failure(originalKey);
            console.error(`Failed to save data: ${err}`);
        });
}

// generates success notification
const success = (key) => {
    if (document.querySelector('.success')) {
        document.querySelectorAll('.success').forEach((item) => item.remove());
    }

    let notification = b('p', `Successfully updated ${key}.`, {
        className: 'success',
    });

    document.body.insertBefore(notification, document.body.lastChild);

    setTimeout(() => {
        notification.remove();
    }, 1000);
};

// generates failure notification
const failure = (key) => {
    if (document.querySelector('.failure')) {
        document.querySelectorAll('.failure').forEach((item) => item.remove());
    }

    let notification = b('p', `Failed to update ${key}.  Check the console for more details.`, {
        className: 'failure',
    });

    document.body.insertBefore(notification, document.body.lastChild);

    setTimeout(() => {
        notification.remove();
    }, 1000);
};

// updates all commands in storage, based on all configurable settings
const updateCommands = () => {
    let name;
    document.querySelectorAll('input[data-command]').forEach((item) => {
        name = item.dataset.command;
        commands[name] = Object.assign(commands[name], { on: item.checked });
    });

    updateSettings('commands', commands);
};

// updates all automatic functions, in memory and storage
const updateAutomaticFunctions = () => {
    let name;
    document.querySelectorAll('input[data-background]').forEach((item) => {
        name = item.dataset.background;
        automaticCommandsList[name] = item.checked;
    });

    updateSettings('automatic', automaticCommandsList, `automatic settings`);
    browser.runtime.sendMessage({
        settings: 'update-settings',
    });
};

// fresh install

// default settings
const defaults = {
    theme: 'operating-system-default',
    automatic: automaticCommandsList,
    automaticsettings: automaticSettings,
    browserAction: false,
};

// creates initial storage data
const initStorage = () => {
    Object.entries(defaults).forEach((item) => updateSettings(item[0], item[1]));

    Object.keys(commands).forEach((command) => {
        commands[command] = Object.assign({ on: true }, commands[command]);
    });

    return updateSettings('commands', commands);
};

export { updateAutomaticFunctions, updateCommands, updateSettings };
