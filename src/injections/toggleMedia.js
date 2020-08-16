// hides/shows images and video
(function () {
    let toggled = Object.values(document.querySelectorAll('img,video')).some((element) => element.style.display == 'none');
    if (toggled == false) {
        document.querySelectorAll("img,video").forEach(item => (item.style.display = "none"));
    } else if (toggled == true) {
        document.querySelectorAll("img,video").forEach(item => (item.style.display = ""));
    }
}());