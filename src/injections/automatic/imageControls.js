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

    const toolbar = buildElement('div', '', { className: 'toolbar' });

    const filters = [
        {
            name: 'Contrast',
            unit: '%',
            min: 0,
            max: 500,
            value: 100,
        },
        {
            name: 'Grayscale',
            unit: '%',
            min: 0,
            max: 100,
            value: 0,
        },
        {
            name: 'Blur',
            unit: 'px',
            min: 0,
            max: 500,
            value: 0,
        },
    ];

    const redrawFilters = () => {
        let allFilters = '';
        document.querySelectorAll('.toolbar input[type="range"]').forEach((item) => {
            let unit = filters.filter((i) => i.name.toLowerCase() == item.id)[0];
            allFilters += `${item.id}(${item.value}${unit.unit}) `;
        });
        ctx.filter = allFilters;
        ctx.drawImage(img, 0, 0);
    };

    filters.forEach((item) => {
        let label = buildElement('label', `${item.name}: ${item.value}${item.unit}`, {
            for: item.name.toLowerCase(),
        });
        let range = buildElement('input', '', {
            type: 'range',
            min: item.min,
            max: item.max,
            value: item.value,
            id: item.name.toLowerCase(),
        });
        range.addEventListener('change', () => {
            label.innerText = `${item.name}: ${range.value}${item.unit}`;
            redrawFilters();
        });

        toolbar.appendChild(label);
        toolbar.appendChild(range);
    });

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