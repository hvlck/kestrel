// opens all links in the same tab
(function () {
    document.body
        .querySelectorAll<HTMLAnchorElement>('a[href]')
        .forEach((link) => link.setAttribute('target', '_self'));
})();
