(function () {
    // slightly modified version of the util function
    function b(type: string, text?: string, attributes?: { [key: string]: string }, children?: HTMLElement[]) {
        let element = document.createElement(type.toString());
        element.innerText = text || '';
        if (attributes) {
            Object.keys(attributes).forEach((item) => {
                if (element.hasAttribute(item)) {
                    if (item.includes('data_')) {
                        element.setAttribute(item.replace(new RegExp('_', 'g'), '-'), attributes[item]);
                    } else {
                        element.setAttribute(item, attributes[item]);
                    }
                }
            });
        }
        if (children) {
            children.forEach((i) => element.appendChild(i));
        }
        return element;
    }

    const fileType = window.location.href.split('.')[window.location.href.split('.').length - 1];

    const container = b('div', '', { style: 'margin:auto;text-align:center' });

    // redraws original image into canvas
    const img = new Image();
    let i = document.body.querySelector('img');
    if (i != null) {
        img.src = i.src;
    }

    // todo: reconvert to b() form after coercion added
    const canvas = document.createElement('canvas');
    canvas.setAttribute('style', 'max-width:80%;margin:auto;text-align:center;');

    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    img.addEventListener('load', function () {
        canvas.height = this.naturalHeight;
        canvas.width = this.naturalWidth;

        ctx?.drawImage(this, 0, 0);
    });

    document.body.querySelector('img')?.remove();
    document.body.appendChild(container);

    // container for tools (filters, reset, export, etc.)
    const toolbar = b('div', '', { className: 'toolbar' });

    // available filters
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
        {
            name: 'Hue Rotate',
            unit: 'deg',
            min: -360,
            max: 360,
            value: 0,
        },
        {
            name: 'Brightness',
            unit: '%',
            min: 0,
            max: 500,
            value: 100,
        },
        {
            name: 'Invert',
            unit: '%',
            min: 0,
            max: 100,
            value: 0,
        },
        {
            name: 'Saturate',
            unit: '%',
            min: 0,
            max: 500,
            value: 0,
        },
        {
            name: 'Sepia',
            unit: '%',
            min: 0,
            max: 100,
            value: 0,
        },
    ];

    // updates image, uses all existing filters
    const redrawFilters = () => {
        let allFilters = '';
        document.querySelectorAll<HTMLElement>('.toolbar input[type="range"]').forEach((item) => {
            let unit = filters.filter((i) => i.name.replace(new RegExp(' ', 'g'), '-').toLowerCase() == item.id)[0];
            allFilters += `${item.id}(${item.getAttribute('value')}${unit.unit}) `;
        });
        if (ctx != null) {
            ctx.filter = allFilters;
            ctx.drawImage(img, 0, 0);
        }
    };

    // generates range elements for filter manipulation
    filters.forEach((item) => {
        let label = b('label', `${item.name}: ${item.value}${item.unit}`, {
            for: item.name.replace(new RegExp(' ', 'g'), '-').toLowerCase(),
        });
        let range = b('input', '', {
            type: 'range',
            min: item.min.toString(),
            max: item.max.toString(),
            value: item.value.toString(),
            id: item.name.replace(new RegExp(' ', 'g'), '-').toLowerCase(),
        });
        range.addEventListener('change', () => {
            label.innerText = `${item.name}: ${range.getAttribute('value')}${item.unit}`;
            redrawFilters();
        });

        toolbar.appendChild(label);
        toolbar.appendChild(range);
    });

    // generates a button to reset filters
    const reset = b('input', '', {
        type: 'reset',
        value: 'Clear filters',
    });
    reset.addEventListener('click', () => {
        if (ctx != null) {
            ctx.filter = 'none';
            ctx.drawImage(img, 0, 0);
        }

        document.querySelectorAll<HTMLElement>('.toolbar input[type="range"]').forEach((item) => {
            let filter = filters.filter((i) => i.name.replace(new RegExp(' ', 'g'), '-').toLowerCase() == item.id)[0];
            item.setAttribute('value', filter.value.toString());
            const p = item.previousElementSibling;
            if (p != null) {
                // @ts-expect-error
                // todo: fix error
                p.innerText = `${filter.name}: ${filter.value}${filter.unit}`;
            }
        });
    });
    toolbar.appendChild(reset);

    // image export button
    const exportLabel = b('label', 'Export image as...', {
        for: 'export-img',
    });
    const exportImg = b('select', '', { id: 'export-img' }) as HTMLInputElement;
    const formats = ['PNG', 'JPEG'];
    formats.forEach((item) => exportImg.appendChild(b('option', item, { value: `image/${item.toLowerCase()}` })));
    exportImg.addEventListener('input', () => {
        let l = b('a', '', {
            href: canvas.toDataURL(`${exportImg.value}`, 1.0),
            download: `image-${new Date().getTime()}.${exportImg.value.split('/')[1]}`,
        });
        l.click();
    });

    toolbar.appendChild(exportLabel);
    toolbar.appendChild(exportImg);
    document.body.appendChild(toolbar);
})();
