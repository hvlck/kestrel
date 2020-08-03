import buildElement from '../../libs/utils.js';

// Special functions

const callbacks = {
    // generates storage reset confirmation
    reset: function () {
        document
            .querySelector(`input[value="Reset settings"]`)
            .setAttribute("disabled", "true");

        let container = buildElement("nav", "", { className: "confirm-reset" });

        let confirmBtn = buildElement("input", "", {
            type: "button",
            value: "Confirm",
        });

        confirmBtn.addEventListener("click", () => this.resetAll());

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
    },

    // resets all storage, and initializes it again with default values
    resetAll: function () {
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
    },

    // download kestrel config as a .json file
    downloadConfig: function () {
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
    },

    // required keys that the config uploaded must have
    required: ["automatic", "automaticsettings", "commands"],
    // validates an uploaded config, and then sets it as the settings
    uploadConfig: function (data) {
        data.files[0]
            .text()
            .then(data => {
                data = JSON.parse(data);
                if (this.required.some(item => !data[item] || Object.keys(data[item]).length == 0) == true) return;
                browser.storage.local
                    .clear()
                    .then(() => {
                        browser.runtime
                            .sendMessage({
                                settings: "unregister-all",
                            })
                            .then(() => {
                                browser.storage.local
                                    .set(data)
                                    .then(() => {
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
    },

    // sets swatches next to inputs that involve colour to their specified colour
    setColour: function (item) {
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
}

export default callbacks;