import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ForumPost } from '../../types';
import { CustomIcon } from '../common/CustomIcon';
import { BBCodeRenderer } from './BBCodeRenderer';
import { QuickEdit } from '../editor/QuickEdit';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { startDownload } from '../../services/downloadManager';

interface PostCardProps {
  post: ForumPost;
  topicTitle: string;
  onReplyWithQuote?: (author: string, quoteContent: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, topicTitle, onReplyWithQuote }) => {
  const { user, isAuthenticated, setAuthModalOpen } = useAuthStore();
  const { multiQuotes, addMultiQuote, showToast } = useUIStore();

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(post.bbCodeContent);
  const [likes, setLikes] = useState(post.likes);
  const [hasLiked, setHasLiked] = useState(post.hasLiked || false);

  const isMultiQuoted = multiQuotes.some((q) => q.postId === post.id);
  const canEdit = isAuthenticated && (user?.id === post.author.id || user?.group === 'Модератор' || user?.group === 'Куратор' || user?.group === 'Администратор');

  const handleLike = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
      showToast(`Вы оценили пост #${post.postNumber}`, 'success');
    }
  };

  const handleSingleQuote = () => {
    if (onReplyWithQuote) {
      onReplyWithQuote(post.author.username, content);
    } else {
      addMultiQuote({
        postId: post.id,
        author: post.author.username,
        topicTitle,
        content,
      });
      showToast(`Цитата #${post.postNumber} добавлена в буфер ответа`, 'info');
    }
  };

  const handleToggleMultiQuote = () => {
    addMultiQuote({
      postId: post.id,
      author: post.author.username,
      topicTitle,
      content,
    });
    if (!isMultiQuoted) {
      showToast(`Пост #${post.postNumber} добавлен в мультицитирование`, 'info');
    } else {
      showToast(`Пост #${post.postNumber} удален из мультицитирования`, 'info');
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/forum/topic/${post.topicId}#post-${post.id}`;
    if (navigator.share) {
      navigator.share({ title: topicTitle, url: postUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(postUrl);
      showToast('Ссылка на пост скопирована!', 'success');
    }
  };

  return (
    <motion.article
      id={`post-${post.id}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-4 sm:p-5 rounded-3xl bg-slate-900/70 backdrop-blur-md border border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.35)] relative overflow-hidden"
    >
      {/* Post Header: Author info & post meta */}
      <div className="flex items-start justify-between gap-3 mb-4 pb-3.5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={post.author.avatar}
              alt={post.author.username}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover ring-2 ring-white/10"
            />
            {post.author.group === 'Куратор' && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-slate-950 ring-2 ring-slate-900">
                ★
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white hover:text-brand-300 transition-colors cursor-pointer">
                {post.author.username}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  post.author.group === 'Куратор'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : post.author.group === 'Модератор'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
                }`}
              >
                {post.author.group}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-[11px] text-slate-400 mt-0.5">
              <span>
                Репутация:{' '}
                <strong className="text-brand-300 font-semibold">+{post.author.reputation}</strong>
              </span>
              <span>•</span>
              <span className="hidden sm:inline">Постов: {post.author.postsCount}</span>
            </div>
          </div>
        </div>

        {/* Post Number & Date */}
        <div className="flex flex-col items-end text-right">
          <span className="text-xs font-bold text-brand-400/80 bg-brand-500/10 px-2 py-0.5 rounded-lg border border-brand-400/20">
            #{post.postNumber}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <CustomIcon name="clock" className="w-3 h-3" />
            {post.createdAt}
          </span>
        </div>
      </div>

      {/* Post Content or Inline Quick Editor */}
      <div className="min-h-[60px] my-2">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <QuickEdit
              key="edit"
              initialContent={content}
              onSave={(newVal) => {
                setContent(newVal);
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <BBCodeRenderer key="display" content={content} />
          )}
        </AnimatePresence>
      </div>

      {/* Attachments (if any) */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Прикрепленные файлы:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {post.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-brand-500/30 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-xl bg-brand-500/20 text-brand-400">
                    <CustomIcon name="download" className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate max-w-[150px]">
                      {att.fileName}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {att.fileSize} • {att.downloadsCount} скачиваний
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    startDownload(att.downloadUrl, att.fileName);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 text-xs font-medium transition-colors"
                >
                  Скачать
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post Actions Footer */}
      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/5 flex-wrap">
        {/* Likes / Karma counter */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            hasLiked
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
              : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-white/5'
          }`}
        >
          <CustomIcon
            name="thumbs-up"
            className={`w-3.5 h-3.5 ${hasLiked ? 'text-rose-400 fill-rose-400' : ''}`}
          />
          <span>{likes}</span>
        </motion.button>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {/* Quick Edit button */}
          {canEdit && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs transition-colors"
              title="Быстрое редактирование"
            >
              <CustomIcon name="edit" className="w-3.5 h-3.5 text-brand-400" />
              <span className="hidden sm:inline">Редактировать</span>
            </button>
          )}

          {/* Multi-quote button */}
          <button
            onClick={handleToggleMultiQuote}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs transition-all ${
              isMultiQuoted
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-transparent'
            }`}
            title="Мультицитирование"
          >
            <CustomIcon name="multiquote" className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Мультицитата</span>
          </button>

          {/* Single Quote / Reply */}
          <button
            onClick={handleSingleQuote}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-500/15 hover:bg-brand-500/25 text-brand-300 text-xs font-medium border border-brand-500/30 transition-all"
            title="Ответить с цитатой"
          >
            <CustomIcon name="quote" className="w-3.5 h-3.5" />
            <span>Цитировать</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-full bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Поделиться постом"
          >
            <CustomIcon name="share" className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.article>
  );
};
