// available settings, converted into html
/*  KEYS

general (required)
    name - header for container encapsulating item
    description - description for encapsulating container
    type - type of item
        divider - section divider, just a header and description
            rule - only for the first divider, because <hr> are pre-appended
        select - dropdown menu (<select> element)
        toggle - table of toggles (checkboxes)
            headers - array of headers for the table (should only be two)
        text - text input (<input type="text" /> element)
            dependsOnKey - object that it depends on to be enabled (this and dependsOn are backwards)
            dependsOn - key that it depends on to be enabled
            keyName - name of key to save
            setting - setting object to update
            placeholder - placeholder attribute
            matches - regex string, pattern attribute
            matchDescription - visual explanation of what the value of the input should be
            min/max-Length - min/max-Length (camelCase) attributes
            default - self-explanatory
            callback - self-explanatory
        special - special cases
    default - default values
    options - available options
    
*/
const settings = [
    {
        name: "Meta",
        description: "Meta settings for Kestrel",
        type: "divider",
        rule: false,
    },
    {
        name: "Theme",
        description: "Set the theme Kestrel uses.",
        type: "select",
        options: ["Dark", "Light", "Operating System Default"],
        default: browser.storage.local.get("theme"),
    },
    {
        name: "Export Config",
        description: "Export your Kestrel configuration",
        type: "special",
        fn: "downloadConfig",
    },
    {
        name: "Import Config",
        description: "Import a Kestrel configuration",
        type: "file",
        fn: "uploadConfig",
    },
    {
        name: "Commands",
        description:
            "Settings for the commands that are shown within the command palette",
        type: "divider",
    },
    {
        name: "Commands",
        description: "Select commands that you want to use.",
        type: "toggle",
        options: browser.storage.local.get("commands"),
        headers: ["Name", "On/Off"],
    },
    {
        name: "Background Tasks",
        description:
            "Settings for background tasks that are run automatically once a page loads.",
        type: "divider",
    },
    {
        name: "Background",
        description: "Select background tasks that you want to use.",
        type: "toggle",
        options: browser.storage.local.get("automatic"),
        headers: ["Name", "On/Off"],
    },
    {
        name: "Loader Bar Colour",
        description:
            "Customise the loader bar's colour.  Note: this may not work on all websites.  See the Reference for more.",
        type: "text",

        dependsOnKey: "automatic",
        dependsOn: "loader",
        keyName: "colour",
        setting: "automaticsettings",

        placeholder: "#",

        matches: "^#\\S{6}",
        matchDescription:
            "Enter a valid <a href='https://en.wikipedia.org/wiki/Web_colors'>HEX</a> colour code, consisting of 6 characters and starting with a '#.'  If you need assistance choosing a colour, <a href='https://github.com/EthanJustice/links#designcolours'>this</a> is a list of websites that can help.",
        min: 7,
        max: 7,

        default: "#16c581",
        callback: "setColour",
    },
    {
        name: "Loader Bar Height",
        description:
            "Customise the loader bar's height.  Note: this may not work on all websites.  See the Reference for more.",
        type: "number",

        dependsOnKey: "automatic",
        dependsOn: "loader",
        keyName: "height",
        setting: "automaticsettings",

        placeholder: "2",

        min: 1,
        max: 20,

        matchDescription:
            "Enter a length (in pixels) between 1 and 20.  The unit is not needed, so just a number will suffice.",

        default: "2",
    },
    {
        name: "Loader Bar Persistence",
        description:
            "Decides whether the loader is removed from view after it's finished.  If it is checked, it will stay; if not, it will be removed.  Note: this may not work on all websites.  See the Reference for more.",
        type: "single-toggle",

        dependsOnKey: "automatic",
        dependsOn: "loader",
        keyName: "persist",
        setting: "automaticsettings",

        default: false,
    },
    {
        name: "Minimap Colour",
        description: "Sets the minimap's overlay colour",
        type: "text",

        dependsOnKey: "automatic",
        dependsOn: "minimap",
        keyName: "colour",
        setting: "automaticsettings",

        placeholder: "#",

        matches: "^#\\S{6}",
        matchDescription:
            "Enter a valid <a href='https://en.wikipedia.org/wiki/Web_colors'>HEX</a> colour code, consisting of 6 characters and starting with a '#.'  If you need assistance choosing a colour, <a href='https://github.com/EthanJustice/links#designcolours'>this</a> is a list of websites that can help.",
        min: 7,
        max: 7,

        default: "#16c581",
        callback: "setColour",
    },
    {
        name: "Danger Zone",
        description: "Exercise caution here.",
        type: "divider",
    },
    {
        name: "Reset settings",
        description: "Reset all settings to default",
        type: "special",
        fn: "reset",
    },
];

// Special functions

// generates storage reset confirmation
function reset() {
    document
        .querySelector(`input[value="Reset settings"]`)
        .setAttribute("disabled", "true");

    let container = buildElement("nav", "", { className: "confirm-reset" });

    let confirmBtn = buildElement("input", "", {
        type: "button",
        value: "Confirm",
    });

    confirmBtn.addEventListener("click", () => resetAll());

    let cancelBtn = buildElement("input", "", {
        type: "button",
        value: "Cancel",
    });

    cancelBtn.addEventListener("click", () => {
        container.remove();
        document
            .querySelector(`input[value="Reset settings"]`)
            .removeAttribute("disabled");
    });

    container.appendChild(cancelBtn);
    container.appendChild(confirmBtn);

    document
        .querySelector(`input[value="Reset settings"]`)
        .parentElement.appendChild(container);
}

// resets all storage, and initializes it again with default values
function resetAll() {
    browser.storage.local.clear().then(() => {
        browser.runtime.sendMessage({ settings: "unregister-all" }).then(() => {
            history.replaceState(
                "",
                "Kestrel | Settings",
                `${window.location.href}#reset`
            );
            window.location.reload();
        });
    });
}

// download kestrel config as a .json file
function downloadConfig() {
    browser.storage.local.get(null).then(data => {
        let link = buildElement("a", "", {
            className: "hidden",
            href: `data:octet/stream;charset=utf-8,${encodeURIComponent(
                JSON.stringify(data)
            )}`,
            download: `kestrel` + `.json`,
        });

        document.body.appendChild(link);
        link.click();
        link.remove();
    });
}

function uploadConfig(data) {
    data.files[0]
        .text()
        .then(data => {
            browser.storage.local
                .clear()
                .then(() => {
                    browser.runtime
                        .sendMessage({
                            settings: "unregister-all",
                        })
                        .then(() => {
                            browser.storage.local
                                .set(JSON.parse(data))
                                .then(() => {
                                    history.replaceState(
                                        "",
                                        "Kestrel | Settings",
                                        `${window.location.href}#reset`
                                    );
                                    window.location.reload();
                                })
                                .catch(err => {
                                    console.error(err);
                                    failure(`Failed to upload config.`);
                                });
                        })
                        .catch(err => {
                            console.error(err);
                            failure(`Failed to upload config.`);
                        });
                })
                .catch(err => {
                    console.error(err);
                    failure(`Failed to upload config.`);
                });
        })
        .catch(err => {
            console.error(err);
            failure(`Failed to upload config.`);
        });
}

function setColour(item) {
    let previous = document.querySelector(
        `span[id="${item.dataset.automaticSetting}-colour-swatch"]`
    );
    if (previous) {
        previous.remove();
    }
    let preview = buildElement("span", "", {
        style: `
			background: ${item.value};
			content: '';
			padding: 5px 10px;
			font-size: 13pt;
			border-bottom: 2px solid ${item.value};
			height: 30px;
			margin: 0 0.5%;
		`,
        id: `${item.dataset.automaticSetting}-colour-swatch`,
    });

    item.insertAdjacentElement("afterend", preview);
}
