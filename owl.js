// owl.js - Ugla: maskot, snakkeboble, toasts og fremdriftspanel for MinWinTidHelper.
window.Owl = (() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ms = (t) => (reducedMotion ? 0 : t);
  const sleep = (t) => new Promise((resolve) => setTimeout(resolve, ms(t)));
  const anim = (el, frames, duration, extra = {}) =>
    el.animate(frames, { duration: ms(duration), easing: 'ease-out', fill: 'forwards', ...extra });
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  const OWL_SVG = `
<svg viewBox="0 0 100 110" aria-hidden="true">
  <ellipse cx="50" cy="105" rx="26" ry="4" fill="#000" opacity=".15"/>
  <g class="bird">
    <ellipse cx="40" cy="98" rx="7" ry="3.5" fill="#f28c28"/>
    <ellipse cx="60" cy="98" rx="7" ry="3.5" fill="#f28c28"/>
    <path d="M18 24 L25 3 L39 17z" fill="#6f4a2f"/>
    <path d="M82 24 L75 3 L61 17z" fill="#6f4a2f"/>
    <ellipse cx="50" cy="56" rx="36" ry="42" fill="#8b5e3c"/>
    <ellipse cx="50" cy="73" rx="22" ry="22" fill="#ecd9b8"/>
    <path d="M38 66 q3 3 6 0 M47 66 q3 3 6 0 M56 66 q3 3 6 0 M42 74 q3 3 6 0 M51 74 q3 3 6 0 M46 82 q3 3 6 0"
      stroke="#c9a97c" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path class="wing wing-l" d="M17 46 q-9 24 5 42 q9 -6 9 -24z" fill="#6f4a2f"/>
    <path class="wing wing-r" d="M83 46 q9 24 -5 42 q-9 -6 -9 -24z" fill="#6f4a2f"/>
    <circle cx="36" cy="38" r="15" fill="#f3e3c3"/>
    <circle cx="64" cy="38" r="15" fill="#f3e3c3"/>
    <circle cx="36" cy="38" r="10" fill="#fff"/>
    <circle cx="64" cy="38" r="10" fill="#fff"/>
    <g class="pupils">
      <circle cx="37" cy="39" r="5.5" fill="#2b2118"/>
      <circle cx="65" cy="39" r="5.5" fill="#2b2118"/>
      <circle cx="39" cy="37" r="1.8" fill="#fff"/>
      <circle cx="67" cy="37" r="1.8" fill="#fff"/>
    </g>
    <g class="lids" fill="#8b5e3c">
      <ellipse cx="36" cy="38" rx="11" ry="11"/>
      <ellipse cx="64" cy="38" rx="11" ry="11"/>
    </g>
    <path d="M45.5 47 L54.5 47 L50 56z" fill="#f28c28"/>
    <ellipse cx="25" cy="50" rx="4" ry="2.5" fill="#ff9e9e" opacity=".55"/>
    <ellipse cx="75" cy="50" rx="4" ry="2.5" fill="#ff9e9e" opacity=".55"/>
  </g>
</svg>`;

  const CSS = `
:host { all: initial; }
.stage { position: fixed; inset: 0; pointer-events: none; z-index: 2147483647;
  font: 14px/1.4 system-ui, -apple-system, 'Segoe UI', sans-serif; color: #2b2118; }
.shield { position: fixed; inset: 0; background: rgba(43, 33, 24, .24); pointer-events: auto; cursor: progress; }
.owl { position: fixed; left: 20px; top: 0; width: 78px; pointer-events: auto; cursor: pointer;
  user-select: none; -webkit-tap-highlight-color: transparent; outline: none; }
.owl:focus-visible svg { filter: drop-shadow(0 0 4px #f28c28); }
.owl svg { display: block; width: 100%; height: auto; overflow: visible; transform-origin: 50% 100%; }
.bird { transform-box: fill-box; transform-origin: 50% 100%; animation: bob 3.2s ease-in-out infinite; }
.lids { transform-box: fill-box; transform-origin: 50% 0; transform: scaleY(0); animation: blink 4.5s infinite; }
.wing { transform-box: fill-box; transform-origin: 50% 0; }
.flying .wing-l { animation: flap-l .16s ease-in-out infinite alternate; }
.flying .wing-r { animation: flap-r .16s ease-in-out infinite alternate; }
.flying .bird { animation: none; }
.owl:not(.flying):hover .bird { animation: tilt .7s ease-in-out; }
.speech { position: absolute; bottom: calc(100% + 6px); right: 40%; max-width: 260px; width: max-content;
  background: #fff; border: 2px solid #2b2118; border-radius: 14px; padding: 7px 11px; font-weight: 650;
  box-shadow: 3px 3px 0 #2b2118; transform-origin: 90% 100%; cursor: default; }
.speech:has(.links) { max-width: 380px; } /* wider and lower, so it doesn't hide the version line */
.speech .links { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 6px; }
.speech a { color: #8b5e3c; font-weight: 750; text-decoration: underline; text-underline-offset: 2px; }
.speech a:hover { color: #f28c28; }
.speech::after { content: ''; position: absolute; right: 14px; top: 100%; border: 7px solid transparent; border-top-color: #2b2118; }
.on-left .speech { right: auto; left: 40%; transform-origin: 10% 100%; }
.on-left .speech::after { right: auto; left: 14px; }
.perched svg > ellipse { display: none; } /* no floor shadow on a branch */
/* On the branch the bubble goes beside the owl, so it doesn't cover the month buttons above. */
.perched .speech { bottom: auto; top: 4px; left: calc(100% + 12px); right: auto; transform-origin: 0 30%; }
.perched .speech::after { top: 14px; left: -14px; right: auto; border-top-color: transparent; border-right-color: #2b2118; }
.toasts { position: fixed; top: 16px; right: 16px; display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
.toast { pointer-events: auto; display: flex; gap: 10px; align-items: flex-start; max-width: 340px; background: #fff;
  border-radius: 12px; padding: 10px 14px; border-left: 5px solid #8b5e3c;
  box-shadow: 0 6px 24px rgba(43, 33, 24, .18), 0 1px 3px rgba(43, 33, 24, .12); }
.toast.success { border-left-color: #2f9e44; }
.toast.error { border-left-color: #e03131; }
.toast .icon { font-size: 18px; line-height: 1.2; }
.panel { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(340px, calc(100vw - 32px));
  pointer-events: auto; background: #fff; border-radius: 18px; padding: 18px 20px;
  box-shadow: 0 16px 48px rgba(43, 33, 24, .3), 0 2px 6px rgba(43, 33, 24, .12); }
.head { display: flex; align-items: center; gap: 14px; }
.panel h3 { margin: 0; font-size: 16px; }
.current { margin: 2px 0 0; min-height: 1.3em; font-size: 13px; color: #6b5a4a; }
.spinner { flex: none; width: 34px; height: 34px; border-radius: 50%; border: 4px solid #f1e6d6;
  border-top-color: #8b5e3c; border-right-color: #f28c28; animation: spin .8s linear infinite; }
.details { margin-top: 14px; }
.panel.simple .details { display: none; }
.bar { height: 10px; border-radius: 99px; background: #f1e6d6; overflow: hidden; }
.bar > div { height: 100%; width: 0; border-radius: inherit; background: linear-gradient(90deg, #8b5e3c, #f28c28);
  transition: width .25s ease-out; }
.meta { display: flex; justify-content: space-between; margin-top: 8px; font-size: 12.5px; color: #6b5a4a; }
/* Same look as the buttons in the page (styles.css): minWINTID's shape in owl brown. */
.panel button { position: relative; overflow: hidden; margin-top: 12px; width: 100%; padding: .55rem 1rem;
  border: 1px solid #6f4a2f; border-radius: 3px; font: inherit; font-weight: 650; color: #fff; cursor: pointer;
  background: linear-gradient(180deg, #a06d44, #8b5e3c); text-shadow: 0 1px 0 rgba(0, 0, 0, .15);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .28), 0 1px 2px rgba(0, 0, 0, .2);
  transition: transform .12s ease, box-shadow .12s ease, filter .12s ease; }
.panel button:hover { filter: brightness(1.07); transform: translateY(-1px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .3), 0 5px 14px rgba(139, 94, 60, .35); }
.panel button:active { filter: brightness(.95); transform: none; box-shadow: inset 0 2px 4px rgba(0, 0, 0, .25); }
.panel button:disabled { filter: grayscale(.6) brightness(1.1); cursor: progress; transform: none; }
.panel button::after { content: ''; position: absolute; inset: 0; pointer-events: none; transform: translateX(-110%);
  background: linear-gradient(105deg, transparent 35%, rgba(255, 255, 255, .35) 50%, transparent 65%); }
.panel button:hover::after { animation: shine .7s ease-out; }
.mark { position: fixed; margin: -14px 0 0 -14px; width: 28px; height: 28px; border-radius: 50%; display: grid;
  place-items: center; font-weight: 800; color: #fff; background: #2f9e44; box-shadow: 0 2px 6px rgba(0,0,0,.25); }
.mark.skip { background: #adb5bd; }
.feather { position: fixed; width: 8px; height: 14px; margin: -7px 0 0 -4px; border-radius: 50% 50% 50% 50% / 70% 70% 30% 30%; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes shine { to { transform: translateX(110%); } }
@keyframes bob { 50% { transform: translateY(-2px) scale(1.015, .985); } }
@keyframes blink { 0%, 93%, 100% { transform: scaleY(0); } 96% { transform: scaleY(1); } }
@keyframes tilt { 30% { transform: rotate(-8deg); } 70% { transform: rotate(6deg); } }
@keyframes flap-l { to { transform: rotate(55deg); } }
@keyframes flap-r { to { transform: rotate(-55deg); } }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
`;

  const make = (tag, className, html) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html) el.innerHTML = html;
    return el;
  };

  const host = document.createElement('minwintid-owl');
  const shadow = host.attachShadow({ mode: 'open' });
  // A constructed stylesheet isn't blocked by the page's CSP. Firefox content scripts haven't always
  // been able to adopt one, so fall back to a <style> element if it throws or doesn't stick.
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(CSS);
    shadow.adoptedStyleSheets = [sheet];
  } catch {
    // handled below
  }
  if (shadow.adoptedStyleSheets?.length !== 1) shadow.append(make('style', null, CSS));

  const stage = make('div', 'stage');
  const shield = make('div', 'shield');
  shield.hidden = true;
  const toasts = make('div', 'toasts');
  const panel = make(
    'div',
    'panel',
    `<div class="head"><div class="spinner" aria-hidden="true"></div><div><h3></h3><p class="current"></p></div></div>
     <div class="details"><div class="bar"><div></div></div><div class="meta"><span></span><span></span></div>
     <button type="button">Stopp</button></div>`
  );
  panel.setAttribute('role', 'status');
  panel.hidden = true;
  const owl = make('div', 'owl', OWL_SVG);
  owl.setAttribute('role', 'button');
  owl.setAttribute('tabindex', '0');
  owl.setAttribute('aria-label', 'Ugla til MinWinTidHelper');
  owl.title = 'Huu-huu! Klikk for et tips';
  const speech = make('div', 'speech');
  speech.hidden = true;
  speech.addEventListener('click', (e) => e.stopPropagation()); // reading the bubble isn't poking the owl
  owl.append(speech);
  stage.append(shield, panel, owl, toasts);
  shadow.append(stage);
  document.documentElement.append(host);
  const svg = owl.querySelector('svg');

  // ---------- speech and toasts ----------

  const say = (() => {
    let timer;
    // links: [{ text, href }], shown under the text, e.g. for a new version.
    return (text, duration = 2600, links = []) => {
      clearTimeout(timer);
      speech.textContent = text;
      if (links.length) {
        const row = make('div', 'links');
        for (const { text: label, href } of links) {
          const a = make('a');
          a.textContent = label;
          a.href = href;
          a.target = '_blank';
          a.rel = 'noopener';
          a.addEventListener('click', (e) => e.stopPropagation()); // not a poke at the owl
          row.append(a);
        }
        speech.append(row);
      }
      speech.hidden = false;
      anim(speech, [{ scale: 0.3, opacity: 0 }, { scale: 1.06, opacity: 1, offset: 0.7 }, { scale: 1, opacity: 1 }], 240);
      timer = setTimeout(() => (speech.hidden = true), Math.max(duration, 500));
    };
  })();

  const ICONS = { info: '🦉', success: '✅', error: '⚠️' };
  const toast = (text, kind = 'info', duration = 4500) => {
    const el = make('div', `toast ${kind}`);
    el.append(make('span', 'icon', ICONS[kind] ?? ICONS.info), make('span'));
    el.lastChild.textContent = text;
    el.addEventListener('click', () => el.remove());
    toasts.append(el);
    anim(el, [{ translate: '30px 0', opacity: 0 }, { translate: '0 0', opacity: 1 }], 260);
    setTimeout(() => anim(el, [{ opacity: 1 }, { opacity: 0, translate: '20px 0' }], 300).finished.then(() => el.remove()), duration);
  };

  // ---------- movement ----------

  let pos = { x: 0, y: 0 };

  const homeRect = () => {
    const r = owl.getBoundingClientRect();
    return { left: r.left - pos.x, top: r.top - pos.y, width: r.width, height: r.height };
  };

  const moveTo = async (to, duration = 420) => {
    if (owl.hidden) return;
    const lift = Math.min(60, Math.hypot(to.x - pos.x, to.y - pos.y) / 4);
    const mid = { x: (pos.x + to.x) / 2, y: Math.min(pos.y, to.y) - lift };
    owl.classList.add('flying');
    const tilt = to.x < pos.x ? '-10deg' : '10deg';
    anim(svg, [{ rotate: '0deg' }, { rotate: tilt, offset: 0.5 }, { rotate: '0deg' }], duration, { fill: 'none' });
    await anim(
      owl,
      [{ translate: `${pos.x}px ${pos.y}px` }, { translate: `${mid.x}px ${mid.y}px` }, { translate: `${to.x}px ${to.y}px` }],
      duration,
      { easing: 'ease-in-out' }
    ).finished;
    pos = to;
    owl.classList.remove('flying');
  };

  // Lands on top of the element, kept inside the viewport.
  const flyTo = (el, duration) => {
    const r = el.getBoundingClientRect();
    const home = homeRect();
    const left = Math.min(Math.max(r.left + r.width / 2 - home.width / 2, 4), innerWidth - home.width - 4);
    const top = Math.min(Math.max(r.top - home.height + 10, 4), innerHeight - home.height - 4);
    return moveTo({ x: left - home.left, y: top - home.top }, duration);
  };

  const goHome = () => moveTo({ x: 0, y: 0 }, 600);

  // ---------- home: on the birdhouse branch, or else the bottom-left corner ----------

  let perch = null; // element marking where the owl's feet go
  let homeMode = null;
  const FEET = 0.92; // the feet are at 92 % of the owl's height

  const homeSpot = () => {
    const w = owl.offsetWidth;
    const h = owl.offsetHeight;
    const r = perch?.isConnected && perch.getClientRects().length ? perch.getBoundingClientRect() : null;
    // Only sit on the branch when the whole birdhouse (the perch's parent) and the owl's head are in
    // view; otherwise wait in the corner, so the owl never ends up half off screen.
    const house = r && perch.parentElement.getBoundingClientRect();
    if (r && r.top - h * FEET >= 0 && house.bottom <= innerHeight) {
      return { mode: 'perch', left: r.left - w / 2, top: r.top - h * FEET };
    }
    return { mode: 'corner', left: 20, top: innerHeight - h - 14 };
  };

  // glide: when the page shifts under the perched owl (not scrolling), it flaps to the new spot.
  const placeHome = (glide = false) => {
    if (owl.hidden) return;
    const spot = homeSpot();
    const before = owl.getBoundingClientRect();
    const old = { left: parseFloat(owl.style.left), top: parseFloat(owl.style.top) };
    owl.style.left = `${spot.left}px`;
    owl.style.top = `${spot.top}px`;
    owl.classList.toggle('on-left', spot.left + owl.offsetWidth / 2 < innerWidth / 2);
    owl.classList.toggle('perched', spot.mode === 'perch');
    const switched = homeMode && spot.mode !== homeMode;
    homeMode = spot.mode;
    // Between the corner and the birdhouse: fly over instead of jumping.
    const atHome = pos.x === 0 && pos.y === 0;
    if (owl.classList.contains('flying')) return;
    if (switched) {
      pos = { x: before.left - spot.left, y: before.top - spot.top };
      moveTo({ x: 0, y: 0 }, 700);
    } else if (glide && atHome && performance.now() - lastScroll > 250 && Math.hypot(spot.left - old.left, spot.top - old.top) > 2) {
      pos = { x: old.left - spot.left, y: old.top - spot.top };
      moveTo({ x: 0, y: 0 }, 350);
    }
  };

  let placeQueued = false;
  let lastScroll = 0;
  const schedulePlace = () => {
    lastScroll = performance.now();
    if (placeQueued) return;
    placeQueued = true;
    requestAnimationFrame(() => {
      placeQueued = false;
      placeHome();
    });
  };
  addEventListener('scroll', schedulePlace, { capture: true, passive: true });
  addEventListener('resize', schedulePlace);
  setInterval(() => placeHome(true), 300); // minWINTID's layout shifts as it loads days
  placeHome();

  const setPerch = (el) => {
    perch = el;
    placeHome();
  };

  const hop = () =>
    anim(
      svg,
      [
        { translate: '0 0', scale: '1 1' },
        { translate: '0 0', scale: '1.12 .88', offset: 0.2 },
        { translate: '0 -22px', scale: '.94 1.06', offset: 0.55 },
        { translate: '0 0', scale: '1.08 .92', offset: 0.85 },
        { translate: '0 0', scale: '1 1' },
      ],
      520,
      { fill: 'none' }
    ).finished;

  const featherBurst = () => {
    const r = owl.getBoundingClientRect();
    for (let i = 0; i < 12; i++) {
      const f = make('div', 'feather');
      f.style.left = `${r.left + r.width / 2}px`;
      f.style.top = `${r.top + r.height / 2}px`;
      f.style.background = pick(['#8b5e3c', '#6f4a2f', '#ecd9b8', '#f28c28']);
      stage.append(f);
      const angle = Math.random() * Math.PI * 2;
      const d = 50 + Math.random() * 60;
      anim(
        f,
        [
          { translate: '0 0', rotate: '0deg', opacity: 1 },
          { translate: `${Math.cos(angle) * d}px ${Math.sin(angle) * d - 20}px`, rotate: `${Math.random() * 360}deg`, opacity: 1, offset: 0.5 },
          { translate: `${Math.cos(angle) * d * 1.2}px ${Math.sin(angle) * d + 40}px`, rotate: `${Math.random() * 720}deg`, opacity: 0 },
        ],
        1400 + Math.random() * 400,
        { easing: 'cubic-bezier(.2,.7,.4,1)' }
      ).finished.then(() => f.remove());
    }
  };

  // A loop-the-loop with flapping wings and a burst of feathers.
  const celebrate = async () => {
    if (owl.hidden) return;
    owl.classList.add('flying');
    featherBurst();
    const frames = [];
    for (let i = 0, n = 24; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      frames.push({ translate: `${pos.x - Math.sin(a) * 50}px ${pos.y - (1 - Math.cos(a)) * 60}px`, rotate: `${(-360 * i) / n}deg` });
    }
    await anim(owl, frames, 900, { easing: 'ease-in-out', fill: 'none' }).finished;
    owl.classList.remove('flying');
  };

  // Pops a ✓ (or –) on a calendar day.
  const mark = (el, skipped = false) => {
    const r = el.getBoundingClientRect();
    const m = make('div', skipped ? 'mark skip' : 'mark', skipped ? '–' : '✓');
    m.style.left = `${r.left + r.width / 2}px`;
    m.style.top = `${r.top + r.height / 2}px`;
    stage.append(m);
    anim(m, [{ scale: 0.2, opacity: 0 }, { scale: 1.2, opacity: 1, offset: 0.3 }, { scale: 1, opacity: 1, offset: 0.8 }, { scale: 0.8, opacity: 0 }], 1100).finished.then(() =>
      m.remove()
    );
  };

  // ---------- progress panel ----------

  // A card in the middle of the screen over a dimmed page, so it's obvious that work is going on.
  const current = panel.querySelector('.current');
  const showPanel = (title, simple) => {
    shield.hidden = false;
    panel.hidden = false;
    panel.classList.toggle('simple', simple);
    panel.querySelector('h3').textContent = title;
    current.textContent = '';
    anim(panel, [{ scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1 }], 220);
  };
  const hidePanel = () => {
    shield.hidden = true;
    panel.hidden = true;
  };

  // Spinner and a line of text, for single actions.
  const busy = (title, text = '') => {
    showPanel(title, true);
    current.textContent = text;
    return { end: hidePanel };
  };

  // Spinner, progress bar and a Stopp button, for month fill and approval.
  const progress = (title, total, onStop) => {
    showPanel(title, false);
    const bar = panel.querySelector('.bar > div');
    const [left, right] = panel.querySelectorAll('.meta span');
    const stop = panel.querySelector('button');
    stop.disabled = false;
    stop.textContent = 'Stopp';
    stop.onclick = () => {
      stop.disabled = true;
      stop.textContent = 'Stopper etter denne dagen…';
      onStop?.();
    };
    const update = (done, detail = '') => {
      bar.style.width = `${total ? (100 * done) / total : 100}%`;
      left.textContent = `${done} av ${total}`;
      right.textContent = detail;
    };
    update(0);
    return { update, setCurrent: (text) => (current.textContent = text), end: hidePanel };
  };

  shield.addEventListener('click', () => say('Vent litt, jeg fører timer! 🦉 (eller trykk Stopp)'));

  // ---------- idle chatter ----------

  const TIPS = [
    // Tips
    'Før fravær, ferie og sykdom før du auto-fyller måneden.',
    'Auto-fyll mnd overskriver aldri noe som allerede er ført.',
    'Start- og sluttid endrer du ved å klikke på fuglekassen min.',
    'Helger, helligdager og korte dager hopper jeg over.',
    'Dager du allerede har godkjent, hopper jeg over. Effektiv ugle!',
    'Jeg kan føre i dag også: Inn først, så Ut.',
    'Stopp-knappen virker. Jeg stopper etter dagen jeg holder på med.',
    'Heisemusikk kan skrus på i innstillingene. Du er herved advart. 🎶',
    'Syk? Bli i senga. Jeg fører egenmeldingen, du lager te. ☕',
    'Har du trent i dag? «Trene?» fører det for deg. Selve treningen må du ta selv.',
    'Hvis minWINTID er treg, venter jeg tålmodig. Ugler er gode på å vente.',
    'Klikk på fuglekassen for innstillinger. Ikke bank på, jeg sover om dagen.',
    // Owl facts
    'Ugler ser 270 grader rundt. Timelistene dine ser jeg også.',
    'Ugler kan ikke bevege øynene. Derfor snur jeg hele hodet når du er sent ute med timelista.',
    'Ugler flyr nesten lydløst. Jeg fører timer nesten like stille.',
    'En flokk ugler kalles et parlament. Jeg er et parlament på én.',
    'Ugler har ikke tenner, så de svelger byttet helt. Jeg svelger hele måneder på en gang.',
    'Hornugle, kattugle, perleugle … og timeugle. Det er meg.',
    // Timesheet humour
    'Huu-huu! 🦉',
    'Huu-huu er ugle for «husk å godkjenne».',
    'En god timeliste er som et godt reir: ryddig og uten hull.',
    'Fleksitid er som mus: best når man har litt i reserve.',
    'En ugle har aldri glemt å føre timer. Bare så du vet det.',
    'Det er aldri for sent å føre timer. Men det er ofte for sent å huske hva man gjorde.',
    'Ingen registreringer denne dagen? Ikke lenge til.',
    'Kaffe teller dessverre ikke som fravær.',
    'Fredag ettermiddag er perfekt for «Godkjenn halve». Og for fredagstaco.',
    'Jeg er ikke en hvilken som helst ugle. Jeg er en timeugle.',
  ];

  const shuffle = (list) => {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };

  // Draws tips from a shuffled deck, so the owl says every tip once before it repeats any, and never
  // the same one twice in a row. The deck is kept in chrome.storage.local, so reloading the page
  // doesn't start it over.
  const nextTip = async () => {
    try {
      const { tipDeck = [], lastTip } = await chrome.storage.local.get(['tipDeck', 'lastTip']);
      let deck = tipDeck.filter((tip) => TIPS.includes(tip)); // tips we've since removed
      if (deck.length === 0) {
        deck = shuffle([...TIPS]);
        if (deck[0] === lastTip) deck.push(deck.shift());
      }
      const tip = deck.shift();
      await chrome.storage.local.set({ tipDeck: deck, lastTip: tip });
      return tip;
    } catch {
      return pick(TIPS); // storage unavailable, e.g. after the extension was reloaded
    }
  };

  const poke = async () => {
    hop();
    say(await nextTip(), 4000);
  };
  owl.addEventListener('click', poke);
  owl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      poke();
    }
  });

  return {
    say,
    toast,
    hop,
    flyTo,
    goHome,
    celebrate,
    mark,
    progress,
    busy,
    sleep,
    setPerch,
    setVisible: (visible) => {
      owl.hidden = !visible;
      placeHome();
    },
  };
})();
