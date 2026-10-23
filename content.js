// content.js  - IMPORTANT _ KEEP VERSION ON LINE 2 UP TO DATE
let version = "2.0.0";

// Adds the MinWinTidHelper buttons to the minWINTID Maintenance page. The owl lives in owl.js.
const DEFAULTS = {
    startTime: '09:00',
    endTime: '16:35',
    dayLength: '07:35',
    music: false,
    manual: false,
    randomness: false,
    showOwl: true,
};

let settings = { ...DEFAULTS };
chrome.storage.sync.get(DEFAULTS).then((stored) => {
    settings = stored;
    Owl.setVisible(settings.showOwl);
});
// Changes in the options page apply right away, no reload needed.
chrome.storage.onChanged.addListener((changes) => {
    for (const [key, { newValue }] of Object.entries(changes)) settings[key] = newValue;
    Owl.setVisible(settings.showOwl);
});

// ############## helpers ##############

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isVisible = (el) => !!el && (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0);

// An error whose message is meant for the user.
class HelperError extends Error {}

// Polls until check() is truthy. Returns false if it timed out.
async function until(check, timeout) {
    const end = performance.now() + timeout;
    while (performance.now() < end) {
        if (check()) return true;
        await sleep(10);
    }
    return false;
}

const loaderVisible = () => isVisible($('.loader-overlay-main'));

const wait = {
    // Measured in minWINTID: after clicking a day, "Inn/Ut" or "Beregn", the loader shows within
    // ~20 ms and hides once the data is in (0.1-1.5 s). Until then the page can show stale data,
    // e.g. a Saturday briefly looks like an empty 07:35 workday. So wait for a full loader cycle.
    // If the loader never shows, we've waited 1.5 s, longer than the old fixed wait.
    // The server can be slow, so there's no fixed limit on the load itself: we wait until the
    // loader has stayed hidden for 150 ms (it may flicker between requests), and give up only
    // after a minute, so we never act on a half-loaded day.
    async loader() {
        if (!(await until(loaderVisible, 1500))) return;
        const end = performance.now() + 60000;
        let hiddenSince = null;
        while (performance.now() < end) {
            if (loaderVisible()) hiddenSince = null;
            else if (performance.now() - (hiddenSince ??= performance.now()) >= 150) return;
            await sleep(10);
        }
        throw new HelperError('minWINTID svarer ikke. Lasteren forsvant ikke på ett minutt, så jeg stoppet.');
    },
    // Absence flow: not measured yet, so these stay the fixed waits from 1.x.
    short: () => sleep(1000),
    long: () => sleep(2000),
};

function setInput(input, value) {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
}

const toMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};
const toTime = (minutes) => {
    const m = ((minutes % 1440) + 1440) % 1440;
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

// Moves start and end by the same 1-30 minutes, earlier or later, so the day length stays the same.
function shuffleTimes(startTime, endTime) {
    const shift = (Math.floor(Math.random() * 30) + 1) * (Math.random() < 0.5 ? 1 : -1);
    return [toTime(toMinutes(startTime) + shift), toTime(toMinutes(endTime) + shift)];
}

// The day's date, from the title attribute "dd.mm.yyyy ...".
function dayDate(dayElement) {
    const [day, month, year] = dayElement.getAttribute('title').substr(0, 10).split('.');
    return new Date(+year, month - 1, +day);
}

let busy = false;
// Runs one action at a time, so a double click can't start two fills at once.
const exclusive = (action) => async () => {
    if (busy) {
        Owl.say('Jeg er opptatt, et øyeblikk! 🦉');
        return;
    }
    busy = true;
    try {
        await action();
    } catch (e) {
        console.error('[MinWinTidHelper]', e);
        Owl.toast(e instanceof HelperError ? e.message : 'Noe gikk galt. Se konsollen for detaljer.', 'error', 8000);
    } finally {
        busy = false;
    }
};

// ############## actions ##############

// Fills the open day with the user's normal hours. Returns the times used, or null if it couldn't.
async function fillDay({ quiet = false } = {}) {
    const registrations = $('#registrations');
    if (!registrations?.innerHTML.includes('Ingen registreringer denne dagen')) {
        if (!quiet) Owl.toast('Kan bare fylle ut en tom dag.', 'error');
        return null;
    }

    let { startTime, endTime } = settings;
    if (settings.randomness) [startTime, endTime] = shuffleTimes(startTime, endTime);

    $('#addInOut').click();
    await wait.loader();
    await until(() => $$("[data-cy='time-input']").length === 2, 500);

    const timeInputs = $$("[data-cy='time-input']");
    if (timeInputs.length !== 2) {
        Owl.toast('Kan ikke fylle ut en dag som ikke er over ennå.', 'error');
        return null;
    }

    setInput(timeInputs[0], startTime);
    await sleep(50);
    setInput(timeInputs[1], endTime);
    await sleep(50);

    // Good to go, hit it!
    $(settings.manual ? '#save-registrations-button' : '#calculate-button').click();
    return { startTime, endTime };
}

// Adds an absence of the given type (e.g. "Trening"), optionally limited to a time span.
async function addAbsence(type, hours) {
    $('#expand-absence').click();
    await wait.short();
    $('#absence-list').click();
    await wait.long();

    for (const tbody of $$('[id^="vue-scroll-table"] tbody')) {
        const cells = tbody.querySelector('tr')?.querySelectorAll('td') ?? [];
        for (const cell of cells) {
            if (cell.innerHTML.includes(type)) cell.click();
        }
    }
    await wait.short();

    if (hours) {
        setInput($('#createAbsence-hours-first'), hours[0]);
        setInput($('#createAbsence-hours-last'), hours[1]);
        await wait.short();
    }
    $('#save-absence-form').click();
}

async function fillMonth() {
    const today = new Date();
    // Skip days with a correction (purple dot) and days in the future.
    const days = $$('.day-container:not(.day-outside-month)').filter(
        (el) => el.getElementsByClassName('day-correction').length === 0 && dayDate(el) < today
    );

    let stopped = false;
    const panel = Owl.progress('Fyller ut måneden', days.length, () => (stopped = true));
    const music = settings.music ? new Audio(chrome.runtime.getURL('music/elevator.mp3')) : null;
    if (music) {
        music.loop = true;
        music.play();
    }
    Owl.say(settings.music ? 'Heisemusikk på, nå fører vi timer! 🎶' : 'Huu-huu! Da setter vi i gang.', 2000);

    let filled = 0;
    let skipped = 0;
    try {
        for (const [i, day] of days.entries()) {
            if (stopped) break;
            Owl.flyTo(day);
            day.click();
            await wait.loader();

            const dayIsEmpty = $$("[data-cy='no-registrations-on-day']").length === 1;
            const dayIsWorkDay = $('#scheme_length_input_attendance').value === settings.dayLength;

            if (dayIsWorkDay && dayIsEmpty) {
                if (!(await fillDay({ quiet: true }))) break;
                await wait.loader();
                filled++;
                Owl.mark(day);
            } else {
                console.log('Ikke arbeidsdag, eller finnes registrering for: ' + day.getAttribute('title'));
                skipped++;
                Owl.mark(day, true);
            }
            panel.update(i + 1, `${filled} ført · ${skipped} hoppet over`);
        }
    } finally {
        music?.pause();
        panel.end();
        await Owl.goHome();
    }

    if (stopped) {
        Owl.toast(`Stoppet. Førte ${filled} dager.`);
    } else {
        Owl.toast(`Ferdig! Førte ${filled} dager, hoppet over ${skipped}.`, 'success', 6000);
        Owl.say('Huu-huu! Måneden er ført 🎉');
        await Owl.celebrate();
    }
}

// ############## approval ##############

const MONTHS = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];

// The month shown in the calendar, from its caption, e.g. "Oktober 2025".
function getDisplayedMonthYear() {
    const [monthName, year] = $('.month-table caption').textContent.trim().split(' ');
    return { year: parseInt(year, 10), monthIndex: MONTHS.indexOf(monthName) };
}

const getDaysInMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0).getDate();

// The first half runs from the 1st through the end of the second full week (Monday to Sunday).
function getFirstHalf() {
    const { year, monthIndex } = getDisplayedMonthYear();
    const weekdayOfFirst = new Date(year, monthIndex, 1).getDay(); // 0=Sunday,1=Monday,...6=Saturday
    const daysInMonth = getDaysInMonth(year, monthIndex);
    if (weekdayOfFirst === 0) return [1, Math.min(15, daysInMonth)]; // 1 partial day (Sunday) + 2 full weeks
    const firstMonday = 1 + ((1 - weekdayOfFirst + 7) % 7);
    return [1, Math.min(firstMonday + 13, daysInMonth)];
}

async function approveDayRange(startDay, endDay) {
    const { year, monthIndex } = getDisplayedMonthYear();
    endDay = Math.min(endDay, getDaysInMonth(year, monthIndex));

    const dayMap = {};
    for (const el of $$('.day-container:not(.day-outside-month)')) {
        const date = dayDate(el);
        if (date.getFullYear() === year && date.getMonth() === monthIndex) dayMap[date.getDate()] = el;
    }

    let stopped = false;
    const total = endDay - startDay + 1;
    const title = `Godkjenner ${startDay}.–${endDay}. ${MONTHS[monthIndex].toLowerCase()}`;
    const panel = Owl.progress(title, total, () => (stopped = true));
    let approved = 0;
    try {
        for (let dayNum = startDay; dayNum <= endDay && !stopped; dayNum++) {
            const el = dayMap[dayNum];
            if (el) {
                Owl.flyTo(el);
                el.click();
                await wait.loader();

                const approveBtn = $('[data-cy="btn-approve-day"]');
                if (approveBtn && !approveBtn.disabled) {
                    approveBtn.click();
                    await wait.loader();
                    approved++;
                    Owl.mark(el);
                } else {
                    console.log('No approve button or already approved for day ' + dayNum);
                    Owl.mark(el, true);
                }
            }
            panel.update(dayNum - startDay + 1, `${approved} godkjent`);
        }
    } finally {
        panel.end();
        await Owl.goHome();
    }
    console.log('Approved days ' + startDay + ' to ' + endDay);
    Owl.toast(`Godkjente ${approved} dager (${startDay}.–${endDay}.).`, 'success');
    if (!stopped) Owl.hop();
}

// ############## buttons ##############

function makeButton(id, icon, label, title, onClick, variant = '') {
    const button = document.createElement('button');
    button.id = id;
    button.type = 'button';
    button.title = title;
    button.className = `mwh-btn ${variant}`;
    button.innerHTML = `<span class="mwh-icon" aria-hidden="true">${icon}</span>`;
    button.append(label);
    button.addEventListener('click', exclusive(onClick));
    return button;
}

async function onFillDay() {
    const times = await fillDay();
    if (times) {
        Owl.say(`Ført ${times.startTime}–${times.endTime} ✓`);
        Owl.hop();
    }
}

async function onTraining() {
    await addAbsence('Trening', ['11:00', '12:00']);
    Owl.say('Trening ført 11–12. Heia! 💪');
    Owl.hop();
}

async function onFlex() {
    await addAbsence('Avvikling fleks');
    Owl.say('Fleksdag ført. Kos deg! 🌴');
    Owl.hop();
}

// minWINTID renders its views on the fly, so (re)insert the buttons whenever they're missing.
function addButtons() {
    const editingDay = $('#editing-day');
    if (editingDay && !$('#dagKnapp')) {
        editingDay.append(
            makeButton('dagKnapp', '⏱️', 'Fyll ut dag', 'Fyll ut dagen med din vanlige arbeidstid', onFillDay, 'mwh-primary'),
            makeButton('treneKnapp', '💪', 'Trene?', 'Legg til trening 11:00–12:00', onTraining),
            makeButton('fleksKnapp', '🌴', 'Fleks?', 'Før hele dagen som avvikling av fleks', onFlex)
        );
    }
    const approval = $('#addApprovalBtn');
    if (approval && !$('#mndKnapp')) {
        approval.after(
            makeButton('mndKnapp', '🦉', 'Auto-fyll mnd', 'Fyll ut alle dager uten registreringer med din vanlige arbeidstid', fillMonth, 'mwh-primary'),
            makeButton('approveFirst', '✔️', 'Godkjenn halve', 'Godkjenn første halvdel av måneden', () => approveDayRange(...getFirstHalf()))
        );
    }
}

addButtons();
setInterval(addButtons, 1000);
