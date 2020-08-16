(function () {
    let b = document.body;
    if (b.contentEditable == "inherit" || b.contentEditable == "false") {
        b.contentEditable = "true";
        document.body
            .querySelectorAll("a[href]")
            .forEach(b => b.setAttribute("disabled", "true"));
    } else if (b.contentEditable == "true") {
        b.contentEditable = "false";
        document.body
            .querySelectorAll("a[href]")
            .forEach(b => b.removeAttribute("disabled"));
    }
}());