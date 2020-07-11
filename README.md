# kestrel

General browser utilities.

![Kestrel's Icon](https://raw.githubusercontent.com/EthanJustice/kestrel/master/src/icons/icon.png)

There's not much implemented right now, and what is is somewhat simplistic.  More complicated features are coming.

The extension hasn't been submitted to FireFox addons just yet, but once some of the markers in the roadmap are hit and a lot more commands/features are added, it will be.  Stabilitiy also needs to be improved before I'll submit it.

## How Permissions are Used

See [Features](#features).

## Features

+ Disable all links [none]
+ Hide media (images/video) [none]
+ Open all links in the same tab [none]
+ Settings [none]
+ Refresh tabs [tabs]
+ Scroll to *x* [none]
+ Show media (images/video) [none]
+ Toggle animations [none]
+ Edit page [none] {in-progress}
+ Minimap [none] {in-progress}

## Usage

There's not much to see right now.  The main part is activated with `Alt+Shift+Q` on everything but Linux, which is `Cmd+Shift+Q`.  Why Q?  All the keys can be hit with one hand.

## Roadmap

+ Performance Testing with *about:performance* [meta]
+ Use arrays to control ports in background scripts, in order to have multiple connections open simultaneously [bug]
+ Refactor options page, and split files [meta]
+ [Possible] Move `/themes` into `/libs` [meta]
+ Better folder naming [meta]
+ Variables for CSS class names, for future-proofing [bug]
+ Fix injection styling inconsistencies [bug]
+ Options page and browser storage for settings [feature]
+ ~~Refactor `Hide/Show Media` commands into `Toggle Media`~~ [meta]

I also have a list of other features I'm working on that I'll port over when I can.

```plaintext
readme.md - meta information
license - MIT
    /meta/ - meta
        /icon - icon generation files
            index.html - icon generation
    /src/ - extension
        manifest.json - WebExtension manifest
        /background - background scripts
            main.js - primary background script, controls injection logic
        /contentscripts - content scripts
            auto.js - things that run automatically
            kestrel.js - logic for commands
            ui.css - styling for command palette
            ui.js - logic for command palette
        /icons - kestrel icons
        /injections - files for commands that require injections
            /minimap - injection files for minimap command
        /libs - libraries and files used across multiple folders
            commands.js - list of commands, aliases, and callbacks
            taita.js - command palette logic processor
            utils.js - utility
        /options - extension options page
            index.css - option page styling
            index.html - option page
            update.js - option page logic
        /themes - reusable themes
            dark.css - dark theme variables
            light.css - light theme variables
```

## License

MIT
