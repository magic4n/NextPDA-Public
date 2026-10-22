import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomIcon } from './CustomIcon';
import { BrandLogo } from './BrandLogo';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, setAuthModalOpen } = useAuthStore();
  const { setSearchOpen, setReleaseModalOpen } = useUIStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-slate-950/75 border-b border-white/[0.08] transition-all">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center group select-none">
          <BrandLogo size="md" />
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white transition-all shadow-sm"
            title="Поиск по форуму и новостям"
          >
            <CustomIcon name="search" className="w-4 h-4 text-brand-400" />
            <span className="text-xs hidden sm:inline text-slate-400">Поиск...</span>
            <kbd className="hidden md:inline text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
              ⌘K
            </kbd>
          </motion.button>

          {/* Quick "Новый релиз" button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/release')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-500/20 to-brand-600/20 hover:from-brand-500/30 hover:to-brand-600/30 border border-brand-400/30 text-brand-300 text-xs font-semibold shadow-sm transition-all"
          >
            <CustomIcon name="plus" className="w-3.5 h-3.5 text-brand-400" />
            <span>Новый релиз</span>
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title="Уведомления"
            >
              <CustomIcon name="bell" className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-400 ring-2 ring-slate-950" />
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-3 z-50"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <span className="text-xs font-semibold text-white">Уведомления</span>
                    <span className="text-[10px] text-brand-400 cursor-pointer hover:underline">
                      Прочитать все
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800/90 transition-colors cursor-pointer border border-white/5">
                      <div className="text-[11px] font-medium text-brand-300">
                        Ответ в теме «Xiaomi 14 - Прошивки»
                      </div>
                      <p className="text-slate-400 text-[10.5px] mt-0.5 line-clamp-1">
                        Куратор обновил шапку с новым релизом HyperOS 2.0
                      </p>
                      <span className="text-[9.5px] text-slate-500 mt-1 block">5 минут назад</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800/90 transition-colors cursor-pointer border border-white/5">
                      <div className="text-[11px] font-medium text-emerald-400">
                        +1 к репутации от пользователя Alex_4PDA
                      </div>
                      <p className="text-slate-400 text-[10.5px] mt-0.5 line-clamp-1">
                        За подробную инструкцию по разблокировке загрузчика
                      </p>
                      <span className="text-[9.5px] text-slate-500 mt-1 block">1 час назад</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User profile / Login */}
          {isAuthenticated && user ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/10 transition-all"
            >
              <img
                src={user.avatar}
                alt={user.username}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-brand-400/40"
              />
              <span className="text-xs font-medium text-slate-200 hidden sm:inline max-w-[100px] truncate">
                {user.username}
              </span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-brand-500/20 text-brand-300 font-bold">
                +{user.reputation}
              </span>
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-semibold shadow-[0_0_15px_rgba(43,126,201,0.35)] transition-all"
            >
              <CustomIcon name="user" className="w-3.5 h-3.5" />
              <span>Войти</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};
