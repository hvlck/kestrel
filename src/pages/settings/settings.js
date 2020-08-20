import buildElement from '../../libs/utils.js';

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
        single-toggle - single toggle
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
        name: 'Meta',
        description: 'Meta settings for Kestrel',
        type: 'divider',
        rule: false,
    },
    {
        name: 'Theme',
        description: 'Set the theme Kestrel uses.',
        type: 'select',
        options: ['Dark', 'Light', 'Operating System Default'],
        default: browser.storage.local.get('theme'),
    },
    {
        name: 'Export Config',
        description: 'Export your Kestrel configuration',
        type: 'special',
        fn: 'downloadConfig',
    },
    {
        name: 'Import Config',
        description: 'Import a Kestrel configuration',
        type: 'file',
        fn: 'uploadConfig',
    },
    {
        name: 'Commands',
        description: 'Settings for the commands that are shown within the command palette',
        type: 'divider',
    },
    {
        name: 'Commands',
        description: 'Select commands that you want to use.',
        type: 'toggle',
        options: browser.storage.local.get('commands'),
        headers: ['Name', 'On/Off'],
    },
    {
        name: 'Background Tasks',
        description: 'Settings for background tasks that are run automatically once a page loads.',
        type: 'divider',
    },
    {
        name: 'Background',
        description: 'Select background tasks that you want to use.',
        type: 'toggle',
        options: browser.storage.local.get('automatic'),
        headers: ['Name', 'On/Off'],
    },
    {
        name: 'Loader Bar Colour',
        description:
            "Customise the loader bar's colour.  Note: this may not work on all websites.  See the Reference for more.",
        type: 'text',

        dependsOnKey: 'automatic',
        dependsOn: 'loader',
        keyName: 'colour',
        setting: 'automaticsettings',

        placeholder: '#',

        matches: '^#\\S{6}',
        matchDescription:
            "Enter a valid <a href='https://en.wikipedia.org/wiki/Web_colors'>HEX</a> colour code, consisting of 6 characters and starting with a '#.'  If you need assistance choosing a colour, <a href='https://github.com/EthanJustice/links#designcolours'>this</a> is a list of websites that can help.",
        min: 7,
        max: 7,

        default: '#16c581',
        callback: 'setColour',
    },
    {
        name: 'Loader Bar Height',
        description:
            "Customise the loader bar's height.  Note: this may not work on all websites.  See the Reference for more.",
        type: 'number',

        dependsOnKey: 'automatic',
        dependsOn: 'loader',
        keyName: 'height',
        setting: 'automaticsettings',

        placeholder: '2',

        min: 1,
        max: 20,

        matchDescription:
            'Enter a length (in pixels) between 1 and 20.  The unit is not needed, so just a number will suffice.',

        default: '2',
    },
    {
        name: 'Loader Bar Persistence',
        description:
            "Decides whether the loader is removed from view after it's finished.  If it is checked, it will stay; if not, it will be removed.  Note: this may not work on all websites.  See the Reference for more.",
        type: 'single-toggle',

        dependsOnKey: 'automatic',
        dependsOn: 'loader',
        keyName: 'persist',
        setting: 'automaticsettings',

        callback: 'updateAutomaticSettings',

        default: false,
    },
    {
        name: 'Minimap Colour',
        description: "Sets the minimap's overlay colour",
        type: 'text',

        dependsOnKey: 'automatic',
        dependsOn: 'minimap',
        keyName: 'colour',
        setting: 'automaticsettings',

        placeholder: '#',

        matches: '^#\\S{6}',
        matchDescription:
            "Enter a valid <a href='https://en.wikipedia.org/wiki/Web_colors'>HEX</a> colour code, consisting of 6 characters and starting with a '#.'  If you need assistance choosing a colour, <a href='https://github.com/EthanJustice/links#designcolours'>this</a> is a list of websites that can help.",
        min: 7,
        max: 7,

        default: '#16c581',
        callback: 'setColour',
    },
    {
        name: 'Page Information',
        description: 'Settings for the <a href="">page information popup</a>.',
        type: 'divider',
    },
    {
        name: 'Popup Enabled',
        type: 'single-toggle',
        description: 'Enables the <a href="">page information popup</a>.',

        dependsOnKey: 'browseraction',
        callback: 'updateBrowserAction',

        default: false,
    },
    {
        name: 'Danger Zone',
        description: 'Exercise caution here.',
        type: 'divider',
    },
    {
        name: 'Reset settings',
        description: 'Reset all settings to default',
        type: 'special',
        fn: 'reset',
    },
];

// changes theme
const toggleTheme = (data) => {
    document.querySelectorAll('link[class="custom-theme"]').forEach((item) => item.remove());
    if (!data || Object.keys(data).length == 0) return;
    data = data.replace(new RegExp(' ', 'g'), '-').toLowerCase();
    if (data != 'operating-system-default') {
        document.head.appendChild(
            buildElement('link', '', {
                href: `../../libs/themes/${data.toLowerCase()}.css`,
                rel: 'stylesheet',
                type: 'text/css',
                className: 'custom-theme',
            })
        );
    } else if (document.querySelector(`link[href$="../../libs/themes"]`)) {
        document.querySelector(`link[href$="../../libs/themes"]`).remove();
    }
};

// descriptions of automatic functions
const automaticDescriptions = {
    loader: 'Enable a loading bar.',
    minimap: 'Enable a minimap of a page.',
    linksInSameTab: 'Open all links in the same tab.',
    noSameSiteLinks: 'Disable links that link to the current page',
};

export { settings, toggleTheme, automaticDescriptions };
