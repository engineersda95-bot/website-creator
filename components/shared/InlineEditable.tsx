'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn, formatRichText } from '@/lib/utils';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Link, Unlink, Type, Smile } from 'lucide-react';
import { ColorInput } from '../blocks/sidebar/ui/ColorInput';

const COMMON_EMOJIS = ['😀','😍','🎉','👍','⭐','🔥','💡','✅','❤️','🚀','📞','📧','📍','🕐','💰','🎯','✨','🏠','🍕','💪'];

interface InlineEditableProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  as?: 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  placeholder?: string;
  multiline?: boolean;
  fieldId?: string;
  disabled?: boolean;
  richText?: boolean;
}

// ─── Floating Rich Text Toolbar (fixed to viewport) ─────────────────────
const RichTextToolbar: React.FC<{ containerRef: React.RefObject<HTMLElement | null>; onContentChange?: () => void }> = ({ containerRef, onContentChange }) => {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const updateToolbar = useCallback(() => {
    if (!containerRef.current) { setPos(null); return; }
    const sel = window.getSelection();
    const hasSelection = sel && !sel.isCollapsed && containerRef.current.contains(sel.anchorNode);

    if (hasSelection) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setPos({ top: rect.top - 44, left: rect.left + rect.width / 2 });
    } else {
      const elRect = containerRef.current.getBoundingClientRect();
      setPos({ top: elRect.top - 44, left: elRect.left + elRect.width / 2 });
    }

    const formats = new Set<string>();
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('insertUnorderedList')) formats.add('ul');
    if (document.queryCommandState('insertOrderedList')) formats.add('ol');
    const sel2 = window.getSelection();
    let node = sel2?.anchorNode as HTMLElement | null;
    while (node && node !== containerRef.current) {
      if (node.tagName === 'A') { formats.add('link'); break; }
      node = node.parentElement;
    }
    setActiveFormats(formats);
  }, [containerRef]);

  useEffect(() => {
    const timer = requestAnimationFrame(updateToolbar);
    document.addEventListener('selectionchange', updateToolbar);
    return () => {
      cancelAnimationFrame(timer);
      document.removeEventListener('selectionchange', updateToolbar);
    };
  }, [updateToolbar]);

  const exec = (cmd: string, val?: string) => {
    if (cmd === 'foreColor' && val) {
      // execCommand('foreColor') generates <font color="rgb(...)"> in some browsers.
      // Use insertHTML with a span instead for consistent, CSS-compatible output.
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const selectedText = range.toString();
        const span = `<span style="color:${val}">${selectedText}</span>`;
        document.execCommand('insertHTML', false, span);
        containerRef.current?.focus();
        setTimeout(() => { updateToolbar(); onContentChange?.(); }, 0);
        return;
      }
    }
    document.execCommand(cmd, false, val);
    containerRef.current?.focus();
    setTimeout(() => {
      updateToolbar();
      onContentChange?.();
    }, 0);
  };

  const handleLink = () => {
    if (activeFormats.has('link')) {
      exec('unlink');
    } else {
      const url = prompt('URL:');
      if (url) exec('createLink', url);
    }
  };

  const insertEmoji = (emoji: string) => {
    document.execCommand('insertText', false, emoji);
    containerRef.current?.focus();
    setShowEmojiPicker(false);
    setTimeout(() => onContentChange?.(), 0);
  };

  if (!pos) return null;

  const Btn: React.FC<{ onClick: () => void; active?: boolean; title?: string; children: React.ReactNode }> = ({ onClick, active, title, children }) => (
    <button
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={cn("p-1.5 rounded-md transition-colors", active ? "bg-white/20 text-white" : "text-zinc-400 hover:text-white hover:bg-white/10")}
    >
      {children}
    </button>
  );

  const Sep = () => <div className="w-px h-4 bg-zinc-700 mx-0.5" />;

  const toolbar = (
    <div
      ref={toolbarRef}
      data-toolbar="true"
      className="fixed flex items-center gap-0.5 bg-zinc-900 rounded-lg shadow-2xl border border-zinc-700 p-0.5 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: `${pos.top}px`, left: `${pos.left}px`, transform: 'translateX(-50%)', zIndex: 99999 }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Text formatting */}
      <Btn onClick={() => exec('bold')} active={activeFormats.has('bold')} title="Grassetto"><Bold size={14} /></Btn>
      <Btn onClick={() => exec('italic')} active={activeFormats.has('italic')} title="Corsivo"><Italic size={14} /></Btn>
      <Btn onClick={() => exec('underline')} active={activeFormats.has('underline')} title="Sottolineato"><UnderlineIcon size={14} /></Btn>

      <Sep />

      {/* Lists */}
      <Btn onClick={() => exec('insertUnorderedList')} active={activeFormats.has('ul')} title="Elenco puntato"><List size={14} /></Btn>
      <Btn onClick={() => exec('insertOrderedList')} active={activeFormats.has('ol')} title="Elenco numerato"><ListOrdered size={14} /></Btn>

      <Sep />

      {/* Link */}
      <Btn onClick={handleLink} active={activeFormats.has('link')} title="Link">
        {activeFormats.has('link') ? <Unlink size={14} /> : <Link size={14} />}
      </Btn>

      {/* Color */}
      <div className="relative">
        <Btn onClick={() => { setShowColorPicker(!showColorPicker); setShowEmojiPicker(false); }} active={showColorPicker} title="Colore testo">
          <Type size={14} />
        </Btn>
        {showColorPicker && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl w-[160px]" onMouseDown={(e) => e.preventDefault()}>
            <ColorInput 
              value={document.queryCommandValue('foreColor') || '#ffffff'}
              onChange={(val) => exec('foreColor', val)}
            />
          </div>
        )}
      </div>

      {/* Emoji */}
      <div className="relative">
        <Btn onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowColorPicker(false); }} active={showEmojiPicker} title="Emoji">
          <Smile size={14} />
        </Btn>
        {showEmojiPicker && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-1.5 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl grid grid-cols-5 gap-0.5 w-[160px]"
            onMouseDown={(e) => e.preventDefault()}
          >
            {COMMON_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onMouseDown={(e) => { e.preventDefault(); insertEmoji(emoji); }}
                className="p-1.5 hover:bg-zinc-700 rounded text-base transition-colors flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(toolbar, document.body);
};

// ─── InlineEditable ─────────────────────────────────────────────────────
export const InlineEditable: React.FC<InlineEditableProps> = ({
  value,
  onChange,
  className,
  style,
  as: Tag = 'div',
  placeholder = 'Clicca per modificare...',
  multiline = false,
  disabled = false,
  richText = false,
  fieldId,
}) => {
  const ref = useRef<HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const lastSavedValue = useRef(value);

  // Sync external value changes when not editing — use formatRichText for display
  useEffect(() => {
    if (!isEditing && ref.current) {
      ref.current.innerHTML = formatRichText(value || '');
      lastSavedValue.current = value;
    }
  }, [value, isEditing]);

  const enterEdit = useCallback(() => {
    if (disabled || isEditing) return;
    setIsEditing(true);
    if (fieldId) {
      window.dispatchEvent(new CustomEvent('block-section-focus', { detail: fieldId }));
    }
    setTimeout(() => {
      if (!ref.current) return;
      // Switch to raw value for editing
      ref.current.innerHTML = lastSavedValue.current || '';
      ref.current.focus();
      // Place cursor at end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }, 0);
  }, [disabled, isEditing]);

  // Sync current content to store without exiting edit mode
  const syncToStore = useCallback(() => {
    if (!ref.current) return;
    const newValue = richText ? ref.current.innerHTML : (ref.current.textContent || '');
    if (newValue !== lastSavedValue.current) {
      lastSavedValue.current = newValue;
      onChange(newValue);
    }
  }, [onChange, richText]);

  const save = useCallback(() => {
    syncToStore();
    setIsEditing(false);
  }, [syncToStore]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (ref.current) {
        ref.current.innerHTML = lastSavedValue.current || '';
      }
      setIsEditing(false);
      ref.current?.blur();
    }
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      save();
      ref.current?.blur();
    }
    // Keyboard shortcuts for rich text
    if (richText && isEditing) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        document.execCommand('bold');
        syncToStore();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        document.execCommand('italic');
        syncToStore();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault();
        document.execCommand('underline');
        syncToStore();
      }
    }
  }, [save, multiline, richText, isEditing]);

  const isEmpty = !value || value === '<p></p>' || value === '<br>';

  return (
    <div className="relative" style={richText ? { width: '100%' } : { display: 'contents' }}>
      {isEditing && richText && <RichTextToolbar containerRef={ref} onContentChange={syncToStore} />}
      <Tag
        ref={ref as any}
        className={cn(
          className,
          'outline-none transition-all',
          isEditing && 'ring-2 ring-blue-400/50 rounded-sm cursor-text',
          !isEditing && !disabled && 'cursor-pointer hover:ring-1 hover:ring-blue-300/30 hover:rounded-sm',
          isEmpty && !isEditing && 'opacity-40',
        )}
        style={style}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onDoubleClick={(e) => {
          e.stopPropagation();
          enterEdit();
        }}
        onBlur={(e) => {
          const related = e.relatedTarget as HTMLElement | null;
          if (related?.closest?.('[data-toolbar]')) return;
          if (isEditing) save();
        }}
        onKeyDown={isEditing ? handleKeyDown : undefined}
        data-placeholder={isEmpty && !isEditing ? placeholder : undefined}
      />
    </div>
  );
};
