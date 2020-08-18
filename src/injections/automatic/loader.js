// generates a loading bar
(function () {
    const buildElement = (type, text, attributes) => {
        let element = document.createElement(type);
        element.innerText = text || "";
        if (attributes) {
            Object.keys(attributes).forEach(item => {
                if (item.includes("data_")) {
                    element.setAttribute(
                        item.replace(new RegExp("_", "g"), "-"),
                        attributes[item]
                    );
                } else {
                    element[item] = attributes[item];
                }
            });
        }
        return element;
    };

    GM_getSettings()
        .then(data => {
            build(data);
        })
        .catch(err => console.error(`Failed to build Kestrel loader: ${err}`));

    const build = settings => {
        let lastWidth = 0;
        settings = settings.settings.automaticsettings.loader;

        if (document.querySelector(`#kestrel-loading-bar`)) {
            return;
        }

        let loader = buildElement("div", "", {
            id: `kestrel-loading-bar`,
            style: `
			width: 0;
			height: ${settings.height ? settings.height : "2"}px;

			position: fixed;
			top: 0;
			left: 0;
			background: ${settings.colour ? settings.colour : "#16c581"};
			transition: 300ms linear !important;
			box-shadow: 0px 0px 5px ${settings.colour ? settings.colour : "#16c581"};
			z-index: 999999999;
		`,
        });

        document.addEventListener("readystatechange", () => {
            if (document.readyState == "loading") {
                if (
                    (33 / 100) * document.documentElement.clientWidth <
                    lastWidth
                ) {
                    return;
                }

                if (!document.querySelector(`#kestrel-loading-bar`)) {
                    document.body.appendChild(loader);
                }

                loader.style.display = "";
                loader.style.width = `${
                    (33 / 100) * document.documentElement.clientWidth
                }px`;
                lastWidth = (33 / 100) * document.documentElement.clientWidth;
            } else if (document.readyState == "interactive") {
                if (
                    (50 / 100) * document.documentElement.clientWidth <
                    lastWidth
                ) {
                    return;
                }

                if (!document.querySelector(`#kestrel-loading-bar`)) {
                    document.body.appendChild(loader);
                }

                loader.style.display = "";
                loader.style.width = `${
                    (50 / 100) * document.documentElement.clientWidth
                }px`;
                lastWidth = (50 / 100) * document.documentElement.clientWidth;
            } else if (document.readyState == "complete") {
                if (document.documentElement.clientWidth < lastWidth) {
                    return;
                }

                if (!document.querySelector(`#kestrel-loading-bar`)) {
                    document.body.appendChild(loader);
                }

                loader.style.display = "";
                loader.style.width = `${document.documentElement.clientWidth}px`;
                lastWidth = document.documentElement.clientWidth;
                if (settings.persist == false) {
                    setTimeout(() => {
                        loader.style.display = "none";
                        loader.remove();
                    }, 1000);
                }
            }
        });

        if (
            document.documentElement.clientWidth > lastWidth &&
            parseInt(loader.style.width) == "0" &&
            !document.querySelector(`#kestrel-loading-bar`) &&
            document.readyState == "complete"
        ) {
            document.body.appendChild(loader);

            loader.style.display = "";
            loader.style.width = `${document.documentElement.clientWidth}px`;
            if (settings.persist == false) {
                setTimeout(() => {
                    loader.style.display = "none";
                    loader.remove();
                }, 1000);
            }
        }
    };
})();
