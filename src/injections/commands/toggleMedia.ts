// hides/shows images and video
(function () {
    const i = document.querySelectorAll<HTMLElement>('img,video');
    let toggled = Object.values(i).some((element) => element.style.display == 'none');
    if (toggled == false) {
        i.forEach((item) => (item.style.display = 'none'));
    } else if (toggled == true) {
        i.forEach((item) => (item.style.display = ''));
    }
})();
