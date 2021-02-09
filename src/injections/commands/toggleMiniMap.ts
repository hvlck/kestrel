// toggles a mini-map, similar to VSCode's
// see https://css-tricks.com/using-the-little-known-css-element-function-to-create-a-minimap-navigator/
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

    const mm = document.querySelector('div[data-kestrel-mini-map][id="kestrel-mini-map"]');
    if (mm) {
        const container = document.querySelector('div[id="kestrel-mini-map-container"]');
        if (container) {
            Object.values(container.children).forEach((item) => document.body.appendChild(item));

            container.remove();

            mm.remove();
        }
    } else {
        const container = b('div', '', {
            id: 'kestrel-mini-map-container',
        });

        Object.values(document.body.children).forEach((item) => {
            if (!item.className.includes('kestrel')) {
                container.appendChild(item);
            }
        });

        document.body.appendChild(container);

        let minimap = b('div', '', {
            data_kestrel_mini_map: 'true',
            id: 'kestrel-mini-map',
            class: 'kestrel-mini-map',
        });

        let selection = b('input', '', {
            type: 'range',
            id: 'kestrel-mini-map-slider',
            max: '100',
            value: '0',
        });

        minimap.appendChild(selection);
        minimap.style.display = 'block';

        document.body.appendChild(minimap);

        const recalculate = () => {
            let dimensions = `${
                (parseInt(getComputedStyle(selection).width) * parseInt(getComputedStyle(container).height)) /
                parseInt(getComputedStyle(container).width)
            }px`;

            selection.style.width = dimensions;
            minimap.style.height = dimensions;
        };

        recalculate();

        window.addEventListener('resize', () => recalculate());
        window.addEventListener(
            'scroll',
            () => {
                let percentage =
                    ((document.documentElement.scrollTop || document.body.scrollTop) /
                        ((document.documentElement.scrollHeight || document.body.scrollHeight) -
                            document.documentElement.clientHeight)) *
                    100;
                // @ts-expect-error
                // todo: find way to coerce return type of util b() function into a more specific html element (e.g. HTMLElement -> HTMLInputElement)

                selection.value = percentage;
            },
            { passive: true }
        );

        selection.addEventListener('change', (event) => {
            // @ts-expect-error
            // todo: find value property
            scrollTo(0, parseInt(getComputedStyle(container).height) * (event.target.value / 100));
        });
    }
})();
