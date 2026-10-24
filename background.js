// background.js - opens the options page (content scripts can't) and checks GitHub for a newer
// release (from here, since minWINTID's page CSP may block the request from a content script).
// Releases are made by the "Ny versjon" workflow in .github/workflows/release.yml.
const REPO = 'https://github.com/ivaruf/MinWinTidHelper';
const LATEST_RELEASE_API = 'https://api.github.com/repos/ivaruf/MinWinTidHelper/releases/latest';
const CHECK_EVERY_MS = 6 * 60 * 60 * 1000; // GitHub allows 60 unauthenticated requests per hour per IP
const IS_FIREFOX = chrome.runtime.getURL('').startsWith('moz-extension:');

// "2.0.10" is newer than "2.0.9".
function isNewer(latest, current) {
    const a = latest.split('.').map(Number);
    const b = current.split('.').map(Number);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0);
    }
    return false;
}

// The "what's new" line from the workflow comes first in the notes; GitHub's generated notes
// (headings, bullet lists, "Full Changelog" links) come after it and are skipped.
function summaryOf(notes = '') {
    const line = notes
        .split('\n')
        .map((l) => l.trim())
        .find((l) => l && !/^(#|\*|-|\*\*Full Changelog)/.test(l));
    return line ?? '';
}

async function fetchLatestRelease() {
    const response = await fetch(LATEST_RELEASE_API, { headers: { Accept: 'application/vnd.github+json' } });
    if (response.status === 404) return null; // no releases yet
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const release = await response.json();
    const zip = release.assets?.find((a) => a.name.includes(IS_FIREFOX ? 'firefox' : 'chrome'));
    return {
        version: release.tag_name.replace(/^v/, ''),
        summary: summaryOf(release.body),
        downloadUrl: zip?.browser_download_url ?? release.html_url,
        changesUrl: release.html_url,
    };
}

// Uses the last answer for a few hours unless forced (a click on the version line).
async function checkForUpdate(force) {
    const current = chrome.runtime.getManifest().version;
    let { release, checkedAt = 0 } = await chrome.storage.local.get(['release', 'checkedAt']);
    let failed = false;
    if (force || !checkedAt || Date.now() - checkedAt > CHECK_EVERY_MS) {
        try {
            release = await fetchLatestRelease();
            await chrome.storage.local.set({ release, checkedAt: Date.now() });
        } catch (e) {
            console.warn('[MinWinTidHelper] Fikk ikke sjekket GitHub etter ny versjon', e);
            failed = true;
        }
    }
    return {
        current,
        failed,
        latest: release?.version,
        summary: release?.summary ?? '',
        updateAvailable: !!release && isNewer(release.version, current),
        downloadUrl: release?.downloadUrl ?? `${REPO}/releases`,
        changesUrl: release?.changesUrl ?? `${REPO}/releases`,
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
