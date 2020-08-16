// prevents all links from working
// note: there is no enable links function for a purpose; this command is to stop time wasting
(function () {
    document.querySelectorAll("a[href]").forEach(item => (item.style.pointerEvents = "none"));
}());