import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
import { CustomIcon } from './CustomIcon';

export const DownloadBar: React.FC = () => {
  const { downloads, removeDownload } = useUIStore();

  const activeOrRecent = downloads.slice(0, 2);
  if (activeOrRecent.length === 0) return null;

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] right-4 z-40 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {activeOrRecent.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="pointer-events-auto p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(56,165,248,0.2)]"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1.5 rounded-xl ${
                  item.status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-brand-500/20 text-brand-400 animate-pulse'
                }`}>
                  <CustomIcon
                    name={item.status === 'completed' ? 'check' : 'download'}
                    className="w-4 h-4"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate max-w-[190px]">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    {item.status === 'completed' ? (
                      <span className="text-emerald-400 font-medium">Загрузка завершена</span>
                    ) : (
                      <>
                        <span>{item.speedFormatted}</span>
                        <span>•</span>
                        <span>{item.sizeFormatted}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-brand-300">
                  {item.progressPercent}%
                </span>
                <button
                  onClick={() => removeDownload(item.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <CustomIcon name="close" className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
              <motion.div
                className={`h-full rounded-full ${
                  item.status === 'completed'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-brand-500 via-brand-400 to-indigo-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${item.progressPercent}%` }}
                transition={{ ease: 'easeOut', duration: 0.2 }}
              />
            </div>

            {/* Quick action when completed */}
            {item.status === 'completed' && item.blobUrl && (
              <a
                href={item.blobUrl}
                download={item.name}
                className="mt-2.5 w-full py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-emerald-500/30"
              >
                <CustomIcon name="download" className="w-3.5 h-3.5" />
                <span>Открыть / Сохранить файл</span>
              </a>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
