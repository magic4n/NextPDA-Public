export interface User {
  id: number;
  username: string;
  group: 'Администратор' | 'Модератор' | 'Куратор' | 'Активный участник' | 'Пользователь';
  avatar: string;
  reputation: number;
  postsCount: number;
  registrationDate: string;
  token?: string;
  devices?: string[];
  signature?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  author: string;
  authorAvatar?: string;
  publishedAt: string;
  category: 'Обзоры' | 'Железо' | 'Игры' | 'Программы' | 'События' | 'Главное';
  views: number;
  commentsCount: number;
  comments?: NewsComment[];
  isFeatured?: boolean;
}

export interface NewsComment {
  id: string;
  author: string;
  authorAvatar: string;
  date: string;
  text: string;
  likes: number;
}

export interface ForumSection {
  id: string;
  title: string;
  description: string;
  iconName: string;
  topicsCount: number;
  postsCount: number;
  lastPost?: {
    topicTitle: string;
    topicId: string;
    author: string;
    date: string;
  };
  subsections?: {
    id: string;
    title: string;
    topicsCount: number;
  }[];
}

export interface ForumTopic {
  id: string;
  sectionId: string;
  sectionTitle: string;
  title: string;
  author: string;
  authorAvatar: string;
  createdAt: string;
  lastPostDate: string;
  lastPostAuthor: string;
  repliesCount: number;
  viewsCount: number;
  isPinned?: boolean;
  isClosed?: boolean;
  hasPoll?: boolean;
  isUnread?: boolean;
  isMyTopic?: boolean;
  poll?: {
    question: string;
    totalVotes: number;
    options: { id: string; title: string; votes: number }[];
    hasVoted?: boolean;
    userVoteId?: string;
  };
}

export interface ForumPost {
  id: string;
  topicId: string;
  postNumber: number;
  author: {
    id: number;
    username: string;
    avatar: string;
    group: string;
    reputation: number;
    postsCount: number;
    registrationDate: string;
    statusBadge?: string;
  };
  createdAt: string;
  updatedAt?: string;
  bbCodeContent: string;
  likes: number;
  hasLiked?: boolean;
  attachments?: {
    id: string;
    fileName: string;
    fileSize: string;
    downloadUrl: string;
    downloadsCount: number;
  }[];
}

export interface MultiQuoteItem {
  postId: string;
  author: string;
  topicTitle: string;
  content: string;
}

export interface DownloadItem {
  id: string;
  name: string;
  sizeBytes: number;
  sizeFormatted: string;
  downloadedBytes: number;
  progressPercent: number;
  speedFormatted: string;
  status: 'pending' | 'downloading' | 'paused' | 'completed' | 'error';
  url: string;
  blobUrl?: string;
}

export interface ReleaseFormData {
  type: string; // 1. Тип публикации
  previewFile: File | null; // 2. Превью (200x200)
  previewUrl: string;
  logoFile: File | null; // 3. Логотип
  logoUrl: string;
  name: string; // 4. Название прошивки/ядра/recovery
  mainPostUrl: string; // 5. Ссылка на основной пост
  osType: 'Android' | 'iOS' | 'Другое'; // 6. Тип OS
  androidVersion: string; // 7. Версия Android
  description: string; // 8. Описание (BB-код)
  installInstructions: string; // 9. Способ установки (BB-код)
  addons: string; // 10. Дополнения (BB-код)
  screenshots: { file: File; url: string; name: string }[]; // 11. Скриншоты
  downloadLinks: string; // 12. Ссылки на скачивание
  moderatorAction: string; // 13. Действие для модераторов
}
