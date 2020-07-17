// available settings, converted into html
const settings = [
    {
        name: "Meta",
        description: "Meta settings for Kestrel",
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
        description: "Customise the loader bar's colour.  Note: this may not work on all websites.  See the Reference for more.",
        type: "text",
        dependsOnKey: "automatic",
        dependsOn: "loader",
        setting: "automaticsettings",
        placeholder: "#",

        matches: "^#\\S{6}",
        matchDescription: "Enter a valid <a href='https://en.wikipedia.org/wiki/Web_colors'>HEX</a> colour code, consisting of 6 characters and starting with a '#.'  If you need assistance choosing a colour, <a href='https://github.com/EthanJustice/uls#design'>this</a> is a list of websites that can help.",
        minLength: 7,
        maxLength: 7,

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