import { NewsArticle, ForumSection, ForumTopic, ForumPost } from '../types';
import { getCacheItem, setCacheItem } from './cache';
import { getApiBaseUrl } from './platform';
import { getActiveCapToken } from './captcha';
import { useUIStore } from '../store/useUIStore';

const CACHE_TTL_5_MIN = 5 * 60 * 1000;

export async function fetchNewsFeed(category = 'all', page = 1): Promise<{
  hero: NewsArticle;
  articles: NewsArticle[];
  sidebar: {
    nowOnForum: { id: string; title: string; section: string; replies: number; time: string }[];
    topDiscussions: { id: string; title: string; comments: number; isHot: boolean }[];
    blogs: { id: string; title: string; author: string; reads: string }[];
    newSoftware: { id: string; name: string; version: string; os: string; icon: string; size: string }[];
  };
  totalPages: number;
}> {
  const cacheKey = `news_feed_${category}_p${page}`;
  const cached = await getCacheItem<any>(cacheKey);
  if (cached) return cached;

  // Try fetching live 4PDA news from proxy endpoint
  try {
    const headers: Record<string, string> = {};
    const capToken = getActiveCapToken();
    if (capToken) headers['X-Cap-Token'] = capToken;

    const res = await fetch(`${getApiBaseUrl()}/news/feed`, { headers });
    if (res.ok) {
      const liveData = await res.json();
      if (liveData && liveData.hero && Array.isArray(liveData.articles)) {
        await setCacheItem(cacheKey, liveData, CACHE_TTL_5_MIN);
        return liveData;
      }
    } else if (res.status === 429) {
      const errJson = await res.json().catch(() => ({}));
      if (errJson.captcha_required) {
        useUIStore.getState().openCaptchaModal(errJson.challenge);
      }
    }
  } catch (err) {
    console.warn('Could not fetch live 4PDA feed, falling back to cached baseline:', err);
  }

  // Baseline structured data 1:1 with 4PDA portal structure
  const heroArticle: NewsArticle = {
    id: 'hero-1',
    title: 'Snapdragon 8 Elite и революция 3-нм архитектуры: детальный разбор ядер Oryon',
    slug: 'snapdragon-8-elite-deep-dive',
    category: 'Главное',
    publishedAt: '22 октября, 12:40',
    views: 48920,
    commentsCount: 342,
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    author: 'Максим Кузнецов',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    summary: 'Qualcomm совершила самый масштабный скачок со времен Snapdragon 800: кастомные ядра Oryon второго поколения, тактовая частота до 4.32 ГГц и полное отсутствие ядер Cortex.',
    content: `[b]Snapdragon 8 Elite[/b] официально ознаменовал отказ Qualcomm от стандартных лицензий ARM Cortex в премиальном сегменте. Новая вычислительная структура Prime + Performance позволяет достигать невероятных 3.2 млн баллов в комплексных тестах.

[spoiler=Ключевые спецификации платформы]
- Архитектура: 2x Prime Oryon 4.32 ГГц + 6x Performance Oryon 3.53 ГГц
- Графика: Adreno 830 с раздельной нарезкой слайсов
- Техпроцесс: TSMC N3E 3-нм
- Модем: Snapdragon X80 5G с искусственным интеллектом
[/spoiler]

[quote=Qualcomm Lab]Мы смогли снизить энергопотребление графического ядра на 40% при одновременном росте частоты кадровой развертки на 44%.[/quote]

Для энтузиастов и разработчиков кастомных прошивок на 4PDA важной новостью стало подтверждение открытых исходников ядра Linux 6.6 LTS прямо на старте продаж первых смартфонов Xiaomi 15 и OnePlus 13.`,
    comments: [
      {
        id: 'c1',
        author: 'RootMaster_99',
        authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&q=80',
        date: '20 минут назад',
        text: 'Главное, чтобы производители не заблокировали fastboot и дали разблокировку загрузчика без китайского паспорта.',
        likes: 24,
      },
      {
        id: 'c2',
        author: 'LeicaUser',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
        date: '1 час назад',
        text: '4.32 ГГц на смартфонах — это впечатляет, но интересно посмотреть на троттлинг в стресс-тестах под нагрузкой.',
        likes: 15,
      },
    ],
  };

  const articles: NewsArticle[] = [
    {
      id: 'news-2',
      title: 'Обзор Xiaomi 14T Pro: когда флагманские камеры Leica доступны по разумной цене',
      slug: 'xiaomi-14t-pro-review',
      category: 'Обзоры',
      publishedAt: '22 октября, 10:15',
      views: 29140,
      commentsCount: 184,
      coverImage: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
      author: 'Артем Левин',
      summary: 'Тестируем смартфон с процессором Dimensity 9300+, 120-ваттной зарядкой и объективом Summilux в реальных городских условиях.',
      content: `Линейка T традиционно предлагает топовую аппаратную начинку без переплаты за премиальный статус Ultra. В 14T Pro установлен 6.67-дюймовый CrystalRes AMOLED с частотой обновления 144 Гц и пиковой яркостью 4000 нит.

[spoiler=Результаты автономности]
- Просмотр YouTube видео: 18 часов 40 минут
- Игровой режим (Genshin Impact 60fps): 5 часов 15 минут
- Полная зарядка комплектным блоком 120W: ровно 19 минут
[/spoiler]`,
    },
    {
      id: 'news-3',
      title: 'Magisk 27.0 и KernelSU: сравнение современных методов получения Root на Android 14/15',
      slug: 'magisk-vs-kernelsu-2026',
      category: 'Программы',
      publishedAt: '21 октября, 18:30',
      views: 38200,
      commentsCount: 412,
      coverImage: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=800&q=80',
      author: 'Денис Романов',
      summary: 'Разбираемся, почему ядровый рут вытесняет классический ramdisk-патчинг и как обходить проверку Play Integrity.',
      content: `С ужесточением политик Google Play Integrity многие пользователи столкнулись с проблемами банковских приложений. KernelSU предлагает работу на уровне ядра Linux без модификации init.

[code]
su -c "setprop persist.sys.pda.boost 1"
fastboot boot boot.patched.img
[/code]`,
    },
    {
      id: 'news-4',
      title: 'Google Pixel 9 Pro XL получил кастомный порт LineageOS 21: чистый Android и долгая поддержка',
      slug: 'pixel-9-lineageos-port',
      category: 'Железо',
      publishedAt: '21 октября, 14:10',
      views: 18400,
      commentsCount: 96,
      coverImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      author: 'Сергей Вавилов',
      summary: 'Разработчики сообщества выпустили первую стабильную сборку с сохранением работы камеры Pixel Camera.',
      content: `Благодаря открытым библиотекам Tensor G4 прошивка работает с полной аппаратной поддержкой нейросетевых функций.`,
    },
    {
      id: 'news-5',
      title: 'Вышел OrangeFox Recovery R11.1 для десятков устройств Xiaomi, POCO и Realme',
      slug: 'orangefox-recovery-r11-release',
      category: 'Программы',
      publishedAt: '20 октября, 19:45',
      views: 24500,
      commentsCount: 133,
      coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      author: 'Александр Белов',
      summary: 'Добавлена поддержка динамических разделов Super, шифрования FBEv2 и встроенного терминала.',
      content: `В новой версии полностью решены проблемы с монтированием зашифрованных разделов после обновления на Android 14.`,
    },
  ];

  const sidebar = {
    nowOnForum: [
      { id: '101', title: 'Xiaomi 14 / 14 Pro - Прошивки HyperOS', section: 'Android - Прошивки', replies: 1420, time: '2 мин назад' },
      { id: '102', title: 'Google Pixel 8/9 - Обсуждение камеры и GCam', section: 'Android - Программы', replies: 890, time: '5 мин назад' },
      { id: '103', title: 'OrangeFox Recovery Project - Ошибки и вопросы', section: 'Android - Модификации', replies: 310, time: '8 мин назад' },
      { id: '104', title: 'Samsung Galaxy S24 Ultra - Брак и ремонт', section: 'Android - Устройства', replies: 640, time: '12 мин назад' },
    ],
    topDiscussions: [
      { id: 't1', title: 'Нужен ли Root в 2026 году? Голосование и мнения участников', comments: 1492, isHot: true },
      { id: 't2', title: 'Блокировка разблокировки загрузчика Xiaomi: петиция и пути решения', comments: 980, isHot: true },
      { id: 't3', title: 'Выбираем лучший компактный флагман до 65 000 руб', comments: 532, isHot: false },
    ],
    blogs: [
      { id: 'b1', title: '15 лет с 4PDA: как менялся мобильный мир и культура прошивок', author: 'OldGamer', reads: '12.4K' },
      { id: 'b2', title: 'Почему современные смартфоны перестали удивлять дизайном', author: 'DesignGeek', reads: '8.1K' },
    ],
    newSoftware: [
      { id: 'ns1', name: 'AIMP for Android', version: 'v4.05.1432', os: 'Android', icon: '🎵', size: '18.4 МБ' },
      { id: 'ns2', name: 'MiXplorer Silver', version: 'v6.65.4', os: 'Android', icon: '📁', size: '14.2 МБ' },
      { id: 'ns3', name: 'AdGuard Premium', version: 'v4.3.44', os: 'Android', icon: '🛡️', size: '28.9 МБ' },
      { id: 'ns4', name: 'Termux Terminal', version: 'v0.119.1', os: 'Android', icon: '💻', size: '95.2 МБ' },
    ],
  };

  const payload = {
    hero: heroArticle,
    articles,
    sidebar,
    totalPages: 5,
  };

  await setCacheItem(cacheKey, payload, CACHE_TTL_5_MIN);
  return payload;
}

export async function fetchForumSections(): Promise<ForumSection[]> {
  const cacheKey = 'forum_sections';
  const cached = await getCacheItem<ForumSection[]>(cacheKey);
  if (cached) return cached;

  const sections: ForumSection[] = [
    {
      id: 'android-dev',
      title: 'Android - Устройства',
      description: 'Обсуждение смартфонов, планшетов, носимых гаджетов на базе ОС Android.',
      iconName: 'android',
      topicsCount: 14820,
      postsCount: 1984000,
      lastPost: {
        topicTitle: 'Xiaomi 14 / 14 Pro - Покупка и выбор',
        topicId: '101',
        author: 'Mi_Fan',
        date: '3 мин назад',
      },
      subsections: [
        { id: 'sub-xiaomi', title: 'Xiaomi / Redmi / POCO', topicsCount: 5200 },
        { id: 'sub-samsung', title: 'Samsung Galaxy', topicsCount: 3800 },
        { id: 'sub-pixel', title: 'Google Pixel', topicsCount: 2100 },
      ],
    },
    {
      id: 'android-roms',
      title: 'Android - Прошивки',
      description: 'Официальные и кастомные прошивки, ядра, Recovery, инструкции по прошивке.',
      iconName: 'upload',
      topicsCount: 22400,
      postsCount: 4210000,
      lastPost: {
        topicTitle: 'HyperOS 2.0 Global - Официальные обновления',
        topicId: '101',
        author: 'ROM_Cooker',
        date: '5 мин назад',
      },
      subsections: [
        { id: 'sub-rom-xiaomi', title: 'Прошивки Xiaomi', topicsCount: 7800 },
        { id: 'sub-rom-aosp', title: 'AOSP / LineageOS / PixelExperience', topicsCount: 4300 },
      ],
    },
    {
      id: 'android-apps',
      title: 'Android - Программы',
      description: 'Каталог приложений, модификации, русификации, утилиты для Android.',
      iconName: 'sparkles',
      topicsCount: 9400,
      postsCount: 1650000,
      lastPost: {
        topicTitle: 'GCam - Модификации Google Камеры',
        topicId: '102',
        author: 'BSG_Fan',
        date: '12 мин назад',
      },
    },
    {
      id: 'apple-ios',
      title: 'Apple iOS / iPadOS / macOS',
      description: 'Устройства Apple, взлом, джейлбрейк, настройка и софт.',
      iconName: 'settings',
      topicsCount: 5300,
      postsCount: 890000,
      lastPost: {
        topicTitle: 'iOS 18 - Обсуждение и производительность',
        topicId: '201',
        author: 'CupertinoPro',
        date: '45 мин назад',
      },
    },
    {
      id: 'laptops-pc',
      title: 'Ноутбуки и Компьютеры',
      description: 'Выбор, апгрейд, ремонт, BIOS, драйверы, операционные системы Windows и Linux.',
      iconName: 'code',
      topicsCount: 6800,
      postsCount: 1120000,
      lastPost: {
        topicTitle: 'Тонкая настройка Windows 11 LTSC',
        topicId: '301',
        author: 'SysAdmin_Ru',
        date: '1 час назад',
      },
    },
    {
      id: 'kurilka',
      title: 'Курилка и Клуб 4PDA',
      description: 'Свободное общение на любые темы, юмор, поздравления, встречи участников.',
      iconName: 'forum',
      topicsCount: 3100,
      postsCount: 740000,
      lastPost: {
        topicTitle: 'Пятничный флейм: технологии будущего',
        topicId: '401',
        author: 'Alex_Bar',
        date: '15 мин назад',
      },
    },
  ];

  await setCacheItem(cacheKey, sections, CACHE_TTL_5_MIN);
  return sections;
}

export async function fetchSectionTopics(
  sectionId: string,
  filter = 'all',
  sortBy = 'date'
): Promise<{
  section: ForumSection;
  topics: ForumTopic[];
}> {
  const cacheKey = `section_topics_${sectionId}_${filter}_${sortBy}`;
  const cached = await getCacheItem<any>(cacheKey);
  if (cached) return cached;

  const sections = await fetchForumSections();
  const section = sections.find((s) => s.id === sectionId) || sections[0];

  const topics: ForumTopic[] = [
    {
      id: '101',
      sectionId: section.id,
      sectionTitle: section.title,
      title: 'Xiaomi 14 / 14 Pro - Официальные и кастомные прошивки HyperOS',
      author: 'Куратор_Hyper',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      createdAt: '15.11.2023',
      lastPostDate: 'Сегодня, 13:42',
      lastPostAuthor: 'Alex_4PDA',
      repliesCount: 3824,
      viewsCount: 124500,
      isPinned: true,
      hasPoll: true,
      isUnread: true,
    },
    {
      id: '102',
      sectionId: section.id,
      sectionTitle: section.title,
      title: 'OrangeFox Recovery Project - Официальная поддержка устройств',
      author: 'DarthJaver',
      authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&q=80',
      createdAt: '10.02.2024',
      lastPostDate: 'Сегодня, 11:15',
      lastPostAuthor: 'RootMaster',
      repliesCount: 940,
      viewsCount: 48900,
      isPinned: true,
      hasPoll: false,
      isMyTopic: true,
    },
    {
      id: '103',
      sectionId: section.id,
      sectionTitle: section.title,
      title: 'LineageOS 21.0 (Android 14) - Неофициальные порты и сборки',
      author: 'AOSP_Dev',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      createdAt: '01.03.2024',
      lastPostDate: 'Вчера, 22:50',
      lastPostAuthor: 'PixelFan',
      repliesCount: 612,
      viewsCount: 31200,
      isPinned: false,
      hasPoll: false,
    },
    {
      id: '104',
      sectionId: section.id,
      sectionTitle: section.title,
      title: 'Инструкция по обходу Play Integrity (MEETS_STRONG_INTEGRITY) без скрытия рута',
      author: 'ChiterMan',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      createdAt: '18.04.2024',
      lastPostDate: '21 октября, 19:30',
      lastPostAuthor: 'BankAppUser',
      repliesCount: 1240,
      viewsCount: 92300,
      isPinned: false,
      hasPoll: true,
      isUnread: true,
    },
  ];

  let filtered = [...topics];
  if (filter === 'my') filtered = filtered.filter((t) => t.isMyTopic);
  if (filter === 'unread') filtered = filtered.filter((t) => t.isUnread);
  if (filter === 'pinned') filtered = filtered.filter((t) => t.isPinned);

  if (sortBy === 'replies') filtered.sort((a, b) => b.repliesCount - a.repliesCount);
  if (sortBy === 'views') filtered.sort((a, b) => b.viewsCount - a.viewsCount);

  const payload = { section, topics: filtered };
  await setCacheItem(cacheKey, payload, CACHE_TTL_5_MIN);
  return payload;
}

export async function fetchTopicPosts(topicId: string, page = 1): Promise<{
  topic: ForumTopic;
  posts: ForumPost[];
  totalPages: number;
}> {
  const cacheKey = `topic_${topicId}_p${page}`;
  const cached = await getCacheItem<any>(cacheKey);
  if (cached) return cached;

  const topic: ForumTopic = {
    id: topicId,
    sectionId: 'android-roms',
    sectionTitle: 'Android - Прошивки',
    title: 'Xiaomi 14 / 14 Pro - Официальные и кастомные прошивки HyperOS',
    author: 'Куратор_Hyper',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    createdAt: '15 ноября 2023',
    lastPostDate: 'Сегодня, 13:42',
    lastPostAuthor: 'Alex_4PDA',
    repliesCount: 3824,
    viewsCount: 124500,
    isPinned: true,
    hasPoll: true,
    poll: {
      question: 'Какую версию прошивки вы используете на Xiaomi 14?',
      totalVotes: 842,
      hasVoted: false,
      options: [
        { id: 'p1', title: 'Официальная Global (MI)', votes: 340 },
        { id: 'p2', title: 'Официальная EEA (Европа)', votes: 215 },
        { id: 'p3', title: 'Кастомная Xiaomi.eu', votes: 195 },
        { id: 'p4', title: 'Чистый AOSP / LineageOS порт', votes: 92 },
      ],
    },
  };

  const posts: ForumPost[] = [
    {
      id: 'p-1',
      topicId,
      postNumber: 1,
      author: {
        id: 742189,
        username: 'Куратор_Hyper',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
        group: 'Куратор',
        reputation: 920,
        postsCount: 4520,
        registrationDate: '12.04.2016',
      },
      createdAt: '15.11.2023, 10:00',
      bbCodeContent: `[b]Добро пожаловать в главную тему по прошивкам для Xiaomi 14 / 14 Pro![/b]

[spoiler=Шапка темы: Правила и FAQ]
1. Перед прошивкой ОБЯЗАТЕЛЬНО сделайте бэкап раздела EFS и личных данных!
2. Для разблокировки загрузчика требуется аккаунт разработчика Xiaomi Community.
3. Все манипуляции вы производите на свой страх и риск.
[/spoiler]

[spoiler=Драйверы и необходимые утилиты]
- [url=https://4pda.to/forum/dl/post/101/adb-fastboot-v34.zip]Пакет ADB и Fastboot последней версии[/url]
- [url=https://4pda.to/forum/dl/post/101/miflash_2023.zip]MiFlash Pro 2024 Flasher[/url]
[/spoiler]

[spoiler=Официальные сборки HyperOS]
[b]Global Stable (OS1.0.12.0.UNCMIXM):[/b]
Recovery: [url=https://bigota.d.miui.com/OS1.0.12.0/miui_HOUJI_OS1.0.12.0.zip]Скачать zip (6.2 ГБ)[/url]
Fastboot: [url=https://bigota.d.miui.com/OS1.0.12.0/houji_images_OS1.0.12.0.tgz]Скачать tgz (8.4 ГБ)[/url]
[/spoiler]

[quote=Важное примечание]При переходе с китайской версии на глобальную блокировать загрузчик КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО — получите кирпич.[/quote]`,
      likes: 184,
      attachments: [
        {
          id: 'att-1',
          fileName: 'adb-fastboot-v34.zip',
          fileSize: '14.2 МБ',
          downloadUrl: 'https://4pda.to/forum/dl/post/101/adb-fastboot-v34.zip',
          downloadsCount: 1420,
        },
        {
          id: 'att-2',
          fileName: 'twrp-3.7.1-houji.img',
          fileSize: '64.0 МБ',
          downloadUrl: 'https://4pda.to/forum/dl/post/101/twrp-3.7.1-houji.img',
          downloadsCount: 3910,
        },
      ],
    },
    {
      id: 'p-2',
      topicId,
      postNumber: 2,
      author: {
        id: 884102,
        username: 'Alex_AndroidDev',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&q=80',
        group: 'Активный участник',
        reputation: 145,
        postsCount: 680,
        registrationDate: '23.01.2021',
      },
      createdAt: 'Сегодня, 11:24',
      bbCodeContent: `[quote=Куратор_Hyper]Перед прошивкой ОБЯЗАТЕЛЬНО сделайте бэкап раздела EFS[/quote]

Подтверждаю, вчера прошивал европейку через fastboot script:
[code]
./flash_all.sh
fastboot reboot
[/code]
Все завелось моментально, Google Pay и Mir Pay работают без дополнительных Magisk модулей. Скорость интерфейса просто космическая.`,
      likes: 38,
    },
    {
      id: 'p-3',
      topicId,
      postNumber: 3,
      author: {
        id: 991204,
        username: 'Elena_Mobile',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
        group: 'Пользователь',
        reputation: 22,
        postsCount: 47,
        registrationDate: '09.08.2023',
      },
      createdAt: 'Сегодня, 13:42',
      bbCodeContent: `Подскажите, пожалуйста, если обновиться по воздуху (OTA), останется ли запись звонков без предупреждения? Телефон куплен с индонезийской прошивкой.`,
      likes: 4,
    },
  ];

  const payload = {
    topic,
    posts,
    totalPages: 128,
  };

  await setCacheItem(cacheKey, payload, CACHE_TTL_5_MIN);
  return payload;
}

export interface SearchItem {
  id: string;
  title: string;
  sectionId: string;
  sectionTitle: string;
  type: 'topic' | 'post' | 'release' | 'news';
  url: string;
  author: string;
  date: string;
  replies: number;
  views: number;
  snippet: string;
  keywords: string[];
}

export interface SearchResponse {
  query: string;
  totalCount: number;
  results: SearchItem[];
  categoriesCount: {
    all: number;
    topics: number;
    posts: number;
    releases: number;
    news: number;
  };
}

export async function searchForum(
  query: string,
  section = 'all',
  scope = 'all',
  sort = 'relevance'
): Promise<SearchResponse> {
  if (!query.trim()) {
    return {
      query: '',
      totalCount: 0,
      results: [],
      categoriesCount: { all: 0, topics: 0, posts: 0, releases: 0, news: 0 },
    };
  }

  const cacheKey = `search_${query}_${section}_${scope}_${sort}`;
  const cached = await getCacheItem<SearchResponse>(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      q: query,
      section,
      scope,
      sort,
    });
    const headers: Record<string, string> = {};
    const capToken = getActiveCapToken();
    if (capToken) headers['X-Cap-Token'] = capToken;

    const res = await fetch(`${getApiBaseUrl()}/search?${params.toString()}`, { headers });
    if (res.ok) {
      const data: SearchResponse = await res.json();
      await setCacheItem(cacheKey, data, CACHE_TTL_5_MIN);
      return data;
    } else if (res.status === 429) {
      const errJson = await res.json().catch(() => ({}));
      if (errJson.captcha_required) {
        useUIStore.getState().openCaptchaModal(errJson.challenge);
      }
    }
  } catch (err) {
    console.warn('API search failed, falling back to local search engine:', err);
  }

  // Offline fallback search corpus
  const fallbackTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const offlineFallbackItems: SearchItem[] = [
    {
      id: 'fb-1',
      title: 'Xiaomi 14 / 14 Pro - Официальные и кастомные прошивки HyperOS',
      sectionId: 'android-roms',
      sectionTitle: 'Android - Прошивки',
      type: 'topic',
      url: '/forum/topic/101',
      author: 'Куратор_Hyper',
      date: 'Сегодня, 13:42',
      replies: 3824,
      views: 124500,
      snippet: 'Разблокировка загрузчика, официальные Global и EEA прошивки, кастомные сборки xiaomi.eu, TWRP и решение проблем с Play Integrity.',
      keywords: ['xiaomi', '14', 'hyperos', 'прошивки', 'twrp'],
    },
    {
      id: 'fb-2',
      title: 'OrangeFox Recovery Project - Официальная поддержка устройств',
      sectionId: 'android-roms',
      sectionTitle: 'Android - Прошивки',
      type: 'release',
      url: '/forum/topic/101',
      author: 'DarthJaver',
      date: 'Сегодня, 11:15',
      replies: 940,
      views: 48900,
      snippet: 'Релиз OrangeFox Recovery R11.1 для устройств на Android 14/15. Поддержка FBEv2 шифрования, Magisk 27, бэкапа EFS и разделов Super.',
      keywords: ['orangefox', 'recovery', 'twrp', 'magisk'],
    },
    {
      id: 'fb-3',
      title: 'Инструкция по обходу Play Integrity (MEETS_STRONG_INTEGRITY)',
      sectionId: 'android-apps',
      sectionTitle: 'Android - Программы',
      type: 'post',
      url: '/forum/topic/101',
      author: 'ChiterMan',
      date: '21 октября, 19:30',
      replies: 1240,
      views: 92300,
      snippet: 'Рабочий способ прохождения аттестации Google Play Integrity с помощью KernelSU и модуля PlayIntegrityFix. Банковские приложения работают штатно.',
      keywords: ['play integrity', 'root', 'рут', 'kernelsu', 'magisk'],
    },
    {
      id: 'fb-4',
      title: 'Snapdragon 8 Elite: архитектура ядер Oryon и новые возможности',
      sectionId: 'news',
      sectionTitle: 'Новости',
      type: 'news',
      url: '/news/snapdragon-8-elite-deep-dive',
      author: 'Максим Кузнецов',
      date: '22 октября, 12:40',
      replies: 342,
      views: 48920,
      snippet: 'Qualcomm представила флагманскую однокристальную систему Snapdragon 8 Elite с кастомными ядрами Oryon.',
      keywords: ['snapdragon', 'qualcomm', 'процессор', 'новости'],
    },
  ];

  const matched = offlineFallbackItems.filter((item) => {
    const corpus = `${item.title} ${item.snippet} ${item.author} ${item.keywords.join(' ')}`.toLowerCase();
    return fallbackTerms.every((t) => corpus.includes(t));
  });

  const response: SearchResponse = {
    query,
    totalCount: matched.length,
    results: matched,
    categoriesCount: {
      all: matched.length,
      topics: matched.filter((i) => i.type === 'topic').length,
      posts: matched.filter((i) => i.type === 'post').length,
      releases: matched.filter((i) => i.type === 'release').length,
      news: matched.filter((i) => i.type === 'news').length,
    },
  };

  await setCacheItem(cacheKey, response, CACHE_TTL_5_MIN);
  return response;
}
