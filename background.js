// background.js - opens the options page, which content scripts can't do themselves.
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'openOptions') chrome.runtime.openOptionsPage();
});

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());
