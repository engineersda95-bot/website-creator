'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Type, 
  Smile, 
  Underline as UnderlineIcon,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColorInput } from './ColorInput';

interface RichEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const COMMON_EMOJIS = [
  '😊', '😂', '😍', '👍', '✨', '🙌', '🚀', '🔥', '❤️', '✅',
  '😎', '🤔', '🎉', '💡', '🌟', '💪', '🤝', '📍', '📞', '📧',
  '📱', '💻', '🛠️', '🎨', '🍕', '☕', '🏢', '🏠', '🌍', '⚡'
];

export function RichEditor({ label, value, onChange, placeholder }: RichEditorProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        autolink: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Scrivi qui...',
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== value) {
         // TipTap can trigger onUpdate during setup; setTimeout ensures we don't update state while rendering.
         setTimeout(() => onChange(html), 0);
      }
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none max-w-none min-h-[150px] p-4 text-sm leading-relaxed rt-content',
      },
    },
  });

  // Sync external value changes (e.g. from inline editing on canvas)
  useEffect(() => {
    if (editor && !editor.isFocused && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Inserisci URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">
          {label}
        </label>
      )}
      
      <div className="border border-zinc-200 rounded-2xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-zinc-900/5 transition-all">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-zinc-100 bg-zinc-50/50">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Grassetto"
          >
            <Bold size={14} />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Corsivo"
          >
            <Italic size={14} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Sottolineato"
          >
            <UnderlineIcon size={14} />
          </ToolbarButton>

          <div className="w-px h-4 bg-zinc-200 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Elenco puntato"
          >
            <List size={14} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Elenco numerato"
          >
            <ListOrdered size={14} />
          </ToolbarButton>

          <div className="w-px h-4 bg-zinc-200 mx-1" />

          <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Inserisci Link">
            <LinkIcon size={14} />
          </ToolbarButton>

          <div className="relative">
            <ToolbarButton 
              onClick={() => setShowColorPicker(!showColorPicker)} 
              title="Colore Testo"
              active={showColorPicker}
            >
              <Type size={14} />
              <div 
                className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white"
                style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}
              />
            </ToolbarButton>
            
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 p-3 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 w-[180px]">
                <ColorInput 
                  value={editor.getAttributes('textStyle').color || '#000000'}
                  onChange={(val) => {
                    editor.chain().focus().setColor(val).run();
                  }}
                />
              </div>
            )}
          </div>

          <div className="relative">
            <ToolbarButton 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
              title="Emoji"
              active={showEmojiPicker}
            >
              <Smile size={14} />
            </ToolbarButton>
            
            {showEmojiPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 grid grid-cols-5 gap-1 animate-in fade-in zoom-in-95 duration-200 w-[180px]">
                {COMMON_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      editor.chain().focus().insertContent(emoji).run();
                      setShowEmojiPicker(false);
                    }}
                    className="p-2 hover:bg-zinc-100 rounded text-xl transition-colors flex items-center justify-center"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="relative custom-scrollbar max-h-[400px] overflow-y-auto rounded-b-2xl">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ children, onClick, active, title }: { children: React.ReactNode, onClick: () => void, active?: boolean, title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg transition-all flex items-center justify-center",
        active 
          ? "bg-zinc-900 text-white shadow-sm" 
          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
      )}
      title={title}
    >
      {children}
    </button>
  );
}
