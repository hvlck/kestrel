// hides/shows video
(function () {
    let toggled = Object.values(document.querySelectorAll('video')).some((element) => element.style.display == 'none');
    if (toggled == false) {
        document.querySelectorAll("video").forEach(item => (item.style.display = "none"));
    } else if (toggled == true) {
        document.querySelectorAll("video").forEach(item => (item.style.display = ""));
    }
}());