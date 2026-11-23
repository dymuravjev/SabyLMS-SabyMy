import { learningHistory, availableCourses } from './data.js';

// Страницы встроенного браузера. Вся разметка редактируется в коде;
// исходные снимки используются только как спрайты фотографий и иллюстраций.
export function createEmbeddedBrowser({ phone, portrait, getMode, getEnrolled, getAvailable, onEnroll, onScreenChange, onClose, toast }) {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const svgPaths = {
    close:'<path d="m5 5 14 14M19 5 5 19"/>',
    folder:'<path d="M3 5h6l2 3h10v12H3Z"/>',
    dots:'<circle cx="12" cy="5" r=".6"/><circle cx="12" cy="12" r=".6"/><circle cx="12" cy="19" r=".6"/>',
    menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
    filter:'<path d="M3 5h18l-7 8v6l-4 2v-8Z"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v7h5"/>',
    history:'<path d="M3 10a9 9 0 1 1 1 9M3 4v6h6M12 6v7h5"/>',
    chat:'<path d="M20 11c0 5-5 7-10 6l-5 3 1-5C1 8 6 3 12 4c5 0 8 3 8 7Z"/>',
    book:'<path d="M3 4c4-1 7 0 9 2 3-2 6-3 9-2v15c-3-1-6 0-9 2-2-2-5-3-9-2ZM12 6v15"/>',
    gift:'<path d="M3 10h18v4H3ZM5 14v8h14v-8M12 10v12M12 10C2 11 3 2 7 3c4 0 5 7 5 7s1-7 5-7c4-1 5 8-5 7Z"/>',
    cloud:'<path d="M7 20a5 5 0 1 1-1-10 7 7 0 0 1 14-1c7 1 6 11-1 11Z"/>',
    clipboard:'<path d="M8 4H5v18h15V4h-3M9 2h7v4H9ZM8 10h9M8 14h9M8 18h9"/>',
    gear:'<path d="M9.8 3h4.4l.5 2.4 1.6.9 2.3-.8 2.2 3.8-1.8 1.7v2l1.8 1.7-2.2 3.8-2.3-.8-1.6.9-.5 2.4H9.8l-.5-2.4-1.6-.9-2.3.8-2.2-3.8L5 13v-2L3.2 9.3l2.2-3.8 2.3.8 1.6-.9Z"/><circle cx="12" cy="12" r="3"/>',
    link:'<path d="m10 8 4-4a4 4 0 0 1 6 6l-4 4M14 16l-4 4a4 4 0 0 1-6-6l4-4M8 16l8-8"/>',
    external:'<path d="M13 3h8v8M21 3 11 13M9 4H3v17h17v-7"/>',
    chevron:'<path d="m9 4 8 8-8 8"/>',
    plus:'<path d="M12 3v18M3 12h18"/>',
    person:'<circle cx="12" cy="8" r="4"/><path d="M5 22v-3a7 7 0 0 1 14 0v3M7 4a9 9 0 0 0 0 15M17 4a9 9 0 0 1 0 15"/>',
    people:'<circle cx="9" cy="7" r="3"/><circle cx="18" cy="5" r="2"/><path d="m3 21 1-6a5 5 0 0 1 10 0l1 6ZM17 12c5-2 7 3 6 7M16 3l3-2 3 2"/>',
    globe:'<circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20M4 7h16M4 17h16"/>',
    cap:'<path d="m2 8 10-5 10 5-10 5ZM6 10v6c4 3 8 3 12 0v-6M22 8v8"/>',
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svgPaths[name] || svgPaths.book}</svg>`;
  const root = document.createElement('section');
  root.className = 'embedded-browser'; root.id = 'embedded-browser'; root.hidden = true;
  root.setAttribute('aria-label', 'Встроенный браузер Saby LMS');
  root.innerHTML = `<header class="browser-chrome"><button class="browser-exit" data-browser-close aria-label="Закрыть встроенный браузер">${icon('close')}</button><div class="browser-brand"><strong>Курс</strong></div></header><div class="browser-content" id="browser-content"></div><section class="registration-panel" id="registration-panel" aria-label="Запись учеников" hidden></section><div class="browser-popover" id="browser-popover" hidden></div><div class="browser-home" aria-hidden="true"><span></span></div>`;
  phone.append(root);
  const content = root.querySelector('#browser-content');
  const registration = root.querySelector('#registration-panel');
  const popover = root.querySelector('#browser-popover');
  let screen = 'program';
  let selectedCourse = null;
  let registryKind = 'available';
  let students = [];
  let search = '';
  let returnToNotifications = false;
  let notificationScroll = 0;
  const readNotifications = new Set();
  const notifications = [
    {id:'enrolled',title:'Вы записаны на курс',course:'english',text:'Английский язык для продвинутых',detail:'Обучение доступно. Перейти к программе',date:'22 нояб',icon:'cap',tone:'blue',target:'program',unread:true},
    {id:'group-start',title:'Скоро начало занятий в группе',course:'english',text:'Английский язык для продвинутых',detail:'Дневная группа · сегодня в 14:00',date:'22 нояб',icon:'people',tone:'yellow',target:'classes'},
    {id:'completed',title:'Поздравляем, курс завершен успешно',course:'english',text:'Деловой английский',detail:'Посмотреть результаты обучения',date:'21 нояб',icon:'cap',tone:'green',target:'history-registry'},
    {id:'date-changed',title:'Изменилась дата начала занятий',course:'english',text:'Английский язык для продвинутых',detail:'Занятие перенесено на 25 ноября, 14:00',date:'21 нояб',icon:'history',tone:'pink',target:'classes'},
    {id:'week',title:'Курс стартует через 1 неделю',course:'hrm',text:'Saby HRM. Подбор персонала',detail:'Начало обучения · 30 ноября',date:'20 нояб',icon:'clock',tone:'yellow',target:'landing'},
    {id:'tomorrow',title:'Завтра начинаются занятия по курсу',course:'english',text:'Английский язык для продвинутых',detail:'Первое занятие · 24 ноября, 10:00',date:'20 нояб',icon:'clock',tone:'blue',target:'classes'},
    {id:'inactive',title:'Вы давно не заходили на курс',course:'english',text:'Английский язык для продвинутых',detail:'Продолжите обучение с того места, где остановились',date:'19 нояб',icon:'history',tone:'yellow',target:'program'},
    {id:'payment',title:'Вы записаны на курс, требуется оплатить участие',course:'finance',text:'Финансы для руководителя',detail:'Стоимость участия · 2 000 ₽',date:'18 нояб',icon:'clipboard',tone:'pink',target:'landing'},
    {id:'new-task',title:'У вас новое задание',course:'english',text:'Английский язык для продвинутых',detail:'Итоговый тест по курсу',date:'17 нояб',icon:'clipboard',tone:'blue',target:'assignments'},
    {id:'revision',title:'Вам вернули задание на доработку',course:'english',text:'Английский язык для продвинутых',detail:'Используй английские идиомы · проверьте комментарии',date:'16 нояб',icon:'chat',tone:'pink',target:'assignments'},
    {id:'materials',title:'Вам доступны новые материалы курса',course:'english',text:'Английский язык для продвинутых',detail:'Откройте новые материалы в программе курса',date:'15 нояб',icon:'book',tone:'green',target:'program'},
  ];
  function updateNotificationBadge() {
    const count = isEmpty() ? 0 : notifications.filter(n => n.unread && !readNotifications.has(n.id)).length;
    const badge = phone.querySelector('.notification-badge');
    badge.textContent = count; badge.hidden = count === 0;
    phone.querySelector('.notification-button').setAttribute('aria-label', count ? `Уведомления, ${count} новое` : 'Уведомления');
  }
  function renderNotifications() {
    updateNotificationBadge();
    content.innerHTML = `<section class="notifications-page"><header class="notifications-header"><button data-browser-close aria-label="Назад к главной">${icon('chevron')}</button><h1>Уведомления</h1></header><div class="notifications-list">${isEmpty() ? empty('Уведомлений пока нет', '<p>Здесь появятся новости вашего обучения</p>') : notifications.map(n => `<button class="notification-row" data-notification="${n.id}"><span class="notification-type-icon tone-${n.tone}">${icon(n.icon)}</span><span class="notification-copy"><span class="notification-row-heading"><strong>${escape(n.title)}</strong><time>${n.date}</time></span><span class="notification-preview">${escape(n.text)}</span><span class="notification-detail">${escape(n.detail)}</span></span>${n.unread && !readNotifications.has(n.id) ? '<span class="notification-unread">1</span>' : ''}</button>`).join('')}</div></section>`;
    content.querySelector('.notifications-list').scrollTop = notificationScroll;
  }
  const isEmpty = () => getMode() === 'empty';
  const defaultCourse = () => getEnrolled()[0] || {id:'english', title:'Английский язык для продвинутых', teacher:'Бурлакова Екатерина', progress:78, score:35};
  const hrmCourse = () => [...getAvailable(), ...getEnrolled()].find(c => c.id === 'hrm') || {id:'hrm', title:'Saby HRM. Подбор персонала', teacher:'Эванс Элизабет', lessons:10};
  const empty = (title, caption = '') => `<div class="lms-empty">${icon('book')}<strong>${title}</strong>${caption}</div>`;

  function open(name, options = {}) {
    returnToNotifications = Boolean(options.fromNotifications);
    root.classList.toggle('native-notifications', name === 'notifications');
    root.setAttribute('aria-label', name === 'notifications' ? 'Уведомления об обучении' : 'Встроенный браузер Saby LMS');
    updateNotificationBadge();
    selectedCourse = options.course || (['landing','registration'].includes(name) ? hrmCourse() : defaultCourse());
    registryKind = name === 'history-registry' ? 'history' : name === 'available-registry' ? 'available' : registryKind;
    screen = name;
    root.querySelector('.browser-brand strong').textContent = name === 'available-registry' ? 'Каталог курсов' : name === 'history-registry' ? 'История обучения' : 'Курс';
    root.hidden = false;
    phone.classList.add('has-webview');
    phone.querySelector('.app-scroll').inert = true;
    registration.hidden = true; popover.hidden = true; search = '';
    content.inert = false;
    if (name === 'notifications') renderNotifications();
    else if (name.endsWith('-registry')) renderRegistry();
    else if (name === 'landing' || name === 'registration') {
      renderLanding();
      if (name === 'registration') openRegistration();
    } else renderCourse();
    onScreenChange(name);
    root.querySelector(name === 'notifications' ? '.notifications-header button' : '.browser-exit').focus({preventScroll:true});
  }

  function close({force = false} = {}) {
    if (returnToNotifications && !force) return open('notifications');
    registration.hidden = true; popover.hidden = true; root.hidden = true;
    content.inert = false;
    phone.classList.remove('has-webview');
    phone.querySelector('.app-scroll').inert = false;
    onClose();
  }

  function tools(registry = false) {
    return `<div class="lms-tools"><button class="tool-folder" data-web-menu="folders" aria-label="Разделы курсов">${icon('folder')}</button><input class="lms-search" id="web-search" placeholder="Найти" type="search" aria-label="Найти в ${registry ? 'реестре' : 'курсе'}">${registry ? `<button class="tool-filter" data-web-menu="filter" aria-label="Фильтр курсов">${icon('filter')}</button><button class="tool-layout" data-toggle-layout aria-label="Изменить вид реестра">${icon('menu')}</button>` : `<button class="tool-more" data-web-menu="more" aria-label="Действия с курсом">${icon('dots')}</button>`}</div>`;
  }

  function renderCourse() {
    const title = selectedCourse?.title || defaultCourse().title;
    const teacher = selectedCourse?.teacher || 'Бурлакова Екатерина';
    const progress = isEmpty() ? 0 : selectedCourse?.progress ?? 78;
    const score = isEmpty() ? 0 : selectedCourse?.score ?? 35;
    const tabs = [['program','Программа'],['classes','Занятия'],['assignments','Задания'],['channel','Канал']];
    content.innerHTML = `<div class="lms-course-page"><section class="lms-course-hero"><h1 class="lms-course-title">${escape(title)}</h1><div class="lms-author"><span class="lms-author-photo" aria-hidden="true"></span><strong>${escape(teacher)}</strong></div><nav class="lms-course-tabs" aria-label="Вкладки курса">${tabs.map(([id,label]) => `<button class="lms-course-tab ${id===screen?'active':''}" data-course-tab="${id}" aria-selected="${id===screen}" role="tab">${label}</button>`).join('')}</nav><div class="lms-course-progress"><span>${progress}%</span><span class="segmented-progress" role="progressbar" aria-label="Прогресс курса" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">${Array.from({length:12},(_,i)=>`<i class="${i<Math.round(progress/100*12)?'done':''}"></i>`).join('')}</span><span class="score">${score} баллов</span></div></section>${tools()}<div class="lms-tab-content" id="lms-tab-content"></div></div>`;
    renderTabContent();
    bindSearch();
  }

  const assignments = [
    {id:'description', title:'Деловое письмо на английском', desc:'Ответьте на письмо зарубежного партнёра.', meta:'120–150 слов · вежливый тон и чёткая структура'},
    {id:'automatic', title:'Грамматика C1: нюансы смысла', desc:'Выберите формы в условных предложениях и инверсии.', meta:'12 вопросов · автоматическая проверка'},
    {id:'final', title:'Итоговый тест: английский C1', desc:'Проверьте лексику, грамматику и понимание текста.', meta:'30 вопросов · 45 минут'},
    {id:'english-task', title:'Идиомы в деловом общении', desc:'Объясните коллеге причину переноса срока.', meta:'8–10 предложений · используйте 3 идиомы', checked:true},
  ];
  const articles = {
    design: {title:'Статья 1. Оттенки смысла в английском', heading:'Статья 1.<br>Оттенки смысла<br>в английском', text:'Разберём, как модальные глаголы, условные конструкции и инверсия помогают точнее выражать мысли. Сравните: «You must be right» — уверенный вывод, а «You might be right» — осторожное предположение.'},
    delivery: {title:'Как звучать убедительно на английском', heading:'Как звучать<br>убедительно<br>на английском', text:'Стройте аргумент по схеме: позиция, причина, пример, вывод. Используйте связки «Furthermore», «Nevertheless» и «As a result», чтобы слушателю было легче следить за мыслью. Для вежливого несогласия подойдёт «I see your point; however…».'},
  };

  function renderTabContent() {
    const target = content.querySelector('#lms-tab-content');
    if (!target) return;
    if (isEmpty()) { target.innerHTML = empty(screen === 'assignments' ? 'Заданий пока нет' : screen === 'channel' ? 'Сообщений пока нет' : 'Материалы пока не добавлены'); return; }
    const q = search.trim().toLocaleLowerCase('ru');
    if (screen === 'assignments') {
      const filtered = assignments.filter(a => `${a.title} ${a.desc} ${a.meta}`.toLocaleLowerCase('ru').includes(q));
      const cards = checked => filtered.filter(a=>!!a.checked===checked).map(a=>`<button class="assignment-card ${a.id==='final'?'final-test':''} ${a.checked?'checked-task':''}" data-assignment="${a.id}"><span class="assignment-title">${a.title}</span>${a.checked?'<span class="assignment-pass">✓ Зачет</span>':''}<span class="assignment-desc ${a.id==='final'?'clamp-two':''}">${a.desc}</span><span class="assignment-meta">${a.meta}</span></button>`).join('');
      target.innerHTML = filtered.length ? `<div class="assignment-list">${filtered.some(a=>!a.checked)?`<h2 class="assignment-section">Выполнить</h2>${cards(false)}`:''}${filtered.some(a=>a.checked)?`<h2 class="assignment-section">Проверено</h2>${cards(true)}`:''}</div>` : empty('Ничего не найдено');
    } else if (screen === 'program') {
      const showFirst = !q || articles.design.title.toLocaleLowerCase('ru').includes(q);
      const showSecond = !q || articles.delivery.title.toLocaleLowerCase('ru').includes(q);
      target.innerHTML = `<div class="program-list">${showFirst?`<article class="program-article" tabindex="0" data-program-article="design"><span class="program-check">✓</span><h2>${articles.design.heading}</h2><button class="program-expand" data-program-article="design">Смотреть полностью</button><div class="program-article-bottom"><span>${icon('chat')}</span><button data-rate-article>Оценить</button></div></article>`:''}${showSecond?`<article class="program-article unpublished" tabindex="0" data-program-article="delivery"><span class="unpublished-notice">${icon('history')}Есть неопубликованные редакции</span><span class="article-tiny-icon">${icon('book')}</span><span class="program-check">✓</span><h2>${articles.delivery.heading}</h2><button class="program-expand" data-program-article="delivery">Смотреть полностью</button></article>`:''}${!showFirst&&!showSecond?empty('Ничего не найдено'):''}</div>`;
    } else if (screen === 'classes') {
      target.innerHTML = `<div class="assignment-list"><h2 class="assignment-section">Занятия</h2>${['Знакомство с курсом','Деловое общение','Практика английского языка'].filter(t=>t.toLowerCase().includes(q)).map((title,i)=>`<button class="assignment-card" data-class="${i}"><span class="assignment-title">${title}</span><span class="assignment-desc">Онлайн</span><span class="assignment-meta">Занятие ${i+1}</span></button>`).join('')}</div>`;
    } else target.innerHTML = empty('Пока нет сообщений', 'Здесь появятся новости и обсуждения курса');
  }

  function registryEntries() {
    if (isEmpty() || (registryKind === 'history' && getMode() !== 'maximum')) return [];
    if (registryKind === 'available' && getMode() === 'typical') return getAvailable().map(c => ({...c,duration:`${c.lessons} занятий`,description:'Онлайн-обучение в удобном темпе.',category:'Обучение сотрудников',theme:'extra-registry'}));
    const base = [
      {id:'english',title:'Английский язык для продвинутых',duration:'10 занятий по 1 часу',description:'В курсе "Английский для профессионалов" ты освоишь навыки делового и повседневного общения.',category:'Иностранные языки',theme:'english'},
      {id:'accounting',title:'Практикум по бухгалтер...',price:'2 000 ₽',duration:'4 группы　◷ 10 занятий по 1 часу и по 1 ч...',description:'На нашем практикуме ты погрузишься в работу реальной организации и попробуешь...',category:'Обучение сотрудников',theme:'accounting'},
    ];
    const others = registryKind === 'available' ? getAvailable() : learningHistory.slice(2).map((course,i)=>({id:`history-${i}`,title:course.title}));
    return [...base, ...others.map(c=>({...c,duration:`${c.lessons||8} занятий`,description:'Онлайн-обучение в удобном темпе.',category:'Обучение сотрудников',theme:'extra-registry'}))];
  }

  function registryCard(c) {
    return `<article class="registry-card ${c.theme==='accounting'?'accounting':c.theme==='extra-registry'?'extra-registry':''}" tabindex="0" data-registry-course="${c.id}" aria-label="${escape(c.title)}"><div class="registry-cover"></div><div class="registry-body"><div class="registry-title-line"><h2 class="registry-course-title">${escape(c.title)}</h2>${c.price?`<span class="registry-price">${c.price}</span>`:''}</div><div class="registry-duration">${icon(c.theme==='accounting'?'clipboard':'clock')}<span>${c.duration}</span></div><p class="registry-description">${escape(c.description)}</p><div class="registry-teacher"><span class="registry-avatar" aria-hidden="true"></span><span>Бурлакова Екатерина</span></div><div class="registry-footer">${icon('folder')}<span>${c.category}</span><span class="registry-decorations"><span>${icon('cap')}</span><span>${icon('globe')}</span><span>+2</span></span></div></div></article>`;
  }

  function renderRegistry() {
    content.innerHTML = `<div class="registry-page" id="registry-page" aria-label="${registryKind==='history'?'Пройденные курсы':'Каталог курсов'}">${tools(true)}<div class="registry-scroll" id="registry-scroll"></div></div>`;
    renderRegistryCards(); bindSearch();
  }

  function renderRegistryCards() {
    const cards = registryEntries().filter(c=>c.title.toLocaleLowerCase('ru').includes(search.trim().toLocaleLowerCase('ru')));
    content.querySelector('#registry-scroll').innerHTML = cards.length ? cards.map(registryCard).join('') : empty(registryKind==='history'?'Пройденных курсов пока нет':'Курсы не найдены');
  }

  function bindSearch() {
    content.querySelector('#web-search')?.addEventListener('input', event => {
      search = event.target.value;
      if (screen.endsWith('-registry')) renderRegistryCards(); else renderTabContent();
    });
  }

  const teacherPhoto = size => selectedCourse?.id === 'hrm' ? '<span class="elizabeth-photo" aria-hidden="true"></span>' : portrait(selectedCourse?.portrait || 'owner', size);
  const teacherRole = () => selectedCourse?.id === 'hrm' ? 'Старший специалист отдела кадров' : 'Специалист учебного центра';

  function renderLanding() {
    const title = selectedCourse?.title || hrmCourse().title;
    content.innerHTML = `<div class="landing-page" id="landing-page"><div class="landing-photo"><button class="landing-settings" data-web-menu="landing-settings" aria-label="Настройки курса">${icon('gear')}</button><h1 class="landing-title">${escape(title)}</h1></div><div class="landing-main"><div class="landing-company"><span class="company-photo" aria-hidden="true"></span><div class="company-text"><span>ком Снежный Кот, г. Ярославль, ул...</span><span>https://settyget.kz/delivery/amorsens"Sed ...</span></div><div class="company-tools"><button data-company-copy aria-label="Скопировать ссылку организации">${icon('link')}</button><button data-company-info aria-label="Об организации">${icon('external')}</button></div></div><div class="landing-facts"><span>${icon('clock')}1 месяц</span><span>${icon('clipboard')}${selectedCourse?.lessons || 10} занятий</span></div><div class="landing-online">${icon('cloud')}Онлайн</div><section class="landing-price-panel"><div class="landing-price">${icon('gift')}${selectedCourse?.price ? `${selectedCourse.price.toLocaleString('ru-RU')} ₽` : 'Бесплатно'}</div><button class="landing-signup" data-open-registration>Записаться</button></section><section class="landing-teachers"><h2>Преподаватели</h2><div class="landing-teacher">${teacherPhoto(80)}<div>${escape(selectedCourse?.teacher || hrmCourse().teacher)}<p>${teacherRole()}</p></div></div></section></div></div>`;
  }

  const initialStudent = () => isEmpty() ? {first:'',last:'',middle:'',phone:'',email:''} : {first:'Элизабет',last:'Эванс',middle:'Конфетовна',phone:'+7 (903) 456-54-64',email:'kd.ilunina@tensor.ru'};

  function openRegistration() {
    screen = 'registration';
    students = [initialStudent()];
    if (getMode()==='maximum') students.push({first:'Иван',last:'Иванов',middle:'Иванович',phone:'+7 (900) 000-00-00',email:'student@example.com'});
    registration.hidden = false;
    content.querySelector('.landing-page').scrollTop = 0;
    content.inert = true;
    registration.tabIndex = -1;
    registration.innerHTML = `<button class="registration-grip" data-close-registration aria-label="Свернуть запись учеников"><span></span></button><div class="registration-scroll"><h1 class="registration-title">${selectedCourse?.id === 'hrm' ? 'Saby HRM.<br>Подбор персонала.' : escape(selectedCourse?.title || hrmCourse().title)}</h1><div class="registration-info"><div class="registration-info-row">${teacherPhoto(48)}<span class="registration-info-text"><strong>${escape(selectedCourse?.teacher || hrmCourse().teacher)}</strong><small>${teacherRole()}</small></span></div><button class="registration-info-row" data-registration-group><span class="registration-info-icon">${icon('menu')}</span><span class="registration-info-text">Дневная группа <em>10 мест</em></span></button><button class="registration-info-row" data-registration-contact><span class="registration-info-icon">${icon('person')}</span><span class="registration-info-text">${escape(selectedCourse?.teacher || hrmCourse().teacher)} <em>+7 (903) 456-54-...</em></span></button><button class="registration-info-row" data-registration-contact><span class="registration-info-icon">${icon('people')}</span><span class="registration-info-text">${escape(selectedCourse?.teacher || hrmCourse().teacher)}, +7 (903) 456-54-...</span></button></div><section class="registration-students"><h2 class="students-heading">УЧЕНИКИ <button class="add-student" data-add-student aria-label="Добавить ученика">${icon('plus')}</button></h2><form id="registration-form"><div id="student-cards"></div></form></section></div><button class="registration-next" type="submit" form="registration-form" aria-label="Подтвердить запись учеников">${icon('chevron')}</button>`;
    renderStudents();
    registration.querySelector('#registration-form').addEventListener('submit', event => {
      event.preventDefault();
      if (!students.length) { toast('Добавьте хотя бы одного ученика'); return; }
      onEnroll(selectedCourse?.id || 'hrm');
    });
    registration.querySelector('#registration-form').addEventListener('input', event => {
      const field = event.target.dataset.field;
      if (field) students[Number(event.target.dataset.student)][field] = event.target.value;
    });
    onScreenChange('registration');
    registration.focus({preventScroll:true});
  }

  function renderStudents() {
    const placeholders = {first:'Имя',last:'Фамилия',middle:'Отчество',phone:'Телефон',email:'Электронная почта'};
    registration.querySelector('#student-cards').innerHTML = students.map((student,i)=>`<div class="student-card"><span class="student-index">${i+1}</span><button class="student-remove" type="button" data-remove-student="${i}" aria-label="Удалить ученика ${i+1}">${icon('close')}</button>${Object.entries(placeholders).map(([key,label])=>`<input class="student-input" data-student="${i}" data-field="${key}" name="${key}-${i}" type="${key==='email'?'email':key==='phone'?'tel':'text'}" value="${escape(student[key])}" placeholder="${label}" aria-label="${label} ученика ${i+1}" ${key==='middle'?'':'required'} autocomplete="off">`).join('')}</div>`).join('');
  }

  function showMenu(kind) {
    const options = kind==='folders' ? ['Все разделы','Иностранные языки','Обучение сотрудников'] : kind==='filter' ? ['Все курсы','Доступные','Пройденные'] : kind==='landing-settings' ? ['О курсе','Преподаватели'] : ['По программе','По названию'];
    popover.style.top = screen.endsWith('-registry') ? '94px' : screen==='landing'?'92px':'306px';
    popover.innerHTML = options.map(text=>`<button data-menu-choice="${escape(text)}">${text}</button>`).join('');
    popover.hidden = !popover.hidden;
  }

  function openArticle(id) {
    const article = articles[id] || articles.design;
    const title = article.title;
    content.innerHTML = `<article class="browser-article-page"><button class="browser-back" data-course-tab="program">К программе курса</button><h1>${title}</h1><p>${escape(article.text)}</p><button class="landing-signup" data-course-tab="program">К программе</button></article>`;
  }

  root.addEventListener('click', event => {
    event.stopPropagation();
    const target = event.target;
    if (target.closest('[data-browser-close]')) return close();
    const notification = target.closest('[data-notification]');
    if (notification) {
      notificationScroll = content.querySelector('.notifications-list').scrollTop;
      const item = notifications.find(n => n.id === notification.dataset.notification);
      readNotifications.add(item.id);
      const course = [...getEnrolled(), ...availableCourses].find(c => c.id === item.course) || defaultCourse();
      return open(item.target, {course, fromNotifications:true});
    }
    const tab = target.closest('[data-course-tab]');
    if (tab) { screen=tab.dataset.courseTab;search='';renderCourse();onScreenChange(screen);return; }
    if (target.closest('[data-open-registration]')) return openRegistration();
    if (target.closest('[data-close-registration]')) { registration.hidden=true;content.inert=false;screen='landing';onScreenChange(screen);return; }
    if (target.closest('[data-add-student]')) {
      if (students.length>=10) return toast('В группе осталось 10 мест');
      students.push({first:'',last:'',middle:'',phone:'',email:''});renderStudents();
      return;
    }
    const remove=target.closest('[data-remove-student]');
    if (remove) {students.splice(Number(remove.dataset.removeStudent),1);renderStudents();return;}
    const entry=target.closest('[data-registry-course]');
    if (entry) {
      const id=entry.dataset.registryCourse;
      const enrolled=getEnrolled().find(c=>c.id===id);
      if (enrolled||registryKind==='history') return open('program',{course:enrolled||defaultCourse()});
      return open('landing',{course:getAvailable().find(c=>c.id===id)||hrmCourse()});
    }
    const menu=target.closest('[data-web-menu]');
    if (menu) return showMenu(menu.dataset.webMenu);
    const choice=target.closest('[data-menu-choice]');
    if (choice) {
      popover.hidden=true;
      if (choice.dataset.menuChoice==='Пройденные') return open('history-registry');
      if (choice.dataset.menuChoice==='Доступные'||choice.dataset.menuChoice==='Все курсы') return open('available-registry');
      if (choice.dataset.menuChoice==='Преподаватели') content.querySelector('.landing-teachers')?.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    if (target.closest('[data-toggle-layout]')) return content.querySelector('.registry-page').classList.toggle('compact-registry');
    if (target.closest('[data-rate-article]')) return toast('Спасибо за оценку');
    const article=target.closest('[data-program-article]');
    if (article) return openArticle(article.dataset.programArticle);
    const task=target.closest('[data-assignment]');
    if (task) {
      const a=assignments.find(a=>a.id===task.dataset.assignment);
      content.innerHTML=`<article class="browser-article-page"><button class="browser-back" data-course-tab="assignments">К заданиям курса</button><h1>${a.title}</h1><p>${a.desc}</p><p>${a.meta}</p><label class="form-field">Ответ<input aria-label="Ответ на задание" placeholder="Введите ответ"></label><button class="landing-signup" data-submit-assignment>Отправить</button></article>`;
      return;
    }
    if (target.closest('[data-submit-assignment]')) {toast('Ответ сохранен в прототипе');screen='assignments';renderCourse();return;}
    if (target.closest('[data-company-copy]')) return toast('Ссылка организации выбрана');
    if (target.closest('[data-company-info]')) return toast('Снежный Кот · Ярославль');
    if (target.closest('[data-registration-group]')) return toast('Выбрана дневная группа · 10 мест');
    if (target.closest('[data-registration-contact]')) return toast('Эванс Элизабет · +7 (903) 456-54-64');
    if (target.closest('[data-class]')) return toast('Выбрано занятие курса');
    if (!target.closest('.browser-popover')) popover.hidden=true;
  });
  root.addEventListener('keydown', event => {
    if (event.key==='Escape') {
      event.stopPropagation();
      if (!registration.hidden) {registration.hidden=true;content.inert=false;screen='landing';onScreenChange(screen);} else close();
    }
    if ((event.key==='Enter'||event.key===' ') && event.target.matches('[data-registry-course],[data-program-article]')) {event.preventDefault();event.target.click();}
  });
  updateNotificationBadge();
  return { open, close, refreshNotificationBadge: updateNotificationBadge, isOpen:()=>!root.hidden, getScreen:()=>screen, refresh:()=>open(screen,{course:selectedCourse}) };
}
