import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
import { CustomIcon } from './CustomIcon';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl text-xs text-white"
          >
            <div className={`p-1.5 rounded-xl ${
              toast.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-400'
                : toast.type === 'warning'
                ? 'bg-amber-500/20 text-amber-400'
                : toast.type === 'error'
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-brand-500/20 text-brand-400'
            }`}>
              <CustomIcon
                name={
                  toast.type === 'success'
                    ? 'check'
                    : toast.type === 'warning'
                    ? 'info'
                    : toast.type === 'error'
                    ? 'close'
                    : 'info'
                }
                className="w-4 h-4"
              />
            </div>
            <span className="flex-1 font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1"
            >
              <CustomIcon name="close" className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
