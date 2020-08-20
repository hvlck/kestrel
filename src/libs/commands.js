import Taita from './taita.js';

// Command palette variables
const commands = {
    disableLinks: {
        name: 'Disable all links',
        callback: 'disableLinks',
        on: false,
    },
    openInSameTab: {
        name: 'Open all links in the current tab',
        callback: 'openInSameTab',
    },
    openSettings: {
        name: 'Open settings page',
        callback: 'openSettings',
        on: false,
    },
    refreshTabs: {
        name: 'Refresh all tabs: soft',
        callback: 'refreshTabs',
        aliases: ['Refresh all tabs: hard'],
    },
    scrollToTop: {
        name: 'Scroll to top of the page',
        callback: 'scrollToTop',
    },
    scrollToBottom: {
        name: 'Scroll to the bottom of the page',
        callback: 'scrollToBottom',
    },
    scrollToMiddle: {
        name: 'Scroll to the middle of the page',
        callback: 'scrollToMiddle',
    },
    scrollToOneFourth: {
        name: 'Scroll to 1/4 of the page',
        callback: 'scrollToOneFourth',
        on: false,
    },
    scrollToThreeFourths: {
        name: 'Scroll to 3/4 of the page',
        callback: 'scrollToThreeFourths',
        on: false,
    },
    toggleAnimations: {
        name: 'Toggle animations: off',
        callback: 'toggleAnimations',
    },
    toggleEditPage: {
        name: 'Toggle page editing',
        callback: 'editPage',
        on: false,
    },
    toggleMedia: {
        name: 'Toggle media',
        callback: 'toggleMedia',
    },
    toggleVideo: {
        name: 'Toggle video',
        callback: 'toggleVideo',
    },
    toggleImages: {
        name: 'Toggle images',
        callback: 'toggleImages',
    },
    toggleMiniMap: {
        name: 'Toggle minimap',
        callback: 'toggleMiniMap',
        on: false,
    },
    togglePageTheme: {
        name: 'Toggle page theme',
        callback: 'togglePageTheme',
        on: false,
    },
};

// list of automatic tasks, where keys are names of command functions
const automaticCommandsList = {
    loader: false,
    minimap: false,
    linksInSameTab: false,
    noSameSiteLinks: false,
};

// settings for automatic tasks
const automaticSettings = {
    loader: {
        colour: '#16c581',
        height: 2,
        persist: false,
    },
    minimap: {
        colour: `#16c581`,
    },
};

// taita instance
const taita = new Taita(commands, {
    sort: 'alphabetical',
});

export { commands, taita, automaticCommandsList, automaticSettings };
