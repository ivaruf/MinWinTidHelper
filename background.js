// background.js - opens the options page (content scripts can't) and checks GitHub for a newer
// version (from here, since minWINTID's page CSP may block the request from a content script).
const REPO = 'https://github.com/ivaruf/MinWinTidHelper';
const MANIFEST_URL = 'https://raw.githubusercontent.com/ivaruf/MinWinTidHelper/master/manifest.json';
const CHECK_EVERY_MS = 6 * 60 * 60 * 1000;

// "2.0.10" is newer than "2.0.9".
function isNewer(latest, current) {
    const a = latest.split('.').map(Number);
    const b = current.split('.').map(Number);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0);
    }
    return false;
}

// Uses the last answer for a few hours unless forced (a click on the version line).
async function checkForUpdate(force) {
    const current = chrome.runtime.getManifest().version;
    let { latest, checkedAt = 0 } = await chrome.storage.local.get(['latest', 'checkedAt']);
    let failed = false;
    if (force || !latest || Date.now() - checkedAt > CHECK_EVERY_MS) {
        try {
            const response = await fetch(MANIFEST_URL, { cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            latest = (await response.json()).version;
            await chrome.storage.local.set({ latest, checkedAt: Date.now() });
        } catch (e) {
            console.warn('[MinWinTidHelper] Fikk ikke sjekket GitHub etter ny versjon', e);
            failed = true;
        }
    }
    return {
        current,
        latest,
        failed,
        updateAvailable: !!latest && isNewer(latest, current),
        downloadUrl: `${REPO}/archive/refs/heads/master.zip`,
        changesUrl: `${REPO}/commits/master`,
    };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'openOptions') chrome.runtime.openOptionsPage();
    if (message.type === 'checkForUpdate') {
        checkForUpdate(message.force).then(sendResponse);
        return true; // answers asynchronously
    }
});

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());
