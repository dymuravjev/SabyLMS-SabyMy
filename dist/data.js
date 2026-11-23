// Данные прототипа. Геометрия карточек задаётся переменными в styles.css.
export const initialEnrolled = [
  { id: 'english', title: 'Английский язык для продвинутых', lessons: 10, teacher: 'Бурлакова Екатерина', portrait: 'owner', theme: 'english', progress: 78, score: 35 },
  { id: 'marketplaces', title: 'Курс «Азбука Маркетплейсов»', lessons: 6, teacher: 'Гаврилова Екатерина', portrait: 'anna', theme: 'market', progress: 30, score: 19 },
];

export const availableCourses = [
  { id: 'hrm', mandatory: true, title: 'Saby HRM. Подбор персонала', lessons: 10, teacher: 'Эванс Элизабет', portrait: 'elizabeth', theme: 'hrm' },
  { id: 'negotiation', mandatory: true, title: 'Искусство переговоров', lessons: 8, teacher: 'Анна Соколова', portrait: 'anna', theme: 'talk' },
  { id: 'time', mandatory: true, title: 'Управление временем', lessons: 6, teacher: 'Михаил Орлов', portrait: 'mikhail', theme: 'clock' },
  { id: 'teamwork', title: 'Работа в команде', lessons: 7, teacher: 'Мария Волкова', portrait: 'owner', theme: 'team' },
  { id: 'excel', mandatory: true, title: 'Основы Excel', lessons: 12, teacher: 'Алексей Петров', portrait: 'mikhail', theme: 'excel' },
  { id: 'service', mandatory: true, title: 'Клиентский сервис', lessons: 5, teacher: 'Анна Соколова', portrait: 'anna', theme: 'service' },
  { id: 'presentation', title: 'Убедительные презентации', lessons: 8, teacher: 'Мария Волкова', portrait: 'owner', theme: 'talk' },
  { id: 'leadership', title: 'Лидерство и управление', lessons: 10, teacher: 'Михаил Орлов', portrait: 'mikhail', theme: 'team' },
  { id: 'analytics', title: 'Основы аналитики', lessons: 9, teacher: 'Алексей Петров', portrait: 'mikhail', theme: 'excel' },
  { id: 'writing', title: 'Деловая переписка', lessons: 4, teacher: 'Анна Соколова', portrait: 'anna', theme: 'english' },
  { id: 'feedback', title: 'Обратная связь', lessons: 5, teacher: 'Мария Волкова', portrait: 'owner', theme: 'talk' },
  { id: 'projects', title: 'Управление проектами', lessons: 11, teacher: 'Михаил Орлов', portrait: 'mikhail', theme: 'clock' },
  { id: 'finance', price: 2000, title: 'Финансы для руководителя', lessons: 7, teacher: 'Алексей Петров', portrait: 'mikhail', theme: 'market' },
  { id: 'stress', title: 'Управление стрессом', lessons: 6, teacher: 'Мария Волкова', portrait: 'owner', theme: 'service' },
  { id: 'mentor', title: 'Школа наставника', lessons: 8, teacher: 'Анна Соколова', portrait: 'anna', theme: 'team' },
  { id: 'sales', title: 'Технологии продаж', lessons: 9, teacher: 'Михаил Орлов', portrait: 'mikhail', theme: 'market' },
  { id: 'security', title: 'Цифровая безопасность', lessons: 5, teacher: 'Алексей Петров', portrait: 'mikhail', theme: 'excel' },
];

export const learningHistory = [
  { title: 'Деловой английский', date: '12 ноября', certificate: true },
  { title: 'Коммуникации в команде', date: '28 октября', certificate: true },
  { title: 'Эффективные встречи', date: '15 октября', certificate: true },
  { title: 'Основы управления', date: '30 сентября', certificate: true },
  { title: 'Работа с документами', date: '18 сентября', certificate: false },
  { title: 'Личная эффективность', date: '4 сентября', certificate: true },
  { title: 'Финансовая грамотность', date: '20 августа', certificate: true },
  { title: 'Информационная безопасность', date: '7 августа', certificate: true },
  { title: 'Сервис и забота о клиенте', date: '24 июля', certificate: true },
  { title: 'Работа с возражениями', date: '10 июля', certificate: false },
  { title: 'Введение в аналитику', date: '26 июня', certificate: true },
  { title: 'Добро пожаловать в команду', date: '12 июня', certificate: false },
];
