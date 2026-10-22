import { create } from 'zustand';
import { MultiQuoteItem, DownloadItem } from '../types';

interface ToastData {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface UIState {
  // Navigation
  activeTab: 'home' | 'forum' | 'activity' | 'bookmarks' | 'profile';
  setActiveTab: (tab: 'home' | 'forum' | 'activity' | 'bookmarks' | 'profile') => void;

  // Search
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // Reader Mode ("Свой ридер")
  readerArticleId: string | null;
  setReaderArticleId: (id: string | null) => void;
  readerFontSize: number;
  setReaderFontSize: (size: number) => void;

  // Multi-quote stack
  multiQuotes: MultiQuoteItem[];
  addMultiQuote: (quote: MultiQuoteItem) => void;
  removeMultiQuote: (postId: string) => void;
  clearMultiQuotes: () => void;

  // Download manager
  downloads: DownloadItem[];
  addDownload: (item: DownloadItem) => void;
  updateDownloadProgress: (id: string, downloadedBytes: number, speedFormatted?: string) => void;
  completeDownload: (id: string, blobUrl?: string) => void;
  failDownload: (id: string) => void;
  removeDownload: (id: string) => void;

  // Toasts
  toasts: ToastData[];
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Release modal
  isReleaseModalOpen: boolean;
  setReleaseModalOpen: (open: boolean) => void;

  // New topic modal
  isNewTopicModalOpen: boolean;
  setNewTopicModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),

  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),

  readerArticleId: null,
  setReaderArticleId: (id) => set({ readerArticleId: id }),
  readerFontSize: 16,
  setReaderFontSize: (size) => set({ readerFontSize: size }),

  multiQuotes: [],
  addMultiQuote: (quote) =>
    set((state) => {
      if (state.multiQuotes.some((q) => q.postId === quote.postId)) {
        return { multiQuotes: state.multiQuotes.filter((q) => q.postId !== quote.postId) };
      }
      return { multiQuotes: [...state.multiQuotes, quote] };
    }),
  removeMultiQuote: (postId) =>
    set((state) => ({
      multiQuotes: state.multiQuotes.filter((q) => q.postId !== postId),
    })),
  clearMultiQuotes: () => set({ multiQuotes: [] }),

  downloads: [],
  addDownload: (item) =>
    set((state) => ({
      downloads: [item, ...state.downloads.filter((d) => d.id !== item.id)],
    })),
  updateDownloadProgress: (id, downloadedBytes, speedFormatted = '2.4 МБ/с') =>
    set((state) => ({
      downloads: state.downloads.map((d) => {
        if (d.id !== id) return d;
        const progressPercent = Math.min(100, Math.round((downloadedBytes / d.sizeBytes) * 100));
        return {
          ...d,
          downloadedBytes,
          progressPercent,
          speedFormatted,
          status: progressPercent >= 100 ? 'completed' : 'downloading',
        };
      }),
    })),
  completeDownload: (id, blobUrl) =>
    set((state) => ({
      downloads: state.downloads.map((d) =>
        d.id === id ? { ...d, progressPercent: 100, status: 'completed', blobUrl } : d
      ),
    })),
  failDownload: (id) =>
    set((state) => ({
      downloads: state.downloads.map((d) => (d.id === id ? { ...d, status: 'error' } : d)),
    })),
  removeDownload: (id) =>
    set((state) => ({
      downloads: state.downloads.filter((d) => d.id !== id),
    })),

  toasts: [],
  showToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3800);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  isReleaseModalOpen: false,
  setReleaseModalOpen: (open) => set({ isReleaseModalOpen: open }),

  isNewTopicModalOpen: false,
  setNewTopicModalOpen: (open) => set({ isNewTopicModalOpen: open }),
}));
