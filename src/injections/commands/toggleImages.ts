// hides/shows images
(function () {
    const img = document.querySelectorAll('img');
    const toggled = Object.values(img).some((element) => element.style.display == 'none');
    if (toggled == false) {
        img.forEach((item) => (item.style.display = 'none'));
    } else if (toggled == true) {
        img.forEach((item) => (item.style.display = ''));
    }
})();
