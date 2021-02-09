// generates a changelog link in the first nav
import b, { ElementTag } from '../libs/utils.js';
import { browser } from 'webextension-polyfill-ts';

browser.runtime
    .sendMessage({
        meta: 'get-manifest',
    })
    .then((resp) => {
        const nav = document.querySelector('nav');
        if (nav) {
            nav.appendChild(
                b(ElementTag.A, `Changelog (${resp.version.slice(0, resp.version.lastIndexOf('.'))})`, {
                    href: `https://github.com/EthanJustice/kestrel#v${
                        resp.version.split('.')[0] + resp.version.split('.')[1]
                    }`,
                })
            );
        }
    });
