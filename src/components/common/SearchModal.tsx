import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomIcon } from './CustomIcon';
import { useUIStore } from '../../store/useUIStore';
import { useNavigate } from 'react-router-dom';
import { searchForum, SearchItem } from '../../services/api';

const QUICK_SEARCH_CHIPS = [
  'HyperOS 2.0',
  'Xiaomi 14',
  'OrangeFox',
  'Magisk 27',
  'Play Integrity',
  'KernelSU',
  'Pixel 9',
  'Fastboot',
];

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setSearchOpen, setReaderArticleId } = useUIStore();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'topics' | 'posts' | 'releases' | 'news'>('all');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  // Live query search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const resp = await searchForum(query, 'all', filterType);
        setResults(resp.results);
      } catch (err) {
        console.warn('Search query error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, filterType]);

  if (!isSearchOpen) return null;

  const handleSelect = (item: SearchItem) => {
    setSearchOpen(false);
    if (item.type === 'news') {
      setReaderArticleId(item.id);
      navigate('/');
    } else {
      navigate(item.url);
    }
  };

  const handleOpenFullSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}&scope=${filterType}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSearchOpen(false)}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl rounded-3xl bg-slate-900/95 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_30px_rgba(56,165,248,0.2)] overflow-hidden"
        >
          {/* Search Input Bar */}
          <form onSubmit={handleOpenFullSearch} className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
            <CustomIcon name="search" className="w-5 h-5 text-brand-400 flex-shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по темам, прошивкам, программам и сообщениям 4PDA..."
              className="flex-1 bg-transparent border-none text-white text-sm placeholder:text-slate-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-white"
              >
                <CustomIcon name="close" className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              ESC
            </kbd>
          </form>

          {/* Quick Popular Chips */}
          <div className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-950/40 border-b border-white/5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 flex-shrink-0">
              <CustomIcon name="flame" className="w-3 h-3 text-amber-400" />
              Тренды:
            </span>
            {QUICK_SEARCH_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setQuery(chip)}
                className="text-[11px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 transition-all"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Scope Filters */}
          <div className="flex items-center gap-1.5 px-5 py-2 border-b border-white/5 overflow-x-auto">
            {(
              [
                { id: 'all', label: 'Все' },
                { id: 'topics', label: 'Темы форума' },
                { id: 'posts', label: 'Сообщения' },
                { id: 'releases', label: 'Релизы' },
                { id: 'news', label: 'Новости' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap transition-colors ${
                  filterType === f.id
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-3 space-y-1.5">
            {isLoading ? (
              <div className="py-10 flex items-center justify-center gap-2 text-xs text-brand-400">
                <div className="w-4 h-4 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
                <span>Поиск по базе 4PDA...</span>
              </div>
            ) : results.length > 0 ? (
              results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="p-3 rounded-2xl hover:bg-slate-800/75 border border-transparent hover:border-white/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        item.type === 'release'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : item.type === 'news'
                          ? 'bg-sky-500/20 text-sky-300'
                          : item.type === 'post'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {item.sectionTitle}
                    </span>
                    <span className="text-[10px] text-slate-500">•</span>
                    <span className="text-[10px] text-slate-400">{item.author}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-brand-300 transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{item.snippet}</p>
                </div>
              ))
            ) : query ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                По запросу «{query}» совпадений не найдено. Нажмите Enter для расширенного поиска.
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Начните вводить поисковый запрос или выберите популярный тег выше
              </div>
            )}
          </div>

          {/* Footer with link to Full Search Page */}
          {query.trim() && (
            <div className="px-5 py-3 bg-slate-950/80 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Найдено совпадений: <strong className="text-white">{results.length}</strong>
              </span>
              <button
                type="button"
                onClick={handleOpenFullSearch}
                className="text-xs font-bold text-brand-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Перейти на страницу поиска →</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
