import { automaticCommandsList } from '../../libs/commands.js';
import buildElement from '../../libs/utils.js';
import { settings, toggleTheme, automaticDescriptions } from './settings.js';
import callbacks from './callbacks.js';
import { updateAutomaticFunctions, updateCommands, updateSettings } from './update.js';

// generates html for settings

// nav bar
const nav = buildElement('nav');

// prevent content flashing
document.body.querySelector('.hidden').appendChild(nav);

// generates settings html
const build = () => {
    const main = buildElement('div', '', {
        className: 'main',
    });

    document.body.querySelector('.hidden').appendChild(main);

    settings.forEach((item) => {
        let div = buildElement('div', '', {
            className: 'settings-item-container',
        });

        let title = buildElement(`${item.type == 'divider' ? 'h2' : 'h3'}`, item.name, {
            className: 'settings-item-header',
            id: `${item.type == 'divider' ? item.name.replace(new RegExp(' ', 'g'), '-').toLowerCase() : ''}`,
        });

        div.appendChild(title);

        let description = buildElement('p', item.description, {
            className: 'settings-item-description',
        });

        div.appendChild(description);

        if (item.type == 'divider') {
            nav.appendChild(
                buildElement('a', item.name, {
                    href: `#${item.name.replace(' ', '-').toLowerCase()}`,
                })
            );
            if (item.rule != false) div.prepend(buildElement('hr'));
        } else if (item.type == 'select') {
            // select element
            let select = buildElement('select', '', {
                className: 'settings-item-select',
            });

            item.options.forEach((option) => {
                let element = buildElement('option', option, {
                    className: 'setting-item-select-option',
                });

                select.appendChild(element);
            });

            item.default.then((data) => {
                if (Object.keys(data).length != 0)
                    data =
                        Object.values(data)[0].replace(new RegExp(' ', 'g'), '-').toLowerCase() ||
                        'operating-system-default';

                let matches = Object.values(select.querySelectorAll('option')).filter(
                    (child) => child.innerText.replace(new RegExp(' ', 'g'), '-').toLowerCase() == data
                )[0];
                if (matches) matches.setAttribute('selected', 'true');

                toggleTheme(data);
            });

            select.addEventListener('input', () => {
                updateSettings(item.name, select.value);
                toggleTheme(select.value);
            });

            div.appendChild(select);
        } else if (item.type == 'toggle') {
            // checkbox elements
            let container = buildElement('table', '', {
                className: 'settings-item-toggle-container',
            });

            if (typeof item.options == 'object' && item.options.then) {
                item.options.then((data) => {
                    buildToggle(item, data, container);
                });
            } else {
                buildToggle(item, container);
            }

            div.appendChild(container);
        } else if (item.type == 'single-toggle') {
            let container = buildElement('div', '', {
                className: 'checkbox-parent',
            });

            let toggle = buildElement('input', '', {
                type: 'checkbox',
                checked: item.default || false,
            });

            if (item.dependsOn) toggle.dataset.automaticSetting = item.dependsOn;
            if (item.keyName) toggle.dataset.key = item.keyName;

            browser.storage.local.get(item.dependsOnKey).then((data) => {
                if (item.dependsOnKey && item.dependsOn) {
                    toggle.disabled = !data[item.dependsOnKey][item.dependsOn];
                }
            });
            browser.storage.local.get(item.setting).then((data) => {
                if (item.setting) {
                    toggle.checked = data[item.setting][item.dependsOn][item.keyName];
                } else {
                    toggle.checked = data[item.dependsOnKey];
                }
            });

            toggle.addEventListener('change', () => {
                if (item.callback) {
                    callbacks[item.callback](toggle);
                }
            });

            container.appendChild(toggle);

            div.appendChild(container);
        } else if (item.type == 'special') {
            // various special resets/buttons
            let btn = buildElement('input', '', {
                type: 'reset',
                value: item.name,
            });

            btn.addEventListener('click', () => callbacks[item.fn]());

            div.appendChild(btn);
        } else if (item.type == 'text' || item.type == 'number') {
            // text/number input
            let text = buildElement('input', '', {
                type: item.type,
                placeholder: item.placeholder,
                [item.type == 'text' ? 'maxLength' : 'max']: item.max || '9999999',
                [item.type == 'text' ? 'minLength' : 'min']: item.min || '1',
                disabled: false,
                value: item.default,
                data_automatic_setting: item.dependsOn,
                data_key: item.keyName,
                pattern: item.matches || '',
            });

            browser.storage.local.get(item.setting).then((data) => {
                text.value = data[item.setting][item.dependsOn][item.keyName] || item.default;
                item.callback ? callbacks[item.callback](text) : '';
            });

            browser.storage.local.get(item.dependsOnKey).then((data) => {
                text.disabled = !data[item.dependsOnKey][item.dependsOn];
            });

            text.addEventListener('input', () => {
                if (item.type == 'number') {
                    if (new RegExp(item.matches).test(text.value)) {
                        if (text.value <= item.max && text.value >= item.min) {
                            callbacks.updateAutomaticSettings();
                            item.callback ? callbacks[item.callback](text) : '';
                        }
                    }
                } else {
                    if (new RegExp(item.matches).test(text.value)) {
                        if (text.value.length <= item.max && text.value.length >= item.min) {
                            callbacks.updateAutomaticSettings();
                            item.callback ? callbacks[item.callback](text) : '';
                        }
                    }
                }
            });

            div.appendChild(text);
            let matchDescElem = buildElement('p', item.matchDescription);
            div.appendChild(matchDescElem);
        } else if (item.type == 'file' && item.fn) {
            let label = buildElement('label', item.name, {
                className: 'file-label',
            });
            label.setAttribute('for', `file-${item.name.toLowerCase().replace(new RegExp(' ', 'g'), '-')}`);

            let inp = buildElement('input', '', {
                type: 'file',
                id: `file-${item.name.toLowerCase().replace(new RegExp(' ', 'g'), '-')}`,
            });

            inp.addEventListener('change', function () {
                callbacks[item.fn](this);
            });

            div.appendChild(label);
            div.appendChild(inp);
        }

        main.appendChild(div);
    });

    document.body.querySelector('.hidden').classList.remove('hidden');
};

// toggle type html structure
function buildToggle(item, customData, container) {
    let head = buildElement('thead');
    let headerRow = buildElement('tr');
    item.headers.forEach((header) => {
        let headerCell = buildElement('th', header);
        headerRow.appendChild(headerCell);
    });

    head.appendChild(headerRow);

    container.appendChild(head);

    if (item.name == 'Commands') {
        Object.values(customData).forEach((option) => {
            // needs to be refactored
            if (Array.isArray(option)) {
                buildToggleHtml(Object.values(option[0]), container, Object.values(customData)[0], 'commands');
            } else {
                buildToggleHtml(Object.values(option), container, Object.values(customData)[0], 'commands');
            }
        });
    } else if (item.name == 'Background') {
        if (Object.keys(customData).length != 0)
            buildToggleHtml(Object.keys(customData.automatic), container, '', 'background');
    }
}

// toggle type content html
function buildToggleHtml(iter, container, original, ref) {
    iter.forEach((option, index) => {
        let row = buildElement('tr');

        let toggleCell = buildElement('td');

        if (ref == 'commands') {
            let toggle = buildElement('input', '', {
                type: 'checkbox',
                checked: option.on,
                data_command: Object.entries(original)[index][0],
            });

            toggle.addEventListener('change', () => {
                updateCommands();
            });

            toggleCell.appendChild(toggle);
        } else if (ref == 'background') {
            browser.storage.local.get('automatic').then((status) => {
                status = status.automatic;
                let toggle = buildElement('input', '', {
                    type: 'checkbox',
                    checked: status[option] || false,
                    data_background: Object.keys(automaticCommandsList)[index],
                });

                toggle.addEventListener('change', () => {
                    updateAutomaticFunctions();
                    document
                        .querySelectorAll(`*[data-automatic-setting="${toggle.dataset.background}"]`)
                        .forEach((item) => (item.disabled = !toggle.checked));
                });

                toggleCell.appendChild(toggle);
            });
        }

        let descriptionCell = buildElement('td');
        if (ref == 'commands') {
            let description = buildElement('p', option.name.split(':')[0]);
            descriptionCell.appendChild(description);
        } else if (ref == 'background') {
            let description = buildElement('p', automaticDescriptions[option]);
            descriptionCell.appendChild(description);
        }

        row.appendChild(descriptionCell);
        row.appendChild(toggleCell);

        container.appendChild(row);
    });
}

export default build;
