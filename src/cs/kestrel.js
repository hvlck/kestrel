// Command Callbacks

// command callbacks, not listed in window object for organization and for preventing conflict
let cmdFunctions = {
    // prevents all links from working
    // note: there is no enable links function for a purpose; this command is to stop time wasting
    disableLinks: function (ref) {
        document
            .querySelectorAll("a[href]")
            .forEach(item => (item.style.pointerEvents = "none"));
    },

    // edit page using contentEditable
    editPage: function (ref) {
        document.querySelectorAll("body > *").forEach(item => {
            if (item.className.includes("kestrel")) {
                return;
            } else {
                if (
                    item.contentEditable == "inherit" ||
                    item.contentEditable == "false"
                ) {
                    item.contentEditable = "true";
                    document.body
                        .querySelectorAll("a[href]")
                        .forEach(item => item.setAttribute("disabled", "true"));
                } else if (item.contentEditable == "true") {
                    item.contentEditable = "false";
                    document.body
                        .querySelectorAll("a[href]")
                        .forEach(item => item.removeAttribute("disabled"));
                }
            }
        });
    },

    // hides/shows images and video
    mediaToggled: false,
    toggleMedia: function (ref) {
        if (!this.mediaToggled) {
            this.mediaToggled = true;

            if (ref.includes("media")) {
                document
                    .querySelectorAll("img,video")
                    .forEach(item => (item.style.display = "none"));
            } else if (ref.includes("video")) {
                document
                    .querySelectorAll("video")
                    .forEach(item => (item.style.display = "none"));
            } else if (ref.includes("image")) {
                document
                    .querySelectorAll("img")
                    .forEach(item => (item.style.display = "none"));
            }
        } else if (this.mediaToggled) {
            this.mediaToggled = false;

            if (ref.includes("media")) {
                document
                    .querySelectorAll("img,video")
                    .forEach(item => (item.style.display = ""));
            } else if (ref.includes("video")) {
                document
                    .querySelectorAll("video")
                    .forEach(item => (item.style.display = ""));
            } else if (ref.includes("image")) {
                document
                    .querySelectorAll("img")
                    .forEach(item => (item.style.display = ""));
            }
        }
    },

    // opens Kestrel's settings/options page
    openSettings: function (ref) {
        sendFnEvent({ fn: "openSettings" });
    },

    // opens all links in the same tab
    openInSameTab: function (ref) {
        document.body
            .querySelectorAll("a[href]")
            .forEach(link => link.setAttribute("target", "_self"));
    },

    // refreshs all tabs
    refreshTabs: function (ref) {
        // soft refreshing doesn't bypass cache, hard refreshing does
        if (ref.includes("soft")) {
            sendFnEvent({
                fn: "tabs",
                args: { bypassCache: false },
            });
        } else if (ref.includes("hard")) {
            sendFnEvent({
                fn: "tabs",
                args: { bypassCache: true },
            });
        }
    },

    // scrolls to position based on reference
    scrollTo: function (ref) {
        if (ref.includes("top")) {
            window.scrollTo(0, 0);
        } else if (ref.includes("middle")) {
            window.scrollTo(0, document.body.scrollHeight / 2);
        } else if (ref.includes("bottom")) {
            window.scrollTo(0, document.body.scrollHeight);
        } else if (ref.includes("1/4")) {
            window.scrollTo(0, document.body.scrollHeight * 0.25);
        } else if (ref.includes("3/4")) {
            window.scrollTo(0, document.body.scrollHeight * 0.75);
        }
    },

    // disables/enables animations
    toggleAnimations: function (ref) {
        if (ref.includes("off")) {
            Object.values(document.body.querySelectorAll("*")).forEach(item => {
                if (
                    item.className.includes("kestrel") ||
                    item.getAnimations().length == 0
                ) {
                    return;
                } else {
                    item.getAnimations().forEach(animation =>
                        animation.pause()
                    );
                }
            });

            cpal.updateCommand({
                toggleAnimations: {
                    name: "Toggle animations: on",
                    callback: "toggleAnimations",
                },
            });
        } else {
            Object.values(document.body.querySelectorAll("*")).forEach(item => {
                if (
                    item.className.includes("kestrel") ||
                    item.getAnimations().length == 0
                ) {
                    return;
                }
                item.getAnimations().forEach(animation => animation.play());
            });

            cpal.updateCommand({
                toggleAnimations: {
                    name: "Toggle animations: off",
                    callback: "toggleAnimations",
                },
            });
        }
    },

    // note: not completed
    // toggles a mini-map, similar to VSCode's
    // see https://css-tricks.com/using-the-little-known-css-element-function-to-create-a-minimap-navigator/
    toggleMiniMap: function (ref) {
        if (
            document.querySelector(
                'div[data-kestrel-mini-map][id="kestrel-mini-map"]'
            )
        ) {
            let container = document.querySelector(
                'div[id="kestrel-mini-map-container"]'
            );
            Object.values(container.children).forEach(item =>
                document.body.appendChild(item)
            );

            container.remove();

            document
                .querySelector(
                    'div[data-kestrel-mini-map][id="kestrel-mini-map"]'
                )
                .remove();
        } else {
            sendFnEvent({ injectSheet: "minimap" });
            let container = buildElement("div", "", {
                id: "kestrel-mini-map-container",
            });

            Object.values(document.body.children).forEach(item => {
                if (!item.className.includes("kestrel")) {
                    container.appendChild(item);
                }
            });

            document.body.appendChild(container);

            let minimap = buildElement("div", "", {
                data_kestrel_mini_map: true,
                id: "kestrel-mini-map",
                class: "kestrel-mini-map",
            });

            let selection = buildElement("input", "", {
                type: "range",
                id: "kestrel-mini-map-slider",
                max: 100,
                value: 0,
            });

            minimap.appendChild(selection);
            minimap.style.display = "block";

            document.body.appendChild(minimap);

            const recalculate = () => {
                let dimensions = `${
                    (parseInt(getComputedStyle(selection).width) *
                        parseInt(getComputedStyle(container).height)) /
                    parseInt(getComputedStyle(container).width)
                    }px`;

                selection.style.width = dimensions;
                minimap.style.height = dimensions;
            };

            recalculate();

            window.addEventListener("resize", () => recalculate());
            window.addEventListener(
                "scroll",
                () => {
                    let percentage =
                        ((document.documentElement.scrollTop ||
                            document.body.scrollTop) /
                            ((document.documentElement.scrollHeight ||
                                document.body.scrollHeight) -
                                document.documentElement.clientHeight)) *
                        100;
                    selection.value = percentage;
                },
                { passive: true }
            );

            selection.addEventListener("change", event => {
                scrollTo(
                    0,
                    parseInt(getComputedStyle(container).height) *
                    (event.target.value / 100)
                );
            });
        }
    },
};
