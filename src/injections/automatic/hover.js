(function () {
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed !important;
        right: 2% !important;
        top: 2% !important;

        z-index: 999999;
        overflow: hidden;

        background: inherit;
        border: 2px solid #404040;

        max-width: 30%;
        padding: 5px;

        transition: 150ms linear;
        animation: none;
    `;

    let sites = {};
    const show = (url) => {
        container.style.display = '';
        Object.values(container.children).forEach((item) => item.remove());
        sites[url].forEach((item) => container.appendChild(item));
    };

    document.body.querySelectorAll('a[href]').forEach((item) => {
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
                                if (i > 5) return;
                                i += 1;

                                let n = document.createElement(item.nodeName);
                                n.innerText = item.innerText;
                                Object.values(item.children).forEach((child) => {
                                    let newChild = document.createElement(child.nodeName);
                                    child.href ? (newChild.href = child.href) : '';
                                    child.innerText ? (newChild.innerText = child.innerText) : '';
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
