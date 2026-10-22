import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CustomIcon } from '../components/common/CustomIcon';
import { getBookmarks, removeBookmark } from '../services/cache';
import { useUIStore } from '../store/useUIStore';
import { SEO } from '../components/common/SEO';
import { useNavigate } from 'react-router-dom';

export const FavoritesPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Array<{ id: string; type: 'news' | 'topic' | 'post'; title: string; url: string; dateAdded: number; previewText?: string }>>([]);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'quotes'>('bookmarks');
  const { multiQuotes, removeMultiQuote, clearMultiQuotes, setReaderArticleId, showToast } = useUIStore();
  const navigate = useNavigate();

  const loadBookmarks = async () => {
    const list = await getBookmarks();
    setBookmarks(list);
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleRemoveBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeBookmark(id);
    await loadBookmarks();
    showToast('Закладка удалена', 'info');
  };

  const handleOpenBookmark = (item: (typeof bookmarks)[0]) => {
    if (item.type === 'news') {
      setReaderArticleId(item.id);
      navigate('/');
    } else {
      navigate(item.url);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
      <SEO
        title="Избранное и Закладки — NextPDA"
        description="Сохраненные статьи, избранные темы форума 4PDA и буфер цитат в клиенте NextPDA."
        canonicalPath="/bookmarks"
      />
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <CustomIcon name="bookmark" className="w-6 h-6 text-brand-400" />
          <span>Избранное</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Сохраненные материалы, темы форума и буфер мультицитирования
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-900/80 p-1 border border-white/10 mb-6 max-w-sm">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'bookmarks'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Закладки ({bookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'quotes'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Буфер цитат ({multiQuotes.length})
        </button>
      </div>

      {activeTab === 'bookmarks' ? (
        bookmarks.length > 0 ? (
          <div className="space-y-3">
            {bookmarks.map((bm) => (
              <motion.div
                key={bm.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleOpenBookmark(bm)}
                className="p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-brand-500/30 shadow-md transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-500/15 text-brand-300">
                      {bm.type === 'news' ? 'Статья' : 'Тема форума'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Сохранено {new Date(bm.dateAdded).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors truncate">
                    {bm.title}
                  </h3>
                  {bm.previewText && (
                    <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                      {bm.previewText}
                    </p>
                  )}
                </div>

                <button
                  onClick={(e) => handleRemoveBookmark(bm.id, e)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Удалить из закладок"
                >
                  <CustomIcon name="trash" className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 p-6 rounded-3xl bg-slate-900/40 border border-white/5 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <CustomIcon name="bookmark" className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Список закладок пуст</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Нажимайте иконку закладки в ридере статей или темах форума, чтобы быстро возвращаться к ним.
            </p>
          </div>
        )
      ) : (
        /* Multi-quote stack tab */
        multiQuotes.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-xs text-slate-400">
                Собрано для ответа: {multiQuotes.length} цитат
              </span>
              <button
                onClick={clearMultiQuotes}
                className="text-xs text-rose-400 hover:underline"
              >
                Очистить все цитаты
              </button>
            </div>

            <div className="space-y-3">
              {multiQuotes.map((q) => (
                <div
                  key={q.postId}
                  className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-300">
                      Автор: {q.author}
                    </span>
                    <button
                      onClick={() => removeMultiQuote(q.postId)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <CustomIcon name="close" className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 italic line-clamp-3">
                    {q.content}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/forum')}
              className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <CustomIcon name="forum" className="w-4 h-4" />
              <span>Перейти в тему для ответа</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-16 p-6 rounded-3xl bg-slate-900/40 border border-white/5 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <CustomIcon name="multiquote" className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Буфер цитат пуст</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Вы можете нажимать кнопку «Мультицитата» под постами в любых темах, чтобы накопить цитаты и ответить на них разом.
            </p>
          </div>
        )
      )}
    </div>
  );
};
