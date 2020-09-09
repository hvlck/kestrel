(function () {
    document.body.querySelectorAll('a[href]').forEach((item) => {
        item.addEventListener('mouseover', (e) => {
            GM_getSiteData(item.href)
                .then((resp) => {
                    if (!resp) return;
                    let data = resp.text;
                    if (data) {
                        let container = document.createElement('div');
                        let content = new DOMParser().parseFromString(data, 'text/html').body;

                        let i = 0;
                        content.querySelectorAll('h1,h2,h3,h4,h5,h6,p,img').forEach((item) => {
                            if (i > 5) return;
                            i += 1;

                            container.appendChild(item);
                        });

                        document.body.appendChild(container);
                    }
                })
                .catch((err) => console.error(err));
        });
    });
})();
