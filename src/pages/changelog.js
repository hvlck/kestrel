import buildElement from '../libs/utils.js';

// generates a changelog link in the first nav
browser.runtime.sendMessage({
    settings: "get-manifest",
}).then(resp => {
    document.querySelector('nav').appendChild(buildElement('a', `Changelog (${resp.version})`, {
        href: `https://github.com/EthanJustice/kestrel#v${resp.version}`
    }));
});