(function () {
    const styles = {
        h1: `font-size: 22pt !important;`,
        h2: `font-size: 20pt !important;`,
        h3: `font-size: 18pt !important;`,
        h4: `font-size: 16pt !important;`,
        h5: `font-size: 14pt !important;`,
        h6: `font-size: 13pt !important;`,
        img: `font-size: 12pt !important;`,
        img: `max-height: 30% !important;
        max-width: 80% !important;`,
    };

    const container = document.createElement('div');
    container.id = 'kestrel-hover';
    container.style.cssText = `
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
        position: fixed !important;
        right: 2% !important;
        top: 2% !important;

        z-index: 999999 !important;
        overflow: scroll !important;

        background: inherit !important;
        border: 2px solid #16c581 !important;

        max-width: 30% !important;
        max-height: 90% !important;
        padding: 5px !important;

        transition: 150ms linear !important;
        animation: none !important;
    `;

    let sites = {};
    const show = (url) => {
        container.style.display = '';
        Object.values(container.children).forEach((item) => item.remove());
        sites[url].forEach((item) => container.appendChild(item));
    };

    document.body.querySelectorAll('a[href]').forEach((item) => {
        if (item.href.startsWith('javascript:')) return;
        item.addEventListener('mouseover', (e) => {
            if (sites[item.href]) show(item.href);
            else {
                GM_getSiteData(item.href)
                    .then((resp) => {
                        if (!resp) return;
                        let data = resp.text;
                        if (data) {
                            let content = new DOMParser().parseFromString(data, 'text/html').body;

                            let i = 0;
                            let items = [];
                            content.querySelectorAll('h1,h2,h3,h4,h5,h6,p,img').forEach((item) => {
                                if (i > 10) return;
                                i += 1;

                                let n = document.createElement(item.nodeName);
                                n.innerText = item.innerText;
                                n.style.cssText = styles[n.nodeName.toLowerCase()];
                                Object.values(item.children).forEach((child) => {
                                    let newChild = document.createElement(child.nodeName);
                                    child.href ? (newChild.href = child.href) : '';
                                    child.innerText ? (newChild.innerText = child.innerText) : '';
                                    child.style.cssText = styles[child.nodeName.toLowerCase()];
                                    n.appendChild(newChild);
                                });

                                items.push(n);
                            });

                            document.body.appendChild(container);

                            sites[item.href] = items;
                            show(item.href);
                        }
                    })
                    .catch((err) => console.error(err));
            }
        });

        item.addEventListener('mouseout', (e) => {
            container.style.display = 'none';
        });
    });
})();
