import { getActiveTab, execute, activeTab } from '../libs/webUtils.js';
import buildElement from '../libs/utils.js';

const dispatch = (event, status) => {
    document.body.appendChild(
        buildElement('p', event, {
            className: `banner ${status}`,
        })
    );
};

getActiveTab().then(async (t) => {
    let title = t.title;
    let c = buildElement('p', title, {
        id: 'title',
        title: 'Copy',
    });
    c.addEventListener('click', () => {
        navigator.clipboard
            .writeText(title)
            .then(() => {
                dispatch('Copied!', 's');
            })
            .catch((err) => {
                dispatch('Failed to copy!', 'f');
            });
    });
    document.body.appendChild(c);

    console.warn(t);
    let siteDataLoader = buildElement('p', 'Loading');

    let registered = execute('../injections/info.js')
        .then(async () => {
            let t = await activeTab();
            browser.runtime.onMessage.addListener((msg, sender) => {
                if (sender.id !== browser.runtime.id) return;
            });
            browser.tabs.sendMessage(t[0].id, { start: true }).then(() => {
                document.body.appendChild(siteDataLoader);
            });
        })
        .catch((err) => {
            console.error(`Failed to inject info: ${err}`);
            dispatch('Failed to get page information.', 'f');
        });
});
