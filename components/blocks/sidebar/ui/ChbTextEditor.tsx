'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Bold, Italic, Underline as UnderlineIcon, Type } from 'lucide-react';
import { ColorInput } from './ColorInput';
import { cn } from '@/lib/utils';

interface ChbTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ChbTextEditor({ value, onChange }: ChbTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColor, setActiveColor] = useState('#000000');
  const savedRange = useRef<Range | null>(null);

  // Sync external value only when not focused
  useEffect(() => {
    const el = ref.current;
    if (!el || document.activeElement === el) return;
    if (el.innerHTML !== value) el.innerHTML = value;
  }, [value]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const exec = (cmd: string, value?: string) => {
    if (ref.current) ref.current.focus();
    restoreSelection();
    document.execCommand(cmd, false, value);
    emitChange();
  };

  const emitChange = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    onChange(el.innerHTML);
  }, [onChange]);

  const applyColor = useCallback((color: string) => {
    setActiveColor(color);
    if (ref.current) ref.current.focus();
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.style.color = color;
    try {
      range.surroundContents(span);
    } catch {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }
    emitChange();
  }, [emitChange]);

  const isActive = (cmd: string) => {
    try { return document.queryCommandState(cmd); } catch { return false; }
  };

  return (
    <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-1.5 py-1 border-b border-zinc-100 bg-zinc-50/50">
        <Btn active={isActive('bold')} title="Grassetto"
          onMouseDown={e => { e.preventDefault(); saveSelection(); exec('bold'); }}>
          <Bold size={13} />
        </Btn>
        <Btn active={isActive('italic')} title="Corsivo"
          onMouseDown={e => { e.preventDefault(); saveSelection(); exec('italic'); }}>
          <Italic size={13} />
        </Btn>
        <Btn active={isActive('underline')} title="Sottolineato"
          onMouseDown={e => { e.preventDefault(); saveSelection(); exec('underline'); }}>
          <UnderlineIcon size={13} />
        </Btn>
        <div className="w-px h-4 bg-zinc-200 mx-1" />
        <div className="relative">
          <Btn active={showColorPicker} title="Colore testo"
            onMouseDown={e => { e.preventDefault(); saveSelection(); setShowColorPicker(v => !v); }}>
            <Type size={13} />
            <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white"
              style={{ background: activeColor }} />
          </Btn>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-3 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 w-44">
              <ColorInput value={activeColor} onChange={applyColor} />
              <button type="button" className="mt-2 w-full text-[10px] text-zinc-400 hover:text-zinc-600"
                onMouseDown={e => { e.preventDefault(); setShowColorPicker(false); }}>
                Chiudi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        className="px-3 py-2 text-sm leading-relaxed outline-none min-h-[60px] text-zinc-800"
        style={{ wordBreak: 'break-word' }}
      />
    </div>
  );
}

function Btn({ children, active, title, onMouseDown }: {
  children: React.ReactNode; active: boolean; title: string;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  return (
    <button type="button" title={title} onMouseDown={onMouseDown}
      className={cn('relative p-1.5 rounded-lg transition-all flex items-center justify-center',
        active ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900')}>
      {children}
    </button>
  );
}
