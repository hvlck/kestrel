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

    const fileType = window.location.href.split('.')[window.location.href.split('.').length - 1];

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

    const contrastLabel = buildElement('label', 'Contrast: 50%', {
        for: 'contrast',
    });
    const contrast = buildElement('input', '', {
        type: 'range',
        min: 0,
        max: 500,
        value: 100,
        id: 'contrast',
    });
    contrast.addEventListener('change', () => {
        contrastLabel.innerText = `Contrast: ${contrast.value}%`;
        ctx.filter = `contrast(${contrast.value}%)`;
        ctx.drawImage(img, 0, 0);
    });

    toolbar.appendChild(contrastLabel);
    toolbar.appendChild(contrast);

    const grayscaleLabel = buildElement('label', 'Grayscale: 50%', {
        for: 'grayscale',
    });
    const grayscale = buildElement('input', '', {
        type: 'range',
        min: 0,
        max: 100,
        id: 'grayscale',
    });
    grayscale.addEventListener('change', () => {
        grayscaleLabel.innerText = `Grayscale: ${grayscale.value}%`;
        ctx.filter = `grayscale(${grayscale.value}%)`;
        ctx.drawImage(img, 0, 0);
    });

    toolbar.appendChild(grayscaleLabel);
    toolbar.appendChild(grayscale);

    const blurLabel = buildElement('label', 'Blur: 50px', {
        for: 'blur',
    });
    const blur = buildElement('input', '', {
        type: 'range',
        min: 0,
        max: 500,
        id: 'blur',
    });
    blur.addEventListener('change', () => {
        blurLabel.innerText = `Blur: ${blur.value}px`;
        ctx.filter = `blur(${blur.value}px)`;
        ctx.drawImage(img, 0, 0);
    });

    toolbar.appendChild(blurLabel);
    toolbar.appendChild(blur);

    const exportImg = buildElement('a', 'Export', {
        href: '',
        download: `image-${new Date().getTime()}.${fileType}`,
    });
    exportImg.addEventListener('click', () => {
        exportImg.href = canvas.toDataURL(`image/${fileType == 'jpeg' ? 'jpeg' : 'png'}`, 1.0);
    });

    toolbar.appendChild(exportImg);
    document.body.appendChild(toolbar);
})();
