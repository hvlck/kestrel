import { getActiveTab, execute, activeTab } from '../libs/webUtils.js';
import buildElement from '../libs/utils.js';

const dispatch = (event, status) => {
    main.appendChild(
        buildElement('p', event, {
            className: `banner ${status}`,
        })
    );
};

const main = buildElement('div', '', {
    id: 'main',
});

document.body.appendChild(main);

const home = buildElement('a', 'Back', {
    style: 'display:none',
});

home.addEventListener('click', () => menus.showMain());

const menus = {
    showMain: () => {
        document.body.appendChild(main);
    },

    showHome: () => {
        home.style.display = '';
    },

    showFeeds: (feeds) => {
        menus.showHome();
        main.remove();
        feeds.forEach((item) => {
            document.body.appendChild(
                buildElement('a', item, {
                    href: item,
                })
            );
        });
    },
};

let info = {};

const buildFromInfo = () => {
    console.log(info);
    if (info.rss.length != 0) {
        let rss = buildElement('a', 'RSS Feeds Available');
        rss.addEventListener('click', () => {
            menus.showFeeds(info.rss);
        });

        main.appendChild(rss);
    }
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
    main.appendChild(c);

    let siteDataLoader = buildElement('p', 'Loading...');

    let registered = execute('../injections/info.js')
        .then(async () => {
            let t = await activeTab();
            main.appendChild(siteDataLoader);
            browser.runtime.onMessage.addListener((msg, sender) => {
                if (sender.id !== browser.runtime.id) return;
                if (msg.info && Object.keys(info).length == 0) {
                    siteDataLoader.remove();
                    info = msg.info;
                    buildFromInfo();
                }
            });

            browser.tabs.sendMessage(t[0].id, { start: true }).then(() => {});
        })
        .catch((err) => {
            console.error(`Failed to inject info: ${err}`);
            dispatch('Failed to get page information.', 'f');
        });
});
