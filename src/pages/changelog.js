import buildElement from '../libs/utils.js';

// generates a changelog link in the first nav
browser.runtime.sendMessage({
    settings: "get-manifest",
}).then(resp => {
    document.querySelector('nav').appendChild(buildElement('a', `Changelog (${resp.version.slice(0, resp.version.lastIndexOf('.'))})`, {
        href: `https://github.com/EthanJustice/kestrel#v${resp.version.split('.')[0] + resp.version.split('.')[1]}`
    }));
});