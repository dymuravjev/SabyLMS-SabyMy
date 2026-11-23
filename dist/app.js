import { initialEnrolled, availableCourses, learningHistory } from './data.js';
import { createEmbeddedBrowser } from './webview.js';

// Простые локальные иконки: никаких шрифтов, библиотек и сетевых запросов.
const paths = {
  chevron: '<path d="m9 5 7 7-7 7"/>',
  up: '<path d="m3 15 9-6 9 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 20h4"/>',
  cap: '<path d="m2 8 10-5 10 5-10 5Z"/><path d="M6 10v6c4 3 8 3 12 0v-6M22 8v8"/>',
  certificate: '<path d="M15 16H4V3h17v13h-3M7 7h11M7 10h8"/><circle cx="15" cy="16" r="3"/><path d="m13 18-1 4 3-1 3 1-1-4"/>',
  home: '<path d="m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10M17 4h3v5"/>',
  chat: '<path d="M14 16c-1 .6-3 1-5 1l-5 3 1-5C0 10 3 3 10 3c5 0 8 3 8 6"/><path d="M20 20c5-5 2-10-4-10-5 0-8 5-4 8 1 1 3 1 5 1l4 3Z"/>',
  send: '<path d="m3 10 19-7-7 19-4-9-8-3ZM11 13 22 3"/>',
  chart: '<path d="M3 3v19h19M7 8h3v10H7ZM13 4h3v14h-3ZM19 10h3v8h-3Z"/>',
  headset: '<path d="M4 14v-3a8 8 0 0 1 16 0v3M4 12H2v7h4v-7H4ZM20 12h2v7h-4v-7h2ZM19 20c-1 2-3 2-6 2"/>',
  mandatory: '<path d="M8 3H5v18h14V3h-3M9 2h6v4H9Z"/><path d="m8 13 3 3 5-6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  history: '<path d="M3 10a9 9 0 1 1 1 9M3 4v6h6M12 6v7h5"/>',
  book: '<path d="M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2ZM12 6v15"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  hand: '<path d="M8 12V5a2 2 0 0 1 4 0v7-3a2 2 0 0 1 4 0v4-2a2 2 0 0 1 4 0v6c0 4-3 6-6 6h-1c-3 0-4-2-6-5l-3-4c-1-2 1-3 3-1l2 2"/>',
};
const icon = (name, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${paths[name] || paths.book}</svg>`;
const escapeHTML = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = selector => document.querySelector(selector);
const rail = $('#course-rail');
const headingRoot = $('#learning-header');
const currentHeading = $('#current-heading');
const moreHeading = $('#more-heading');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const model = { enrolled: initialEnrolled.map(c => ({ ...c })), mode: 'typical' };
let embeddedBrowser;
let selectedScreen = 'widget-start';
let activeState = 'start';
let toastTimer;
let didDrag = false;
let frameRequested = false;

// Светлые и темные обложки намеренно чередуются в одной ленте.
const coverPalettes = {
  english: ['#ede1ff', '#f7ecff'], market: ['#14233c', '#294c65'],
  talk: ['#ffe4dc', '#fff2ec'], clock: ['#10234b', '#294d89'],
  team: ['#e8e3ff', '#f5f0ff'], excel: ['#09392c', '#21654f'],
  service: ['#ffe8d4', '#fff6eb'], catalog: ['#e2edff', '#f2f7ff'],
  history: ['#e2edff', '#f2f7ff'],
  hrm: ['#f3f5f4', '#fff'],
};

function artwork(theme, uid = theme) {
  const [a, b] = coverPalettes[theme] || coverPalettes.catalog;
  const id = `art-${uid}`;
  const figures = {
    english: `<g transform="translate(19 -25) rotate(-23 100 50)"><rect x="28" y="14" width="178" height="64" rx="10" fill="#d4bdf6"/><rect x="25" y="8" width="178" height="62" rx="9" fill="#faf5ff" stroke="#ddcdf3"/>${Array.from({ length: 3 }, (_, r) => Array.from({ length: 7 }, (_, c) => `<rect x="${37 + c * 22}" y="${18 + r * 14}" width="17" height="9" rx="3" fill="${(c + r) % 4 === 0 ? '#d1b3ff' : '#e9def7'}"/>`).join('')).join('')}<rect x="65" y="60" width="86" height="7" rx="3" fill="#e4d4f8"/></g><circle cx="13" cy="14" r="6" fill="#bdc5ff"/>`,
    market: `<g transform="translate(78 -8) rotate(17)"><rect x="0" y="0" width="105" height="66" rx="4" fill="#c8d3d4"/><rect x="5" y="5" width="95" height="55" rx="2" fill="#f5f7f4"/><path d="M12 17h70M12 26h75M12 35h68M12 44h75" stroke="#b8c6c6" stroke-width="3" stroke-dasharray="6 4"/><circle cx="112" cy="27" r="16" fill="#ded5c9"/><circle cx="112" cy="24" r="12" fill="#58443d"/><circle cx="112" cy="22" r="9" fill="#372a29"/></g>`,
    talk: `<g transform="translate(88 3)"><rect x="1" y="2" width="73" height="39" rx="14" fill="#ffc5a9"/><path d="m15 34-4 15 20-14" fill="#ffc5a9"/><rect x="48" y="22" width="64" height="37" rx="13" fill="#ff9fa5"/><path d="m99 52 7 13-23-14" fill="#ff9fa5"/><g fill="#fff3e9"><circle cx="24" cy="20" r="4"/><circle cx="39" cy="20" r="4"/><circle cx="54" cy="20" r="4"/></g><g fill="#ffe7e8"><circle cx="65" cy="40" r="3"/><circle cx="79" cy="40" r="3"/><circle cx="93" cy="40" r="3"/></g></g>`,
    clock: `<circle cx="163" cy="28" r="44" fill="#bad2ff"/><circle cx="163" cy="26" r="36" fill="#e7efff"/><g stroke="#8fb6ff" stroke-width="2"><path d="M163 0v5M163 47v5M136 26h5M185 26h5"/><path d="m163 12-1 16 14-12" stroke-width="4" stroke-linecap="round"/></g><path d="M52 0 0 60V0" fill="#d1e1ff" opacity=".7"/>`,
    team: `<g fill="#b7a8f5"><circle cx="137" cy="17" r="12"/><path d="M114 58c0-28 46-28 46 0"/></g><g fill="#d0c4ff"><circle cx="177" cy="29" r="10"/><path d="M158 65c0-23 39-23 39 0"/></g><path d="M85 20h22m-7-6 7 6-7 6" fill="none" stroke="#d4cafa" stroke-width="4" stroke-linecap="round"/>`,
    excel: `<g transform="translate(104 -1) rotate(9 50 40)"><rect x="4" y="5" width="91" height="68" rx="8" fill="#abdcc5"/><rect x="0" y="0" width="91" height="68" rx="8" fill="#f0fff7" stroke="#c4e8d6"/><path d="M13 17h65M13 31h65M13 45h65M28 10v47M49 10v47M70 10v47" stroke="#a6d5bc" stroke-width="2"/><rect x="9" y="13" width="22" height="19" rx="3" fill="#65b78d"/></g>`,
    service: `<path d="m153 0 12 20 24 4-17 17 4 24-23-11-21 11 4-24-18-17 25-4Z" fill="#ffd291"/><path d="m153 6 10 17 19 3-14 14 3 19-18-9-17 9 3-19-15-14 20-3Z" fill="#ffe5b5"/><circle cx="99" cy="15" r="9" fill="#ffe4b8"/>`,
    catalog: `<g transform="translate(89 -3) rotate(8 60 40)"><rect x="11" y="11" width="91" height="66" rx="7" fill="#b9d0ff"/><rect x="2" y="6" width="91" height="66" rx="7" fill="#d7e5ff"/><rect x="-5" y="0" width="91" height="66" rx="7" fill="#f2f7ff" stroke="#c2d8ff"/><path d="M10 16h54M10 26h47M10 36h36" stroke="#bdcff0" stroke-width="5" stroke-linecap="round"/><path d="m36 0 27-11L90 0 63 12Z" fill="#94b8ff"/><path d="M47 5v10c10 6 22 6 32 0V5" fill="#a9c6ff"/></g>`,
    history: `<g transform="translate(112 -7)"><circle cx="45" cy="35" r="34" fill="#d3e3ff"/><circle cx="45" cy="32" r="27" fill="#edf4ff"/><path d="M25 18a23 23 0 1 1-2 25M23 9v12h12M45 18v15h12" fill="none" stroke="#87aff3" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g><g transform="translate(84 32) rotate(-8)"><rect width="44" height="31" rx="4" fill="#c6dafa"/><rect x="-3" y="-3" width="44" height="31" rx="4" fill="#f4f8ff" stroke="#b9cff4"/><path d="M6 6h25M6 13h19" stroke="#b0c9ef" stroke-width="3" stroke-linecap="round"/></g>`,
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" class="cover-art" width="204" height="80" viewBox="0 0 204 80" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${id}" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="204" height="80" fill="url(#${id})"/>${figures[theme] || figures.catalog}</svg>`;
}

function luminance(r, g, b) {
  const linear = channel => { const value = channel / 255; return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4; };
  return .2126 * linear(r) + .7152 * linear(g) + .0722 * linear(b);
}

function initialCoverTone(theme) {
  const hex = (coverPalettes[theme] || coverPalettes.catalog)[0];
  return luminance(...[1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))) >= .42 ? 'light' : 'dark';
}

// Анализируем само изображение ДО наложения градиента. Медиана яркости
// определяет доминирующий светлый/темный фон, не реагируя на мелкие детали.
function analyzeCovers() {
  rail.querySelectorAll('img[data-auto-tone]').forEach(img => {
    const apply = () => {
      if (!img.isConnected || !img.naturalWidth) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 40; canvas.height = 20;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, 40, 20);
        const pixels = ctx.getImageData(0, 0, 40, 20).data;
        const values = [];
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i + 3] > 127) values.push(luminance(pixels[i], pixels[i + 1], pixels[i + 2]));
        }
        values.sort((a, b) => a - b);
        if (values.length) img.parentElement.dataset.coverTone = values[Math.floor(values.length / 2)] >= .42 ? 'light' : 'dark';
        img.dataset.toneAnalyzed = 'true';
      } catch {
        // Для изображения без разрешения CORS сохраняется исходный тон.
        img.dataset.toneAnalyzed = 'fallback';
      }
    };
    if (img.complete) apply(); else img.addEventListener('load', apply, { once: true });
  });
}

// Единый HTML-шаблон для КАЖДОЙ плашки: обложка, основная часть, нижняя ячейка.
function renderCard({ type, attributes, label, title, theme, uid, body, bodyClass = '', footer, footerClass = '' }) {
  const image = theme === 'hrm' ? './assets/landing-reference.png' : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(artwork(theme, uid))}`;
  return `<article class="course-card ${type}-card" ${attributes} tabindex="0" aria-label="${escapeHTML(label)}"><div class="course-cover" data-cover-tone="${initialCoverTone(theme)}"><img class="cover-art ${theme==='hrm'?'hrm-cover':''}" src="${image}" alt="" draggable="false" data-auto-tone><h3 class="course-title">${escapeHTML(title)}</h3></div><div class="course-details ${bodyClass}">${body}</div><div class="course-footer ${footerClass}">${footer}</div></article>`;
}

// Фото — локальные CSS-спрайты из согласованных макетов; текст и интерфейс — HTML.
function portrait(person, size = 29) {
  const sources = {
    owner: { file: 'interface', x: 697, y: 120, crop: 93 },
    anna: { file: 'teachers', x: 34, y: 1119, crop: 64 },
    mikhail: { file: 'teachers', x: 521, y: 1119, crop: 64 },
    gavrilova: { file: 'interface', x: 520, y: 1119, crop: 64 },
    elizabeth: { path: './assets/registration-reference.png', x: 18, y: 266, crop: 48, width:375, height:812 },
  };
  const source = sources[person] || sources.owner;
  const scale = size / source.crop;
  const style = `width:${size}px;height:${size}px;background-image:url('${source.path||`./assets/${source.file}-sprite.png`}');background-size:${(source.width||813) * scale}px ${(source.height||1934) * scale}px;background-position:${-source.x * scale}px ${-source.y * scale}px`;
  return `<span class="portrait" style="${style}" aria-hidden="true"></span>`;
}

function courseCard(course, enrolled = false) {
  const footer = enrolled
    ? `<div class="progress-footer"><div class="progress-label">${course.progress}% <span class="score">${course.score} баллов</span></div><div class="progress-track" role="progressbar" aria-valuenow="${course.progress}" aria-valuemin="0" aria-valuemax="100" aria-label="Прогресс курса"><div class="progress-fill" style="width:${course.progress}%"></div></div></div>`
    : `<button class="enroll-button" data-enroll="${course.id}">Записаться</button>`;
  return renderCard({
    type: enrolled ? 'enrolled' : 'available', attributes: `data-course="${course.id}"`,
    label: course.title + (enrolled ? `, пройдено ${course.progress}%` : ', можно записаться'),
    title: course.title, theme: course.theme, uid: course.id, footer,
    body: `<div class="course-meta"><span>${course.lessons} ${lessonWord(course.lessons)}</span><span>Онлайн</span></div><div class="teacher">${portrait(course.portrait)}<span class="teacher-info"><span class="teacher-name">${escapeHTML(course.teacher)}</span><span class="teacher-role">Специалист учебного центра</span></span></div>`,
  });
}

function lessonWord(n) {
  if (n % 100 >= 11 && n % 100 <= 14) return 'занятий';
  return n % 10 === 1 ? 'занятие' : n % 10 >= 2 && n % 10 <= 4 ? 'занятия' : 'занятий';
}

function catalogCard(count) {
  return renderCard({ type: 'catalog', attributes: 'data-utility="catalog"', label: `Каталог курсов: ${count} доступных`, title: 'Каталог курсов', theme: 'catalog', uid: 'catalog', bodyClass: 'metrics-body', body: metric(count, 'Курсов', 'book') + metric(available().filter(c => c.mandatory).length, 'Обязательных', 'mandatory'), footer: `<span class="catalog-action">Смотреть все ${icon('chevron')}</span>` });
}

function metric(value, label, name) {
  return `<div class="metric"><span class="metric-value">${value}${icon(name)}</span><span class="metric-label">${label}</span></div>`;
}

function historyCard() {
  const count = model.mode === 'empty' ? 0 : learningHistory.length;
  const certificates = model.mode === 'empty' ? 0 : learningHistory.filter(c => c.certificate).length;
  return renderCard({ type: 'history', attributes: 'data-utility="history"', label: `История обучения: ${count} курсов, ${certificates} сертификатов`, title: 'История обучения', theme: 'history', uid: 'history', bodyClass: 'metrics-body', body: metric(count, 'Курсов', 'cap') + metric(certificates, 'Сертификатов', 'certificate'), footerClass: 'avatars-footer', footer: (count ? `<div class="avatar-stack" aria-label="Преподаватели пройденных курсов">${portrait('owner', 32)}${portrait('anna', 32)}${portrait('mikhail', 32)}${portrait('gavrilova', 32)}<span class="more-avatars">+8</span></div>` : '<span class="metric-label">Нет пройденных курсов</span>') + `<span class="history-chevron">${icon('chevron')}</span>` });
}

function available() {
  if (model.mode === 'empty') return [];
  const pool = model.mode === 'typical' ? availableCourses.slice(0, 5) : availableCourses;
  return pool.filter(c => !model.enrolled.some(e => e.id === c.id));
}

function renderRail(state = activeState) {
  const remaining = available();
  $('#learning').hidden = model.mode === 'empty';
  $('#end-state-caption').textContent = model.mode === 'maximum' ? 'Каталог и история' : 'Конец ленты';
  $('#current-count').textContent = model.enrolled.length;
  $('#available-count').textContent = remaining.length;
  if (model.mode === 'empty') { rail.replaceChildren(); return; }
  rail.innerHTML = model.enrolled.map(c => courseCard(c, true)).join('')
    + remaining.slice(0, 5).map(c => courseCard(c)).join('')
    + (model.mode === 'maximum' ? catalogCard(remaining.length) + historyCard() : '');
  goToState(state, false);
  analyzeCovers();
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Важный контракт: граница групп — зазор перед первой доступной карточкой.
// Заголовок следует её ЛЕВОМУ ВНЕШНЕМУ краю. До появления карточки он
// ограничен правым краем заголовочной строки; после прохода — левым отступом.
function updateHeadings() {
  frameRequested = false;
  const firstAvailable = rail.querySelector('.available-card') || rail.querySelector('.catalog-card');
  const inset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--heading-inset'));
  moreHeading.hidden = !firstAvailable;
  if (!firstAvailable) {
    currentHeading.style.transform = `translateX(${inset}px)`;
    currentHeading.style.opacity = '1';
    currentHeading.style.visibility = 'visible';
    return;
  }
  const firstCardLeft = firstAvailable.offsetLeft - rail.scrollLeft;
  const rightLimit = Math.max(inset, headingRoot.clientWidth - inset - moreHeading.offsetWidth);
  const moreX = clamp(firstCardLeft, inset, rightLimit);
  const currentWidth = currentHeading.offsetWidth;
  const currentX = Math.min(inset, moreX - currentWidth - 18);
  const opacity = clamp((moreX - inset) / (currentWidth + 18), 0, 1);
  moreHeading.style.transform = `translateX(${moreX}px)`;
  currentHeading.style.transform = `translateX(${currentX}px)`;
  currentHeading.style.opacity = opacity;
  currentHeading.style.visibility = opacity === 0 ? 'hidden' : 'visible';
  const catalog = rail.querySelector('.catalog-card');
  let nextState = 'start';
  if (rail.scrollLeft > 8) {
    nextState = rail.scrollLeft >= (catalog ? catalog.offsetLeft - rail.clientWidth / 2 : rail.scrollWidth - rail.clientWidth - 8) ? 'end'
      : firstCardLeft <= inset + 2 ? 'available' : 'boundary';
  }
  if (nextState !== activeState) setActiveState(nextState);
}

function requestHeadingUpdate() {
  if (!frameRequested) {
    frameRequested = true;
    requestAnimationFrame(updateHeadings);
  }
}

function setActiveState(name) {
  activeState = name;
  if (!embeddedBrowser?.isOpen()) selectInspectorScreen(`widget-${name}`);
}

function selectInspectorScreen(name) {
  selectedScreen = name;
  document.querySelectorAll('input[name="screen"]').forEach(input => { input.checked = input.value === name; });
}

function showScreen(name) {
  if (name.startsWith('widget-')) {
    if (embeddedBrowser.isOpen()) embeddedBrowser.close({force:true});
    goToState(name.slice(7), false);
    selectInspectorScreen(name);
  } else embeddedBrowser.open(name);
}

function setDensity(mode) {
  const screen = selectedScreen;
  model.mode = mode;
  document.querySelectorAll('input[name="density"]').forEach(input => {input.checked=input.value===mode;});
  model.enrolled = mode === 'empty' ? [] : initialEnrolled.map(c => ({...c}));
  if (mode === 'maximum') model.enrolled.push(...availableCourses.slice(10,16).map((c,i)=>({...c,progress:Math.min(95,12+i*15),score:7+i*5})));
  renderRail(screen.startsWith('widget-') ? screen.slice(7) : activeState);
  embeddedBrowser.refreshNotificationBadge();
  showScreen(screen);
}

function goToState(name, smooth = true) {
  const first = rail.querySelector('.available-card') || rail.querySelector('.catalog-card');
  if (!first) { rail.scrollLeft = 0; updateHeadings(); return; }
  const targets = {
    start: 0,
    boundary: first.offsetLeft - 70,
    available: first.offsetLeft - 14,
    end: rail.scrollWidth - rail.clientWidth,
  };
  const animate = smooth && !reducedMotion.matches;
  rail.scrollTo({ left: targets[name] || 0, behavior: animate ? 'smooth' : 'instant' });
  if (!animate) updateHeadings();
}

// Равноправные способы управления: touch/трекпад, мышь, колесо и клавиатура.
rail.addEventListener('scroll', requestHeadingUpdate, { passive: true });
new ResizeObserver(requestHeadingUpdate).observe(headingRoot);
let dragging = null;
rail.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('button')) return;
  dragging = { x: event.clientX, scroll: rail.scrollLeft, id: event.pointerId };
  didDrag = false;
});
window.addEventListener('pointermove', event => {
  if (!dragging || event.pointerId !== dragging.id) return;
  const delta = event.clientX - dragging.x;
  if (Math.abs(delta) > 5) {
    didDrag = true;
    rail.classList.add('dragging');
    if (!rail.hasPointerCapture(event.pointerId)) rail.setPointerCapture(event.pointerId);
    const scale = rail.getBoundingClientRect().width / rail.clientWidth;
    rail.scrollLeft = dragging.scroll - delta / scale;
    event.preventDefault();
  }
});
function endDrag() {
  if (dragging && rail.hasPointerCapture(dragging.id)) rail.releasePointerCapture(dragging.id);
  dragging = null;
  rail.classList.remove('dragging');
  if (didDrag) setTimeout(() => { didDrag = false; }, 0);
}
window.addEventListener('pointerup', endDrag);
rail.addEventListener('pointercancel', endDrag);
rail.addEventListener('dragstart', event => event.preventDefault());
rail.addEventListener('wheel', event => {
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
  const atStart = rail.scrollLeft <= 0 && event.deltaY < 0;
  const atEnd = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 1 && event.deltaY > 0;
  if (atStart || atEnd) return;
  event.preventDefault();
  rail.scrollLeft += event.deltaY * (event.deltaMode === 1 ? 20 : 1);
}, { passive: false });
rail.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    rail.scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * 228, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.course-card')) {
    event.preventDefault();
    event.target.click();
  }
});

function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2600);
}

function openCourse(id, register = false) {
  const course = [...model.enrolled, ...availableCourses].find(c => c.id === id);
  if (!course) return;
  embeddedBrowser.open(model.enrolled.some(c => c.id === id) ? 'program' : register ? 'registration' : 'landing', {course});
}

function enroll(id) {
  const course = available().find(c => c.id === id);
  if (!course) { toast(model.enrolled.some(c=>c.id===id) ? 'Вы уже записаны на этот курс' : 'Курс недоступен для записи'); return; }
  model.enrolled.push({...course, progress:0, score:0});
  embeddedBrowser.close({force:true});
  renderRail('start');
  toast('Вы записаны на курс');
}

function openCatalog() { embeddedBrowser.open('available-registry'); }
function openHistory() { embeddedBrowser.open('history-registry'); }

document.addEventListener('click', event => {
  if (didDrag) { event.preventDefault(); return; }
  const target = event.target;
  if (target.closest('[data-action="notifications"]')) return embeddedBrowser.open('notifications');
  const stateButton = target.closest('[data-state]');
  if (stateButton) return goToState(stateButton.dataset.state);
  if (target.closest('#current-heading')) return goToState('start');
  if (target.closest('#more-heading')) return goToState('available');
  const enrollButton = target.closest('[data-enroll]');
  if (enrollButton) return openCourse(enrollButton.dataset.enroll, true);
  const confirm = target.closest('[data-confirm-enroll]');
  if (confirm) return enroll(confirm.dataset.confirmEnroll);
  const openCourseButton = target.closest('[data-open-course]');
  if (openCourseButton) return openCourse(openCourseButton.dataset.openCourse);
  if (target.closest('[data-open-catalog]')) return openCatalog();
  const utility = target.closest('[data-utility]');
  if (utility) return utility.dataset.utility === 'history' ? openHistory() : openCatalog();
  const courseCardElement = target.closest('[data-course]');
  if (courseCardElement) return openCourse(courseCardElement.dataset.course);
});

document.addEventListener('change', event => {
  if (event.target.name === 'density') setDensity(event.target.value);
  if (event.target.name === 'screen') showScreen(event.target.value);
});
document.addEventListener('keydown', event => {
  if (embeddedBrowser.isOpen() || event.target.matches('input,textarea')) return;
  if (/^[1-4]$/.test(event.key)) goToState(['start','boundary','available','end'][Number(event.key)-1]);
});

function resetDemo() {
  setDensity('typical');
  showScreen('widget-start');
}

$('#bell-icon').innerHTML = icon('bell');
$('#collapse-icon').innerHTML = icon('up');
$('#vacation-chevron').innerHTML = icon('chevron');
$('#salary-chevron').innerHTML = icon('chevron');
$('#status-icons').innerHTML = '<svg viewBox="0 0 20 16" fill="currentColor" aria-hidden="true"><rect x="1" y="10" width="3" height="5" rx=".6"/><rect x="6" y="7" width="3" height="8" rx=".6"/><rect x="11" y="4" width="3" height="11" rx=".6"/><rect x="16" y="1" width="3" height="14" rx=".6"/></svg><svg viewBox="0 0 20 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 5q8-7 16 0M5 9q5-5 10 0M8 12q2-2 4 0"/><circle cx="10" cy="14" r="1" fill="currentColor" stroke="none"/></svg><svg viewBox="0 0 28 16" fill="none" stroke="currentColor" aria-hidden="true"><rect x="1" y="3" width="23" height="11" rx="2" stroke-opacity=".5"/><rect x="3" y="5" width="19" height="7" rx="1" fill="currentColor" stroke="none"/><path d="M26 6v5" stroke-width="2" stroke-opacity=".5"/></svg>';
const navItems = [['Главная', 'home'], ['Сообщен.', 'chat'], ['Документы', 'send'], ['Зарплата', 'chart'], ['Служ.под', 'headset']];
$('#bottom-nav').innerHTML = navItems.map(([label, name], i) => `<button class="nav-item ${i === 0 ? 'active' : ''}" disabled ${i === 0 ? 'aria-current="page"' : ''}>${icon(name)}<span>${label}</span></button>`).join('');

// Контекст приложения неподвижен; интерактивны только виджет и его страницы.
document.querySelectorAll('.app-header button:not(.notification-button),.quick-actions button,.vacation-card,.salary-card').forEach(button => { button.disabled = true; });
$('.bottom-nav').inert = true;

function fitPhone() {
  const scale = innerWidth > 750 ? Math.min(1, (innerHeight - 32) / 812) : 1;
  $('.phone').style.setProperty('--phone-scale', Math.max(.35, scale));
  requestHeadingUpdate();
}
addEventListener('resize', fitPhone, { passive: true });

embeddedBrowser = createEmbeddedBrowser({
  phone: $('.phone'), portrait, getMode: () => model.mode, getEnrolled: () => model.enrolled,
  getAvailable: available, onEnroll: enroll, onScreenChange: selectInspectorScreen,
  onClose: () => { selectInspectorScreen(`widget-${activeState}`); rail.focus({preventScroll:true}); }, toast,
});
renderRail();
fitPhone();
document.fonts.ready.then(updateHeadings);

// Небольшой интерфейс для дальнейшей правки и проверки в DevTools.
window.sabyPrototype = { goToState, showScreen, setDensity, reset: resetDemo, updateHeadings };
