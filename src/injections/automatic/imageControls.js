(function () {
    const buildElement = (type, text, attributes) => {
        let element = document.createElement(type);
        element.innerText = text || '';
        if (attributes) {
            Object.keys(attributes).forEach((item) => {
                if (item.includes('data_')) {
                    element.setAttribute(item.replace(new RegExp('_', 'g'), '-'), attributes[item]);
                } else {
                    element[item] = attributes[item];
                }
            });
        }
        return element;
    };

    const container = buildElement('div', '', { style: 'margin:auto;text-align:center' });

    const img = new Image();
    img.src = document.body.querySelector('img').src;

    const canvas = buildElement('canvas', '', {
        style: `max-width:80%;margin:auto;text-align:center;`,
    });
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    img.addEventListener('load', function () {
        canvas.height = this.naturalHeight;
        canvas.width = this.naturalWidth;

        ctx.drawImage(this, 0, 0);
    });

    document.body.querySelector('img').remove();
    document.body.appendChild(container);

    const toolbar = buildElement('div');

    const exportImg = buildElement('a', 'Export', {
        href: '',
        download: 'image.png',
    });
    exportImg.addEventListener('click', () => {
        exportImg.href = canvas.toDataURL('image/png', 1.0);
    });

    toolbar.appendChild(exportImg);
    document.body.appendChild(toolbar);
})();
