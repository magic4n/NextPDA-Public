import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReleaseFormData } from '../../types';
import { CustomIcon } from '../common/CustomIcon';
import { BBCodeRenderer } from '../forum/BBCodeRenderer';

interface ReleasePreviewProps {
  data: ReleaseFormData;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSubmit: () => void;
}

export const ReleasePreview: React.FC<ReleasePreviewProps> = ({
  data,
  isOpen,
  onClose,
  onConfirmSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xl flex justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-slate-950/80 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Предварительный просмотр
              </span>
              <h3 className="text-sm font-semibold text-white">
                Отображение релиза в шапке темы 4PDA
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <CustomIcon name="close" className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Preview Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Header Banner & Logo */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-brand-950/40 border border-brand-500/20 flex flex-col sm:flex-row items-center gap-5">
              {data.previewUrl && (
                <img
                  src={data.previewUrl}
                  alt="Превью"
                  className="w-24 h-24 rounded-2xl object-cover ring-2 ring-brand-400/30 shadow-md"
                />
              )}
              {data.logoUrl && (
                <img
                  src={data.logoUrl}
                  alt="Логотип"
                  className="max-h-20 object-contain rounded-xl"
                />
              )}
              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {data.type}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {data.osType} {data.androidVersion && `(v${data.androidVersion})`}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {data.name || 'Название релиза не указано'}
                </h2>
                {data.mainPostUrl && (
                  <a
                    href={data.mainPostUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-400 hover:underline mt-1 inline-flex items-center gap-1"
                  >
                    <span>Ссылка на тему / пост</span>
                    <CustomIcon name="external-link" className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl p-4 bg-slate-950/40 border border-white/5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400">
                1. Описание
              </h4>
              <BBCodeRenderer content={data.description || 'Описание отсутствует'} />
            </div>

            {/* Install Instructions */}
            <div className="rounded-2xl p-4 bg-slate-950/40 border border-white/5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                2. Инструкция по установке
              </h4>
              <BBCodeRenderer content={data.installInstructions || 'Инструкция не указана'} />
            </div>

            {/* Addons */}
            {data.addons && (
              <div className="rounded-2xl p-4 bg-slate-950/40 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  3. Дополнения и патчи
                </h4>
                <BBCodeRenderer content={data.addons} />
              </div>
            )}

            {/* Screenshots */}
            {data.screenshots.length > 0 && (
              <div className="rounded-2xl p-4 bg-slate-950/40 border border-white/5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  4. Скриншоты ({data.screenshots.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {data.screenshots.map((s, idx) => (
                    <img
                      key={idx}
                      src={s.url}
                      alt={s.name}
                      className="w-full h-32 object-cover rounded-xl border border-white/10 shadow-sm"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Download Links */}
            <div className="rounded-2xl p-4 bg-brand-950/30 border border-brand-500/20 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                5. Ссылки на скачивание
              </h4>
              <div className="font-mono text-xs space-y-1">
                {data.downloadLinks
                  .split('\n')
                  .filter((l) => l.trim().length > 0)
                  .map((link, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-white/5 text-brand-300"
                    >
                      <CustomIcon name="download" className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{link}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Moderator Action info */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 text-xs text-slate-400 flex items-center justify-between">
              <span>Запрошенное действие для модератора:</span>
              <span className="font-semibold text-white">{data.moderatorAction}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-950/90 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Вернуться к редактированию
            </button>
            <button
              onClick={onConfirmSubmit}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-semibold shadow-lg transition-all flex items-center gap-1.5"
            >
              <CustomIcon name="check" className="w-4 h-4" />
              <span>Опубликовать релиз</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
