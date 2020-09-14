// control for the page-action

import { getActiveTab, execute, activeTab } from '../libs/webUtils.js';
import buildElement from '../libs/utils.js';

const toggles = buildElement('div', '', {
    className: 'toggle-container',
});

document.body.appendChild(toggles);

const menusContainer = buildElement('div', '', {
    className: 'menus',
});

document.body.appendChild(menusContainer);

const main = buildElement('div', '', {
    id: 'main',
    className: 'menu hidden',
});

menusContainer.appendChild(main);

const menus = {
    hideMenus: () => {
        document.querySelectorAll('.menu').forEach((item) => {
            item.style.display = 'none';
        });
    },

    addToggle: (name) => {
        let t = buildElement('p', `${name} +`, {
            className: 'toggle',
            data_toggled: false,
            id: `toggle-${name.toLowerCase()}`,
        });
        t.addEventListener('click', () => {
            t.dataset.toggled ? menus.showMenu(name) : menus.hideMenu(name);
            t.dataset.toggled = !t.dataset.toggled;
        });
        toggles.appendChild(t);
    },

    showMenu: (name) => {
        document.querySelectorAll('.menus > *').forEach((item) => item.classList.add('hidden'));
        document.querySelector(`.menus > #${name.toLowerCase()}`).classList.remove('hidden');
    },

    hideMenu: (name) => {
        document.querySelector(`.menus > #${name.toLowerCase()}`).classList.add('hidden');
    },
};

menus.addToggle('Main');

let info = {};

const buildFromInfo = () => {
    console.log(info);
    if (info.rss.length != 0) {
        let rss = buildElement('h4', 'RSS');

        let container =
            document.querySelector('#feeds') ||
            buildElement('div', '', {
                className: 'menu hidden',
                id: 'feeds',
            });
        info.rss.forEach((item) => {
            container.appendChild(
                buildElement('a', item, {
                    href: item,
                })
            );
        });

        menusContainer.appendChild(container);

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

    if (info.headings) {
        menus.addToggle('Headings');
        const headings = buildElement('div', '', { className: 'menu hidden', id: 'headings' });
        Object.entries(info.headings).forEach((item, i, arr) => {
            headings.appendChild(
                buildElement('p', item[0], { style: `font-size: ${Math.abs(item[1].slice(1) - 6) * 4}pt` })
            );
        });

        menusContainer.appendChild(headings);
    }
};

getActiveTab().then(async (t) => {
    let crumbs = t.url.split(/\/+/).filter((i) => i.length > 0);
    let root = buildElement('a', '', { href: t.url });

    let path = '';
    menus.addToggle('Breadcrumbs');
    let crumbContainer = buildElement('div', '', { className: 'menu hidden', id: 'breadcrumbs' });
    crumbs.forEach((item, index) => {
        if (item.includes('http')) return;
        if (root.hostname != item) path += `/${item}`;
        crumbContainer.appendChild(
            buildElement(
                'a',
                `${new String('\xa0').repeat(index != 1 ? index * 2 : 0)}${root.hostname != item ? path : item}`,
                {
                    href: `${root.protocol}//${root.hostname}${root.hostname == item ? '' : path}`,
                }
            )
        );
    });
    menusContainer.appendChild(crumbContainer);

    browser.permissions.contains({ permissions: ['history'] }).then((has) => {
        if (has == true) {
            let root = buildElement('a', '', { href: t.url }).hostname;
            browser.history
                .search({
                    text: root,
                    startTime: new Date().setMonth(new Date().getMonth() - 1),
                })
                .then(async (data) => {
                    menus.addToggle('History');
                    const hContainer = buildElement('div', '', { className: 'menu hidden', id: 'history' });
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

                    menusContainer.appendChild(hContainer);
                });
        }
    });

    let siteDataLoader = buildElement('p', 'Loading...');

    let registered = execute('../injections/info.js').then(async () => {
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
    });
});
