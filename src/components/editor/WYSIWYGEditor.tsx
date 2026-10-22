import React, { useState, useRef, useEffect } from 'react';
import { CustomIcon, IconName } from '../common/CustomIcon';
import { BBCodeRenderer } from '../forum/BBCodeRenderer';

interface WYSIWYGEditorProps {
  initialValue?: string;
  value?: string;
  onChange: (bbCode: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const WYSIWYGEditor: React.FC<WYSIWYGEditorProps> = ({
  initialValue = '',
  value: controlledValue,
  onChange,
  placeholder = 'Введите текст сообщения...',
  minHeight = '180px',
}) => {
  const [content, setContent] = useState(controlledValue !== undefined ? controlledValue : initialValue);
  const [mode, setMode] = useState<'visual' | 'bbcode'>('visual');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [modalPrompt, setModalPrompt] = useState<{
    isOpen: boolean;
    type: 'link' | 'image' | 'spoiler';
    title: string;
    field1Label: string;
    field1Placeholder: string;
    field2Label?: string;
    field2Placeholder?: string;
  }>({
    isOpen: false,
    type: 'link',
    title: '',
    field1Label: '',
    field1Placeholder: '',
  });

  const [inputVal1, setInputVal1] = useState('');
  const [inputVal2, setInputVal2] = useState('');

  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== content) {
      setContent(controlledValue);
    }
  }, [controlledValue]);

  const updateContent = (newText: string) => {
    setContent(newText);
    onChange(newText);
  };

  // Helper to wrap selected text in BBCode
  const insertBBTag = (openTag: string, closeTag: string, defaultText = 'текст') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      const updated = `${content} ${openTag}${defaultText}${closeTag}`;
      updateContent(updated);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || defaultText;
    const before = content.substring(0, start);
    const after = content.substring(end);

    const replacement = `${openTag}${selected}${closeTag}`;
    const newText = before + replacement + after;
    updateContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, start + openTag.length + selected.length);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 'и') {
        e.preventDefault();
        insertBBTag('[b]', '[/b]', 'жирный текст');
      } else if (e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'ш') {
        e.preventDefault();
        insertBBTag('[i]', '[/i]', 'курсив');
      } else if (e.key.toLowerCase() === 'u' || e.key.toLowerCase() === 'г') {
        e.preventDefault();
        insertBBTag('[u]', '[/u]', 'подчеркнутый');
      }
    }
  };

  const handleOpenPrompt = (type: 'link' | 'image' | 'spoiler') => {
    setInputVal1('');
    setInputVal2('');
    if (type === 'link') {
      setModalPrompt({
        isOpen: true,
        type: 'link',
        title: 'Вставить гиперссылку',
        field1Label: 'URL адрес',
        field1Placeholder: 'https://...',
        field2Label: 'Текст ссылки (необязательно)',
        field2Placeholder: 'Название сайта или темы',
      });
    } else if (type === 'image') {
      setModalPrompt({
        isOpen: true,
        type: 'image',
        title: 'Вставить изображение',
        field1Label: 'Прямая ссылка на картинку',
        field1Placeholder: 'https://images.unsplash.com/...',
      });
    } else if (type === 'spoiler') {
      setModalPrompt({
        isOpen: true,
        type: 'spoiler',
        title: 'Создать скрытый спойлер',
        field1Label: 'Заголовок спойлера',
        field1Placeholder: 'Например: Лог изменений или Скриншоты',
      });
    }
  };

  const handleApplyPrompt = () => {
    if (modalPrompt.type === 'link') {
      if (inputVal1.trim()) {
        const label = inputVal2.trim() || inputVal1.trim();
        insertBBTag(`[url=${inputVal1.trim()}]`, `[/url]`, label);
      }
    } else if (modalPrompt.type === 'image') {
      if (inputVal1.trim()) {
        const replacement = `\n[img]${inputVal1.trim()}[/img]\n`;
        updateContent(content + replacement);
      }
    } else if (modalPrompt.type === 'spoiler') {
      const title = inputVal1.trim() || 'Скрытый текст';
      insertBBTag(`[spoiler=${title}]\n`, `\n[/spoiler]`, 'Содержимое под спойлером');
    }
    setModalPrompt((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 shadow-md overflow-hidden flex flex-col">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-slate-950/70 border-b border-white/10">
        <div className="flex flex-wrap items-center gap-1">
          {/* Format buttons */}
          <ToolbarBtn
            icon="bold"
            title="Жирный (Ctrl+B)"
            onClick={() => insertBBTag('[b]', '[/b]', 'жирный текст')}
          />
          <ToolbarBtn
            icon="italic"
            title="Курсив (Ctrl+I)"
            onClick={() => insertBBTag('[i]', '[/i]', 'курсив')}
          />
          <ToolbarBtn
            icon="underline"
            title="Подчеркнутый (Ctrl+U)"
            onClick={() => insertBBTag('[u]', '[/u]', 'подчеркнутый')}
          />
          <ToolbarBtn
            icon="strike"
            title="Зачеркнутый"
            onClick={() => insertBBTag('[s]', '[/s]', 'зачеркнутый')}
          />

          <div className="w-[1px] h-5 bg-white/10 mx-1 hidden sm:block" />

          {/* Quote & Spoiler */}
          <ToolbarBtn
            icon="quote"
            title="Цитата"
            onClick={() => insertBBTag('[quote]', '[/quote]', 'Текст цитаты')}
          />
          <ToolbarBtn
            icon="spoiler"
            title="Спойлер"
            onClick={() => handleOpenPrompt('spoiler')}
          />

          <div className="w-[1px] h-5 bg-white/10 mx-1 hidden sm:block" />

          {/* Alignment */}
          <ToolbarBtn
            icon="align-left"
            title="По левому краю"
            onClick={() => insertBBTag('[align=left]', '[/align]')}
          />
          <ToolbarBtn
            icon="align-center"
            title="По центру"
            onClick={() => insertBBTag('[align=center]', '[/align]')}
          />
          <ToolbarBtn
            icon="align-right"
            title="По правому краю"
            onClick={() => insertBBTag('[align=right]', '[/align]')}
          />

          <div className="w-[1px] h-5 bg-white/10 mx-1 hidden sm:block" />

          {/* Links, Media, Code */}
          <ToolbarBtn
            icon="link"
            title="Вставить ссылку"
            onClick={() => handleOpenPrompt('link')}
          />
          <ToolbarBtn
            icon="image"
            title="Вставить картинку"
            onClick={() => handleOpenPrompt('image')}
          />
          <ToolbarBtn
            icon="code"
            title="Вставить блок кода"
            onClick={() => insertBBTag('[code]\n', '\n[/code]', 'sudo fastboot flash boot boot.img')}
          />
        </div>

        {/* View Mode Switcher */}
        <div className="flex rounded-lg bg-slate-900 p-0.5 border border-white/5 ml-auto">
          <button
            type="button"
            onClick={() => setMode('visual')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
              mode === 'visual'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Визуальный вид
          </button>
          <button
            type="button"
            onClick={() => setMode('bbcode')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
              mode === 'bbcode'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            BB-код
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative p-3 flex-1 flex flex-col" style={{ minHeight }}>
        {mode === 'bbcode' ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => updateContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full flex-1 bg-transparent border-none text-white font-mono text-xs leading-relaxed focus:outline-none resize-y placeholder:text-slate-600"
            style={{ minHeight }}
          />
        ) : (
          <div className="flex flex-col flex-1">
            {/* Visual WYSIWYG Mode with editable sync */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => updateContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={4}
              className="w-full bg-slate-950/40 rounded-xl p-2.5 text-xs text-slate-200 border border-white/5 focus:outline-none focus:border-brand-500/40 mb-3 resize-y font-sans"
            />
            {/* Live rendered preview box */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 min-h-[100px]">
              <div className="text-[10px] uppercase font-semibold text-brand-400/80 mb-2 tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                Интерактивное отображение:
              </div>
              {content ? (
                <BBCodeRenderer content={content} />
              ) : (
                <span className="text-slate-500 text-xs italic">
                  Начните ввод или примените инструменты панели выше...
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Word and Character Count bar */}
      <div className="px-3 py-1.5 bg-slate-950/50 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
        <span>Синхронизировано с форматом 4PDA BB-Code</span>
        <span>
          Слов: {content.trim() ? content.trim().split(/\s+/).length : 0} • Символов:{' '}
          {content.length}
        </span>
      </div>

      {/* Insert Prompt Modal */}
      {modalPrompt.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-4">
            <h4 className="text-sm font-bold text-white mb-3">{modalPrompt.title}</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  {modalPrompt.field1Label}
                </label>
                <input
                  type="text"
                  autoFocus
                  value={inputVal1}
                  onChange={(e) => setInputVal1(e.target.value)}
                  placeholder={modalPrompt.field1Placeholder}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-brand-400"
                />
              </div>

              {modalPrompt.field2Label && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    {modalPrompt.field2Label}
                  </label>
                  <input
                    type="text"
                    value={inputVal2}
                    onChange={(e) => setInputVal2(e.target.value)}
                    placeholder={modalPrompt.field2Placeholder}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-brand-400"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalPrompt((prev) => ({ ...prev, isOpen: false }))}
                  className="px-3 py-1.5 text-xs rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleApplyPrompt}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-500 shadow-sm"
                >
                  Вставить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ToolbarBtn: React.FC<{
  icon: IconName;
  title: string;
  onClick: () => void;
}> = ({ icon, title, onClick }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
  >
    <CustomIcon name={icon} className="w-4 h-4" />
  </button>
);
