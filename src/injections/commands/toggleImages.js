// hides/shows images
(function () {
    let toggled = Object.values(document.querySelectorAll('img')).some((element) => element.style.display == 'none');
    if (toggled == false) {
        document.querySelectorAll("img").forEach(item => (item.style.display = "none"));
    } else if (toggled == true) {
        document.querySelectorAll("img").forEach(item => (item.style.display = ""));
    }
}());