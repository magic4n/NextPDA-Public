import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchNewsFeed } from '../services/api';
import { CustomIcon } from '../components/common/CustomIcon';
import { useUIStore } from '../store/useUIStore';
import { ArticleReader } from '../components/reader/ArticleReader';
import { NewsArticle } from '../types';
import { startDownload } from '../services/downloadManager';
import { SEO } from '../components/common/SEO';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const { setReaderArticleId } = useUIStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['newsFeed', activeCategory, page],
    queryFn: () => fetchNewsFeed(activeCategory, page),
  });

  const categories = [
    { id: 'all', label: 'Все новости' },
    { id: 'reviews', label: 'Обзоры' },
    { id: 'hardware', label: 'Железо' },
    { id: 'software', label: 'Программы' },
    { id: 'games', label: 'Игры' },
  ];

  const handleOpenArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setReaderArticleId(article.id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-28">
      {/* Dynamic SEO for Googlebot and Search Indexing */}
      <SEO
        title="Главная страница — Новости технологий и портал 4PDA"
        description="Свежие обзоры флагманов, новости мобильных процессоров, каталог софта и топовые обсуждения форума 4PDA в современном клиенте NextPDA."
        canonicalPath="/"
        keywords="4pda, новости 4pda, обзоры смартфонов, hyperos, snapdragon, android, программы 4pda"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'NewsMediaOrganization',
          'name': 'NextPDA',
          'url': 'https://nextpda.app',
        }}
      />

      {/* Category Filter Pills (Top navigation under navbar) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-[0_0_15px_rgba(43,126,201,0.35)]'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading || !data ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-80 rounded-3xl bg-slate-900/80 border border-white/5" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="h-40 rounded-3xl bg-slate-900/60" />
              <div className="h-40 rounded-3xl bg-slate-900/60" />
            </div>
            <div className="h-80 rounded-3xl bg-slate-900/60" />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Hero Block (Главная новость 1:1 со структурой 4PDA) */}
          {data.hero && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleOpenArticle(data.hero)}
              className="group relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.5)] cursor-pointer bg-slate-900"
            >
              <div className="relative h-72 sm:h-96 w-full overflow-hidden">
                <img
                  src={data.hero.coverImage}
                  alt={data.hero.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-brand-500 text-white shadow-md">
                    ГЛАВНАЯ НОВОСТЬ
                  </span>
                  <span className="text-xs text-slate-300">•</span>
                  <span className="text-xs text-slate-300 flex items-center gap-1">
                    <CustomIcon name="clock" className="w-3.5 h-3.5" />
                    {data.hero.publishedAt}
                  </span>
                  <span className="text-xs text-slate-300">•</span>
                  <span className="text-xs text-slate-300 flex items-center gap-1">
                    <CustomIcon name="message" className="w-3.5 h-3.5 text-brand-400" />
                    {data.hero.commentsCount}
                  </span>
                </div>

                <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug group-hover:text-brand-300 transition-colors">
                  {data.hero.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mt-2 font-normal max-w-3xl">
                  {data.hero.summary}
                </p>
              </div>
            </motion.div>
          )}

          {/* Main 4PDA Grid: News Feed + Sidebar Blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: News Feed with Pagination */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CustomIcon name="sparkles" className="w-4 h-4 text-brand-400" />
                  Лента материалов
                </h3>
                <span className="text-xs text-slate-400">Страница {page} из {data.totalPages}</span>
              </div>

              <div className="space-y-4">
                {data.articles.map((art, idx) => (
                  <motion.article
                    key={art.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleOpenArticle(art)}
                    className="p-4 sm:p-5 rounded-3xl bg-slate-900/75 hover:bg-slate-900 border border-white/[0.08] hover:border-brand-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all cursor-pointer group flex flex-col sm:flex-row gap-4"
                  >
                    {art.coverImage && (
                      <div className="sm:w-48 h-36 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-950">
                        <img
                          src={art.coverImage}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-400">
                          <span className="font-semibold text-brand-300">{art.category}</span>
                          <span>•</span>
                          <span>{art.publishedAt}</span>
                        </div>
                        <h4 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors leading-snug">
                          {art.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1.5">
                          {art.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-xs text-slate-500">
                        <span className="text-[11px] font-medium text-slate-400">
                          {art.author}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <CustomIcon name="eye" className="w-3.5 h-3.5" />
                            {art.views}
                          </span>
                          <span className="flex items-center gap-1 text-brand-300 font-semibold">
                            <CustomIcon name="message" className="w-3.5 h-3.5" />
                            {art.commentsCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
                >
                  ← Назад
                </button>
                {[1, 2, 3, 4, 5].map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      page === pageNum
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl bg-brand-600/80 hover:bg-brand-500 border border-brand-400/30 text-xs font-semibold text-white disabled:opacity-40 transition-colors"
                >
                  Вперед →
                </button>
              </div>
            </div>

            {/* Right Column: 4PDA Sidebar Blocks */}
            <div className="space-y-6">
              {/* Блок «Сейчас на форуме» */}
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Сейчас на форуме
                  </h4>
                  <button
                    onClick={() => navigate('/forum')}
                    className="text-[11px] text-brand-400 hover:underline"
                  >
                    Все разделы →
                  </button>
                </div>
                <div className="space-y-2">
                  {data.sidebar.nowOnForum.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/forum/topic/${item.id}`)}
                      className="p-2.5 rounded-2xl bg-slate-950/40 hover:bg-slate-800/80 border border-white/5 transition-all cursor-pointer group"
                    >
                      <div className="text-[10px] text-brand-300 font-semibold mb-0.5">
                        {item.section}
                      </div>
                      <div className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                        {item.title}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                        <span>{item.replies} ответов</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Блок «Топ-обсуждения» */}
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 pb-2 border-b border-white/10">
                  <CustomIcon name="flame" className="w-4 h-4 text-amber-400" />
                  Топ-обсуждения
                </h4>
                <div className="space-y-2.5">
                  {data.sidebar.topDiscussions.map((top) => (
                    <div
                      key={top.id}
                      onClick={() => navigate('/forum')}
                      className="p-2.5 rounded-2xl bg-slate-950/40 hover:bg-slate-800/80 border border-white/5 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        {top.isHot && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            HOT
                          </span>
                        )}
                        <span className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                          {top.title}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <CustomIcon name="message" className="w-3 h-3 text-brand-400" />
                        <span>{top.comments} комментариев</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Блок «Новинки софта» */}
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 pb-2 border-b border-white/10">
                  <CustomIcon name="download" className="w-4 h-4 text-sky-400" />
                  Новинки софта
                </h4>
                <div className="space-y-2">
                  {data.sidebar.newSoftware.map((soft) => (
                    <div
                      key={soft.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-brand-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl">{soft.icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate max-w-[120px]">
                            {soft.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {soft.version} • {soft.size}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          startDownload(`https://4pda.to/soft/${soft.id}`, `${soft.name}_${soft.version}.apk`);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 text-xs font-medium transition-colors"
                      >
                        Скачать
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Блок «Блоги» */}
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 pb-2 border-b border-white/10">
                  <CustomIcon name="edit" className="w-4 h-4 text-indigo-400" />
                  Колонки и Блоги
                </h4>
                <div className="space-y-2">
                  {data.sidebar.blogs.map((blog) => (
                    <div
                      key={blog.id}
                      className="p-2.5 rounded-2xl bg-slate-950/40 hover:bg-slate-800/80 border border-white/5 transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                        {blog.title}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                        <span>Автор: {blog.author}</span>
                        <span>{blog.reads} просмотров</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reader Mode Drawer / Modal */}
      {selectedArticle && (
        <ArticleReader
          article={selectedArticle}
          onClose={() => {
            setSelectedArticle(null);
            setReaderArticleId(null);
          }}
        />
      )}
    </div>
  );
};
