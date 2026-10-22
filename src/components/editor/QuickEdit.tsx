import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CustomIcon } from '../common/CustomIcon';
import { WYSIWYGEditor } from './WYSIWYGEditor';
import { useUIStore } from '../../store/useUIStore';

interface QuickEditProps {
  initialContent: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
}

export const QuickEdit: React.FC<QuickEditProps> = ({ initialContent, onSave, onCancel }) => {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useUIStore();

  const handleSave = async () => {
    if (!content.trim()) {
      showToast('Текст сообщения не может быть пустым', 'warning');
      return;
    }
    setIsSaving(true);
    // Simulating quick save to 4PDA API
    setTimeout(() => {
      onSave(content);
      setIsSaving(false);
      showToast('Пост успешно обновлен!', 'success');
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="p-3.5 rounded-2xl bg-slate-950/80 border border-brand-500/30 shadow-lg space-y-3"
    >
      <div className="flex items-center justify-between text-xs pb-1 border-b border-white/5">
        <span className="font-semibold text-brand-300 flex items-center gap-1.5">
          <CustomIcon name="edit" className="w-3.5 h-3.5 text-brand-400" />
          Быстрое inline-редактирование поста
        </span>
        <span className="text-[10px] text-slate-500">Без перезагрузки страницы</span>
      </div>

      <WYSIWYGEditor
        initialValue={content}
        value={content}
        onChange={setContent}
        minHeight="140px"
        placeholder="Отредактируйте текст поста..."
      />

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
        >
          {isSaving ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <CustomIcon name="check" className="w-3.5 h-3.5" />
          )}
          <span>Сохранить изменения</span>
        </button>
      </div>
    </motion.div>
  );
};
