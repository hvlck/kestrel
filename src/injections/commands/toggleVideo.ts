// hides/shows video
(function () {
    const vid = document.querySelectorAll('video');
    const toggled = Object.values(vid).some((element) => element.style.display == 'none');
    if (toggled == false) {
        vid.forEach((item) => (item.style.display = 'none'));
    } else if (toggled == true) {
        vid.forEach((item) => (item.style.display = ''));
    }
})();
