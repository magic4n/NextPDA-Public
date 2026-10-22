import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomIcon } from './CustomIcon';
import { useAuthStore } from '../../store/useAuthStore';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen } = useAuthStore();

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setAuthModalOpen(false)}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md rounded-3xl bg-slate-900/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-400 via-brand-500 to-indigo-500" />

          {/* Close button */}
          <button
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <CustomIcon name="close" className="w-5 h-5" />
          </button>

          <div className="p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-400/20 text-brand-400 mx-auto shadow-[0_0_20px_rgba(56,189,248,0.25)]">
              <CustomIcon name="user" className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Авторизация
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Открытая версия NextPDA предназначена для комфортного чтения новостей и просмотра материалов 4PDA в гостевом режиме.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 leading-relaxed text-left space-y-2">
              <div className="flex items-center gap-2 text-brand-300 font-semibold">
                <CustomIcon name="info" className="w-4 h-4 flex-shrink-0" />
                <span>Официальный клиент</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Для входа с аккаунтом 4PDA, комментирования и скачивания закрытых файлов используйте официальный сервис или нативные приложения NextPDA.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-white/10 transition-all"
            >
              Понятно, продолжить чтение
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
