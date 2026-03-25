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
    <aside data-tour="block-sidebar" className={cn(
      "shrink-0 bg-white border-r border-zinc-200/80 flex flex-col h-full z-20 transition-all duration-300 relative",
      isCollapsed ? "w-12" : "w-[17rem]"
    )}>

      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 flex items-center justify-center bg-white border border-zinc-200 rounded-full w-6 h-6 shadow-sm hover:shadow-md z-30 transition-all active:scale-90"
        title={isCollapsed ? "Espandi Sidebar" : "Riduci Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={12} className="text-zinc-500" /> : <ChevronLeft size={12} className="text-zinc-500" />}
      </button>

      {/* CONTENT WRAPPER */}
      <div className="w-full h-full flex flex-col overflow-hidden relative">
        <div className={cn(
          "w-[17rem] flex flex-col h-full shrink-0 transition-opacity duration-300",
          isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <div className="p-4 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            {/* PAGE BLOCKS LIST */}
            {currentPage && currentPage.blocks.length > 0 && (
              <div className="border-t border-zinc-100 pt-5 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="px-1 mb-3">
                  <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Struttura</h3>
                </div>
                <div className="space-y-1">
                  {currentPage.blocks.map((block, idx) => {
                    const Icon = blockIcons[block.type] || Square;
                    const isSelected = selectedBlockId === block.id;

                    return (
                      <button
                        key={block.id}
                        onClick={() => selectBlock(block.id)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all text-left group",
                          isSelected
                            ? "bg-zinc-900 text-white"
                            : "text-zinc-600 hover:bg-zinc-50"
                        )}
                      >
                        <div className={cn(
                          "p-1.5 rounded-md transition-colors",
                          isSelected ? "bg-white/15" : "bg-zinc-100"
                        )}>
                          <Icon size={12} className={isSelected ? "text-white" : "text-zinc-400"} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-medium truncate">
                            {block.type.charAt(0).toUpperCase() + block.type.slice(1).replace('-', ' ')}
                          </div>
                          {(block.content?.title || block.content?.text) && (
                            <div className={cn("text-[10px] truncate mt-0.5", isSelected ? "text-white/50" : "text-zinc-400")}>
                              {block.content.title || block.content.text?.substring(0, 30)}
                            </div>
                          )}
                        </div>
                        <span className={cn("text-[9px] font-medium", isSelected ? "text-white/30" : "text-zinc-300")}>
                          {idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-t border-zinc-100 pt-5">
              <div className="px-1 mb-3">
                <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Blocchi</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Clicca per aggiungere in fondo</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {blockLibrary.map((block) => (
                  <button
                    key={block.type}
                    onClick={() => addBlock(block.type)}
                    className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-all group text-center"
                  >
                    <block.icon size={18} className="text-zinc-400 group-hover:text-zinc-700 transition-colors" />
                    <span className="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-700 leading-tight">{block.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-t border-zinc-100">
            <p className="text-[10px] text-zinc-400 leading-relaxed flex items-center gap-1.5">
              <MousePointer2 size={10} className="shrink-0" />
              Usa il tasto + nel canvas per inserire tra i blocchi
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
