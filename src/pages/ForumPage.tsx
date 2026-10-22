import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { fetchForumSections, fetchSectionTopics, fetchTopicPosts } from '../services/api';
import { CustomIcon } from '../components/common/CustomIcon';
import { PostCard } from '../components/forum/PostCard';
import { WYSIWYGEditor } from '../components/editor/WYSIWYGEditor';
import { NewTopicModal } from '../components/forum/NewTopicModal';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { SEO } from '../components/common/SEO';
import { useParams, useNavigate } from 'react-router-dom';

export const ForumPage: React.FC = () => {
  const { topicId: urlTopicId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, setAuthModalOpen } = useAuthStore();
  const { multiQuotes, clearMultiQuotes, showToast } = useUIStore();

  // Navigation hierarchy:
  // activeSectionId === null && selectedTopicId === null  =>  Level 1: All Sections
  // activeSectionId !== null && selectedTopicId === null  =>  Level 2: Topics in Section
  // selectedTopicId !== null                              =>  Level 3: Posts in Topic
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(urlTopicId || null);

  // Filters & sorting for topics
  const [topicFilter, setTopicFilter] = useState<'all' | 'my' | 'unread' | 'pinned'>('all');
  const [topicSort, setTopicSort] = useState<'date' | 'replies' | 'views'>('date');

  // Modals
  const [isNewTopicOpen, setIsNewTopicOpen] = useState(false);

  // Reply editor state
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Sync with url parameter if navigating directly
  React.useEffect(() => {
    if (urlTopicId) setSelectedTopicId(urlTopicId);
  }, [urlTopicId]);

  // Query 1: Forum sections
  const { data: sections, isLoading: isSectionsLoading } = useQuery({
    queryKey: ['forumSections'],
    queryFn: fetchForumSections,
  });

  // Query 2: Topics in active section
  const { data: sectionTopicsData, isLoading: isTopicsLoading } = useQuery({
    queryKey: ['sectionTopics', activeSectionId, topicFilter, topicSort],
    queryFn: () => (activeSectionId ? fetchSectionTopics(activeSectionId, topicFilter, topicSort) : null),
    enabled: !!activeSectionId && !selectedTopicId,
  });

  // Query 3: Topic posts
  const { data: topicData, isLoading: isTopicLoading, refetch: refetchTopic } = useQuery({
    queryKey: ['topicPosts', selectedTopicId],
    queryFn: () => (selectedTopicId ? fetchTopicPosts(selectedTopicId) : null),
    enabled: !!selectedTopicId,
  });

  // Handle voting in poll
  const [pollVotedOption, setPollVotedOption] = useState<string | null>(null);

  const handleVote = (optionId: string) => {
    if (!isAuthenticated) {
      showToast('Для участия в опросе необходима авторизация на 4PDA', 'warning');
      setAuthModalOpen(true);
      return;
    }
    setPollVotedOption(optionId);
    showToast('Ваш голос успешно учтен!', 'success');
  };

  // Reply submission
  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Авторизуйтесь для публикации ответа', 'warning');
      setAuthModalOpen(true);
      return;
    }

    if (!replyText.trim()) {
      showToast('Введите текст сообщения', 'warning');
      return;
    }

    setIsSubmittingReply(true);
    setTimeout(() => {
      setIsSubmittingReply(false);
      setReplyText('');
      clearMultiQuotes();
      showToast('Ваш ответ успешно добавлен в тему!', 'success');
      refetchTopic();
    }, 600);
  };

  // Insert multiquotes into reply
  const handleInsertMultiQuotes = () => {
    const combinedQuotes = multiQuotes
      .map((q) => `[quote=${q.author}]\n${q.content}\n[/quote]\n`)
      .join('\n');
    setReplyText((prev) => `${prev}\n${combinedQuotes}`);
    clearMultiQuotes();
    showToast('Цитаты вставлены в поле ответа', 'success');
  };

  // -------------------------------------------------------------
  // HIERARCHY LEVEL 3: Posts in Selected Topic
  // -------------------------------------------------------------
  if (selectedTopicId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
        {/* Dynamic SEO for Forum Topic */}
        {topicData?.topic && (
          <SEO
            title={`${topicData.topic.title} — Форум 4PDA`}
            description={`Тема форума 4PDA: ${topicData.topic.title}. Ответы куратора, инструкции по установке, ссылки на прошивки и решение проблем.`}
            canonicalPath={`/forum/topic/${topicData.topic.id}`}
            ogType="article"
            publishedTime={topicData.topic.createdAt}
            author={topicData.topic.author}
            jsonLd={{
              '@context': 'https://schema.org',
              '@type': 'DiscussionForumPosting',
              'headline': topicData.topic.title,
              'url': `https://nextpda.app/forum/topic/${topicData.topic.id}`,
              'author': { '@type': 'Person', 'name': topicData.topic.author },
              'interactionStatistic': {
                '@type': 'InteractionCounter',
                'interactionType': 'https://schema.org/CommentAction',
                'userInteractionCount': topicData.topic.repliesCount,
              },
            }}
          />
        )}

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-5 flex-wrap">
          <button
            onClick={() => {
              setSelectedTopicId(null);
              navigate('/forum');
            }}
            className="hover:text-brand-300 transition-colors flex items-center gap-1 font-medium"
          >
            <CustomIcon name="forum" className="w-3.5 h-3.5 text-brand-400" />
            <span>Разделы форума</span>
          </button>
          <span>/</span>
          <button
            onClick={() => {
              setSelectedTopicId(null);
              if (!activeSectionId && topicData?.topic.sectionId) {
                setActiveSectionId(topicData.topic.sectionId);
              }
            }}
            className="hover:text-brand-300 transition-colors font-medium text-slate-300"
          >
            {topicData?.topic.sectionTitle || 'Раздел'}
          </button>
          <span>/</span>
          <span className="text-brand-400 font-semibold truncate max-w-xs">
            {topicData?.topic.title}
          </span>
        </div>

        {isTopicLoading || !topicData ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-28 rounded-3xl bg-slate-900/80" />
            <div className="h-56 rounded-3xl bg-slate-900/60" />
            <div className="h-56 rounded-3xl bg-slate-900/60" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Topic Header Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {topicData.topic.isPinned && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <CustomIcon name="pin" className="w-3 h-3" />
                    Закреплено в шапке
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  {topicData.topic.repliesCount} ответов • {topicData.topic.viewsCount.toLocaleString()} просмотров
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug mb-3">
                {topicData.topic.title}
              </h1>

              <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <img
                    src={topicData.topic.authorAvatar}
                    alt={topicData.topic.author}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-white/10"
                  />
                  <span>
                    Куратор темы: <strong className="text-slate-200">{topicData.topic.author}</strong>
                  </span>
                </div>
                <span>Создана: {topicData.topic.createdAt}</span>
              </div>
            </div>

            {/* Topic Poll (if present) */}
            {topicData.topic.poll && (
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-brand-500/20 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
                    Опрос темы 4PDA
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Всего голосов: {topicData.topic.poll.totalVotes}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white">
                  {topicData.topic.poll.question}
                </h3>

                <div className="space-y-2.5">
                  {topicData.topic.poll.options.map((opt) => {
                    const percent = Math.round((opt.votes / topicData.topic.poll!.totalVotes) * 100);
                    const isSelected = pollVotedOption === opt.id;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleVote(opt.id)}
                        className={`relative p-3 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                          isSelected
                            ? 'border-brand-400 bg-brand-500/20 shadow-[0_0_15px_rgba(56,165,248,0.25)]'
                            : 'border-white/5 bg-slate-950/40 hover:bg-slate-950/70 hover:border-white/10'
                        }`}
                      >
                        {/* Vote percentage bar background */}
                        <div
                          className="absolute inset-y-0 left-0 bg-brand-500/15 rounded-2xl transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />

                        <div className="relative flex items-center justify-between text-xs">
                          <span className="font-medium text-white">{opt.title}</span>
                          <span className="font-bold text-brand-300">
                            {percent}% ({opt.votes})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Posts List */}
            <div className="space-y-4">
              {topicData.posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  topicTitle={topicData.topic.title}
                  onReplyWithQuote={(author, text) => {
                    setReplyText((prev) => `${prev}\n[quote=${author}]\n${text}\n[/quote]\n`);
                    const editorElement = document.getElementById('reply-editor-box');
                    editorElement?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              ))}
            </div>

            {/* MultiQuote Floating Bar */}
            {multiQuotes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-full bg-slate-900/95 border border-amber-500/40 shadow-2xl backdrop-blur-xl flex items-center gap-3"
              >
                <span className="text-xs font-semibold text-amber-300">
                  Выбрано цитат: {multiQuotes.length}
                </span>
                <button
                  onClick={handleInsertMultiQuotes}
                  className="px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
                >
                  Вставить в ответ
                </button>
                <button onClick={clearMultiQuotes} className="p-1 text-slate-400 hover:text-white">
                  <CustomIcon name="close" className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}

            {/* Reply Editor Box */}
            <div id="reply-editor-box" className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CustomIcon name="edit" className="w-4 h-4 text-brand-400" />
                <span>Быстрый ответ в тему</span>
              </h3>

              <WYSIWYGEditor
                value={replyText}
                onChange={setReplyText}
                placeholder="Напишите ваше сообщение, ответ или инструкцию..."
                minHeight="140px"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  Синхронизировано с BB-кодом 4PDA
                </span>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={handleSubmitReply}
                  disabled={isSubmittingReply}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2"
                >
                  {isSubmittingReply ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CustomIcon name="check" className="w-3.5 h-3.5" />
                  )}
                  <span>Отправить ответ</span>
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // HIERARCHY LEVEL 2: Topics list inside a Section
  // -------------------------------------------------------------
  if (activeSectionId) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 pb-32">
        {/* Dynamic SEO for Section Topics */}
        {sectionTopicsData?.section && (
          <SEO
            title={`${sectionTopicsData.section.title} — Форум 4PDA`}
            description={`Раздел форума 4PDA: ${sectionTopicsData.section.title}. ${sectionTopicsData.section.description} Темы, прошивки и ответы.`}
            canonicalPath={`/forum?section=${activeSectionId}`}
          />
        )}

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-5">
          <button
            onClick={() => setActiveSectionId(null)}
            className="hover:text-brand-300 transition-colors flex items-center gap-1 font-medium"
          >
            <CustomIcon name="chevron-left" className="w-3.5 h-3.5 text-brand-400" />
            <span>Все разделы форума</span>
          </button>
          <span>/</span>
          <span className="text-brand-400 font-semibold">
            {sectionTopicsData?.section.title || 'Раздел'}
          </span>
        </div>

        {/* Section Banner */}
        {sectionTopicsData?.section && (
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-lg mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <CustomIcon name={sectionTopicsData.section.iconName as any} className="w-6 h-6 text-brand-400" />
                <span>{sectionTopicsData.section.title}</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {sectionTopicsData.section.description}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!isAuthenticated) {
                  showToast('Авторизуйтесь для создания темы', 'warning');
                  setAuthModalOpen(true);
                } else {
                  setIsNewTopicOpen(true);
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 text-white text-xs font-bold shadow-md transition-all whitespace-nowrap"
            >
              <CustomIcon name="plus" className="w-4 h-4" />
              <span>Создать тему</span>
            </motion.button>
          </div>
        )}

        {/* Filters and Sorting */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 flex-wrap gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(
              [
                { id: 'all', label: 'Все темы' },
                { id: 'my', label: 'Мои темы' },
                { id: 'unread', label: 'Непрочитанные' },
                { id: 'pinned', label: 'Закрепленные' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setTopicFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  topicFilter === f.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Сортировка:</span>
            <select
              value={topicSort}
              onChange={(e) => setTopicSort(e.target.value as any)}
              className="px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 text-slate-200 text-xs focus:outline-none"
            >
              <option value="date">По дате обновления</option>
              <option value="replies">По ответам</option>
              <option value="views">По просмотрам</option>
            </select>
          </div>
        </div>

        {/* Topics List */}
        {isTopicsLoading || !sectionTopicsData ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-20 rounded-2xl bg-slate-900/60" />
            <div className="h-20 rounded-2xl bg-slate-900/60" />
            <div className="h-20 rounded-2xl bg-slate-900/60" />
          </div>
        ) : (
          <div className="space-y-2.5">
            {sectionTopicsData.topics.map((t) => (
              <motion.div
                key={t.id}
                whileHover={{ x: 2 }}
                onClick={() => setSelectedTopicId(t.id)}
                className="p-4 rounded-2xl bg-slate-900/75 hover:bg-slate-900 border border-white/[0.08] hover:border-brand-500/30 shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <img
                    src={t.authorAvatar}
                    alt={t.author}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 mt-0.5"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {t.isPinned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <CustomIcon name="pin" className="w-2.5 h-2.5" />
                          Закреплено
                        </span>
                      )}
                      {t.hasPoll && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          Опрос
                        </span>
                      )}
                      {t.isUnread && (
                        <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors leading-snug">
                      {t.title}
                    </h3>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Автор: <span className="text-slate-400">{t.author}</span> • Создана {t.createdAt}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-xs text-slate-400 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 flex-shrink-0">
                  <div className="text-right">
                    <span className="font-semibold text-brand-300">{t.repliesCount}</span>{' '}
                    <span className="text-slate-500">ответов</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {t.lastPostDate} ({t.lastPostAuthor})
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal for creating a new topic */}
        <NewTopicModal
          defaultSectionId={activeSectionId}
          isOpen={isNewTopicOpen}
          onClose={() => setIsNewTopicOpen(false)}
          onCreated={() => setSelectedTopicId('101')}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // HIERARCHY LEVEL 1: Sections List
  // -------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-32">
      {/* Dynamic SEO for Main Forum Catalog */}
      <SEO
        title="Форум 4PDA — Каталог разделов и тем"
        description="Крупнейшее сообщество по мобильным устройствам, официальным и кастомным прошивкам, программам и технологиям на форуме 4PDA."
        canonicalPath="/forum"
        keywords="4pda форум, android прошивки, каталог тем 4pda, twrp, recovery, apple ios, курилка 4pda"
      />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CustomIcon name="forum" className="w-6 h-6 text-brand-400" />
            <span>Форум 4PDA</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Крупнейшее русскоязычное сообщество мобильных устройств, прошивок и разработок
          </p>
        </div>

        {/* New Topic Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (!isAuthenticated) {
              showToast('Авторизуйтесь для создания темы', 'warning');
              setAuthModalOpen(true);
            } else {
              setIsNewTopicOpen(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(43,126,201,0.35)] transition-all"
        >
          <CustomIcon name="plus" className="w-4 h-4" />
          <span>Новая тема</span>
        </motion.button>
      </div>

      {/* Forum Sections Grid */}
      {isSectionsLoading || !sections ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <div className="h-44 rounded-3xl bg-slate-900/60" />
          <div className="h-44 rounded-3xl bg-slate-900/60" />
          <div className="h-44 rounded-3xl bg-slate-900/60" />
          <div className="h-44 rounded-3xl bg-slate-900/60" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((sec) => (
            <motion.div
              key={sec.id}
              whileHover={{ y: -3 }}
              onClick={() => setActiveSectionId(sec.id)}
              className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-white/[0.08] hover:border-brand-500/35 shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-400/20 text-brand-400 group-hover:scale-110 transition-transform">
                      <CustomIcon name={sec.iconName as any} className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                        {sec.title}
                      </h3>
                      <div className="text-[11px] text-slate-500">
                        {sec.topicsCount.toLocaleString()} тем • {sec.postsCount.toLocaleString()} постов
                      </div>
                    </div>
                  </div>
                  <CustomIcon name="chevron-right" className="w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-transform" />
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mt-1">
                  {sec.description}
                </p>

                {/* Subsections tags */}
                {sec.subsections && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-white/5">
                    {sec.subsections.map((sub) => (
                      <span
                        key={sub.id}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950/60 text-slate-400 border border-white/5"
                      >
                        {sub.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Last post in section */}
              {sec.lastPost && (
                <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="truncate max-w-[200px] text-brand-300 font-medium">
                    {sec.lastPost.topicTitle}
                  </span>
                  <span className="text-slate-500">{sec.lastPost.date}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal for creating a new topic */}
      <NewTopicModal
        isOpen={isNewTopicOpen}
        onClose={() => setIsNewTopicOpen(false)}
        onCreated={() => setSelectedTopicId('101')}
      />
    </div>
  );
};
