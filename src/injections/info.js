(function () {
    const data = {
        getRSS: () => {
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
    };

    const scrape = () => {
        let returnedData = {};
        returnedData.rss = data.getRSS();

        return returnedData;
    };

    browser.runtime.onMessage.addListener((msg, sender) => {
        if (msg.start === true) {
            browser.runtime.sendMessage({ info: scrape() });
        }
    });
})();
