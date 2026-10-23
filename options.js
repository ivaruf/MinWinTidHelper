// Options page: reads and saves the settings in chrome.storage.sync.
const DEFAULTS = {
    startTime: '09:00',
    endTime: '16:35',
    dayLength: '07:35',
    music: false,
    manual: false,
    randomness: false,
    showOwl: true,
};
const TIME_FIELDS = ['startTime', 'endTime', 'dayLength'];
const TOGGLES = ['music', 'manual', 'randomness', 'showOwl'];

const $ = (id) => document.getElementById(id);
const isTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const toMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};
const formatDuration = (minutes) => `${Math.floor(minutes / 60)} t ${minutes % 60} min`;

// Accepts "9:00", "0900" and "900" as well, and tidies them to "09:00".
function normalize(value) {
    const digits = value.replace(/\D/g, '');
    const match = value.trim().match(/^(\d{1,2}):(\d{2})$/) ?? (/^\d{3,4}$/.test(digits) ? [null, digits.slice(0, -2), digits.slice(-2)] : null);
    return match ? `${match[1].padStart(2, '0')}:${match[2]}` : value.trim();
}

function validate() {
    let valid = true;
    for (const id of TIME_FIELDS) {
        const ok = isTime($(id).value);
        $(id).setAttribute('aria-invalid', String(!ok));
        valid &&= ok;
    }

    const hint = $('hint');
    hint.className = 'hint';
    if (!valid) {
        hint.textContent = 'Skriv tidene som tt:mm, for eksempel 09:00.';
        hint.classList.add('warn');
        return false;
    }
    const worked = toMinutes($('endTime').value) - toMinutes($('startTime').value);
    if (worked <= 0) {
        hint.textContent = 'Sluttid må være etter starttid.';
        hint.classList.add('warn');
        return false;
    }
    const expected = toMinutes($('dayLength').value);
    hint.textContent =
        worked === expected
            ? `Det blir ${formatDuration(worked)}, akkurat en vanlig arbeidsdag. 👌`
            : `Det blir ${formatDuration(worked)}, mens en vanlig dag er ${formatDuration(expected)}.`;
    return true;
}

async function restore() {
    $('version').textContent = chrome.runtime.getManifest().version;
    const settings = await chrome.storage.sync.get(DEFAULTS);
    for (const id of TIME_FIELDS) $(id).value = settings[id];
    for (const id of TOGGLES) $(id).checked = settings[id];
    validate();
}

async function save() {
    for (const id of TIME_FIELDS) $(id).value = normalize($(id).value);
    const status = $('status');
    if (!validate()) {
        status.textContent = 'Sjekk tidene over.';
        status.className = 'error';
        return;
    }
    const settings = {};
    for (const id of TIME_FIELDS) settings[id] = $(id).value;
    for (const id of TOGGLES) settings[id] = $(id).checked;
    await chrome.storage.sync.set(settings);
    status.textContent = 'Lagret ✓';
    status.className = '';
    // The options open in a tab of their own (from the birdhouse or the toolbar icon), so close it.
    setTimeout(async () => {
        const tab = await chrome.tabs.getCurrent();
        if (tab) chrome.tabs.remove(tab.id);
        else window.close();
    }, 900);
}

for (const id of TIME_FIELDS) {
    $(id).addEventListener('input', validate);
    $(id).addEventListener('blur', () => {
        $(id).value = normalize($(id).value);
        validate();
    });
}
$('save').addEventListener('click', save);
document.addEventListener('keydown', (e) => e.key === 'Enter' && save());
document.addEventListener('DOMContentLoaded', restore);
