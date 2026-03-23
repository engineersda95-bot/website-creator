'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { getBlockComponent } from './BlockRegistry';
import {
  Trash2, ChevronUp, ChevronDown, Monitor, Tablet, Smartphone,
  Moon, Sun, Plus, Type, Layout, Menu, Square, Copy,
  Clipboard as ClipboardIcon, Layers, Settings, RotateCcw, RotateCw, Minus,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBlockLibrary } from '@/lib/block-definitions';
import { HelpCenter } from '../editor/HelpCenter';

import { getBlockCSSVariables } from '@/lib/responsive-utils';

// --- Helper Components for Performance ---

const FontLoader = React.memo(({ font }: { font: string }) => {
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap`;
  return <link rel="stylesheet" href={googleFontUrl} />;
});
FontLoader.displayName = 'FontLoader';

const MemoizedBlock = React.memo(({
  block,
  project,
  projectPages,
  viewport,
  isSelected,
  index,
  totalBlocks,
  onSelect,
  onCopy,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onRemove,
  imageMemoryCache
}: any) => {
  const Component = getBlockComponent(block.type);
  const vars = getBlockCSSVariables(block, project, viewport || 'desktop');

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.id);
      }}
      className={cn(
        "group relative transition-all cursor-pointer block-wrapper",
        block.type === 'navigation' ? "z-50" : "z-0",
        isSelected ? "z-[40]" : "z-0",
      )}
      style={{
        ...vars,
        borderRadius: 'var(--block-radius)',
        border: 'var(--block-border-w) solid var(--block-border-c)',
        marginTop: 'var(--block-mt)',
        marginBottom: 'var(--block-mb)',
        marginLeft: 'var(--block-ml)',
        marginRight: 'var(--block-mr)',
        width: 'var(--block-width)',
      } as any}
    >
      {isSelected && (
        <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none z-20" />
      )}

      <Component
        content={block.content}
        block={block}
        isEditing={true}
        project={project}
        allPages={projectPages}
        viewport={viewport}
        imageMemoryCache={imageMemoryCache}
      />

      {/* Block Controls */}
      <div className={cn(
        "absolute flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 bg-zinc-900/90 backdrop-blur-md shadow-2xl rounded-2xl p-2 border border-white/20 z-[10001] transform",
        index === 0 ? "left-6 bottom-6 -translate-x-4 group-hover:translate-x-0" : "right-6 top-6 translate-x-4 group-hover:translate-x-0"
      )}>
        <div className="flex items-center gap-1 pr-2 mr-2 border-r border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">
          {block.type}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onCopy(block.id); }}
          className="p-2 hover:bg-white/20 text-white rounded-xl transition-colors"
          title="Copia (Ctrl+C)"
        >
          <Copy size={16} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(block.id); }}
          className="p-2 hover:bg-white/20 text-white rounded-xl transition-colors"
          title="Duplica (Ctrl+D)"
        >
          <Layers size={16} />
        </button>
        <div className="w-px h-4 bg-white/10 mx-1" />
        <button
          onClick={(e) => { e.stopPropagation(); onMoveUp(block.id); }}
          className="p-2 hover:bg-white/20 text-white rounded-xl transition-colors disabled:opacity-20"
          disabled={index === 0}
          title="Sposta Su"
        >
          <ChevronUp size={18} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveDown(block.id); }}
          className="p-2 hover:bg-white/20 text-white rounded-xl transition-colors disabled:opacity-20"
          disabled={index === totalBlocks - 1}
          title="Sposta Giu"
        >
          <ChevronDown size={18} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(block.id); }}
          className="p-2 hover:bg-red-500 text-white rounded-xl transition-colors ml-1"
          title="Elimina"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
});
MemoizedBlock.displayName = 'MemoizedBlock';

export const EditorCanvas: React.FC = () => {
  const {
    project,
    currentPage,
    removeBlock,
    moveBlockUp,
    moveBlockDown,
    selectedBlockId,
    selectBlock,
    viewport,
    setViewport,
    updateProjectSettings,
    projectPages,
    addBlock,
    duplicateBlock,
    copyBlock,
    pasteBlock,
    undo,
    redo,
    pageHistories,
    imageMemoryCache
  } = useEditorStore();

  const currentHist = currentPage ? pageHistories[currentPage.id] : null;
  const historyIndex = currentHist?.index ?? -1;
  const historyLength = currentHist?.steps.length ?? 0;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable;
      if (isInput) return;

      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        
        if (key === 'z') {
           e.preventDefault();
           if (e.shiftKey) redo();
           else undo();
        }
        else if (key === 'y') { e.preventDefault(); redo(); }
        else if (key === 'c' && selectedBlockId) { e.preventDefault(); copyBlock(selectedBlockId); }
        else if (key === 'v') { e.preventDefault(); pasteBlock(); }
        else if (key === 'd' && selectedBlockId) { e.preventDefault(); duplicateBlock(selectedBlockId); }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [selectedBlockId, copyBlock, pasteBlock, duplicateBlock, undo, redo]);

  const [hasCopiedBlock, setHasCopiedBlock] = React.useState(false);

  React.useEffect(() => {
    const checkCopied = () => setHasCopiedBlock(!!localStorage.getItem('sv_copied_block'));
    checkCopied();
    window.addEventListener('storage', checkCopied);
    const interval = setInterval(checkCopied, 1000);
    return () => {
      window.removeEventListener('storage', checkCopied);
      clearInterval(interval);
    };
  }, []);

  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const [showMenuAt, setShowMenuAt] = React.useState<number | null>(null);

  const INSERT_OPTIONS = getBlockLibrary();

  const isDark = project?.settings?.appearance === 'dark';
  const font = project?.settings?.fontFamily || 'Outfit';
  const themeBg = isDark
    ? (project?.settings?.themeColors?.dark?.bg || '#0c0c0e')
    : (project?.settings?.themeColors?.light?.bg || '#ffffff');
  const themeText = isDark
    ? (project?.settings?.themeColors?.dark?.text || '#ffffff')
    : (project?.settings?.themeColors?.light?.text || '#000000');

  const [isMounted, setIsMounted] = React.useState(false);
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);
  React.useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return <div className="flex-1 bg-zinc-100" />;

  if (!currentPage) return (
    <div className="flex-1 flex items-center justify-center text-zinc-400 bg-zinc-50 uppercase text-[10px] font-black tracking-widest">
      Seleziona una pagina per iniziare
    </div>
  );

  return (
    <div className={cn("flex-1 overflow-hidden flex flex-col bg-zinc-200 transition-colors duration-500")}>
      <FontLoader font={font} />

      {/* TOOLBAR TOP */}
      <div className="h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewport('desktop')}
            className={cn("p-2 rounded-lg transition-all", viewport === 'desktop' ? "bg-zinc-900 text-white shadow-xl scale-110" : "text-zinc-400 hover:bg-zinc-100")}
          >
            <Monitor size={18} />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={cn("p-2 rounded-lg transition-all", viewport === 'tablet' ? "bg-zinc-900 text-white shadow-xl scale-110" : "text-zinc-400 hover:bg-zinc-100")}
          >
            <Tablet size={18} />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={cn("p-2 rounded-lg transition-all", viewport === 'mobile' ? "bg-zinc-900 text-white shadow-xl scale-110" : "text-zinc-400 hover:bg-zinc-100")}
          >
            <Smartphone size={18} />
          </button>

          <div className="h-4 w-px bg-zinc-200 mx-1" />

          <button
            onClick={() => undo()}
            disabled={historyIndex <= 0}
            className={cn("p-2 rounded-lg transition-all", historyIndex > 0 ? "text-zinc-900 hover:bg-zinc-100" : "text-zinc-200 cursor-not-allowed")}
            title="Annulla (Ctrl+Z)"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={() => redo()}
            disabled={historyIndex >= historyLength - 1}
            className={cn("p-2 rounded-lg transition-all", historyIndex < historyLength - 1 ? "text-zinc-900 hover:bg-zinc-100" : "text-zinc-200 cursor-not-allowed")}
            title="Ripristina (Ctrl+Y)"
          >
            <RotateCw size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4">

          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all border shadow-sm bg-white text-blue-600 border-blue-100 hover:bg-blue-50"
          >
            <HelpCircle size={14} />
            <span className="uppercase tracking-widest text-[10px]">Guida / Aiuto</span>
          </button>

          <button
            onClick={() => selectBlock(null)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all border shadow-sm",
              selectedBlockId === null
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
            )}
          >
            <Settings size={14} />
            <span className="uppercase tracking-widest text-[10px]">Stili Globali</span>
          </button>


          <div className="h-4 w-px bg-zinc-200" />
          <button
            onClick={() => updateProjectSettings({ appearance: isDark ? 'light' : 'dark' })}
            className={cn("flex items-center gap-3 px-4 py-2 rounded-full text-xs font-black transition-all border shadow-sm", isDark ? "bg-zinc-900 text-amber-400 border-zinc-800 hover:bg-zinc-800" : "bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50")}
          >
            {isDark ? <Moon size={14} /> : <Sun size={14} />}
            <span className="uppercase tracking-widest text-[10px]">{isDark ? 'Tema Dark' : 'Tema Light'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 flex justify-center scroll-smooth bg-zinc-100/50 custom-scrollbar">
        <style>{`
          #editor-content { font-family: '${font}', sans-serif !important; }
          #editor-content * { font-family: inherit !important; }
          #editor-content { 
            background-color: ${themeBg} !important; 
            color: ${themeText} !important; 
          }
          .block-wrapper { background-color: inherit; }
          .canvas-desktop { width: 100%; }
          .canvas-tablet { width: 768px; }
          .canvas-mobile { width: 390px; }
        `}</style>

        <main
          id="editor-content"
          className={cn(
            "shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] min-h-screen relative pb-20 transition-all duration-700 origin-top",
            isDark ? "dark" : "light",
            viewport === 'desktop' ? "canvas-desktop" :
              viewport === 'tablet' ? "canvas-tablet" : "canvas-mobile"
          )}
          style={{
            backgroundColor: themeBg,
            display: 'flow-root'
          }}
        >
          {currentPage.blocks.length === 0 ? (
            <div className="p-20 text-center text-zinc-300 border-4 border-dashed m-12 rounded-[3rem] uppercase text-[10px] font-black tracking-widest flex flex-col items-center gap-4">
              <Plus className="opacity-20" size={48} />
              Trascina o clicca un blocco per iniziare
            </div>
          ) : (
            <div className="relative bg-inherit">
              {/* Insertion Point Start */}
              <div
                className="relative h-0 flex items-center justify-center group/insert z-[60]"
                onMouseEnter={() => setHoverIndex(0)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <div className={cn("absolute h-[3px] bg-blue-500 w-full transition-opacity opacity-0 group-hover/insert:opacity-100", showMenuAt === 0 && "opacity-100")} />
                <button
                  onClick={() => setShowMenuAt(showMenuAt === 0 ? null : 0)}
                  className={cn("absolute w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl transition-all opacity-0 group-hover/insert:opacity-100 scale-50 group-hover/insert:scale-100 hover:scale-110 z-[70]", showMenuAt === 0 && "opacity-100 scale-100 rotate-45 bg-zinc-900")}
                >
                  <Plus size={16} />
                </button>

                {showMenuAt === 0 && (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-3xl p-3 grid grid-cols-2 gap-2 min-w-[320px] animate-in zoom-in-95 fade-in duration-200 z-[80]">
                    <div className="col-span-2 px-3 py-1 mb-1 border-b border-zinc-100">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Inserisci Blocco Inizio</span>
                    </div>
                    {INSERT_OPTIONS.map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() => { addBlock(opt.type as any, 0); setShowMenuAt(null); }}
                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all group text-left border border-zinc-100"
                      >
                        <div className="p-2 bg-zinc-50 rounded-xl group-hover:bg-white/10 transition-colors">
                          <opt.icon size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-tight">{opt.label}</span>
                        </div>
                      </button>
                    ))}
                    {hasCopiedBlock && (
                      <button onClick={() => { pasteBlock(0); setShowMenuAt(null); }} className="col-span-2 flex items-center justify-center gap-3 p-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all border border-blue-100 mt-1">
                        <ClipboardIcon size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Incolla Blocco Copiato</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {currentPage.blocks.map((block, index) => (
                <React.Fragment key={block.id}>
                  <MemoizedBlock
                    block={block}
                    project={project}
                    projectPages={projectPages}
                    viewport={viewport}
                    isSelected={selectedBlockId === block.id}
                    index={index}
                    totalBlocks={currentPage.blocks.length}
                    onSelect={selectBlock}
                    onCopy={copyBlock}
                    onDuplicate={duplicateBlock}
                    onMoveUp={moveBlockUp}
                    onMoveDown={moveBlockDown}
                    onRemove={removeBlock}
                    imageMemoryCache={imageMemoryCache}
                  />

                  {/* Insertion Points */}
                  <div
                    className="relative h-0 flex items-center justify-center group/insert z-[60]"
                    onMouseEnter={() => setHoverIndex(index + 1)}
                    onMouseLeave={() => setHoverIndex(null)}
                  >
                    <div className={cn("absolute h-[3px] bg-blue-500 w-full transition-opacity opacity-0 group-hover/insert:opacity-100", showMenuAt === index + 1 && "opacity-100")} />
                    <button
                      onClick={() => setShowMenuAt(showMenuAt === index + 1 ? null : index + 1)}
                      className={cn("absolute w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(37,99,235,0.4)] transition-all opacity-0 group-hover/insert:opacity-100 scale-50 group-hover/insert:scale-100 hover:scale-110 z-[75]", showMenuAt === index + 1 && "opacity-100 scale-100 rotate-45 bg-zinc-900 shadow-none")}
                    >
                      <Plus size={16} />
                    </button>

                    {showMenuAt === index + 1 && (
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-2xl border border-zinc-200 shadow-[0_30px_70px_rgba(0,0,0,0.25)] rounded-[2rem] p-3 grid grid-cols-2 gap-2 min-w-[340px] animate-in zoom-in-90 fade-in slide-in-from-top-4 duration-300 z-[90]">
                        <div className="col-span-2 px-3 py-1 mb-1 border-b border-zinc-100 flex justify-between items-center">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Aggiungi Sezione</span>
                          <button onClick={() => setShowMenuAt(null)} className="text-zinc-400 hover:text-zinc-900 transition-colors"><Trash2 size={12} /></button>
                        </div>
                        {INSERT_OPTIONS.map((opt) => (
                          <button
                            key={opt.type}
                            onClick={() => { addBlock(opt.type as any, index + 1); setShowMenuAt(null); }}
                            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all group text-left border border-zinc-100 hover:border-zinc-900"
                          >
                            <div className="p-2 bg-zinc-50 rounded-xl group-hover:bg-white/10 transition-colors">
                              <opt.icon size={16} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-tight">{opt.label}</span>
                            </div>
                          </button>
                        ))}
                        {hasCopiedBlock && (
                          <button onClick={() => { pasteBlock(index + 1); setShowMenuAt(null); }} className="col-span-2 flex items-center justify-center gap-3 p-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all border border-blue-100 mt-1">
                            <ClipboardIcon size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Incolla Blocco Copiato</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </main>
      </div>
      {/* Help Center Modal */}
      <HelpCenter
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};
