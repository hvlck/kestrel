// control for the page-action

import { getActiveTab, execute, activeTab } from '../libs/webUtils.js';
import b, { ElementTag } from '../libs/utils.js';
import { browser } from 'webextension-polyfill-ts';

const toggles = b(ElementTag.Div, '', {
    className: 'toggle-container',
});

document.body.appendChild(toggles);

const menusContainer = b(ElementTag.Div, '', {
    className: 'menus',
});

document.body.appendChild(menusContainer);

const main = b(ElementTag.Div, '', {
    id: 'main',
    className: 'menu hidden',
});

menusContainer.appendChild(main);

const menus = {
    addToggle: (name: string) => {
        let t = b(ElementTag.P, `${name} +`, {
            className: 'toggle',
            data_toggled: 'false',
            id: `toggle-${name.toLowerCase()}`,
        });
        t.addEventListener('click', () => {
            t.dataset.toggled ? menus.showMenu(name) : menus.hideMenu(name);
            t.dataset.toggled = String(!t.dataset.toggled);
        });
        toggles.appendChild(t);
    },

    showMenu: (name: string) => {
        document.querySelectorAll('.menus > *').forEach((item) => item.classList.add('hidden'));
        document.querySelector(`.menus > #${name.toLowerCase()}`)?.classList.remove('hidden');
    },

    hideMenu: (name: string) => {
        document.querySelector(`.menus > #${name.toLowerCase()}`)?.classList.add('hidden');
    },
};

menus.addToggle('Main');

interface Info {
    readingTime?: number;
    rss?: string[];
    pwa?: boolean;
    headings?: {
        [index: string]: string;
    };
}

let info: Info;

const buildFromInfo = () => {
    console.log(info);

    if (info.readingTime) {
        main.appendChild(
            b(ElementTag.P, `Reading time: ${info.readingTime} minute${info.readingTime != 1 ? 's' : ''}.`)
        );
    }

    if (info.rss?.length != 0) {
        let rss = b(ElementTag.H4, 'RSS', { className: 'section' });

        let container = b(ElementTag.Div);
        info.rss?.forEach((item) => {
            container.appendChild(
                b(ElementTag.A, item, {
                    href: item,
                })
            );
        });

        main.appendChild(rss);
        main.appendChild(container);
    }

    if (info.pwa == true) {
        main.appendChild(b(ElementTag.P, 'PWA'));
    }

    if (info.headings) {
        menus.addToggle('Headings');
        const headings = b(ElementTag.Div, '', { className: 'menu hidden', id: 'headings' });
        Object.entries(info.headings).forEach((item, i, arr) => {
            headings.appendChild(
                b(ElementTag.P, item[0], { style: `font-size: ${Math.abs(item[1].slice(1) - 6) * 4}pt` })
            );
        });

        menusContainer.appendChild(headings);
    }
};

getActiveTab().then(async (t) => {
    let crumbs = t.url.split(/\/+/).filter((i) => i.length > 0);
    let root = b(ElementTag.A, '', { href: t.url });

    let path = '';
    menus.addToggle('Breadcrumbs');
    let crumbContainer = b(ElementTag.Div, '', { className: 'menu hidden', id: 'breadcrumbs' });
    crumbs.forEach((item, index) => {
        if (item.includes('http')) return;
        if (root.hostname != item) path += `/${item}`;
        crumbContainer.appendChild(
            b(ElementTag.A, root.hostname != item ? path : item, {
                href: `${root.protocol}//${root.hostname}${root.hostname == item ? '' : path}`,
                style: `margin: auto ${index != 1 ? index * 2 : 0}%;`,
            })
        );
    });
    menusContainer.appendChild(crumbContainer);

    browser.permissions.contains({ permissions: ['history'] }).then((has) => {
        if (has == true) {
            let root = b(ElementTag.A, '', { href: t.url }).hostname;
            browser.history
                .search({
                    text: root,
                    startTime: new Date().setMonth(new Date().getMonth() - 1),
                })
                .then(async (data) => {
                    menus.addToggle('History');
                    const hContainer = b(ElementTag.Div, '', { className: 'menu hidden', id: 'history' });
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
                        b(
                            ElementTag.P,
                            `Visited page ${pageTotal} time${
                                pageTotal > 1 ? 's' : ''
                            } in the last month (${pageDaily} time${pageDaily > 1 ? 's' : ''} today)`
                        )
                    );

                    hContainer.appendChild(
                        b(
                            ElementTag.P,
                            `Visited domain ${domainTotal} time${
                                domainTotal > 1 ? 's' : ''
                            } in the last month (${domainDaily} time${domainDaily > 1 ? 's' : ''} today)`
                        )
                    );

                    menusContainer.appendChild(hContainer);
                });
        }
    });

    let siteDataLoader = b(ElementTag.P, 'Loading...');

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
