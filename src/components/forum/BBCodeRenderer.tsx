import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomIcon } from '../common/CustomIcon';
import { startDownload } from '../../services/downloadManager';
import { useUIStore } from '../../store/useUIStore';

interface BBCodeRendererProps {
  content: string;
  className?: string;
}

export const BBCodeRenderer: React.FC<BBCodeRendererProps> = ({ content, className = '' }) => {
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  return (
    <div className={`text-slate-200 text-sm leading-relaxed space-y-3 font-normal break-words ${className}`}>
      {renderBBCodeBlocks(content, setZoomImage)}

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={zoomImage}
                alt="Увеличенное изображение"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              />
              <button
                onClick={() => setZoomImage(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white shadow-lg"
              >
                <CustomIcon name="close" className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Collapsible Spoiler Component
const SpoilerBlock: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-3 rounded-2xl border border-white/10 bg-slate-900/70 overflow-hidden shadow-sm transition-colors hover:border-white/15">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800/80 text-left transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Спойлер
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-100">{title}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <CustomIcon name="chevron-down" className="w-4 h-4 text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-white/5 text-xs sm:text-sm text-slate-300 space-y-2 bg-slate-950/30">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Quote Block Component
const QuoteBlock: React.FC<{ author?: string; children: React.ReactNode }> = ({ author, children }) => {
  return (
    <div className="my-3 rounded-2xl border-l-4 border-l-brand-400 bg-slate-900/80 border border-white/5 p-4 shadow-sm">
      {author && (
        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/5">
          <CustomIcon name="quote" className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-xs font-bold text-brand-300">{author} писал(а):</span>
        </div>
      )}
      <div className="text-xs sm:text-sm text-slate-300 italic space-y-1">{children}</div>
    </div>
  );
};

// Code Block Component
const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const { showToast } = useUIStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    showToast('Код скопирован в буфер', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-2xl bg-slate-950 border border-white/10 overflow-hidden font-mono text-xs shadow-inner">
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-white/5 text-slate-400 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <span className="ml-2 font-semibold text-slate-300">Терминал / Код</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors px-2 py-0.5 rounded bg-slate-800"
        >
          <CustomIcon name={copied ? 'check' : 'edit'} className="w-3 h-3 text-brand-400" />
          <span>{copied ? 'Скопировано' : 'Копировать'}</span>
        </button>
      </div>
      <pre className="p-4 text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
        {code.trim()}
      </pre>
    </div>
  );
};

// Robust Multi-line BBCode Block Parser
function renderBBCodeBlocks(rawText: string, onImageClick: (url: string) => void): React.ReactNode[] {
  if (!rawText) return [];

  // Match top-level blocks: code, spoiler, quote, align, list
  const blockRegex =
    /(\[code\]([\s\S]*?)\[\/code\]|\[spoiler(?:=([^\]]*))?\]([\s\S]*?)\[\/spoiler\]|\[quote(?:=([^\]]*))?\]([\s\S]*?)\[\/quote\]|\[align=(center|left|right)\]([\s\S]*?)\[\/align\]|\[list\]([\s\S]*?)\[\/list\])/gi;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = blockRegex.exec(rawText)) !== null) {
    // Process text before block
    if (match.index > lastIndex) {
      const textBefore = rawText.substring(lastIndex, match.index);
      elements.push(...renderParagraphs(textBefore, onImageClick, `before-${keyIndex}`));
    }

    const fullMatch = match[0];

    if (fullMatch.startsWith('[code]')) {
      const codeContent = match[2] || '';
      elements.push(<CodeBlock key={`block-code-${keyIndex++}`} code={codeContent} />);
    } else if (fullMatch.startsWith('[spoiler')) {
      const title = match[3] || 'Скрытый текст';
      const innerContent = match[4] || '';
      elements.push(
        <SpoilerBlock key={`block-spoiler-${keyIndex++}`} title={title}>
          {renderBBCodeBlocks(innerContent, onImageClick)}
        </SpoilerBlock>
      );
    } else if (fullMatch.startsWith('[quote')) {
      const author = match[5];
      const innerContent = match[6] || '';
      elements.push(
        <QuoteBlock key={`block-quote-${keyIndex++}`} author={author}>
          {renderBBCodeBlocks(innerContent, onImageClick)}
        </QuoteBlock>
      );
    } else if (fullMatch.startsWith('[align=')) {
      const alignment = (match[7] || 'center') as 'center' | 'left' | 'right';
      const innerContent = match[8] || '';
      const alignClass =
        alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left';
      elements.push(
        <div key={`block-align-${keyIndex++}`} className={`my-2 ${alignClass}`}>
          {renderBBCodeBlocks(innerContent, onImageClick)}
        </div>
      );
    } else if (fullMatch.startsWith('[list]')) {
      const listContent = match[9] || '';
      const items = listContent
        .split(/\[\*\]/)
        .map((s) => s.trim())
        .filter(Boolean);
      elements.push(
        <ul key={`block-list-${keyIndex++}`} className="list-disc list-inside space-y-1 my-2 pl-2">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, onImageClick)}</li>
          ))}
        </ul>
      );
    }

    lastIndex = blockRegex.lastIndex;
  }

  // Process remaining text after last block
  if (lastIndex < rawText.length) {
    const textAfter = rawText.substring(lastIndex);
    elements.push(...renderParagraphs(textAfter, onImageClick, `after-${keyIndex}`));
  }

  return elements;
}

// Render plain text paragraphs
function renderParagraphs(text: string, onImageClick: (url: string) => void, prefix: string): React.ReactNode[] {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const trimmed = line.trimEnd();
    if (!trimmed) {
      return <div key={`${prefix}-br-${idx}`} className="h-1.5" />;
    }
    return (
      <p key={`${prefix}-p-${idx}`} className="leading-relaxed">
        {renderInline(trimmed, onImageClick)}
      </p>
    );
  });
}

// Recursive inline tag parser
function renderInline(text: string, onImageClick: (url: string) => void): React.ReactNode {
  let parts: React.ReactNode[] = [text];

  const applyRegex = (regex: RegExp, render: (m: RegExpMatchArray, k: string) => React.ReactNode) => {
    const newParts: React.ReactNode[] = [];
    parts.forEach((part, pIdx) => {
      if (typeof part !== 'string') {
        newParts.push(part);
        return;
      }

      let lastIndex = 0;
      let match: RegExpExecArray | null;
      let localIdx = 0;

      while ((match = regex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          newParts.push(part.substring(lastIndex, match.index));
        }
        newParts.push(render(match, `inline-${pIdx}-${localIdx++}`));
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < part.length) {
        newParts.push(part.substring(lastIndex));
      }
    });
    parts = newParts;
  };

  // Bold [b]...[/b]
  applyRegex(/\[b\]([\s\S]*?)\[\/b\]/gi, (m, k) => (
    <strong key={k} className="font-bold text-white">
      {renderInline(m[1], onImageClick)}
    </strong>
  ));

  // Italic [i]...[/i]
  applyRegex(/\[i\]([\s\S]*?)\[\/i\]/gi, (m, k) => (
    <em key={k} className="italic text-slate-300">
      {renderInline(m[1], onImageClick)}
    </em>
  ));

  // Underline [u]...[/u]
  applyRegex(/\[u\]([\s\S]*?)\[\/u\]/gi, (m, k) => (
    <span key={k} className="underline underline-offset-2">
      {renderInline(m[1], onImageClick)}
    </span>
  ));

  // Strike [s]...[/s]
  applyRegex(/\[s\]([\s\S]*?)\[\/s\]/gi, (m, k) => (
    <span key={k} className="line-through text-slate-500">
      {renderInline(m[1], onImageClick)}
    </span>
  ));

  // Color [color=...]...[/color]
  applyRegex(/\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi, (m, k) => (
    <span key={k} style={{ color: m[1] }}>
      {renderInline(m[2], onImageClick)}
    </span>
  ));

  // Size [size=...]...[/size]
  applyRegex(/\[size=([1-7])\]([\s\S]*?)\[\/size\]/gi, (m, k) => {
    const s = parseInt(m[1], 10);
    const rem = 0.75 + s * 0.12;
    return (
      <span key={k} style={{ fontSize: `${rem}rem` }}>
        {renderInline(m[2], onImageClick)}
      </span>
    );
  });

  // Images [img]...[/img]
  applyRegex(/\[img\]([\s\S]*?)\[\/img\]/gi, (m, k) => {
    const url = m[1].trim();
    return (
      <span key={k} className="inline-block my-2 group cursor-zoom-in">
        <img
          src={url}
          alt="Изображение"
          loading="lazy"
          onClick={() => onImageClick(url)}
          className="max-h-80 rounded-2xl border border-white/10 shadow-md group-hover:opacity-90 group-hover:scale-[1.01] transition-all"
        />
      </span>
    );
  });

  // Attachments [attachment=id:filename]
  applyRegex(/\[attachment=(\d+):([^\]]+)\]/gi, (m, k) => {
    const id = m[1];
    const fileName = m[2];
    const fileUrl = `https://4pda.to/forum/dl/post/${id}/${encodeURIComponent(fileName)}`;
    return (
      <button
        key={k}
        type="button"
        onClick={() => startDownload(fileUrl, fileName, 35 * 1024 * 1024)}
        className="inline-flex items-center gap-2 px-3 py-1.5 my-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-brand-400/30 text-brand-300 text-xs font-medium transition-all group"
      >
        <CustomIcon name="download" className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
        <span className="font-semibold">{fileName}</span>
        <span className="text-[10px] text-slate-400 font-mono">(4PDA CDN)</span>
      </button>
    );
  });

  // Links [url=...]...[/url] or [url]...[/url]
  applyRegex(/\[url=(.*?)\]([\s\S]*?)\[\/url\]/gi, (m, k) => {
    const href = m[1].trim();
    const label = m[2];
    const isFile = href.match(/\.(apk|zip|img|tar|gz|bin|rar|7z)$/i);

    if (isFile) {
      const fileName = href.split('/').pop() || 'download_file';
      return (
        <button
          key={k}
          type="button"
          onClick={() => startDownload(href, fileName)}
          className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-2"
        >
          <CustomIcon name="download" className="w-3.5 h-3.5 inline" />
          <span>{label}</span>
        </button>
      );
    }

    return (
      <a
        key={k}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-medium underline underline-offset-2"
      >
        <span>{label}</span>
        <CustomIcon name="external-link" className="w-3 h-3 inline opacity-70" />
      </a>
    );
  });

  return <>{parts}</>;
}
