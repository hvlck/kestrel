// disables/enables animations
(function () {
    let ref = Object.values(document.body.querySelectorAll('*')).some(item => item.getAnimations().some(animation => animation.playState == "paused"));
    if (ref == false) {
        Object.values(document.body.querySelectorAll("*")).forEach(item => {
            if (item.getAnimations().length == 0) return;

            item.getAnimations().forEach(animation =>
                animation.pause()
            );
        });
    } else if (ref == true) {
        Object.values(document.body.querySelectorAll("*")).forEach(item => {
            if (item.getAnimations().length == 0) return
            item.getAnimations().forEach(animation => animation.play());
        });
    }
}());