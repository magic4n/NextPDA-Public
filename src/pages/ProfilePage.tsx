import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CustomIcon } from '../components/common/CustomIcon';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { clearAllCache, getCacheCount } from '../services/cache';
import { SEO } from '../components/common/SEO';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout, setAuthModalOpen } = useAuthStore();
  const { readerFontSize, setReaderFontSize, showToast } = useUIStore();
  const [cacheCount, setCacheCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [themeMode, setThemeMode] = useState<'slate' | 'amoled' | 'blue'>(() => {
    return (localStorage.getItem('nextpda_theme_preset') as any) || 'slate';
  });

  const loadCacheInfo = async () => {
    const count = await getCacheCount();
    setCacheCount(count);
  };

  useEffect(() => {
    loadCacheInfo();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleThemeChange = (mode: 'slate' | 'amoled' | 'blue') => {
    setThemeMode(mode);
    localStorage.setItem('nextpda_theme_preset', mode);

    const root = document.documentElement;
    if (mode === 'amoled') {
      root.style.setProperty('--surface-dark', '#000000');
      document.body.style.backgroundColor = '#000000';
    } else if (mode === 'blue') {
      root.style.setProperty('--surface-dark', '#0a1628');
      document.body.style.backgroundColor = '#0a1628';
    } else {
      root.style.setProperty('--surface-dark', '#0b111e');
      document.body.style.backgroundColor = '#0b111e';
    }
    showToast('Тема оформления обновлена', 'success');
  };

  const handleClearCache = async () => {
    await clearAllCache();
    await loadCacheInfo();
    showToast('Локальный кэш (IndexedDB) успешно очищен', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-32 space-y-6">
      <SEO
        title="Профиль и Настройки — NextPDA"
        description="Управление учетной записью 4PDA, сессией токена, кэшем IndexedDB и оформлением клиента NextPDA."
        canonicalPath="/profile"
      />
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CustomIcon name="user" className="w-6 h-6 text-brand-400" />
            <span>Профиль и Настройки</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Управление учетной записью 4PDA, сессией и параметрами клиента NextPDA
          </p>
        </div>

        {/* Network Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-white/10 text-xs">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
          <span className="text-[11px] text-slate-300">
            {isOnline ? 'Сеть подключена' : 'Офлайн (кэш IndexedDB)'}
          </span>
        </div>
      </div>

      {/* User Card or Auth Callout */}
      {isAuthenticated && user ? (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-20 h-20 rounded-3xl object-cover ring-4 ring-brand-400/30 shadow-md"
            />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-white">{user.username}</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {user.group}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                На форуме 4PDA с {user.registrationDate}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-4 pt-2 text-xs">
                <div>
                  <span className="text-slate-400">Репутация: </span>
                  <span className="font-bold text-brand-400">+{user.reputation}</span>
                </div>
                <div>
                  <span className="text-slate-400">Сообщений: </span>
                  <span className="font-bold text-white">{user.postsCount}</span>
                </div>
              </div>

              {user.devices && user.devices.length > 0 && (
                <div className="pt-2 text-[11px] text-slate-400">
                  <span>Устройства в профиле: </span>
                  <span className="text-slate-300 font-medium">
                    {user.devices.join(', ')}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-brand-500/20 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-white">Вы просматриваете в режиме гостя</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Войдите с помощью логина или официального токена 4PDA, чтобы оценивать посты, отвечать в темах и публиковать релизы.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 text-white text-xs font-bold shadow-md transition-all whitespace-nowrap"
            >
              Войти в аккаунт
            </button>
          </div>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Theme Presets */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Оформление интерфейса
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'slate', name: 'macOS Slate', desc: 'Глубокий сине-серый фон с мягким свечением' },
              { id: 'amoled', name: 'AMOLED Black', desc: 'Чистый черный фон для экономии батареи' },
              { id: 'blue', name: 'Pastel Midnight', desc: 'Пастельные оттенки классического 4PDA' },
            ].map((th) => (
              <div
                key={th.id}
                onClick={() => handleThemeChange(th.id as any)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  themeMode === th.id
                    ? 'border-brand-400 bg-brand-500/15 shadow-[0_0_15px_rgba(56,165,248,0.25)]'
                    : 'border-white/5 bg-slate-950/40 hover:bg-slate-950/80 hover:border-white/10'
                }`}
              >
                <div className="text-xs font-bold text-white mb-0.5">{th.name}</div>
                <div className="text-[10px] text-slate-400">{th.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reader Typography Settings */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Отображение и Ридер
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">Размер шрифта в статьях</div>
              <div className="text-[11px] text-slate-400">Комфортное чтение новостей и постов</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReaderFontSize(Math.max(12, readerFontSize - 1))}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold"
              >
                -
              </button>
              <span className="text-xs font-mono font-bold text-white w-8 text-center">
                {readerFontSize}px
              </span>
              <button
                onClick={() => setReaderFontSize(Math.min(24, readerFontSize + 1))}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Cache & Offline Data Manager */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Хранилище данных и Кэш
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              TTL: 5 минут
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">Кэш новостей и форума</div>
              <div className="text-[11px] text-slate-400">
                Записей в локальной базе IndexedDB: <strong>{cacheCount}</strong>
              </div>
            </div>
            <button
              onClick={handleClearCache}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Очистить кэш
            </button>
          </div>
        </div>

        {/* About NextPDA Clean Identity (Zero tech stack exposed!) */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-sm space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400">
            О клиенте
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white font-semibold">Версия приложения</span>
            <span className="text-xs text-brand-300 font-mono font-semibold">NextPDA v1.2.0</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
            NextPDA — независимый веб-клиент для чтения и участия в жизни форума 4PDA. Создан для быстрой загрузки, удобного чтения материалов и публикации релизов.
          </p>
        </div>
      </div>
    </div>
  );
};
