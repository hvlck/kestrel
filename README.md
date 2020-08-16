# kestrel

General browser utilities.

![Kestrel's Icon](https://raw.githubusercontent.com/EthanJustice/kestrel/master/src/icons/icon.png)

There's not much implemented right now, and what is is somewhat simplistic.  More complicated features are coming.

The extension hasn't been submitted to FireFox addons just yet, but once some of the markers in the roadmap are hit and a lot more commands/features are added, it will be.  Stability also needs to be improved before I'll submit it.

## Table of Contents

+ [Features](#features)
+ [FAQ](#faq)
+ [Usage](#usage)
+ [Screenshots](#screenshots)
+ [Roadmap](#roadmap)
+ [Docs](#docs)
+ [Motivation](#motivation)
+ [License](#license)

## Features

TODO: Update

+ Disable all links [none]
+ Hide media (images/video) [none]
+ Open all links in the same tab [none]
+ Refresh tabs [tabs]
+ Scroll to *x* [none]
+ Show media (images/video) [none]
+ Toggle animations [none]
+ Edit page [none] {in-progress}
+ Mini-map [none] {in-progress}

## FAQ

TODO: Finish section

### How Are Permissions Used

The [features](#features) section lists the permissions that each feature uses.

TODO: General overview of how permissions are used

### How Do I Change Kestrel's Default Activation Command

See [this article](https://support.mozilla.org/en-US/kb/manage-extension-shortcuts-firefox) from Mozilla.

## Usage

Kestrel is currently not listed on any addons store, and it will stay that way until **at least** 1.0.  The current version can be found in the `version` key of the [manifest](https://github.com/EthanJustice/kestrel/blob/master/src/manifest.json).

There's not much to see right now.  The main part is activated with `Alt+Shift+Q`.  Why Q?  All the keys can be hit with one hand.

### Development

1. Download Kestrel
2. Go to `about:debugging`
3. Click on `This Firefox`
4. Click on `Load Temporary Add-on...`
5. Navigate to wherever you downloaded Kestrel and open `src/manifest.json` in the prompt
6. You're good to go!

## Screenshots

TODO: Finish section

## Roadmap

+ Performance Testing with **about:performance** [meta]
+ Better docs (diagrams, etc.) [meta]

### High

+ Security [bug] {in-progress}

### Medium

+ Refactoring [meta]
+ Better onboarding/user-friendly docs [meta] {in-progress}
+ Homepage [meta] {in-progress}
+ Customisation of highlight colour [feature]
+ Better mini-map styling [bug]

### Low

+ Fix injection styling inconsistencies [bug] {in-progress}

### Abandoned/Ultra-Low Priority

+ ~~User-set activation/close command [feature]~~ [abandoned - see [](https://github.com/EthanJustice/kestrel/)]
+ Dynamic permission requests [feature] (see [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/optional_permissions) for all permissions that can be requested dynamically - of these, only a few are not needed automatically)

I also have a list of other features I'm working on that I'll port over when I can.

## Docs

File structure

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
            scriptApi.js - userscript API
        /cs - content scripts
            /automatic - automatic content scripts, injected at page load
            kestrel.js - logic for commands
            ui.css - styling for command palette
            ui.js - logic for command palette
        /icons - kestrel icons
        /injections - files for commands that require injections
            /minimap - injection files for minimap command
        /libs - libraries and files used across multiple folders
            commands.js - list of commands, aliases, and callbacks
            index.css - base stylesheet for all pages
            taita.js - command palette logic processor
            utils.js - utility
            /themes - various themes
        /pages
            /settings - extension settings page
                index.html - settings page
                settings.css - form styling, some stlying specific to /settings
                settings.js - object with settings, descriptions, etc.
                update.js - settings page logic
            /media - images
            /guide - kestrel guide
            /reference - kestrel reference
        /themes - reusable themes
            dark.css - dark theme variables
            light.css - light theme variables
```

Messaging between extension parts

```plaintext
background -> ui.js/kestrel.js
+ Showing/hiding UI (because Kestrel uses the Command API, rather than a DOM event)
+ Initial handshake (needs to be expanded on in the future)

ui.js/kestrel.js -> background
+ (kestrel.js) Settings command - open settings
+ (kestrel.js) Hard/soft refresh command - has to query and refresh all tabs
+ (kestrel.js) Minimap command - injects minimap styles and scripts

auto.js -> background
+ Injects scripts that run automatically
```

Extension storage (all are customised in the options page)

```plaintext
automatic - automatic tasks, and whether they're enabled

automaticsettings - settings for automatic tasks

commands - all commands, and whether they're enabled

theme - string - kestrel's theme (light, dark, or operating-system-default, which uses the (prefers-color-scheme) media query)
```

## Motivation

Kestrel is simply a collection of utilities that I wished browsers included (and they may, I probably just didn't find them), wrapped in convenience (as opposed to several hundred small UserScripts).  I've built it to present as little overhead on general performance as possible, but there's still much to be done.

## License

MIT
