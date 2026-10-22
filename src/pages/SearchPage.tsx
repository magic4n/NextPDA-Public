import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { searchForum, SearchItem } from '../services/api';
import { CustomIcon } from '../components/common/CustomIcon';
import { SEO } from '../components/common/SEO';
import { useUIStore } from '../store/useUIStore';

const POPULAR_QUERIES = [
  'HyperOS 2.0',
  'Xiaomi 14',
  'OrangeFox Recovery',
  'Magisk 27',
  'Play Integrity fix',
  'KernelSU',
  'Pixel 9 Pro',
  'LineageOS 21',
  'Fastboot',
  'TWRP',
];

const SEARCH_HISTORY_KEY = 'nextpda_search_history';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setReaderArticleId } = useUIStore();

  const urlQuery = searchParams.get('q') || '';
  const urlSection = searchParams.get('section') || 'all';
  const urlScope = searchParams.get('scope') || 'all';
  const urlSort = searchParams.get('sort') || 'relevance';

  const [inputVal, setInputVal] = useState(urlQuery);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  });

  // Query search
  const { data, isLoading } = useQuery({
    queryKey: ['forumSearch', urlQuery, urlSection, urlScope, urlSort],
    queryFn: () => searchForum(urlQuery, urlSection, urlScope, urlSort),
    enabled: urlQuery.trim().length > 0,
  });

  const saveToHistory = (q: string) => {
    if (!q.trim()) return;
    const clean = q.trim();
    const updated = [clean, ...searchHistory.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
    setSearchHistory(updated);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    saveToHistory(inputVal.trim());
    setSearchParams({
      q: inputVal.trim(),
      section: urlSection,
      scope: urlScope,
      sort: urlSort,
    });
  };

  const handleSelectChip = (q: string) => {
    setInputVal(q);
    saveToHistory(q);
    setSearchParams({
      q,
      section: urlSection,
      scope: urlScope,
      sort: urlSort,
    });
  };

  const handleScopeChange = (newScope: string) => {
    setSearchParams({
      q: urlQuery,
      section: urlSection,
      scope: newScope,
      sort: urlSort,
    });
  };

  const handleSectionChange = (newSection: string) => {
    setSearchParams({
      q: urlQuery,
      section: newSection,
      scope: urlScope,
      sort: urlSort,
    });
  };

  const handleSortChange = (newSort: string) => {
    setSearchParams({
      q: urlQuery,
      section: urlSection,
      scope: urlScope,
      sort: newSort,
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  const handleOpenResult = (item: SearchItem) => {
    if (item.type === 'news') {
      setReaderArticleId(item.id);
      navigate('/');
    } else {
      navigate(item.url);
    }
  };

  // Helper to highlight terms
  const highlightMatches = (text: string, queryStr: string) => {
    if (!queryStr.trim()) return text;
    const terms = queryStr.trim().split(/\s+/).filter(Boolean);
    const regex = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, idx) =>
      regex.test(part) ? (
        <mark key={idx} className="bg-brand-500/35 text-brand-200 px-1 py-0.5 rounded font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-32 space-y-6">
      {/* Dynamic SEO for Search Engine Google Indexing */}
      <SEO
        title={urlQuery ? `Поиск «${urlQuery}» — Форум 4PDA` : 'Поиск по форуму и новостям — NextPDA'}
        description={
          urlQuery
            ? `Результаты поиска «${urlQuery}» по темам, прошивкам, программам и сообщениям форума 4PDA на клиенте NextPDA.`
            : 'Полнотекстовый поиск по всем разделам форума 4PDA, официальным и кастомным прошивкам, ядрам и новостям.'
        }
        canonicalPath={urlQuery ? `/search?q=${encodeURIComponent(urlQuery)}` : '/search'}
        keywords={`поиск 4pda, ${urlQuery}, прошивки, форум 4pda, темы, инструкции`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SearchResultsPage',
          'name': `Поиск по 4PDA: ${urlQuery || 'Все темы'}`,
          'url': `https://nextpda.app/search?q=${encodeURIComponent(urlQuery)}`,
        }}
      />

      {/* Search Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <CustomIcon name="search" className="w-6 h-6 text-brand-400" />
          <span>Поиск по форуму и порталу</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Быстрый поиск по темам, сообщениям кураторов, релизам прошивок и каталогу софта
        </p>
      </div>

      {/* Main Search Bar Form */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 pointer-events-none text-brand-400">
            <CustomIcon name="search" className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Введите запрос, модель устройства, название прошивки или утилиты..."
            className="w-full pl-12 pr-28 py-4 rounded-3xl bg-slate-900/90 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 shadow-xl transition-all"
          />
          {inputVal && (
            <button
              type="button"
              onClick={() => setInputVal('')}
              className="absolute right-20 text-slate-400 hover:text-white p-1"
            >
              <CustomIcon name="close" className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Найти</span>
          </button>
        </div>
      </form>

      {/* Popular Chips and Search History */}
      <div className="space-y-3">
        {/* Popular chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <CustomIcon name="flame" className="w-3.5 h-3.5 text-amber-400" />
            Популярные:
          </span>
          {POPULAR_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => handleSelectChip(q)}
              className="px-3 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/5 hover:border-brand-400/30 text-slate-300 hover:text-white text-xs font-medium transition-all"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Search history */}
        {searchHistory.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <CustomIcon name="clock" className="w-3.5 h-3.5" />
              История:
            </span>
            {searchHistory.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectChip(q)}
                className="px-2.5 py-0.5 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-white/5 text-slate-400 hover:text-slate-200 text-[11px] transition-colors"
              >
                {q}
              </button>
            ))}
            <button
              onClick={clearHistory}
              className="text-[10px] text-slate-500 hover:text-rose-400 ml-1 underline"
            >
              Очистить
            </button>
          </div>
        )}
      </div>

      {/* Scope Categories Tabs & Filter Bar */}
      {urlQuery && (
        <div className="space-y-4 pt-2">
          {/* Tabs */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'all', label: 'Все результаты', count: data?.categoriesCount.all || 0 },
                { id: 'topics', label: 'Темы форума', count: data?.categoriesCount.topics || 0 },
                { id: 'posts', label: 'Сообщения', count: data?.categoriesCount.posts || 0 },
                { id: 'releases', label: 'Релизы', count: data?.categoriesCount.releases || 0 },
                { id: 'news', label: 'Новости', count: data?.categoriesCount.news || 0 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleScopeChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    urlScope === tab.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    urlScope === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
              {/* Section selector */}
              <div className="flex items-center gap-1.5">
                <span>Раздел:</span>
                <select
                  value={urlSection}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-200 text-xs focus:outline-none"
                >
                  <option value="all">Все разделы форума</option>
                  <option value="android-roms">Android - Прошивки</option>
                  <option value="android-dev">Android - Устройства</option>
                  <option value="android-apps">Android - Программы</option>
                  <option value="apple-ios">Apple iOS / iPadOS</option>
                  <option value="laptops-pc">Ноутбуки и Компьютеры</option>
                  <option value="news">Новости портала</option>
                </select>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5">
                <span>Сортировка:</span>
                <select
                  value={urlSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-200 text-xs focus:outline-none"
                >
                  <option value="relevance">По релевантности</option>
                  <option value="date">По дате</option>
                  <option value="replies">По ответам</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary & List */}
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-28 rounded-3xl bg-slate-900/60" />
              <div className="h-28 rounded-3xl bg-slate-900/60" />
              <div className="h-28 rounded-3xl bg-slate-900/60" />
            </div>
          ) : data && data.results.length > 0 ? (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>
                  Найдено совпадений: <strong className="text-white">{data.totalCount}</strong> по запросу «{urlQuery}»
                </span>
                <span className="text-[11px] text-brand-300 font-mono">
                  Индексировано для Google
                </span>
              </div>

              {data.results.map((res) => (
                <motion.article
                  key={res.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleOpenResult(res)}
                  className="p-5 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-white/[0.08] hover:border-brand-500/35 shadow-sm transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        res.type === 'release'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : res.type === 'news'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : res.type === 'post'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {res.sectionTitle}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400">Автор: <strong className="text-slate-300">{res.author}</strong></span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{res.replies} ответов</span>
                      <span>•</span>
                      <span>{res.date}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors leading-snug">
                    {highlightMatches(res.title, urlQuery)}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {highlightMatches(res.snippet, urlQuery)}
                  </p>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-white/5 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
                <CustomIcon name="search" className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Ничего не найдено</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                По запросу «{urlQuery}» совпадений не обнаружено. Попробуйте изменить формулировку, использовать другие ключевые слова или выбрать «Все разделы».
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
