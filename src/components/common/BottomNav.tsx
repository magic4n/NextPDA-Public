import React from 'react';
import { motion } from 'framer-motion';
import { CustomIcon, IconName } from './CustomIcon';
import { useUIStore } from '../../store/useUIStore';
import { useNavigate, useLocation } from 'react-router-dom';

interface TabItem {
  id: 'home' | 'forum' | 'activity' | 'bookmarks' | 'profile';
  label: string;
  icon: IconName;
  path: string;
}

const TABS: TabItem[] = [
  { id: 'home', label: 'Главная', icon: 'home', path: '/' },
  { id: 'forum', label: 'Форум', icon: 'forum', path: '/forum' },
  { id: 'activity', label: 'Новое', icon: 'activity', path: '/activity' },
  { id: 'bookmarks', label: 'Избранное', icon: 'bookmark', path: '/bookmarks' },
  { id: 'profile', label: 'Профиль', icon: 'profile', path: '/profile' },
];

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { multiQuotes, downloads } = useUIStore();

  const getActiveTab = (): TabItem['id'] => {
    const path = location.pathname;
    if (path.startsWith('/forum')) return 'forum';
    if (path.startsWith('/activity')) return 'activity';
    if (path.startsWith('/bookmarks')) return 'bookmarks';
    if (path.startsWith('/profile')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();
  const activeDownloadsCount = downloads.filter((d) => d.status === 'downloading').length;

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)] left-0 right-0 z-40 flex justify-center pointer-events-none px-4">
      {/* Outer wrapper with glowing reflection */}
      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        className="pointer-events-auto relative flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-full 
                   bg-slate-900/85 backdrop-blur-2xl border border-white/10 
                   shadow-[0_12px_36px_rgba(0,0,0,0.55),0_0_24px_rgba(56,165,248,0.18)]"
      >
        {/* Soft background ambient gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-500/10 via-brand-400/5 to-brand-600/10 pointer-events-none" />

        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center justify-center min-w-[58px] sm:min-w-[68px] py-1.5 px-2 rounded-full transition-colors ${
                isActive ? 'text-brand-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active pill background with shared layout transition */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 rounded-full bg-gradient-to-b from-brand-500/25 to-brand-600/15 border border-brand-400/30 shadow-[0_0_15px_rgba(56,165,248,0.3)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              {/* Icon container */}
              <div className="relative z-10 flex items-center justify-center">
                <CustomIcon
                  name={tab.icon}
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(56,165,248,0.7)] text-brand-300' : ''
                  }`}
                />

                {/* Badge for bookmarks or active quotes if on that tab */}
                {tab.id === 'forum' && multiQuotes.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950 ring-2 ring-slate-900 animate-pulse">
                    {multiQuotes.length}
                  </span>
                )}

                {tab.id === 'activity' && activeDownloadsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-emerald-500 text-slate-950 ring-2 ring-slate-900 animate-bounce">
                    ↓
                  </span>
                )}
              </div>

              {/* Label */}
              <span className="relative z-10 text-[10.5px] mt-0.5 tracking-tight">
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </motion.nav>
    </div>
  );
};
