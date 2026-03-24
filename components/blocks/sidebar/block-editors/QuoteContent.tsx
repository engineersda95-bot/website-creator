'use client';

import React from 'react';
import { SectionHeader, SimpleInput, LayoutGridSlider } from '../SharedSidebarComponents';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { Quote, Plus, Trash2, ChevronDown, ChevronUp, Star, Circle, Square, Layout, Palette, Type } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { resolveImageUrl } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface ReviewListManagerProps {
  items: Array<{ text: string; name: string; role: string; stars: number; avatar?: string }>;
  onChange: (items: Array<{ text: string; name: string; role: string; stars: number; avatar?: string }>) => void;
}

const ReviewListManager: React.FC<ReviewListManagerProps> = ({ items = [], onChange }) => {
  const { uploadImage } = useEditorStore();
  const project = useEditorStore(state => state.project);
  const imageMemoryCache = useEditorStore(state => state.imageMemoryCache);

  const addItem = () => {
    onChange([...items, { text: 'Inserisci qui la recensione.', name: 'Nome Utente', role: 'Ruolo / Azienda', stars: 5 }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
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
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recensioni Personali</label>
        <button
          onClick={addItem}
          className="px-3 py-1 bg-zinc-900 text-white rounded-lg text-[10px] font-bold hover:bg-zinc-800 transition-colors"
        >
          <Plus size={10} className="inline mr-1" /> AGGIUNGI
        </button>
      </div>
      
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm space-y-4 relative group animate-in slide-in-from-right-2 duration-200">
            <div className="flex items-center justify-between gap-2 border-b border-zinc-50 pb-2">
              <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Recensione #{i + 1}</span>
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

            <div className="grid grid-cols-[80px,1fr] gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block">Avatar</label>
                <div className="scale-90 origin-top-left">
                    <ImageUpload
                      value={resolveImageUrl(item.avatar, project, imageMemoryCache)}
                      onChange={async (val: string, filename?: string) => {
                        const relativePath = await uploadImage(val, filename);
                        updateItem(i, 'avatar', relativePath);
                      }}
                    />
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                   <div className="space-y-1">
                     <label className="text-[9px] font-bold text-zinc-400 uppercase block">Nome</label>
                     <input
                       className="w-full p-2 border border-zinc-100 rounded-xl text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none"
                       value={item.name}
                       onChange={(e) => updateItem(i, 'name', e.target.value)}
                     />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[9px] font-bold text-zinc-400 uppercase block">Ruolo</label>
                     <input
                       className="w-full p-2 border border-zinc-100 rounded-xl text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none"
                       value={item.role}
                       onChange={(e) => updateItem(i, 'role', e.target.value)}
                     />
                   </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block flex justify-between">
                    Valutazione
                    <span className="text-zinc-900 font-bold">{item.stars} ★</span>
                  </label>
                  <input 
                    type="range" min="0" max="5" step="1" 
                    className="w-full h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                    value={item.stars}
                    onChange={(e) => updateItem(i, 'stars', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-zinc-400 uppercase block">Testo Recensione</label>
              <textarea
                className="w-full h-32 p-3 border border-zinc-100 rounded-xl text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 transition-all outline-none leading-relaxed resize-none"
                value={item.text}
                onChange={(e) => updateItem(i, 'text', e.target.value)}
                placeholder="Scrivi qui la recensione..."
              />
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed border-zinc-100 rounded-3xl">
             <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest leading-relaxed">Nessuna recensione.<br/>Clicca aggiungi per iniziare.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const QuoteContent: React.FC<any> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue
}) => {
  const viewport = useEditorStore(state => state.viewport);
  const content = selectedBlock.content;

  const updateSetting = (key: string, value: any) => {
    updateContent({ [key]: value });
  };

  return (
    <div className="space-y-10 pb-20">
      <SectionHeader icon={Quote} title="Configurazione Blocco" />
      
      <div className="space-y-8">
        <SimpleInput 
          label="Titolo Sezione (Opzionale)"
          placeholder="es: Cosa dicono di noi" 
          value={content.title || ''} 
          onChange={(val) => updateSetting('title', val)} 
        />

        <LayoutGridSlider 
          content={content}
          updateContent={updateContent}
          updateStyle={updateStyle}
          getStyleValue={getStyleValue}
          viewport={viewport}
        />

        <div className="pt-4 border-t border-zinc-100">
          <label className="text-[10px] font-bold text-zinc-400 uppercase mb-4 block tracking-widest">Icona / Stile</label>
          <div className="flex p-1.5 bg-zinc-100 rounded-[1.25rem] gap-1.5 shadow-inner">
              {[
                { id: 'quotes', icon: Quote, label: 'Quote' },
                { id: 'stars', icon: Star, label: 'Stelle' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => updateSetting('visualType', t.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all",
                    (content.visualType || 'quotes') === t.id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                  )}
                >
                    <t.icon size={14} />
                    <span className="text-[8px] font-black uppercase tracking-tighter">{t.label}</span>
                </button>
              ))}
          </div>
        </div>

        <section className="pt-8 border-t border-zinc-100 space-y-6">
           <div className="flex items-center gap-3">
              <Circle size={14} className="text-zinc-900" />
              <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Avatar Cliente</h3>
           </div>
           
           <div className="bg-zinc-50/50 border border-zinc-100 rounded-3xl p-6 space-y-8 shadow-sm">
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Forma</label>
                    <div className="flex p-1 bg-white border border-zinc-200 rounded-xl gap-1">
                       {[
                         { id: 'circle', icon: Circle, label: 'Cerchio' },
                         { id: 'rect', icon: Square, label: 'Standard' }
                       ].map(s => (
                          <button
                            key={s.id}
                            onClick={() => updateSetting('avatarShape', s.id)}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 p-2 rounded-lg transition-all",
                              (content.avatarShape || 'circle') === s.id ? "bg-zinc-900 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-900"
                            )}
                          >
                             <s.icon size={12} />
                          </button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Proporzioni</label>
                    <select
                      className="w-full p-2 border border-zinc-200 rounded-xl text-[11px] bg-white font-black text-zinc-900 focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none appearance-none cursor-pointer"
                      value={content.avatarAspectRatio || '1/1'}
                      onChange={(e) => updateSetting('avatarAspectRatio', e.target.value)}
                    >
                      <option value="1/1">1:1 (Quadrato)</option>
                      <option value="4/3">4:3 (Photo)</option>
                      <option value="3/4">3:4 (Portrait)</option>
                      <option value="16/9">16:9 (Wide)</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between px-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Dimensione Avatar</label>
                    <span className="text-[12px] font-black text-zinc-900 bg-white px-3 py-1 rounded-full border border-zinc-200 shadow-sm">{content.avatarSize || 60}px</span>
                 </div>
                 <input
                   type="range" min="10" max="150" step="2"
                   className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900 transition-all hover:accent-zinc-700"
                   value={content.avatarSize || 60}
                   onChange={(e) => updateSetting('avatarSize', parseInt(e.target.value))}
                 />
              </div>
           </div>
        </section>
      </div>

      <ReviewListManager 
        items={content.items || []}
        onChange={(items) => updateContent({ items })}
      />
    </div>
  );
};
