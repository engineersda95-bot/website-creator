'use client';

import React, { useState } from 'react';
import {
  Bold, Italic, Heading2, Heading3, Heading4, List, ListOrdered, Quote,
  Link as LinkIcon, Code, Minus, Youtube,
  Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Palette, Mic, MicOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColorInput } from '@/components/blocks/sidebar/ui/ColorInput';

interface BlogPostToolbarProps {
  editor: any;
  isRecording: boolean;
  speechSupported: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onToggleSpeech: () => void;
}

export function BlogPostToolbar({
  editor,
  isRecording,
  speechSupported,
  fileInputRef,
  onToggleSpeech,
}: BlogPostToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const tb = {
    bold:      () => (editor?.chain() as any).focus().toggleBold().run(),
    italic:    () => (editor?.chain() as any).focus().toggleItalic().run(),
    code:      () => (editor?.chain() as any).focus().toggleCode().run(),
    h2:        () => (editor?.chain() as any).focus().toggleHeading({ level: 2 }).run(),
    h3:        () => (editor?.chain() as any).focus().toggleHeading({ level: 3 }).run(),
    h4:        () => (editor?.chain() as any).focus().toggleHeading({ level: 4 }).run(),
    ul:        () => (editor?.chain() as any).focus().toggleBulletList().run(),
    ol:        () => (editor?.chain() as any).focus().toggleOrderedList().run(),
    quote:     () => (editor?.chain() as any).focus().toggleBlockquote().run(),
    hr:        () => (editor?.chain() as any).focus().setHorizontalRule().run(),
    link: () => {
      const url = window.prompt('URL del link:');
      if (!url) return;
      (editor?.chain() as any).focus().setLink({ href: url }).run();
    },
    youtube: () => {
      const url = window.prompt("Inserisci l'URL del video YouTube:");
      if (!url) return;
      (editor?.chain() as any).focus().insertContent({ type: 'inlineYoutube', attrs: { url } }).run();
    },
  };

  return (
    <div className="sticky top-0 z-20 flex items-center gap-0.5 px-2 py-1.5 border border-zinc-200 rounded-t-xl bg-white/95 backdrop-blur-sm flex-wrap">
      <button onMouseDown={(e) => { e.preventDefault(); tb.bold(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('bold') ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Grassetto (⌘B)"><Bold size={14} /></button>
      <button onMouseDown={(e) => { e.preventDefault(); tb.italic(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('italic') ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Corsivo (⌘I)"><Italic size={14} /></button>
      <button onMouseDown={(e) => { e.preventDefault(); tb.code(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('code') ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Codice inline"><Code size={14} /></button>

      <div className="w-px h-4 bg-zinc-200 mx-1" />

      <button onMouseDown={(e) => { e.preventDefault(); tb.h2(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('heading', { level: 2 }) ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Titolo H2"><Heading2 size={14} /></button>
      <button onMouseDown={(e) => { e.preventDefault(); tb.h3(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('heading', { level: 3 }) ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Titolo H3"><Heading3 size={14} /></button>
      <button onMouseDown={(e) => { e.preventDefault(); tb.h4(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('heading', { level: 4 }) ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Titolo H4"><Heading4 size={14} /></button>

      <div className="w-px h-4 bg-zinc-200 mx-1" />

      <button onMouseDown={(e) => { e.preventDefault(); tb.ul(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('bulletList') ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Lista puntata"><List size={14} /></button>
      <button onMouseDown={(e) => { e.preventDefault(); tb.ol(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('orderedList') ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Lista numerata"><ListOrdered size={14} /></button>
      <button onMouseDown={(e) => { e.preventDefault(); tb.quote(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('blockquote') ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Citazione"><Quote size={14} /></button>

      <div className="w-px h-4 bg-zinc-200 mx-1" />

      <button onMouseDown={(e) => { e.preventDefault(); tb.link(); }} className={cn("p-1.5 rounded-md transition-all", editor?.isActive('link') ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")} title="Link"><LinkIcon size={14} /></button>
      <button onMouseDown={(e) => { e.preventDefault(); tb.hr(); }} className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60 transition-all" title="Separatore"><Minus size={14} /></button>

      <div className="w-px h-4 bg-zinc-200 mx-1" />

      <button
        onMouseDown={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
        className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60 transition-all"
        title="Inserisci immagine"
      >
        <ImageIcon size={14} />
      </button>

      <button
        onMouseDown={(e) => { e.preventDefault(); tb.youtube(); }}
        className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60 transition-all font-bold"
        title="Inserisci video YouTube"
      >
        <Youtube size={14} />
      </button>

      <div className="w-px h-4 bg-zinc-200 mx-1" />

      {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight], ['justify', AlignJustify]] as const).map(([val, Icon]) => (
        <button
          key={val}
          onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().setTextAlign(val).run(); }}
          className={cn("p-1.5 rounded-md transition-all", editor?.isActive({ textAlign: val }) ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60")}
          title={`Allinea ${val}`}
        ><Icon size={14} /></button>
      ))}

      <div className="w-px h-4 bg-zinc-200 mx-1" />

      <div className="relative flex items-center">
        <button
          onMouseDown={(e) => { e.preventDefault(); setShowColorPicker(v => !v); }}
          className={cn(
            "p-1.5 rounded-md transition-all relative",
            showColorPicker ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60"
          )}
          title="Colore testo"
        >
          <Palette size={14} />
          <span
            className="absolute bottom-1 left-1 right-1 h-[2px] rounded-full"
            style={{ background: editor?.getAttributes('textStyle').color || 'transparent', border: editor?.getAttributes('textStyle').color ? 'none' : '1px solid #d4d4d8' }}
          />
        </button>
        <button
          onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
          className="p-1 rounded-md text-zinc-300 hover:text-zinc-500 transition-all text-[10px] font-bold"
          title="Rimuovi colore"
        >✕</button>

        {showColorPicker && (
          <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-zinc-200 rounded-xl shadow-xl z-[100] animate-in fade-in zoom-in-95 duration-200 w-[180px]">
            <ColorInput
              value={editor?.getAttributes('textStyle').color || '#000000'}
              onChange={(val) => { editor?.chain().focus().setColor(val).run(); }}
            />
          </div>
        )}
      </div>

      {speechSupported && (
        <>
          <div className="w-px h-4 bg-zinc-200 mx-1" />
          <button
            onMouseDown={(e) => { e.preventDefault(); onToggleSpeech(); }}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all",
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60"
            )}
            title={isRecording ? 'Ferma registrazione' : 'Dettatura vocale'}
          >
            {isRecording ? <MicOff size={13} /> : <Mic size={13} />}
            {isRecording ? 'Ascolto...' : 'Voce'}
          </button>
        </>
      )}
    </div>
  );
}
