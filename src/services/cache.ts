import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface NextPDACacheDB extends DBSchema {
  cache: {
    key: string;
    value: {
      key: string;
      data: any;
      timestamp: number;
      ttlMs: number;
    };
  };
  bookmarks: {
    key: string;
    value: {
      id: string;
      type: 'news' | 'topic' | 'post';
      title: string;
      url: string;
      dateAdded: number;
      previewText?: string;
    };
  };
}

const DB_NAME = 'nextpda-client-db';
const DB_VERSION = 1;
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 минут TTL согласно ТЗ

let dbPromise: Promise<IDBPDatabase<NextPDACacheDB>> | null = null;

function getDb(): Promise<IDBPDatabase<NextPDACacheDB>> {
  if (!dbPromise) {
    dbPromise = openDB<NextPDACacheDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('bookmarks')) {
          db.createObjectStore('bookmarks', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function setCacheItem<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): Promise<void> {
  try {
    const db = await getDb();
    await db.put('cache', {
      key,
      data,
      timestamp: Date.now(),
      ttlMs,
    });
  } catch (error) {
    console.warn('Не удалось записать в IndexedDB кэш:', error);
  }
}

export async function getCacheItem<T>(key: string): Promise<T | null> {
  try {
    const db = await getDb();
    const entry = await db.get('cache', key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttlMs;
    if (isExpired) {
      await db.delete('cache', key);
      return null;
    }
    return entry.data as T;
  } catch (error) {
    console.warn('Не удалось прочитать из IndexedDB кэша:', error);
    return null;
  }
}

export async function clearAllCache(): Promise<void> {
  try {
    const db = await getDb();
    await db.clear('cache');
  } catch (error) {
    console.warn('Не удалось очистить кэш:', error);
  }
}

export async function getCacheCount(): Promise<number> {
  try {
    const db = await getDb();
    return await db.count('cache');
  } catch {
    return 0;
  }
}

// Bookmarks management
export async function addBookmark(item: { id: string; type: 'news' | 'topic' | 'post'; title: string; url: string; previewText?: string }): Promise<void> {
  try {
    const db = await getDb();
    await db.put('bookmarks', {
      ...item,
      dateAdded: Date.now(),
    });
  } catch (error) {
    console.warn('Ошибка сохранения закладки:', error);
  }
}

export async function removeBookmark(id: string): Promise<void> {
  try {
    const db = await getDb();
    await db.delete('bookmarks', id);
  } catch (error) {
    console.warn('Ошибка удаления закладки:', error);
  }
}

export async function getBookmarks(): Promise<Array<{ id: string; type: 'news' | 'topic' | 'post'; title: string; url: string; dateAdded: number; previewText?: string }>> {
  try {
    const db = await getDb();
    return await db.getAll('bookmarks');
  } catch {
    return [];
  }
}

export async function isBookmarked(id: string): Promise<boolean> {
  try {
    const db = await getDb();
    const item = await db.get('bookmarks', id);
    return !!item;
  } catch {
    return false;
  }
}
