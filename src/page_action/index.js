// control for the page-action

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

    if (info.pwa == true) {
        main.appendChild(buildElement('p', 'PWA'));
    }
};

getActiveTab().then(async (t) => {
    let crumbs = t.url.split(/\/+/).filter((i) => i.length > 0);
    let root = buildElement('a', '', { href: t.url });

    let path = '';
    let crumbContainer = buildElement('div', '', { className: 'menu', id: 'breadcrumbs' });
    crumbs.forEach((item, index) => {
        if (item.includes('http')) return;
        if (root.hostname != item) path += `/${item}`;
        crumbContainer.appendChild(
            buildElement('a', `${new String('\xa0').repeat(index * 2)}${root.hostname != item ? path : item}`, {
                href: `${root.protocol}//${root.hostname}${root.hostname == item ? '' : path}`,
            })
        );
    });
    document.body.insertBefore(crumbContainer, document.body.firstChild);

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

    browser.permissions.contains({ permissions: ['history'] }).then((has) => {
        if (has == true) {
            let root = buildElement('a', '', { href: t.url }).hostname;
            browser.history
                .search({
                    text: root,
                    startTime: new Date().setMonth(new Date().getMonth() - 1),
                })
                .then(async (data) => {
                    const hContainer = buildElement('div', '', { className: 'menu ' });
                    let pageDailyRaw = await browser.history.search({
                        text: root,
                    });

                    let pageDaily = Array.from(pageDailyRaw)
                        .filter((visit) => visit.url.split('#')[0] == t.url.split('#')[0])
                        .reduce((p, n) => (p += n.visitCount), 0);

                    let pageTotal = Array.from(data)
                        .filter((visit) => visit.url.split('#')[0] == t.url.split('#')[0])
                        .reduce((p, n) => (p += n.visitCount), 0);

                    let domainDaily = Array.from(pageDailyRaw).reduce((p, n) => (p += n.visitCount), 0);

                    let domainTotal = Array.from(data).reduce((p, n) => (p += n.visitCount), 0);

                    hContainer.appendChild(
                        buildElement(
                            'p',
                            `Visited page ${pageTotal} time${
                                pageTotal > 1 ? 's' : ''
                            } in the last month (${pageDaily} time${pageDaily > 1 ? 's' : ''} today)`
                        )
                    );

                    hContainer.appendChild(
                        buildElement(
                            'p',
                            `Visited domain ${domainTotal} time${
                                domainTotal > 1 ? 's' : ''
                            } in the last month (${domainDaily} time${domainDaily > 1 ? 's' : ''} today)`
                        )
                    );

                    document.body.appendChild(hContainer);
                });
        }
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
