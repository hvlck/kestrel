// scrapes information from the current page for the page-action
(function () {
    const data = {
        rss: () => {
            let links = [];
            document.head
                .querySelectorAll(
                    'link[type="application/atom+xml"],link[type="application/feed+json"],link[type="rss+xml"]'
                )
                .forEach((item) => {
                    links.push(item.href);
                });

            return links;
        },

        readingTime: () => {
            let words = 0;
            document.body
                .querySelectorAll('h1,h2,h3,h4,h5,h6,p,p > *,article,table > *,table,code,kbd,blockquote,cite')
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
    };

    const scrape = () => {
        let returnedData = {};
        Object.keys(data).forEach((item) => {
            returnedData[item] = data[item]();
        });

        return returnedData;
    };

    browser.runtime.onMessage.addListener((msg, sender) => {
        if (msg.start === true) {
            browser.runtime.sendMessage({ info: scrape() });
        }
    });
})();
