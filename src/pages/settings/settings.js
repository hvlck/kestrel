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
        rule: false
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