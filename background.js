// background.js - opens the options page, from the birdhouse in minWINTID or the toolbar icon.
// (Content scripts can't open it themselves.)
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'openOptions') chrome.runtime.openOptionsPage();
});

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());
