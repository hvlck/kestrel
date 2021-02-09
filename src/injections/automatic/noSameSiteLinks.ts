// disables all links that go to the current page
(function () {
    document.body.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((item) => {
        if (item.href.includes('#') || item.href.includes('?')) return;
        if (item.href == window.location.href) {
            item.addEventListener('click', (e) => e.preventDefault());
        }
    });
})();
