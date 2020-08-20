// Command Callbacks

import { sendFnEvent, input, hideKestrel, showKestrel, updateCommands, listen, kestrel } from './ui.js';
import buildElement from '../libs/utils.js';

const parseAlarm = (v) => {
    return new Promise((resolve, reject) => {
        if (!v.includes(':')) {
            let d = new Date();
            resolve(
                resolve(
                    new Date(d.getFullYear(), d.getMonth(), d.getDate(), v > 60 ? d.getHours() + 1 : d.getHours(), v)
                )
            );
        } else if (v.includes(':') && v.split(':').length == 2) {
            let d = new Date();
            resolve(
                new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), v.split(':')[0], v.split(':')[1])
            );
        } else {
            reject(`Invalid user input.`);
        }
    });
};

// command callbacks, not listed in window object for organization and for preventing conflict
// note: explicit returns of false denote that the function doesn't need access to the window (through injections)
let cmdFunctions = {
    // opens Kestrel's settings/options page
    openSettings: function (ref) {
        sendFnEvent({ fn: 'openSettings' });
        return false;
    },

    // refreshs all tabs
    refreshTabs: function (ref) {
        // soft refreshing doesn't bypass cache, hard refreshing does
        if (ref.includes('soft')) {
            sendFnEvent({
                fn: 'tabs',
                args: { bypassCache: false },
            });
        } else if (ref.includes('hard')) {
            sendFnEvent({
                fn: 'tabs',
                args: { bypassCache: true },
            });
        }

        return false;
    },

    // toggles a mini-map, similar to VSCode's
    // see https://css-tricks.com/using-the-little-known-css-element-function-to-create-a-minimap-navigator/
    injectedMiniMap: false,
    toggleMiniMap: function (ref) {
        if (this.injectedMiniMap == false) {
            sendFnEvent({ injectSheet: 'minimap' });
            this.injectedMiniMap = true;
        }
    },

    setTimer: function (ref) {
        hideKestrel();
        let time;

        input.placeholder = 'For how long?';
        input.pattern = /\d/;
        input.removeEventListener('keydown', listen);

        const addAlarm = async (event) => {
            if (event.keyCode == 13 && input.value) {
                if (!time) {
                    time = await parseAlarm(input.value).catch((e) => console.error(`Failed to parse date: ${e}`));
                    input.value = '';

                    input.pattern = /[a-z]/i;
                    input.placeholder = 'What do you want to name this alarm?';
                } else {
                    console.log(time);
                    browser.alarms.create(input.value, {
                        when: time.getTime(),
                    });

                    input.removeEventListener('keydown', addAlarm);
                    input.addEventListener('keydown', listen);

                    input.value = '';
                    input.placeholder = 'Search commands';
                    input.removeAttribute('pattern');

                    updateCommands();
                    showKestrel();
                    input.focus();
                }
            }
        };

        input.addEventListener('keydown', addAlarm);
        return false;
    },

    viewTimers: async function (ref) {
        let started = new Date();

        const format = (t) => {
            //            let diff = Math.floor((t.getTime() - started.getTime()) / 1000);
            //            console.log(diff);
            return `diff`;
            //return `${h > 10 ? h : `0${h}`}:${m > 10 ? m : `0${m}`}:${s > 10 ? s : `0${s}`}`;
        };

        hideKestrel();
        input.classList.add('kestrel-hidden');
        let alarms = await browser.alarms.getAll();
        if (alarms.length == 0) kestrel.appendChild(buildElement('p', 'No alarms set.'));

        let timers = [];
        alarms.forEach((alarm) => {
            let t = new Date(alarm.scheduledTime);
            timers.push(t);
            let newAlarm = buildElement('p', `${alarm.name} - ${format(t)} remaining`, {
                className: `timer-info`,
            });
            kestrel.appendChild(newAlarm);
        });

        return false;
    },
};

export { cmdFunctions };
