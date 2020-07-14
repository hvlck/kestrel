// available settings, converted into html
const settings = [
    {
        name: "Meta",
        description: "Meta settings",
        type: "divider"
    },
    {
        name: "Theme",
        description: "Set the theme Kestrel uses.",
        type: "select",
        options: [
            "Dark",
            "Light",
            "Operating System Default"
        ],
        default: browser.storage.local.get('theme')
    },
    {
        name: "Utilities",
        description: "Settings for Kestrel utilities",
        type: "divider"
    },
    {
        name: "Commands",
        description: "Select commands that you want to use.",
        type: "toggle",
        options: browser.storage.local.get('commands'),
        headers: [
            "Name",
            "On/Off"
        ]
    },
    {
        name: "Background",
        description: "Select background tasks that you want to use.",
        type: "toggle",
        options: browser.storage.local.get('automatic'),
        headers: [
            "Name",
            "On/Off"
        ]
    },
    {
        name: "Loader Bar Colour",
        description: "Customise the loader bar's colour.  Note: this may not work on all websites.  See the Command Reference for more.",
        type: "text",
        dependsOnKey: "automatic",
        dependsOn: "loader",
        setting: "automaticsettings",
        placeholder: "#",
        default: "#16c581",
        callback: "setColour"
    },
    {
        name: "Reset settings",
        description: "Reset all settings to default",
        type: "special",
        fn: "reset"
    }
]