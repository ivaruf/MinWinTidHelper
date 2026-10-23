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
  font: 14px/1.4 system-ui, -apple-system, 'Segoe UI', sans-serif; color: #1f2d30; }
.shield { position: fixed; inset: 0; background: rgba(16, 42, 46, .24); pointer-events: auto; cursor: progress; }
.owl { position: fixed; right: 24px; bottom: 14px; width: 78px; pointer-events: auto; cursor: pointer;
  user-select: none; -webkit-tap-highlight-color: transparent; outline: none; }
.owl:focus-visible svg { filter: drop-shadow(0 0 4px #14b8a6); }
.owl svg { display: block; width: 100%; height: auto; overflow: visible; transform-origin: 50% 100%; }
.bird { transform-box: fill-box; transform-origin: 50% 100%; animation: bob 3.2s ease-in-out infinite; }
.lids { transform-box: fill-box; transform-origin: 50% 0; transform: scaleY(0); animation: blink 4.5s infinite; }
.wing { transform-box: fill-box; transform-origin: 50% 0; }
.flying .wing-l { animation: flap-l .16s ease-in-out infinite alternate; }
.flying .wing-r { animation: flap-r .16s ease-in-out infinite alternate; }
.flying .bird { animation: none; }
.owl:not(.flying):hover .bird { animation: tilt .7s ease-in-out; }
.speech { position: absolute; bottom: calc(100% + 6px); right: 40%; max-width: 260px; width: max-content;
  background: #fff; border: 2px solid #1f2d30; border-radius: 14px; padding: 7px 11px; font-weight: 650;
  box-shadow: 3px 3px 0 #1f2d30; transform-origin: 90% 100%; }
.speech::after { content: ''; position: absolute; right: 14px; top: 100%; border: 7px solid transparent; border-top-color: #1f2d30; }
.toasts { position: fixed; top: 16px; right: 16px; display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
.toast { pointer-events: auto; display: flex; gap: 10px; align-items: flex-start; max-width: 340px; background: #fff;
  border-radius: 12px; padding: 10px 14px; border-left: 5px solid #0e7c7b;
  box-shadow: 0 6px 24px rgba(16, 42, 46, .18), 0 1px 3px rgba(16, 42, 46, .12); }
.toast.success { border-left-color: #2f9e44; }
.toast.error { border-left-color: #e03131; }
.toast .icon { font-size: 18px; line-height: 1.2; }
.panel { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(340px, calc(100vw - 32px));
  pointer-events: auto; background: #fff; border-radius: 18px; padding: 18px 20px;
  box-shadow: 0 16px 48px rgba(16, 42, 46, .3), 0 2px 6px rgba(16, 42, 46, .12); }
.head { display: flex; align-items: center; gap: 14px; }
.panel h3 { margin: 0; font-size: 16px; }
.current { margin: 2px 0 0; min-height: 1.3em; font-size: 13px; color: #5b6b6e; }
.spinner { flex: none; width: 34px; height: 34px; border-radius: 50%; border: 4px solid #d9f0ee;
  border-top-color: #0a6c6e; border-right-color: #14b8a6; animation: spin .8s linear infinite; }
.details { margin-top: 14px; }
.panel.simple .details { display: none; }
.bar { height: 10px; border-radius: 99px; background: #d9f0ee; overflow: hidden; }
.bar > div { height: 100%; width: 0; border-radius: inherit; background: linear-gradient(90deg, #0a6c6e, #3ddbc6);
  transition: width .25s ease-out; }
.meta { display: flex; justify-content: space-between; margin-top: 8px; font-size: 12.5px; color: #5b6b6e; }
.panel button { margin-top: 10px; width: 100%; border: 0; border-radius: 10px; padding: 7px; font: inherit; font-weight: 650;
  background: #e0f2f1; color: #0a4f50; cursor: pointer; }
.panel button:hover { background: #c9e9e6; }
.mark { position: fixed; margin: -14px 0 0 -14px; width: 28px; height: 28px; border-radius: 50%; display: grid;
  place-items: center; font-weight: 800; color: #fff; background: #2f9e44; box-shadow: 0 2px 6px rgba(0,0,0,.25); }
.mark.skip { background: #adb5bd; }
.feather { position: fixed; width: 8px; height: 14px; margin: -7px 0 0 -4px; border-radius: 50% 50% 50% 50% / 70% 70% 30% 30%; }
@keyframes spin { to { transform: rotate(360deg); } }
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
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(CSS);
    shadow.adoptedStyleSheets = [sheet];
  } catch {
    shadow.append(make('style', null, CSS));
  }

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
  owl.append(speech);
  stage.append(shield, panel, owl, toasts);
  shadow.append(stage);
  document.documentElement.append(host);
  const svg = owl.querySelector('svg');

  // ---------- speech and toasts ----------

  const say = (() => {
    let timer;
    return (text, duration = 2600) => {
      clearTimeout(timer);
      speech.textContent = text;
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
    'Huu-huu! 🦉',
    'Før fravær, ferie og sykdom før du auto-fyller måneden.',
    'Auto-fyll mnd overskriver aldri noe som allerede er ført.',
    'Start- og sluttid endrer du i innstillingene til utvidelsen.',
    'Helger, helligdager og korte dager hopper jeg over.',
    'Ugler ser 270 grader rundt. Timelistene dine ser jeg også.',
  ];
  const poke = () => {
    hop();
    say(pick(TIPS), 3600);
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
    setVisible: (visible) => (owl.hidden = !visible),
  };
})();
