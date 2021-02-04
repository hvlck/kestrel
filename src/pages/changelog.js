// generates a changelog link in the first nav
import b from '../libs/utils.js';

browser.runtime
    .sendMessage({
        meta: 'get-manifest',
    })
    .then((resp) => {
        document.querySelector('nav').appendChild(
            b('a', `Changelog (${resp.version.slice(0, resp.version.lastIndexOf('.'))})`, {
                href: `https://github.com/EthanJustice/kestrel#v${
                    resp.version.split('.')[0] + resp.version.split('.')[1]
                }`,
            })
        );
    });
