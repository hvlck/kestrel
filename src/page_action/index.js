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
    className: 'menu',
});

document.body.appendChild(main);

const home = buildElement('a', 'Back', {
    style: 'display: none;',
});

home.addEventListener('click', () => menus.showMain());
document.body.appendChild(home);

const menus = {
    hideMenus: () => {
        document.querySelectorAll('.menu').forEach((item) => {
            item.style.display = 'none';
        });
    },

    showMain: function () {
        this.hideMenus();
        main.style.display = '';
    },

    showHome: function () {
        this.hideMenus();
        home.style.display = '';
    },

    showFeeds: (feeds) => {
        let container =
            document.querySelector('#feeds') ||
            buildElement('div', '', {
                className: 'menu',
                id: 'feeds',
            });

        menus.showHome();
        menus.hideMenus();

        if (!document.querySelector('#feeds')) {
            feeds.forEach((item) => {
                container.appendChild(
                    buildElement('a', item, {
                        href: item,
                    })
                );
            });
            document.body.appendChild(container);
        } else {
            menus.hideMenus();
            container.style.display = '';
        }
    },
};

let info = {};

const buildFromInfo = () => {
    console.log(info);
    if (info.rss.length != 0) {
        let rss = buildElement('a', 'RSS Feeds Available', { className: 'special' });
        rss.addEventListener('click', () => {
            menus.showFeeds(info.rss);
        });

        main.appendChild(rss);
    }

    if (info.readingTime) {
        main.appendChild(
            buildElement('p', `Reading time: ${info.readingTime} minute${info.readingTime != 1 ? 's' : ''}.`)
        );
    }
};

getActiveTab().then(async (t) => {
    let title = t.title;
    let c = buildElement('p', title, {
        className: 'special',
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

    let crumbs = t.url.split(/\/+/).filter((i) => i.length > 0);
    let root = buildElement('a', '', { href: t.url });

    let path = '';
    crumbs.forEach((item, index) => {
        if (item.includes('http')) return;
        if (root.hostname != item) path += `/${item}`;
        document.body.appendChild(
            buildElement('a', root.hostname != item ? path : item, {
                href: `${root.protocol}//${root.hostname}${root.hostname == item ? '' : path}`,
            })
        );
    });

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

            browser.tabs.sendMessage(t[0].id, { start: true });
        })
        .catch((err) => {
            console.error(`Failed to inject info: ${err}`);
            dispatch('Failed to get page information.', 'f');
        });
});
