(() => {
// =========================================================
// Pikhta Servers — сайт услуги «Discord‑сервер под ключ»
// =========================================================

// ▼▼▼ НАСТРОЙКИ — впиши свои контакты ▼▼▼
// Куда отправлять заявку. Заполни хотя бы одно поле.
const CONTACT = {
  telegram: 'nepikhta', // ник без @ → откроется t.me/nepikhta
  link: '',     // или любая другая ссылка: VK, приглашение в Discord и т.п.
};
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let toastTimer;
function toast(msg, ms = 2800) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), ms);
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* fallback */ }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  ta.remove();
  return ok;
}

/* ---------------- header & nav ---------------- */
const header = $('#header');
const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 10);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const burger = $('#burger');
const nav = $('#nav');
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', open);
  nav.classList.toggle('is-open', open);
});
$$('a', nav).forEach((a) => a.addEventListener('click', () => {
  burger.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
}));

const navLinks = $$('a', nav);
const spy = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle('is-active', a.hash === `#${en.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
navLinks.forEach((a) => { const s = $(a.hash); if (s) spy.observe(s); });

/* ---------------- reveal ---------------- */
const revealer = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); revealer.unobserve(en.target); } });
}, { threshold: 0.12 });
$$('.reveal').forEach((el) => revealer.observe(el));

function tiltCards(cards) {
  cards.forEach((card) => {
    revealer.observe(card);
    if (matchMedia('(hover: none)').matches) return;
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.transform = `rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 12}deg) translateY(-4px)`;
      card.style.transitionDelay = '0s';
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

/* ---------------- services ---------------- */
const SERVICES = [
  { i: '#', c: '#3ccf9a', t: 'Структура каналов', d: 'Продуманные категории, текстовые и голосовые каналы с описаниями — новичок сразу понимает, куда идти.' },
  { i: '🛡', c: '#8b93ff', t: 'Роли и права', d: 'Иерархия ролей от админа до новичка. Права без дыр: никто лишний не сможет пинговать всех или удалять каналы.' },
  { i: '⚙', c: '#ffb86b', t: 'Боты и автоматизация', d: 'Приветствия, роли по реакциям, уровни, тикеты, напоминания — подберу и настрою ботов под задачу.' },
  { i: '🔐', c: '#ff8fab', t: 'Защита', d: 'AutoMod, уровень проверки, фильтры спама и ссылок — сервер готов к рейдам и ботам‑спамерам.' },
  { i: '📜', c: '#5ec8e5', t: 'Правила и онбординг', d: 'Понятные правила, экран приветствия и онбординг с вопросами, который сам раздаёт роли по интересам.' },
  { i: '🎨', c: '#b7e36b', t: 'Оформление', d: 'Единый стиль названий, эмодзи в каналах, цвета ролей — сервер выглядит аккуратно и узнаваемо.' },
];
$('#services-grid').innerHTML = SERVICES.map((s, n) => `
  <article class="service reveal" style="transition-delay:${n * 0.05}s">
    <span class="service__icon" style="background:${s.c}">${s.i}</span>
    <h3>${s.t}</h3>
    <p>${s.d}</p>
  </article>`).join('');
$$('.service').forEach((el) => revealer.observe(el));

/* ---------------- process steps ---------------- */
const STEPS = [
  {
    title: 'Заявка', sub: 'Ты пишешь мне',
    text: 'Оставляешь заявку на сайте или пишешь напрямую. Достаточно пары слов: о чём сервер и для кого он.',
    points: ['Можно без чёткого плана — разберёмся вместе', 'Если сервер уже есть — доработаю существующий'],
    tip: 'Чем больше расскажешь об идее, тем точнее получится результат.',
  },
  {
    title: 'Обсуждение', sub: 'Уточняем детали',
    text: 'Задаю вопросы: тематика, примерный размер сообщества, какие роли нужны, какие боты, есть ли любимые цвета и стиль. Согласуем сроки и тариф.',
    points: ['Составляю список каналов и ролей', 'Предлагаю подходящих ботов', 'Фиксируем всё, чтобы не было сюрпризов'],
    tip: 'Если есть сервер, который тебе нравится, — покажи, возьму за ориентир.',
  },
  {
    title: 'Сборка', sub: 'Делаю сервер',
    text: 'Создаю категории и каналы, настраиваю роли и права, подключаю ботов, включаю защиту, пишу правила и настраиваю онбординг.',
    points: ['Права проверяю с разных ролей', 'Ботам — только нужные права, без «Администратора»', 'Оформляю всё в едином стиле'],
    tip: 'Тебе ничего не нужно делать на этом этапе — просто жди.',
  },
  {
    title: 'Проверка', sub: 'Показываю результат',
    text: 'Приглашаю тебя на сервер, показываю, как всё устроено. Если что‑то хочется поменять — вношу правки.',
    points: ['Проходим сервер глазами новичка', 'Правим названия, порядок, роли'],
    tip: 'Смотри внимательно — это лучший момент для пожеланий.',
  },
  {
    title: 'Передача', sub: 'Сервер твой',
    text: 'Передаю тебе права владельца сервера и объясняю, как им управлять: где роли, как модерировать, как работают боты.',
    points: ['Ты — полноправный владелец', 'Объясняю основы управления', 'Остаётся только позвать людей'],
    tip: 'Готово! Можно запускать сообщество.',
  },
];

const stepsRoot = $('.steps');
const stepsList = $('#steps-list');
const stepsPanel = $('#steps-panel');
let stepIdx = 0;
let stepTimer;
let stepsInView = false;

stepsList.innerHTML = STEPS.map((s, i) => `
  <button class="step-btn" role="tab" id="step-tab-${i}" aria-controls="steps-panel" data-i="${i}">
    <span class="step-btn__num">${i + 1}</span>
    <span><span class="step-btn__title">${s.title}</span><span class="step-btn__sub">${s.sub}</span></span>
    <span class="step-btn__bar"></span>
  </button>`).join('');

function showStep(i, manual = false) {
  stepIdx = (i + STEPS.length) % STEPS.length;
  const s = STEPS[stepIdx];
  $$('.step-btn', stepsList).forEach((b, j) => {
    b.classList.toggle('is-active', j === stepIdx);
    b.setAttribute('aria-selected', j === stepIdx);
    b.tabIndex = j === stepIdx ? 0 : -1;
  });
  stepsPanel.dataset.num = `0${stepIdx + 1}`;
  stepsPanel.setAttribute('aria-labelledby', `step-tab-${stepIdx}`);
  const last = stepIdx === STEPS.length - 1;
  stepsPanel.innerHTML = `
    <div class="panel-anim">
      <span class="eyebrow">Шаг ${stepIdx + 1} из ${STEPS.length}</span>
      <h3>${s.title}</h3>
      <p>${s.text}</p>
      <ul class="steps__points" style="margin-top:22px">${s.points.map((p) => `<li>${p}</li>`).join('')}</ul>
      <div class="tip">${s.tip}</div>
      <div class="steps__nav">
        <button class="btn btn--ghost btn--small" data-go="-1">← Назад</button>
        ${last
          ? '<a href="#order" class="btn btn--primary btn--small">Оставить заявку →</a>'
          : '<button class="btn btn--dark btn--small" data-go="1">Дальше →</button>'}
      </div>
    </div>`;
  const bar = $('.step-btn.is-active .step-btn__bar', stepsList);
  bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
  if (manual) $('.step-btn.is-active', stepsList).scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  clearTimeout(stepTimer);
  stepTimer = setTimeout(autoStep, 9000);
}
function autoStep() {
  if (stepsRoot.classList.contains('is-paused') || !stepsInView) { stepTimer = setTimeout(autoStep, 1500); return; }
  showStep(stepIdx + 1);
}
new IntersectionObserver(([en]) => { stepsInView = en.isIntersecting; }, { threshold: 0.3 }).observe(stepsRoot);
stepsList.addEventListener('click', (e) => { const b = e.target.closest('.step-btn'); if (b) showStep(+b.dataset.i, true); });
stepsList.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); showStep(stepIdx + 1, true); $('.step-btn.is-active').focus(); }
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); showStep(stepIdx - 1, true); $('.step-btn.is-active').focus(); }
});
stepsPanel.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) showStep(stepIdx + +b.dataset.go, true); });
['mouseenter', 'focusin'].forEach((ev) => stepsRoot.addEventListener(ev, () => stepsRoot.classList.add('is-paused')));
['mouseleave', 'focusout'].forEach((ev) => stepsRoot.addEventListener(ev, () => stepsRoot.classList.remove('is-paused')));
showStep(0);

/* ---------------- examples (read‑only Discord mock) ---------------- */
const T = (n) => ({ t: 'text', n });
const V = (n) => ({ t: 'voice', n });
const EXAMPLES = {
  gaming: {
    label: 'Игровой', desc: 'Кланы и тиммейты', glyph: 'GG', emoji: '🎮', color: '#3ccf9a', name: 'Пиксельная гильдия',
    cats: [
      { n: 'Информация', ch: [T('правила'), T('анонсы'), T('роли')] },
      { n: 'Общение', ch: [T('общий'), T('мемы'), T('поиск-тиммейтов')] },
      { n: 'Голосовые', ch: [V('Лобби'), V('Рейд #1'), V('AFK')] },
    ],
    roles: [{ n: 'Глава', c: '#ff8fab' }, { n: 'Офицер', c: '#8b93ff' }, { n: 'Игрок', c: '#3ccf9a' }, { n: 'Новичок', c: '#a8c4bb' }],
    features: ['Роли по играм через онбординг', 'Бот уровней за активность', 'Поиск тиммейтов с упоминанием роли', 'Голосовые с лимитом мест'],
  },
  study: {
    label: 'Учебный', desc: 'Курсы и группы', glyph: '✎', emoji: '📚', color: '#8b93ff', name: 'Учимся вместе',
    cats: [
      { n: 'Старт', ch: [T('правила'), T('объявления'), T('представься')] },
      { n: 'Учёба', ch: [T('вопросы'), T('материалы'), T('дедлайны')] },
      { n: 'Фокус', ch: [V('Тихая библиотека'), V('Помодоро 25/5')] },
    ],
    roles: [{ n: 'Куратор', c: '#ffb86b' }, { n: 'Наставник', c: '#8b93ff' }, { n: 'Студент', c: '#3ccf9a' }],
    features: ['Форум для вопросов — каждый в своей ветке', 'Напоминания о дедлайнах', 'Объявления только для кураторов', 'Голосовые для совместной учёбы'],
  },
  creative: {
    label: 'Творческий', desc: 'Арт, музыка, стримы', glyph: '✦', emoji: '🎨', color: '#ff8fab', name: 'Мятная студия',
    cats: [
      { n: 'Главное', ch: [T('правила'), T('новости')] },
      { n: 'Творчество', ch: [T('арт'), T('музыка'), T('фидбек')] },
      { n: 'Голосовые', ch: [V('Стрим-комната'), V('Джем-сессия')] },
    ],
    roles: [{ n: 'Основатель', c: '#ff8fab' }, { n: 'Художник', c: '#5ec8e5' }, { n: 'Зритель', c: '#a8c4bb' }],
    features: ['Витрина работ с закрепами', 'Канал фидбека в формате форума', 'Анонсы стримов с уведомлениями', 'Роли творцов по заявке'],
  },
  community: {
    label: 'Сообщество', desc: 'Друзья и фанаты', glyph: '☕', emoji: '☕', color: '#ffb86b', name: 'Уютный район',
    cats: [
      { n: 'Добро пожаловать', ch: [T('правила'), T('приветствие')] },
      { n: 'Общение', ch: [T('общий'), T('фото-питомцев'), T('офтоп')] },
      { n: 'Ивенты', ch: [T('ивенты'), V('Киновечер')] },
    ],
    roles: [{ n: 'Админ', c: '#ff8fab' }, { n: 'Модератор', c: '#8b93ff' }, { n: 'Активист', c: '#ffb86b' }, { n: 'Житель', c: '#3ccf9a' }],
    features: ['Красивое приветствие новичков', 'Мероприятия с напоминаниями', 'AutoMod от спама и ссылок', 'Роли по интересам'],
  },
};

const NAMES = ['Мята', 'Кексик', 'Нео', 'Лис', 'Санёк', 'Ира', 'Пиксель', 'Гоша', 'Ника', 'Тимур', 'Зефир', 'Оля', 'Бублик', 'Рома', 'Луна', 'Арс', 'Мила', 'Ден'];
const CHANNEL_HINTS = [
  [/правил/, 'Здесь будут короткие и понятные правила — новички читают их первыми.'],
  [/анонс|новост|объявлен/, 'Канал только для чтения: писать сюда могут лишь админы, поэтому важное не теряется.'],
  [/роли/, 'Тут участники сами выбирают роли по реакциям или через онбординг.'],
  [/привет|представ/, 'Бот встречает каждого новичка и подсказывает, куда идти дальше.'],
  [/мем|офтоп|фото/, 'Канал для расслабона. Медленный режим включается, если начнётся флуд.'],
  [/вопрос|фидбек/, 'Формат форума: каждый вопрос — отдельная ветка, ничего не теряется.'],
  [/материал|арт|музык/, 'Лучшее закрепляется — это витрина сервера.'],
  [/ивент/, 'Мероприятия с напоминаниями: участники не пропустят начало.'],
  [/тиммейт|дедлайн/, 'Бот делает напоминания и опросы, чтобы канал не утонул в сообщениях.'],
];

let ex;
let activeEx = 'gaming';

function loadExample(key) {
  activeEx = key;
  const d = EXAMPLES[key];
  let uid = 0;
  ex = {
    ...d,
    cats: d.cats.map((c) => ({ id: `c${uid++}`, n: c.n, collapsed: false, ch: c.ch.map((ch) => ({ id: `h${uid++}`, ...ch })) })),
  };
  ex.active = ex.cats[1]?.ch.find((c) => c.t === 'text')?.id || ex.cats[0].ch[0].id;
  renderTabs();
  renderExample();
  // в форме заявки — тот же тип сервера
  setOrderType(key, false);
}

function renderTabs() {
  $('#templates').innerHTML = Object.entries(EXAMPLES).map(([k, t]) => `
    <button class="tpl ${k === activeEx ? 'is-active' : ''}" role="radio" aria-checked="${k === activeEx}" data-ex="${k}">
      <span class="tpl__icon" style="background:${t.color}">${t.glyph}</span>
      <span><b>${t.label}</b><span>${t.desc}</span></span>
    </button>`).join('');
  $('#dc-rail').innerHTML = `
    <span class="rail-icon" style="background:#eafff6" aria-hidden="true">#</span>
    <span class="rail-sep"></span>
    ${Object.entries(EXAMPLES).map(([k, t]) => `<button class="rail-icon ${k === activeEx ? 'is-active' : ''}" style="background:${t.color}" data-ex="${k}" aria-label="${t.label}" title="${t.label}">${t.glyph}</button>`).join('')}`;
}

function members() {
  let k = 0;
  return ex.roles.map((r, i) => {
    const people = [];
    for (let j = 0; j < Math.min(1 + i, 4); j++) people.push(NAMES[(k++ + activeEx.length * 3) % NAMES.length]);
    return { role: r, people };
  });
}

function renderExample() {
  $('#server-name').textContent = ex.name;
  const flat = members().flatMap((g) => g.people.map((p) => ({ p, c: g.role.c })));
  let seat = 0;
  $('#channel-list').innerHTML = ex.cats.map((cat) => `
    <div class="cat ${cat.collapsed ? 'is-collapsed' : ''}">
      <button class="cat__head" data-cat="${cat.id}" aria-expanded="${!cat.collapsed}">
        <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
        ${esc(cat.n)}
      </button>
      ${cat.ch.map((ch) => {
        const users = ch.t === 'voice' && seat < 2 && !cat.collapsed ? flat.slice(seat * 2, seat++ * 2 + 2) : [];
        return `
        <button class="ch ${ch.id === ex.active ? 'is-active' : ''}" data-ch="${ch.id}">
          <span class="ch__icon">${ch.t === 'voice' ? '🔊' : '#'}</span>
          <span class="ch__name">${esc(ch.n)}</span>
        </button>
        ${users.length ? `<div class="ch__voice-users">${users.map((u) => `<span><i style="background:${u.c}">${u.p[0]}</i>${u.p}</span>`).join('')}</div>` : ''}`;
      }).join('')}
    </div>`).join('');

  $('#members-list').innerHTML = members().map((g) => `
    <div class="role-group">
      <div class="role-group__title"><span>${esc(g.role.n)} — ${g.people.length}</span></div>
      ${g.people.map((p, j) => `
        <div class="member"><span class="member__av ${j % 3 === 2 ? 'is-idle' : ''}" style="background:${g.role.c}">${p[0]}</span>
        <span class="member__name" style="color:${g.role.c}">${p}</span></div>`).join('')}
    </div>`).join('');

  const all = ex.cats.flatMap((c) => c.ch);
  $('#example-icon').textContent = ex.emoji;
  $('#example-title').textContent = `Пример: ${ex.label.toLowerCase()} сервер`;
  $('#example-stats').textContent = `${all.length} каналов · ${ex.cats.length} категории · ${ex.roles.length} роли`;
  $('#example-features').innerHTML = ex.features.map((f, n) => `<li class="is-good" style="animation-delay:${n * 0.06}s"><i>✅</i>${esc(f)}</li>`).join('');
  renderChat();
}

function renderChat() {
  let found;
  for (const cat of ex.cats) { const ch = cat.ch.find((x) => x.id === ex.active); if (ch) { found = { cat, ch }; break; } }
  const { cat, ch } = found;
  const isVoice = ch.t === 'voice';
  const hint = CHANNEL_HINTS.find(([re]) => re.test(ch.n.toLowerCase()))?.[1]
    || (isVoice ? 'Голосовой канал с лимитом мест — созвоны остаются уютными.' : 'У каждого канала есть описание, чтобы новички понимали, о чём здесь пишут.');
  const owner = members()[0];
  $('#chat-head').innerHTML = `<span>${isVoice ? '🔊' : '#'}</span><span>${esc(ch.n)}</span><small>${esc(cat.n)}</small>`;
  $('#chat-messages').innerHTML = `
    <div class="welcome">
      <div class="welcome__icon">${isVoice ? '🔊' : '#'}</div>
      <h4>Добро пожаловать в ${isVoice ? '' : '#'}${esc(ch.n)}!</h4>
      <p>Это начало канала на сервере «${esc(ex.name)}».</p>
    </div>
    <div class="msg" style="animation-delay:.1s">
      <span class="msg__avatar" style="background:${owner.role.c}">${owner.people[0][0]}</span>
      <div><div class="msg__meta"><b style="color:${owner.role.c}">${owner.people[0]}</b> сегодня в 19:42</div>
      <div class="msg__text">${isVoice ? 'Кто на созвон? Залетайте 🎧' : 'Всем привет! Сервер открыт 🎉'}</div>
      ${isVoice ? `<div class="voice-card"><div class="voice-card__wave">${[0, .2, .4, .1, .3, .5, .15].map((dl) => `<i style="animation-delay:${dl}s"></i>`).join('')}</div><span class="msg__text">2 участника в голосовом</span></div>` : ''}
      </div>
    </div>
    <div class="msg" style="animation-delay:.25s">
      <span class="msg__avatar" style="background:#6dffd0">🤖</span>
      <div><div class="msg__meta"><b style="color:#6dffd0">Минти</b><span class="msg__bot">БОТ</span> сегодня в 19:43</div>
      <div class="msg__text">${hint}</div></div>
    </div>`;
  $('#composer-placeholder').textContent = isVoice ? `Написать в чат канала 🔊${ch.n}` : `Написать в #${ch.n}`;
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-ex]');
  if (b) loadExample(b.dataset.ex);
});
$('#channel-list').addEventListener('click', (e) => {
  const cat = e.target.closest('[data-cat]');
  if (cat) { const c = ex.cats.find((x) => x.id === cat.dataset.cat); c.collapsed = !c.collapsed; renderExample(); return; }
  const ch = e.target.closest('[data-ch]');
  if (ch) { ex.active = ch.dataset.ch; renderExample(); }
});

/* ---------------- why ---------------- */
const WHY = [
  { i: '⏱', c: '#3ccf9a', t: 'Экономия времени', d: 'Не нужно разбираться в сотнях настроек — ты занимаешься сообществом, а не галочками.' },
  { i: '🛡', c: '#8b93ff', t: 'Безопасно', d: 'Права настроены так, что случайный участник не сломает сервер, а бот не получит лишнего.' },
  { i: '🎯', c: '#ff8fab', t: 'Под твою идею', d: 'Не шаблон «как у всех», а структура под твою тематику, аудиторию и стиль.' },
  { i: '👑', c: '#ffb86b', t: 'Сервер — твой', d: 'После сдачи передаю права владельца: ты полностью управляешь сервером.' },
  { i: '🤖', c: '#5ec8e5', t: 'Боты уже работают', d: 'Приветствия, роли, модерация — всё запущено и проверено до передачи.' },
  { i: '💬', c: '#b7e36b', t: 'Объясню, как всё устроено', d: 'Покажу, где роли, как модерировать и как работают боты, чтобы ты не потерялся.' },
];
$('#why-grid').innerHTML = WHY.map((b, n) => `
  <article class="bot-card reveal" tabindex="0" style="transition-delay:${n * 0.05}s">
    <div class="bot-card__icon" style="background:${b.c}">${b.i}</div>
    <h3>${b.t}</h3>
    <p>${b.d}</p>
  </article>`).join('');
tiltCards($$('.bot-card'));

/* ---------------- order form ---------------- */
const PLANS = { basic: 'Под ключ — 5 000 ₽', pashki: 'Специальное предложение для Пашка — 10 000 ₽ (только сегодня)' };
const TYPES = { ...Object.fromEntries(Object.entries(EXAMPLES).map(([k, v]) => [k, `${v.emoji} ${v.label}`])), other: '✨ Другое' };
let orderType = 'gaming';

$('#f-type').innerHTML = Object.entries(TYPES).map(([k, v]) =>
  `<button type="button" class="type-chip" role="radio" data-type="${k}" aria-checked="false">${v}</button>`).join('');
function setOrderType(key, focus = true) {
  orderType = key;
  $$('.type-chip').forEach((b) => {
    const on = b.dataset.type === key;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-checked', on);
  });
  if (focus) $(`.type-chip[data-type="${key}"]`)?.focus();
}
$('#f-type').addEventListener('click', (e) => { const b = e.target.closest('.type-chip'); if (b) setOrderType(b.dataset.type); });

// Все кнопки «Заказать» ведут прямо в Telegram
const TG_URL = CONTACT.telegram ? `https://t.me/${CONTACT.telegram.replace(/^@/, '')}` : '';
if (TG_URL) {
  $$('.js-tg').forEach((a) => {
    a.href = TG_URL;
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $$('.js-tg-name').forEach((el) => { el.textContent = `@${CONTACT.telegram.replace(/^@/, '')}`; });
}
// «Хочу такой сервер» в примерах
$('#example-order').addEventListener('click', () => setOrderType(activeEx, false));

const form = $('#order-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = $('#f-name');
  const contact = $('#f-contact');
  let bad = null;
  [name, contact].forEach((f) => {
    const empty = !f.value.trim();
    f.closest('.field').classList.toggle('is-error', empty);
    if (empty && !bad) bad = f;
  });
  if (bad) { bad.focus(); toast('Заполни имя и контакт для связи'); return; }

  const plan = form.querySelector('input[name="plan"]:checked').value;
  const text = [
    'Привет! Хочу заказать Discord‑сервер.',
    `Имя: ${name.value.trim()}`,
    `Связь: ${contact.value.trim()}`,
    `Тип сервера: ${TYPES[orderType].replace(/^\S+\s/, '')}`,
    `Тариф: ${PLANS[plan]}`,
    $('#f-wish').value.trim() ? `Пожелания: ${$('#f-wish').value.trim()}` : '',
  ].filter(Boolean).join('\n');

  const copied = await copyText(text);
  const url = CONTACT.telegram ? `https://t.me/${CONTACT.telegram.replace(/^@/, '')}` : CONTACT.link;
  const note = $('#order-note');
  if (url) {
    note.textContent = copied
      ? 'Текст заявки скопирован — вставь его в открывшийся чат и отправь.'
      : 'Открываю чат — опиши заказ в сообщении.';
    window.open(url, '_blank', 'noopener');
    toast('Заявка готова — отправь её в чате 💬', 4000);
  } else {
    note.textContent = copied
      ? 'Текст заявки скопирован. Контакт для отправки скоро появится на сайте.'
      : 'Контакт для отправки скоро появится на сайте.';
    toast('Заявка скопирована 📋', 3500);
  }
  form.classList.add('is-sent');
  setTimeout(() => form.classList.remove('is-sent'), 900);
});
form.addEventListener('input', (e) => e.target.closest('.field')?.classList.remove('is-error'));

loadExample('gaming');

/* ---------------- 🔥 промо для Пашка ---------------- */
const pad = (n) => String(n).padStart(2, '0');
function tickCountdown() {
  const now = new Date();
  const end = new Date(now); end.setHours(24, 0, 0, 0); // до полуночи — «только сегодня»
  const left = Math.max(0, Math.floor((end - now) / 1000));
  const h = pad(Math.floor(left / 3600)), m = pad(Math.floor((left % 3600) / 60)), sec = pad(left % 60);
  const set = (id, v) => { const el = document.getElementById(id); if (el && el.textContent !== v) el.textContent = v; };
  set('t-h', h); set('t-m', m); set('t-s', sec);
  $$('.js-countdown').forEach((el) => { el.textContent = `${h}:${m}:${sec}`; });
}
tickCountdown();
setInterval(tickCountdown, 1000);

const confettiBox = $('#promo-confetti');
const CONFETTI_COLORS = ['#6dffd0', '#ffe17a', '#ff8fab', '#8b93ff', '#ffb86b', '#5ec8e5', '#ffffff'];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
function confetti(count = 70) {
  if (!confettiBox || reduceMotion) return;
  for (let i = 0; i < count; i++) {
    const c = document.createElement('i');
    c.className = 'confetti';
    c.style.left = `${Math.random() * 100}%`;
    c.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    c.style.setProperty('--dx', `${(Math.random() - 0.5) * 220}px`);
    c.style.setProperty('--rot', `${(Math.random() - 0.5) * 1440}deg`);
    c.style.animationDuration = `${2.2 + Math.random() * 2.2}s`;
    c.style.animationDelay = `${Math.random() * 0.8}s`;
    if (Math.random() > 0.6) { c.style.width = '9px'; c.style.height = '9px'; c.style.borderRadius = '50%'; }
    confettiBox.appendChild(c);
    c.addEventListener('animationend', () => confettiBox.removeChild(c));
  }
}
const promoCard = $('#promo-card');
let promoTimer = null;
if (promoCard) {
  new IntersectionObserver(([en]) => {
    $('#promo-float')?.classList.toggle('is-hidden', en.isIntersecting);
    if (en.isIntersecting) {
      confetti();
      clearInterval(promoTimer);
      promoTimer = setInterval(() => confetti(25), 4000);
    } else {
      clearInterval(promoTimer);
    }
  }, { threshold: 0.35 }).observe(promoCard);
  $('.promo__btn')?.addEventListener('pointerenter', () => confetti(30));
  $('.promo__btn')?.addEventListener('click', () => confetti(90));
}

/* ---------------- faq ---------------- */
const FAQ = [
  ['Что нужно от меня?', 'Только идея: о чём сервер, для кого и что в нём точно должно быть. Всё остальное — структуру, роли, ботов и защиту — продумаю и сделаю я.'],
  ['Как сервер станет моим?', 'После того как ты всё проверишь, я передам тебе права владельца сервера через настройки Discord. С этого момента ты полностью им управляешь.'],
  ['Можно доработать уже существующий сервер?', 'Да. Пригласи меня на свой сервер с нужными правами — наведу порядок в каналах, ролях, правах и ботах.'],
  ['Сколько времени занимает работа?', 'Зависит от объёма: простой сервер собирается быстрее, сложный с кучей ролей и ботов — дольше. Точные сроки назову после обсуждения.'],
  ['Можно внести правки?', 'Да. Перед передачей я показываю результат, и мы вносим правки, если что‑то хочется поменять.'],
  ['Чем отличаются тарифы?', 'Оба тарифа — это сервер под ключ с одинаковым набором работ. Второй — специальное предложение для Пашка: только сегодня цена для тебя 10 000 ₽.'],
];
$('#faq-list').innerHTML = FAQ.map(([q, a], i) => `
  <div class="faq-item">
    <button aria-expanded="false" aria-controls="faq-${i}" id="faq-q-${i}">${q}<span class="faq-item__plus" aria-hidden="true"></span></button>
    <div class="faq-item__body" id="faq-${i}" role="region" aria-labelledby="faq-q-${i}"><div><p>${a}</p></div></div>
  </div>`).join('');
$('#faq-list').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const item = b.parentElement;
  const open = !item.classList.contains('is-open');
  $$('.faq-item').forEach((x) => { x.classList.remove('is-open'); $('button', x).setAttribute('aria-expanded', 'false'); });
  item.classList.toggle('is-open', open);
  b.setAttribute('aria-expanded', open);
});
})();
