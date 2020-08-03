// handles updating storage, some visual (confirm/fail) notifcations, etc.

// checks if this is a fresh install, acts if it is
(function () {
    browser.storage.local
        .get(null)
        .then(data => {
            if (Object.keys(data).length === 0 && !window.location.hash) {
                initStorage().then(() =>
                    window.location.assign("../guide/index.html")
                );
            } else if (window.location.hash == "#reset") {
                history.replaceState(
                    "",
                    "Kestrel | Settings",
                    window.location.href.split(window.location.hash)[0]
                );
                initStorage().then(() => window.location.reload());
            } else {
                browser.storage.local
                    .get("theme")
                    .then(theme => toggleTheme(theme.theme));
            }
        })
        .then(() => build());
})();

// updates settings
function updateSettings(key, value, original) {
    let originalKey = original || key;
    if (key && typeof key !== "object")
        key = key
            .replace(new RegExp(" ", "g"), "_")
            .replace(new RegExp("-", "g"), "_")
            .toLowerCase();
    if (value && typeof value !== "object" && typeof value !== "boolean")
        value = value.replace(new RegExp(" ", "g"), "-").toLowerCase();

    return browser.storage.local
        .set({ [key]: value })
        .then(() => {
            success(originalKey);
        })
        .catch(err => {
            failure(originalKey);
            console.error(`Failed to save data: ${err}`);
        });
}

// generates success notification
const success = key => {
    if (document.querySelector(".success")) {
        document.querySelectorAll(".success").forEach(item => item.remove());
    }

    let notification = buildElement("p", `Successfully updated ${key}.`, {
        className: "success",
    });

    document.body.insertBefore(notification, document.body.lastChild);

    setTimeout(() => {
        notification.remove();
    }, 1000);
};

// generates failure notification
const failure = key => {
    if (document.querySelector(".failure")) {
        document.querySelectorAll(".failure").forEach(item => item.remove());
    }

    let notification = buildElement(
        "p",
        `Failed to update ${key}.  Check the console for more details.`,
        {
            className: "failure",
        }
    );

    document.body.insertBefore(notification, document.body.lastChild);

    setTimeout(() => {
        notification.remove();
    }, 1000);
};

// updates all commands in storage, based on all configurable settings
const updateCommands = () => {
    let name;
    document.querySelectorAll("input[data-command]").forEach(item => {
        name = item.dataset.command;
        commands[name] = Object.assign(commands[name], { on: item.checked });
    });

    updateSettings("commands", commands);
};

// updates all automatic functions, in memory and storage
const updateAutomaticFunctions = () => {
    let name;
    document.querySelectorAll("input[data-background]").forEach(item => {
        name = item.dataset.background;
        automaticCommandsList[name] = item.checked;
    });

    updateSettings("automatic", automaticCommandsList, `automatic settings`);
    browser.runtime.sendMessage({
        settings: "update-settings",
    });
};

// updates all automatic task settings
const updateAutomaticSettings = () => {
    let name;
    document.querySelectorAll("input[data-automatic-setting]").forEach(item => {
        if (item.parentElement.classList.contains("checkbox-parent")) {
            name = item.parentElement.parentElement
                .querySelector("h3")
                .innerText.toLowerCase();
        } else {
            name = item.parentElement
                .querySelector("h3")
                .innerText.toLowerCase();
        }

        let key = item.dataset.key;
        let parent = item.dataset.automaticSetting;
        if (item.type == "checkbox") {
            automaticSettings[parent][key] = item.checked;
        } else {
            automaticSettings[parent][key] = item.value;
        }
    });

    updateSettings("automaticsettings", automaticSettings, name);
};

// fresh install

// default settings
const defaults = {
    theme: "operating-system-default",
    automatic: automaticCommandsList,
    automaticsettings: automaticSettings,
};

// creates initial storage data
const initStorage = () => {
    Object.entries(defaults).forEach(item => updateSettings(item[0], item[1]));

    Object.keys(commands).forEach(command => {
        commands[command] = Object.assign({ on: true }, commands[command]);
    });

    return updateSettings("commands", commands);
};

// other

// changes theme
const toggleTheme = data => {
    document
        .querySelectorAll('link[class="custom-theme"]')
        .forEach(item => item.remove());
    data = data.replace(new RegExp(" ", "g"), "-").toLowerCase();
    if (data != "operating-system-default") {
        document.head.appendChild(
            buildElement("link", "", {
                href: `../../libs/themes/${data.toLowerCase()}.css`,
                rel: "stylesheet",
                type: "text/css",
                className: "custom-theme",
            })
        );
    } else if (document.querySelector(`link[href$="../../libs/themes"]`)) {
        document.querySelector(`link[href$="../../libs/themes"]`).remove();
    }
};

// descriptions of automatic functions
const automaticDescriptions = {
    loader: "Enable a loading bar.",
    minimap: "Enable a minimap of a page.",
    linksInSameTab: "Open all links in the same tab.",
};
