import b, { ElementTag } from '../../libs/utils.js';
import { updateSettings, failure } from "./update";

import { browser } from 'webextension-polyfill-ts';

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

enum SettingType {
    Divider = 'divider',
    Select = 'select',
    Special = 'special',
    File = 'file',
    SingleToggle = 'single-toggle',
    Text = 'text',
    Number = 'number',
    Toggle = 'toggle'
}

interface SettingsItem {
    name: string;
    description: string;
    type: SettingType;
    rule?: boolean;
    default?: any;
    fn?: Function;
    options?: string[];
    matchDescription?: string
    dependsOn?: string
    dependsOnKey?: string
    keyName?: string
    setting?: string
    placeholder?: string
    matches?: RegExp
    min?: number,
    max?: number
}

const settings: SettingsItem[] = [
    {
        name: 'Meta',
        description: 'Meta settings for Kestrel',
        type: SettingType.Divider,
        rule: false,
    },
    {
        name: 'Theme',
        description: 'Set the theme Kestrel uses.',
        type: SettingType.Select,
        options: ['Dark', 'Light', 'Operating System Default'],
        default: browser.storage.local.get('theme'),
    },
    {
        name: 'Export Config',
        description: 'Export your Kestrel configuration',
        type: SettingType.Special,
        fn: function () {
        // download kestrel config as a .json file
        browser.storage.local.get(null).then((data) => {
            let link = b(ElementTag.A, '', {
                className: 'hidden',
                href: `data:octet/stream;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`,
                download: `kestrel` + `.json`,
            });

            document.body.appendChild(link);
            link.click();
            link.remove();
        });
    },
    {
        name: 'Import Config',
        description: 'Import a Kestrel configuration',
        type: SettingType.File,
        fn: function (data: any) {
            const required = ['automatic', 'automaticsettings', 'commands'];
        // validates an uploaded config, and then sets it as the settings
        // todo: fix `data` any parameter
        data.files[0]
            .text()
            .then((data: string) => {
                data = JSON.parse(data);
                if (required.some((item: string) => !data[item] || Object.keys(data[item]).length == 0) == true) return;
                browser.storage.local
                    .clear()
                    .then(() => {
                        browser.runtime
                            .sendMessage({
                                settings: 'unregister-all',
                            })
                            .then(() => {
                                browser.storage.local
                                    .set(data)
                                    .then(() => {
                                        window.location.reload();
                                    })
                                    .catch((err) => {
                                        console.error(err);
                                        failure(`Failed to upload config.`);
                                    });
                            })
                            .catch((err) => {
                                console.error(err);
                                failure(`Failed to upload config.`);
                            });
                    })
                    .catch((err) => {
                        console.error(err);
                        failure(`Failed to upload config.`);
                    });
            })
            .catch((err) => {
                console.error(err);
                failure(`Failed to upload config.`);
            });
        }
    },
    {
        name: 'Commands',
        description: 'Settings for the commands that are shown within the command palette',
        type: SettingType.Divider,
    },
    {
        name: 'Commands',
        description: 'Select commands that you want to use.',
        type: SettingType.Toggle,
        options: async () => await browser.storage.local.get('commands'),
        headers: ['Name', 'On/Off'],
    },
    {
        name: 'Background Tasks',
        description: 'Settings for background tasks that are run automatically once a page loads.',
        type: SettingType.Divider,
    },
    {
        name: 'Background',
        description: 'Select background tasks that you want to use.',
        type: SettingType.Toggle,
        options: async () => await browser.storage.local.get('automatic'),
        headers: ['Name', 'On/Off'],
    },
    {
        name: 'Loader Bar Colour',
        description:
            "Customise the loader bar's colour.  Note: this may not work on all websites.  See the Wiki for more.",
        type: SettingType.Text,

        dependsOnKey: 'automatic',
        dependsOn: 'loader',
        keyName: 'colour',
        setting: 'automaticsettings',

        placeholder: '#',

        matches: /^#\\S{6}/,
        matchDescription: "Enter a valid HEX colour code, consisting of 6 characters and starting with a '#.'",
        min: 7,
        max: 7,

        default: '#16c581',
        callback: 'setColour',
    },
    {
        name: 'Loader Bar Height',
        description:
            "Customise the loader bar's height.  Note: this may not work on all websites.  See the Wiki for more.",
        type: SettingType.Number,

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
            "Decides whether the loader is removed from view after it's finished.  If it is checked, it will stay; if not, it will be removed.  Note: this may not work on all websites.  See the Wiki for more.",
        type: SettingType.SingleToggle,

        dependsOnKey: 'automatic',
        dependsOn: 'loader',
        keyName: 'persist',
        setting: 'automaticsettings',

        fn: function () {
        // updates all automatic task settings
        let name;
        document.querySelectorAll<HTMLInputElement>('input[data-automatic-setting]').forEach((item) => {
            if (item.disabled == true) {
                return;
            }
            if (item.parentElement?.classList.contains('checkbox-parent')) {
                name = item.parentElement.parentElement.querySelector('h3').innerText.toLowerCase();
            } else {
                name = item.parentElement.querySelector('h3').innerText.toLowerCase();
            }

            let key = item.dataset.key;
            let parent = item.dataset.automaticSetting;
            if (item.type == 'checkbox') {
                automaticSettings[parent][key] = item.checked;
            } else {
                automaticSettings[parent][key] = item.value;
            }
        });

        updateSettings('automaticsettings', automaticSettings, name);
    },

        default: false,
    },
    {
        name: 'Minimap Colour',
        description: "Sets the minimap's overlay colour",
        type: SettingType.Text,

        dependsOnKey: 'automatic',
        dependsOn: 'minimap',
        keyName: 'colour',
        setting: 'automaticsettings',

        placeholder: '#',

        matches: /^#\\S{6}/,
        matchDescription: "Enter a valid HEX colour code, consisting of 6 characters and starting with a '#.'",
        min: 7,
        max: 7,

        default: '#16c581',
        fn: function (item: any) {
        // sets swatches next to inputs that involve colour to their specified colour
        let previous = document.querySelector(`span[id="${item.dataset.automaticSetting}-colour-swatch"]`);
        if (previous) {
            previous.remove();
        }
        let preview = b(ElementTag.Span, '', {
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

        item.insertAdjacentElement('afterend', preview);
    },
    },
    {
        name: 'Page Information',
        description: 'Settings for the page information popup.',
        type: SettingType.Divider,
    },
    {
        name: 'Popup Enabled',
        type: SettingType.SingleToggle,
        description: 'Enables the page information popup.',

        dependsOnKey: 'browseraction',
        fn:  function (item: boolean) {
        browser.permissions
            .request({
                permissions: ['history'],
            })
            .then((resp) => {
                if (resp == false) item == false;
                browser.runtime.sendMessage({ settings: `popup-${item}` }).then(() => {
                    updateSettings('browserAction', item, 'popup');
                });
            });
    },

        default: false,
    },
    {
        name: 'Danger Zone',
        description: 'Exercise caution here.',
        type: SettingType.Divider,
    },
    {
        name: 'Reset settings',
        description: 'Reset all settings to default',
        type: SettingType.Special,
        fn: function () {
            const resetAll = () => {
                        // resets all storage, and initializes it again with default values
        browser.storage.local.clear().then(() => {
            browser.runtime.sendMessage({ settings: 'unregister-all' }).then(() => {
                history.replaceState('', 'Kestrel | Settings', `${window.location.href}#reset`);
                window.location.reload();
            });
        });
            }
        // generates storage reset confirmation
        const reset = document.querySelector(`input[value="Reset settings"]`)
        if (reset != null) reset.setAttribute('disabled', 'true');

        let container = b(ElementTag.Nav, '', { className: 'confirm-reset' });

        let confirmBtn = b(ElementTag.Input, '', {
            type: 'button',
            value: 'Confirm',
        });

        confirmBtn.addEventListener('click', () => resetAll());

        let cancelBtn = b(ElementTag.Input, '', {
            type: 'button',
            value: 'Cancel',
        });

        cancelBtn.addEventListener('click', () => {
            container.remove();
            if (reset != null) reset.removeAttribute('disabled');
        });

        container.appendChild(cancelBtn);
        container.appendChild(confirmBtn);

        if (reset != null) reset.parentElement?.appendChild(container);
    },
    },
];

// changes theme
const toggleTheme = (data: string) => {
    document.querySelectorAll('link[class="custom-theme"]').forEach((item) => item.remove());

    data = data.replace(new RegExp(' ', 'g'), '-').toLowerCase();

    const sheet = document.querySelector(`link[href$="../../libs/themes"]`);

    if (data != 'operating-system-default') {
        document.head.appendChild(
            b(ElementTag.Link, '', {
                href: `../../libs/themes/${data.toLowerCase()}.css`,
                rel: 'stylesheet',
                type: 'text/css',
                className: 'custom-theme',
            })
        );
    } else if (sheet != null) {
        sheet.remove();
    }
};

// descriptions of automatic functions
const automaticDescriptions: {[index: string]: string} = {
    loader: 'Enable a loading bar.',
    img: 'Enable image manipulation tools.',
    minimap: 'Enable a minimap of a page.',
    linksInSameTab: 'Open all links in the same tab.',
    noSameSiteLinks: 'Disable links that link to the current page',
};

export { settings, toggleTheme, automaticDescriptions };
