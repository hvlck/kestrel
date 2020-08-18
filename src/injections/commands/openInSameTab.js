// opens all links in the same tab
(function () {
    document.body.querySelectorAll("a[href]").forEach(link => link.setAttribute("target", "_self"));
}());