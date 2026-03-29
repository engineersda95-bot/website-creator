'use client';

import React from 'react';
import { SimpleInput, SectionHeader } from '../SharedSidebarComponents';
import { HelpCircle, Plus, Trash2, ChevronDown, ChevronUp, List, Square, Columns, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQ_VARIANTS = [
  { id: 'accordion', label: 'Minimal', icon: List },
  { id: 'classic', label: 'Classico', icon: Square },
  { id: 'side-by-side', label: 'Affiancato', icon: Columns },
  { id: 'numbered', label: 'Numerato', icon: Hash },
];

interface FAQListManagerProps {
  items: Array<{ question: string; answer: string }>;
  onChange: (items: Array<{ question: string; answer: string }>) => void;
}

const FAQListManager: React.FC<FAQListManagerProps> = ({ items = [], onChange }) => {
  const addItem = () => {
    onChange([...items, { question: 'Nuova Domanda', answer: 'Inserisci qui la risposta.' }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;
    
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    onChange(newItems);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-zinc-100">
      <div className="flex items-center justify-between">
        <label className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">Domande e Risposte</label>
        <button
          onClick={addItem}
          className="px-3 py-1 bg-zinc-900 text-white rounded-lg text-[12px] font-bold hover:bg-zinc-800 transition-colors"
        >
          <Plus size={10} className="inline mr-1" /> AGGIUNGI
        </button>
      </div>
      
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-3 relative group animate-in slide-in-from-right-2 duration-200">
            <div className="flex items-center justify-between gap-2 border-b border-zinc-50 pb-2">
              <span className="text-[12px] font-black text-zinc-300 uppercase tracking-widest">FAQ #{i + 1}</span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => moveItem(i, 'up')} 
                  disabled={i === 0}
                  className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20"
                >
                  <ChevronUp size={14} />
                </button>
                <button 
                  onClick={() => moveItem(i, 'down')} 
                  disabled={i === items.length - 1}
                  className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-20"
                >
                  <ChevronDown size={14} />
                </button>
                <button 
                  onClick={() => removeItem(i)} 
                  className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-zinc-400 uppercase block">Domanda</label>
              <textarea
                className="w-full p-2 border border-zinc-100 rounded-xl text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none font-bold resize-none"
                rows={2}
                placeholder="Inserisci la domanda..."
                value={item.question}
                onChange={(e) => updateItem(i, 'question', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-zinc-400 uppercase block">Risposta</label>
              <textarea
                className="w-full p-2 border border-zinc-100 rounded-xl text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none resize-none leading-relaxed"
                rows={3}
                placeholder="Inserisci la risposta..."
                value={item.answer}
                onChange={(e) => updateItem(i, 'answer', e.target.value)}
              />
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed border-zinc-100 rounded-3xl">
             <p className="text-[12px] font-black text-zinc-300 uppercase tracking-widest leading-relaxed">Nessuna domanda.<br/>Clicca aggiungi per iniziare.</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface FAQContentProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
}

export const FAQContent: React.FC<FAQContentProps> = ({
  selectedBlock,
  updateContent,
}) => {
  return (
    <div className="space-y-8">
      <SectionHeader icon={HelpCircle} title="Contenuto FAQ" />

      {/* Variant selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Stile</label>
        <div className="grid grid-cols-4 gap-1.5">
          {FAQ_VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => updateContent({ variant: v.id })}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-[9px] font-medium transition-all",
                (selectedBlock.content.variant || 'accordion') === v.id
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-100 text-zinc-400 hover:border-zinc-300"
              )}
            >
              <v.icon size={14} />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <SimpleInput
          label="Titolo Sezione"
          placeholder="es: Domande Frequenti"
          value={selectedBlock.content.title || ''}
          onChange={(val) => updateContent({ title: val })}
        />
      </div>

      <FAQListManager 
        items={selectedBlock.content.items || []}
        onChange={(items) => updateContent({ items })}
      />
    </div>
  );
};

