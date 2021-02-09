import { browser } from 'webextension-polyfill-ts';

// scrapes information from the current page for the page-action (/src/page_action)
(function () {
    const data = {
        rss: () => {
            let links: string[] = [];
            document.head
                .querySelectorAll<HTMLElement>(
                    'link[type="application/atom+xml"],link[type="application/feed+json"],link[type="rss+xml"]'
                )
                .forEach((item) => {
                    if (item.getAttribute('href') != null) {
                        // @ts-expect-error
                        links.push(item.getAttribute('href'));
                    }
                });

            return links;
        },

        readingTime: () => {
            let words = 0;
            document.body
                .querySelectorAll<HTMLElement>(
                    'h1,h2,h3,h4,h5,h6,p,p > *,article,table > *,table,code,kbd,blockquote,cite'
                )
                .forEach((item) => {
                    if (item.innerText && Object.values(item.getBoundingClientRect()).every((i) => i == 0))
                        words += item.innerText.split(/\s/g).filter((s) => s.length > 0).length;
                });

            return Math.ceil(words / 250);
        },

        pwa: () => {
            if (document.head.querySelector(`link[rel="manifest"][href$=".webmanifest"]`)) return true;
            else return false;
        },

        headings: () => {
            let headings = {};
            document.body.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6').forEach((item) => {
                Object.defineProperty(headings, item.innerText, item.nodeName);
                // not sure if the line above will work
                //                headings[item.innerText] = item.nodeName;
            });

            return headings;
        },
    };

    const scrape = () => {
        let returnedData = {};
        Object.values(data).forEach((item) => {
            if (typeof item == 'function') {
                item.apply(null);
            }
        });

        return returnedData;
    };

    browser.runtime.onMessage.addListener((msg) => {
        if (msg.start === true) {
            browser.runtime.sendMessage({ info: scrape() });
        }
    });
})();
