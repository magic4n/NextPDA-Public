import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CustomIcon } from '../components/common/CustomIcon';
import { SEO } from '../components/common/SEO';
import { useNavigate } from 'react-router-dom';

interface ActivityItem {
  id: string;
  type: 'post' | 'release' | 'topic' | 'update';
  title: string;
  section: string;
  author: string;
  authorAvatar: string;
  time: string;
  preview: string;
  url: string;
  tag?: string;
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'release',
    title: 'OrangeFox Recovery R11.1 для Xiaomi 14 (houji)',
    section: 'Android - Прошивки',
    author: 'DarthJaver',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    time: '4 минуты назад',
    preview: 'Добавлена поддержка расшифровки /data на HyperOS 2.0 (Android 15), исправлен бэкап разделов modem и persist.',
    url: '/forum/topic/101',
    tag: 'Свежий релиз',
  },
  {
    id: 'act-2',
    type: 'post',
    title: 'Ответ в теме «Xiaomi 14 / 14 Pro - Прошивки»',
    section: 'Android - Прошивки',
    author: 'Alex_AndroidDev',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&q=80',
    time: '12 минут назад',
    preview: 'Подтверждаю, вчера прошивал европейку через fastboot script, все сервисы работают стабильно.',
    url: '/forum/topic/101',
  },
  {
    id: 'act-3',
    type: 'update',
    title: 'AIMP for Android обновился до v4.05.1432',
    section: 'Android - Программы',
    author: 'Artem_Izmaylov',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    time: '28 минут назад',
    preview: 'Исправлена работа эквалайзера при выводе звука на USB DAC с высокой частотой дискретизации.',
    url: '/forum/topic/102',
    tag: 'Обновление софта',
  },
  {
    id: 'act-4',
    type: 'topic',
    title: 'Создана тема: «Опыт эксплуатации Google Pixel 9 Pro после месяца использования»',
    section: 'Android - Устройства',
    author: 'MobileGeek',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&q=80',
    time: '45 минут назад',
    preview: 'Подробный отзыв об автономности, нагреве модема Exynos 5400 и качестве съемки при плохом освещении.',
    url: '/forum/topic/103',
  },
];

export const ActivityPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'release' | 'post' | 'update'>('all');
  const navigate = useNavigate();

  const filtered = ACTIVITIES.filter((item) => filter === 'all' || item.type === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
      <SEO
        title="Новое и Активность — Форум 4PDA"
        description="Живая лента свежих сообщений, обновлений прошивок, релизов кастомных ядер и новых тем сообщества 4PDA."
        canonicalPath="/activity"
      />
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <CustomIcon name="activity" className="w-6 h-6 text-brand-400" />
          <span>Новое и Активность</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Лента свежих сообщений, обновлений прошивок и новых релизов форума
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 pb-3 mb-6 border-b border-white/10 overflow-x-auto">
        {(
          [
            { id: 'all', label: 'Все события' },
            { id: 'release', label: 'Свежие релизы' },
            { id: 'post', label: 'Новые ответы' },
            { id: 'update', label: 'Обновления' },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === f.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-4">
        {filtered.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => navigate(item.url)}
            className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-white/[0.08] hover:border-brand-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <img
                  src={item.authorAvatar}
                  alt={item.author}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10"
                />
                <span className="text-xs font-semibold text-slate-200">{item.author}</span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-[11px] text-brand-300 font-medium">{item.section}</span>
              </div>
              <span className="text-[10px] text-slate-500">{item.time}</span>
            </div>

            <div className="flex items-center gap-2 mb-1.5">
              {item.tag && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {item.tag}
                </span>
              )}
              <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                {item.title}
              </h3>
            </div>

            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {item.preview}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
