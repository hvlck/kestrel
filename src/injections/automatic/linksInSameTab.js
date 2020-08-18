// opens all links in the same tab
// see the openInSameTab in /src/cs/kestrel.js
(function () {
    document.body
        .querySelectorAll("a[href]")
        .forEach(link => link.setAttribute("target", "_self"));
})();
