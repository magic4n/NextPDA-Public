import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomIcon } from '../common/CustomIcon';
import { WYSIWYGEditor } from '../editor/WYSIWYGEditor';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';

interface NewTopicModalProps {
  defaultSectionId?: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (topic: any) => void;
}

export const NewTopicModal: React.FC<NewTopicModalProps> = ({
  defaultSectionId = 'android-roms',
  isOpen,
  onClose,
  onCreated,
}) => {
  const { isAuthenticated, setAuthModalOpen } = useAuthStore();
  const { showToast } = useUIStore();

  const [title, setTitle] = useState('');
  const [sectionId, setSectionId] = useState(defaultSectionId);
  const [content, setContent] = useState('');
  const [hasPoll, setHasPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddPollOption = () => {
    if (pollOptions.length < 10) setPollOptions([...pollOptions, '']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Для создания темы требуется авторизация', 'warning');
      setAuthModalOpen(true);
      return;
    }

    if (!title.trim()) {
      showToast('Введите заголовок темы', 'warning');
      return;
    }

    if (!content.trim()) {
      showToast('Заполните первое сообщение темы', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onCreated({
        id: 'new_' + Date.now(),
        title,
        sectionId,
        repliesCount: 0,
        viewsCount: 1,
        createdAt: 'Только что',
        author: 'Вы (NextPDA User)',
      });
      showToast('Тема успешно создана на форуме!', 'success');
      onClose();
    }, 700);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xl flex justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-brand-500/10 text-brand-400">
                <CustomIcon name="plus" className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Создание новой темы</h3>
                <p className="text-xs text-slate-400">Публикация в сообществе 4PDA</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <CustomIcon name="close" className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Раздел форума
              </label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-400 cursor-pointer"
              >
                <option value="android-dev">Android - Устройства</option>
                <option value="android-roms">Android - Прошивки</option>
                <option value="android-apps">Android - Программы</option>
                <option value="apple-ios">Apple iOS / iPadOS</option>
                <option value="laptops-pc">Ноутбуки и Компьютеры</option>
                <option value="kurilka">Курилка и Клуб 4PDA</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Заголовок темы
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Краткое и понятное название темы..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-400 placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Первое сообщение (Шапка темы)
              </label>
              <WYSIWYGEditor
                value={content}
                onChange={setContent}
                placeholder="Напишите текст сообщения с описанием, спойлерами и ссылками..."
                minHeight="140px"
              />
            </div>

            {/* Poll Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasPoll}
                  onChange={(e) => setHasPoll(e.target.checked)}
                  className="rounded bg-slate-950 border-white/20 text-brand-500 focus:ring-0"
                />
                <span className="text-xs text-slate-300 font-medium">
                  Добавить опрос в эту тему
                </span>
              </label>

              {hasPoll && (
                <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="Вопрос опроса..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                  />
                  {pollOptions.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const copy = [...pollOptions];
                        copy[i] = e.target.value;
                        setPollOptions(copy);
                      }}
                      placeholder={`Вариант ${i + 1}...`}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={handleAddPollOption}
                    className="text-[11px] text-brand-400 hover:underline pt-1"
                  >
                    + Добавить еще вариант
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CustomIcon name="check" className="w-3.5 h-3.5" />
                )}
                <span>Создать тему</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
