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
// The button shimmers while its action runs.
const exclusive = (action, button) => async () => {
    if (busy) {
        Owl.say('Jeg er opptatt, et øyeblikk! 🦉');
        return;
    }
    busy = true;
    button?.classList.add('mwh-busy');
    try {
        await action();
    } catch (e) {
        console.error('[MinWinTidHelper]', e);
        Owl.toast(e instanceof HelperError ? e.message : 'Noe gikk galt. Se konsollen for detaljer.', 'error', 8000);
    } finally {
        busy = false;
        button?.classList.remove('mwh-busy');
    }
};

// ############## actions ##############

// Fills the open day with the user's normal hours. Returns the times used, or null if it couldn't.
const dayIsEmpty = () => !!$('#registrations')?.innerHTML.includes('Ingen registreringer denne dagen');

// Monday 19 October -> "mandag 19. oktober"
const dayLabel = (date) => date.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });

async function fillDay({ quiet = false } = {}) {
    if (!dayIsEmpty()) {
        if (!quiet) Owl.toast('Kan bare fylle ut en tom dag.', 'error');
        return null;
    }

    let { startTime, endTime } = settings;
    if (settings.randomness) [startTime, endTime] = shuffleTimes(startTime, endTime);

    const timeInputs = () => $$("[data-cy='time-input']");
    $('#addInOut').click();
    await wait.loader();
    await until(() => timeInputs().length > 0, 500);

    // A day that isn't over yet only gets an "Inn" field. Filling it in and clicking Inn/Ut again
    // adds the "Ut" field.
    if (timeInputs().length === 1) {
        setInput(timeInputs()[0], startTime);
        await sleep(50);
        $('#addInOut').click();
        await wait.loader();
        await until(() => timeInputs().length === 2, 500);
    }

    const [inTime, outTime] = timeInputs();
    if (timeInputs().length !== 2) {
        Owl.toast('Fant ikke feltene for inn og ut, så jeg fylte ikke ut dagen.', 'error');
        return null;
    }

    setInput(inTime, startTime);
    await sleep(50);
    setInput(outTime, endTime);
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
            const label = dayLabel(dayDate(day));
            panel.setCurrent(`Sjekker ${label}…`);
            Owl.flyTo(day);
            day.click();
            await wait.loader();

            const noRegistrations = $$("[data-cy='no-registrations-on-day']").length === 1;
            const dayIsWorkDay = $('#scheme_length_input_attendance').value === settings.dayLength;

            if (dayIsWorkDay && noRegistrations) {
                panel.setCurrent(`Fører ${label}…`);
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
                panel.setCurrent(`Godkjenner ${dayLabel(dayDate(el))}…`);
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

// Line icons in the style of the flat minWINTID buttons; they inherit the text colour.
const svgIcon = (paths) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
const ICONS = {
    clock: svgIcon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    sparkles: svgIcon('<path d="M10 3l1.9 5.1L17 10l-5.1 1.9L10 17l-1.9-5.1L3 10l5.1-1.9z"/><path d="M18.5 14l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/>'),
    dumbbell: svgIcon('<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>'),
    sun: svgIcon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    checks: svgIcon('<path d="m2 12 4 4 7-8"/><path d="m11 15 1.5 1.5L20 8"/>'),
};

// minWINTID styles plain <button>s, plus a class on some (e.g. .approval-button). Copying the
// classes of the button next to ours gives the same size, font, corners and spacing, also if
// minWINTID changes its look. styles.css adds the owl colours on top.
function makeButton({ id, icon, label, title, onClick, like, cta = false }) {
    const button = document.createElement('button');
    button.id = id;
    button.type = 'button';
    button.title = title;
    const pageClasses = [...($(like)?.classList ?? [])].filter((c) => !/active|disabled|focus/i.test(c));
    button.className = [...pageClasses, 'mwh-btn', ...(cta ? ['mwh-cta'] : [])].join(' ');
    button.innerHTML = `<span class="mwh-icon" aria-hidden="true">${ICONS[icon]}</span>`;
    button.append(label);
    button.addEventListener('click', exclusive(onClick, button));
    return button;
}

// minWINTID's own buttons are separated by whitespace in the markup, so add the same between ours.
const spaced = (buttons) => buttons.flatMap((button) => [' ', button]);

// Shows the busy card until the action and minWINTID's last request are done.
async function whileBusy(title, text, action) {
    const card = Owl.busy(title, text);
    try {
        const result = await action();
        await wait.loader();
        return result;
    } finally {
        card.end();
    }
}

async function onFillDay() {
    if (!dayIsEmpty()) {
        Owl.toast('Kan bare fylle ut en tom dag.', 'error');
        return;
    }
    const times = await whileBusy('Fyller ut dagen', 'Fører din vanlige arbeidstid…', () => fillDay());
    if (times) {
        Owl.say(`Ført ${times.startTime}–${times.endTime} ✓`);
        Owl.hop();
    }
}

async function onTraining() {
    await whileBusy('Legger til trening', '11:00–12:00', () => addAbsence('Trening', ['11:00', '12:00']));
    Owl.say('Trening ført 11–12. Heia! 💪');
    Owl.hop();
}

async function onFlex() {
    await whileBusy('Legger til fleks', 'Hele dagen som avvikling av fleks', () => addAbsence('Avvikling fleks'));
    Owl.say('Fleksdag ført. Kos deg! 🌴');
    Owl.hop();
}

// minWINTID renders its views on the fly, so (re)insert the buttons whenever they're missing.
function addButtons() {
    const editingDay = $('#editing-day');
    if (editingDay && !$('#dagKnapp')) {
        const like = '#calculate-button';
        editingDay.append(
            ...spaced([
                makeButton({ id: 'dagKnapp', icon: 'clock', label: 'Fyll ut dag', title: 'Fyll ut dagen med din vanlige arbeidstid', onClick: onFillDay, like }),
                makeButton({ id: 'treneKnapp', icon: 'dumbbell', label: 'Trene?', title: 'Legg til trening 11:00–12:00', onClick: onTraining, like }),
                makeButton({ id: 'fleksKnapp', icon: 'sun', label: 'Fleks?', title: 'Før hele dagen som avvikling av fleks', onClick: onFlex, like }),
            ])
        );
    }
    const approval = $('#addApprovalBtn');
    if (approval && !$('#mndKnapp')) {
        const like = '#addApprovalBtn';
        approval.after(
            ...spaced([
                makeButton({ id: 'mndKnapp', icon: 'sparkles', label: 'Auto-fyll mnd', title: 'Fyll ut alle dager uten registreringer med din vanlige arbeidstid', onClick: fillMonth, like, cta: true }),
                makeButton({ id: 'approveFirst', icon: 'checks', label: 'Godkjenn halve', title: 'Godkjenn første halvdel av måneden', onClick: () => approveDayRange(...getFirstHalf()), like }),
            ])
        );
    }
}

addButtons();
setInterval(addButtons, 1000);
