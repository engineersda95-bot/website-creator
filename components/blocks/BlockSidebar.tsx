'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { cn } from '@/lib/utils';
import type { BlockType } from '@/types/editor';
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
  Plus,
  Menu,
  FileText,
  ShoppingBag,
  Minus,
  GripVertical,
  X
} from 'lucide-react';
import { getBlockLibrary } from '@/lib/block-definitions';
import { BlockDefinition, BlockVariant } from '@/types/block-definition';

import { BlockLibraryCard } from '@/components/blocks/BlockLibraryCard';

export const BlockSidebar: React.FC = () => {
  const { addBlock, currentPage, selectedBlockId, selectBlock, leftSidebarCollapsed, setLeftSidebarCollapsed, reorderBlocks } = useEditorStore();
  const [dragIdx, setDragIdx] = React.useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = React.useState<number | null>(null);
  const [previewTarget, setPreviewTarget] = React.useState<{ blockDef: BlockDefinition; variantIdx: number } | null>(null);

  const blockLibrary = getBlockLibrary();

  const scrollToNewBlock = () => {
    setTimeout(() => {
      const wrappers = document.querySelectorAll('#editor-content .block-wrapper');
      // penultimate = new block, last = footer
      const target = wrappers[wrappers.length - 2] ?? wrappers[wrappers.length - 1];
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleAddBlock = (blockDef: BlockDefinition, variant?: BlockVariant) => {
    const v = variant ?? blockDef.variants?.[0];
    if (v) {
      addBlock(blockDef.type, undefined, {
        content: { variant: v.id, ...(v.contentOverride || {}) },
        style: v.styleOverride,
      });
    } else {
      addBlock(blockDef.type);
    }
    setPreviewTarget(null);
    scrollToNewBlock();
  };

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
    <>
    <aside data-tour="block-sidebar" className={cn(
      "shrink-0 bg-white border-r border-zinc-200/80 flex flex-col h-full z-20 transition-all duration-300 relative",
      leftSidebarCollapsed ? "w-12" : "w-[17rem]"
    )}>

      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        className="absolute -right-3 top-5 flex items-center justify-center bg-white border border-zinc-200 rounded-full w-6 h-6 shadow-sm hover:shadow-md z-30 transition-all active:scale-90"
        title={leftSidebarCollapsed ? "Espandi Sidebar" : "Riduci Sidebar"}
      >
        {leftSidebarCollapsed ? <ChevronRight size={12} className="text-zinc-500" /> : <ChevronLeft size={12} className="text-zinc-500" />}
      </button>

      {/* CONTENT WRAPPER */}
      <div className="w-full h-full flex flex-col overflow-hidden relative">
        <div className={cn(
          "w-[17rem] flex flex-col h-full shrink-0 transition-opacity duration-300",
          leftSidebarCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <div className="p-4 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            {/* PAGE BLOCKS LIST */}
            {currentPage && currentPage.blocks.length > 0 && (
              <div className="border-t border-zinc-100 pt-5 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="px-1 mb-3">
                  <h3 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wide">Struttura</h3>
                </div>
                <div className="space-y-0.5">
                  {currentPage.blocks.map((block, idx) => {
                    const Icon = blockIcons[block.type] || Square;
                    const isSelected = selectedBlockId === block.id;
                    const isDragging = dragIdx === idx;
                    const isDragOver = dragOverIdx === idx;

                    return (
                      <div
                        key={block.id}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          setDragOverIdx(idx);
                        }}
                        onDragLeave={() => setDragOverIdx(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (dragIdx !== null && dragIdx !== idx) {
                            reorderBlocks(dragIdx, idx);
                          }
                          setDragIdx(null);
                          setDragOverIdx(null);
                        }}
                        onClick={() => {
                          selectBlock(block.id);
                          setTimeout(() => {
                            const wrappers = document.querySelectorAll('#editor-content .block-wrapper');
                            const el = wrappers[idx];
                            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 50);
                        }}
                        className={cn(
                          "w-full flex items-center gap-1 pr-2.5 py-1.5 rounded-lg transition-all text-left group",
                          isSelected
                            ? "bg-zinc-900 text-white"
                            : "text-zinc-600 hover:bg-zinc-50",
                          isDragging && "opacity-40",
                          isDragOver && dragIdx !== idx && "ring-2 ring-blue-400 ring-offset-1"
                        )}
                      >
                        {/* Drag handle */}
                        <div
                          draggable
                          onDragStart={(e) => {
                            setDragIdx(idx);
                            e.dataTransfer.effectAllowed = 'move';
                            e.stopPropagation();
                          }}
                          onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                          className={cn(
                            "px-1 py-2 cursor-grab active:cursor-grabbing shrink-0 transition-all",
                            isSelected ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                          )}
                        >
                          <GripVertical size={12} className={isSelected ? "text-white/50" : "text-zinc-500"} />
                        </div>
                        <div className={cn(
                          "p-1.5 rounded-md transition-colors shrink-0",
                          isSelected ? "bg-white/15" : "bg-zinc-100"
                        )}>
                          <Icon size={12} className={isSelected ? "text-white" : "text-zinc-400"} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium truncate">
                            {block.type.charAt(0).toUpperCase() + block.type.slice(1).replace('-', ' ')}
                          </div>
                          {(block.content?.title || block.content?.text) && (
                            <div className={cn("text-[10px] truncate mt-0.5", isSelected ? "text-white/50" : "text-zinc-400")}>
                              {block.content.title || block.content.text?.substring(0, 30)}
                            </div>
                          )}
                        </div>
                        <span className={cn("text-[9px] font-medium tabular-nums", isSelected ? "text-white/30" : "text-zinc-300")}>
                          {idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-t border-zinc-100 pt-5">
              <div className="px-1 mb-3">
                <h3 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-wide">Blocchi</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Clicca per aggiungere in fondo</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {blockLibrary.map((block) => (
                  <BlockLibraryCard
                    key={block.type}
                    blockDef={block}
                    onAdd={handleAddBlock}
                    onPreview={(bd) => setPreviewTarget({ blockDef: bd, variantIdx: 0 })}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-t border-zinc-100">
            <p className="text-[11px] text-zinc-400 leading-relaxed flex items-center gap-1.5">
              <MousePointer2 size={10} className="shrink-0" />
              Usa il tasto + nel canvas per inserire tra i blocchi
            </p>
          </div>
        </div>
      </div>

      {/* PREVIEW PANEL */}
      {previewTarget && (() => {
        const { blockDef, variantIdx } = previewTarget;
        const hasVariants = !!blockDef.variants?.length;
        const activeVariant = hasVariants ? blockDef.variants![variantIdx] : undefined;
        const ThumbnailComponent = activeVariant?.preview ?? blockDef.thumbnail ?? null;
        const description = activeVariant?.description ?? blockDef.description ?? null;
        return (
          <div className="absolute inset-0 z-40 bg-white flex flex-col animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 shrink-0">
              <div>
                <span className="text-[13px] font-semibold text-zinc-800">{blockDef.label}</span>
                {activeVariant && (
                  <span className="ml-2 text-[11px] text-zinc-400">{activeVariant.label}</span>
                )}
              </div>
              <button onClick={() => setPreviewTarget(null)} className="p-1 rounded-lg hover:bg-zinc-100 transition-colors">
                <X size={14} className="text-zinc-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
              {ThumbnailComponent && (
                <div className="w-full rounded-xl overflow-hidden border border-zinc-100 shadow-sm">
                  <ThumbnailComponent className="w-full h-auto" />
                </div>
              )}

              {hasVariants && (
                <div className="flex gap-1.5 flex-wrap">
                  {blockDef.variants!.map((v, i) => (
                    <button
                      key={v.id}
                      onClick={() => setPreviewTarget({ blockDef, variantIdx: i })}
                      className={cn(
                        'text-[10px] px-2.5 py-1 rounded-full border transition-all',
                        i === variantIdx
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'
                      )}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              )}

              {description && (
                <p className="text-[12px] text-zinc-500 leading-relaxed">{description}</p>
              )}

              <button
                onClick={() => handleAddBlock(blockDef, activeVariant)}
                className="w-full py-2.5 bg-zinc-900 text-white text-[12px] font-medium rounded-xl hover:bg-zinc-700 transition-colors"
              >
                Aggiungi blocco
              </button>
            </div>
          </div>
        );
      })()}
    </aside>

    </>
  );
};
