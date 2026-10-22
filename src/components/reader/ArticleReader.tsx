import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NewsArticle } from '../../types';
import { CustomIcon } from '../common/CustomIcon';
import { useUIStore } from '../../store/useUIStore';
import { addBookmark, removeBookmark, isBookmarked } from '../../services/cache';
import { BBCodeRenderer } from '../forum/BBCodeRenderer';

interface ArticleReaderProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({ article, onClose }) => {
  const { readerFontSize, setReaderFontSize, showToast } = useUIStore();
  const [isSaved, setIsSaved] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(article?.comments || []);
  const [readingProgress, setReadingProgress] = useState(0);

  // Reaction counters
  const [reactions, setReactions] = useState<{ useful: number; fire: number; idea: number }>({
    useful: 38,
    fire: 24,
    idea: 15,
  });
  const [userReaction, setUserReaction] = useState<string | null>(null);

  React.useEffect(() => {
    if (article) {
      isBookmarked(article.id).then(setIsSaved);
      setComments(article.comments || []);
      setReadingProgress(0);
    }
  }, [article]);

  if (!article) return null;

  const words = (article.content + ' ' + article.summary).split(/\s+/).length;
  const readTimeMin = Math.max(1, Math.round(words / 140));

  const toggleBookmark = async () => {
    if (isSaved) {
      await removeBookmark(article.id);
      setIsSaved(false);
      showToast('Удалено из закладок', 'info');
    } else {
      await addBookmark({
        id: article.id,
        type: 'news',
        title: article.title,
        url: `/news/${article.slug}`,
        previewText: article.summary,
      });
      setIsSaved(true);
      showToast('Статья сохранена в закладки NextPDA', 'success');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const added = {
      id: 'c_' + Date.now(),
      author: 'Вы (NextPDA User)',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      date: 'Только что',
      text: newComment.trim(),
      likes: 0,
    };
    setComments([added, ...comments]);
    setNewComment('');
    showToast('Комментарий опубликован!', 'success');
  };

  const handleReaction = (type: 'useful' | 'fire' | 'idea') => {
    if (userReaction === type) return;
    setReactions((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
      ...(userReaction ? { [userReaction]: prev[userReaction as keyof typeof prev] - 1 } : {}),
    }));
    setUserReaction(type);
    showToast('Ваша реакция учтена', 'info');
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: article.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast('Ссылка на статью скопирована', 'success');
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) {
      setReadingProgress(Math.min(100, Math.max(0, (el.scrollTop / maxScroll) * 100)));
    }
  };

  return (
    <AnimatePresence>
      <div
        onScroll={handleScroll}
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-2xl flex justify-center p-0 sm:p-4 select-text"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-3xl min-h-screen sm:min-h-0 sm:rounded-3xl bg-slate-900 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col my-auto"
        >
          {/* Reading progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800 z-30">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-400 via-sky-400 to-indigo-400 shadow-[0_0_10px_rgba(56,165,248,0.7)]"
              style={{ width: `${readingProgress}%` }}
              transition={{ ease: 'easeOut', duration: 0.1 }}
            />
          </div>

          {/* Reader Top Bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 bg-slate-900/90 backdrop-blur-xl border-b border-white/10">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <CustomIcon name="chevron-left" className="w-4 h-4" />
              <span>Назад</span>
            </button>

            {/* Typography & Actions */}
            <div className="flex items-center gap-2">
              {/* Font Size adjustments */}
              <div className="flex items-center rounded-xl bg-slate-950/60 p-0.5 border border-white/5">
                <button
                  onClick={() => setReaderFontSize(Math.max(13, readerFontSize - 1))}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                  title="Уменьшить шрифт"
                >
                  A-
                </button>
                <span className="text-[10px] text-slate-500 px-1 font-mono">{readerFontSize}</span>
                <button
                  onClick={() => setReaderFontSize(Math.min(22, readerFontSize + 1))}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                  title="Увеличить шрифт"
                >
                  A+
                </button>
              </div>

              {/* Bookmark */}
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-xl transition-colors ${
                  isSaved
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title="В закладки"
              >
                <CustomIcon name={isSaved ? 'bookmark-fill' : 'bookmark'} className="w-4 h-4" />
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Поделиться"
              >
                <CustomIcon name="share" className="w-4 h-4" />
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <CustomIcon name="close" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reader Body */}
          <div className="p-5 sm:p-8 flex-1">
            {/* Meta Tags */}
            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-brand-500/15 text-brand-300 border border-brand-500/25">
                {article.category}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <CustomIcon name="clock" className="w-3.5 h-3.5" />
                ~{readTimeMin} мин на чтение
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <CustomIcon name="eye" className="w-3.5 h-3.5" />
                {article.views.toLocaleString()}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug mb-4">
              {article.title}
            </h1>

            {/* Author card */}
            <div className="flex items-center gap-3 pb-6 mb-6 border-b border-white/10">
              <img
                src={article.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'}
                alt={article.author}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-400/30"
              />
              <div>
                <div className="text-xs font-bold text-white">{article.author}</div>
                <div className="text-[11px] text-slate-400">Автор редакции 4PDA • {article.publishedAt}</div>
              </div>
            </div>

            {/* Cover Image */}
            {article.coverImage && (
              <div className="mb-6 rounded-3xl overflow-hidden border border-white/10 shadow-lg">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}

            {/* Summary Lead */}
            {article.summary && (
              <p className="text-base font-medium text-slate-200 italic mb-6 leading-relaxed bg-brand-500/5 p-4 rounded-2xl border-l-4 border-l-brand-400">
                {article.summary}
              </p>
            )}

            {/* Article Main Text with BBCode Renderer */}
            <div
              className="text-slate-200 leading-relaxed space-y-4"
              style={{ fontSize: `${readerFontSize}px` }}
            >
              <BBCodeRenderer content={article.content} />
            </div>

            {/* Interactive Reactions */}
            <div className="my-8 p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs font-semibold text-slate-400">Оцените материал:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReaction('useful')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    userReaction === 'useful'
                      ? 'bg-brand-500/25 border-brand-400 text-brand-300'
                      : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <span>👍 Полезно</span>
                  <span className="text-[10px] opacity-75">{reactions.useful}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReaction('fire')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    userReaction === 'fire'
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                      : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <span>🔥 Огонь</span>
                  <span className="text-[10px] opacity-75">{reactions.fire}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReaction('idea')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    userReaction === 'idea'
                      ? 'bg-purple-500/25 border-purple-400 text-purple-300'
                      : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <span>💡 Интересно</span>
                  <span className="text-[10px] opacity-75">{reactions.idea}</span>
                </button>
              </div>
            </div>

            {/* Original 4PDA Link */}
            <div className="mt-8 p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs font-semibold text-white">Оригинал публикации</div>
                <div className="text-[11px] text-slate-400">
                  Материал опубликован на официальном портале 4PDA
                </div>
              </div>
              <a
                href={`https://4pda.to/${article.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-all shadow-md"
              >
                <span>Открыть на 4PDA</span>
                <CustomIcon name="external-link" className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Comments Section */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CustomIcon name="message" className="w-5 h-5 text-brand-400" />
                <span>Обсуждение ({comments.length})</span>
              </h3>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mb-6 space-y-2">
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Оставьте ваш комментарий к новости..."
                  className="w-full p-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-400 transition-colors resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <CustomIcon name="check" className="w-3.5 h-3.5" />
                    <span>Отправить комментарий</span>
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={c.authorAvatar}
                          alt={c.author}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                        />
                        <span className="text-xs font-semibold text-white">{c.author}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{c.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
