// switches page theme by toggling media query rules
(function () {
    if (!document.body.dataset.theme)
        document.body.dataset.theme =
            window.matchMedia('(prefers-color-scheme:dark)').matches == true ? 'dark' : 'light';

    const currentThemeColour = () => {
        if (document.body.dataset.theme != null) {
            return document.body.dataset.theme;
        } else {
            return false;
        }
    };

    const oppositeColour = () => {
        let current = document.body.dataset.theme; // current theme
        return current == 'dark' ? 'light' : 'dark';
    };

    // docment.styleSheets doesn't have an iterator
    for (let i = 0; i < document.styleSheets.length; i++) {
        let sheet = document.styleSheets[i];
        if (sheet.disabled == true) return;

        Array.from(sheet.cssRules).forEach((rule, index) => {
            if (rule.cssText.startsWith('@media') == true && rule.cssText.includes('color') == true) {
                sheet.removeRule(index);
                const t = currentThemeColour();
                if (t != false) {
                    sheet.insertRule(rule.cssText.replace(t, oppositeColour()), index);
                }
                document.body.dataset.theme = oppositeColour();
            }
        });
    }
})();
