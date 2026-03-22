'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { cn } from '@/lib/utils';
import { BlockType } from '@/types/editor';
import {
  Square,
  Type,
  Image as ImageIcon,
  Layout,
  Grid,
  LayoutTemplate,
  Phone,
  MapPin,
  ChevronRight,
  ChevronLeft,
  MousePointer2,
  Columns,
  Plus,
  Menu,
  FileText,
  ShoppingBag,
  Minus
} from 'lucide-react';
import { PageManager } from '../editor/PageManager';
import { getBlockLibrary } from '@/lib/block-definitions';

export const BlockSidebar: React.FC = () => {
  const { addBlock, currentPage, selectedBlockId, selectBlock } = useEditorStore();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  const blockLibrary = getBlockLibrary();

  const blockIcons: Record<string, any> = {
    hero: Square,
    text: Type,
    navigation: Menu,
    footer: Layout,
    image: ImageIcon,
    'image-text': Grid,
    gallery: LayoutTemplate,
    map: MapPin,
    features: LayoutTemplate,
    contact: Phone,
    reviews: FileText,
    'product-carousel': ShoppingBag,
    embed: Plus,
    divider: Minus
  };

  return (
    <aside className={cn(
      "shrink-0 bg-white border-r border-zinc-200 flex flex-col h-full shadow-sm z-20 transition-all duration-300 relative",
      isCollapsed ? "w-12" : "w-72"
    )}>

      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 flex items-center justify-center bg-white border border-zinc-200 rounded-full w-6 h-6 shadow-md hover:bg-zinc-50 z-30 transition-transform active:scale-90"
        title={isCollapsed ? "Espandi Sidebar" : "Riduci Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={14} className="text-zinc-500" /> : <ChevronLeft size={14} className="text-zinc-500" />}
      </button>

      {/* CONTENT WRAPPER */}
      <div className="w-full h-full flex flex-col overflow-hidden relative">
        <div className={cn(
          "w-72 flex flex-col h-full shrink-0 transition-opacity duration-300",
          isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <div className="p-6 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
            <PageManager />

            {/* PAGE BLOCKS LIST (New) */}
            {currentPage && currentPage.blocks.length > 0 && (
              <div className="border-t border-zinc-100 pt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="px-2 mb-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Struttura Pagina</h3>
                  <p className="text-[10px] text-zinc-400 mt-1">Seleziona e modifica i blocchi esistenti</p>
                </div>
                <div className="space-y-2">
                  {currentPage.blocks.map((block, idx) => {
                    const Icon = blockIcons[block.type] || Square;
                    const isSelected = selectedBlockId === block.id;

                    return (
                      <button
                        key={block.id}
                        onClick={() => selectBlock(block.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left group",
                          isSelected
                            ? "bg-zinc-900 border-zinc-900 shadow-xl text-white scale-[1.02]"
                            : "bg-zinc-50 border-zinc-100 text-zinc-600 hover:border-zinc-300"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-xl transition-colors",
                          isSelected ? "bg-white/10" : "bg-white shadow-sm"
                        )}>
                          <Icon size={14} className={isSelected ? "text-white" : "text-zinc-400"} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-black uppercase tracking-tight truncate">
                            {idx + 1}. {block.type}
                          </div>
                          {(block.content?.title || block.content?.text) && (
                            <div className={cn("text-[9px] truncate font-medium mt-0.5", isSelected ? "text-white/50" : "text-zinc-400")}>
                              {block.content.title || block.content.text?.substring(0, 30)}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-t border-zinc-100 pt-8">
              <div className="px-2 mb-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Libreria Blocchi</h3>
                <p className="text-[10px] text-zinc-400 mt-1">Trascina o clicca per aggiungere</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {blockLibrary.map((block) => (
                  <button
                    key={block.type}
                    onClick={() => addBlock(block.type)}
                    className="flex flex-col items-center justify-center aspect-square p-2 rounded-2xl border-2 border-zinc-100 hover:border-zinc-900 hover:shadow-xl transition-all group text-center"
                  >
                    <div className="p-2 text-zinc-400 group-hover:text-zinc-900 transition-colors">
                      <block.icon size={22} />
                    </div>
                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-tight group-hover:text-zinc-900">{block.label.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <MousePointer2 size={10} />
              <span>Tip</span>
            </div>
            <p className="px-2 text-[10px] text-zinc-500 leading-relaxed mt-1">
              Puoi anche inserire blocchi usando il tasto "+" tra le sezioni nel canvas centrale.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
