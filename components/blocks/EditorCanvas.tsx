'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { getBlockComponent } from './BlockRegistry';
import { Plus, Type, Layout, Menu, Square, Trash2, Clipboard as ClipboardIcon } from 'lucide-react';
import { cn, toPx } from '@/lib/utils';
import { getBlockLibrary } from '@/lib/block-definitions';
import { CanvasToolbar } from '@/components/editor/CanvasToolbar';
import { EditorBlockWrapper } from '@/components/editor/EditorBlockWrapper';
import { HelpCenter } from '../editor/HelpCenter';

import { getBlockCSSVariables } from '@/lib/responsive-utils';

// --- Helper Components for Performance ---

const FontLoader = React.memo(({ font }: { font: string }) => {
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,700&display=swap`;
  return <link rel="stylesheet" href={googleFontUrl} />;
});
FontLoader.displayName = 'FontLoader';


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
    imageMemoryCache,
    leftSidebarCollapsed,
    rightSidebarCollapsed,
    setLeftSidebarCollapsed,
    setRightSidebarCollapsed
  } = useEditorStore();

  const currentHist = currentPage ? pageHistories[currentPage.id] : null;
  const historyIndex = currentHist?.index ?? -1;
  const historyLength = currentHist?.steps.length ?? 0;


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
  const [zoom, setZoom] = React.useState(100);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const ZOOM_STEPS = [50, 67, 75, 80, 90, 100, 110, 125, 150];
  const zoomIn = () => { setZoom(prev => ZOOM_STEPS.find(z => z > prev) || prev); };
  const zoomOut = () => { setZoom(prev => [...ZOOM_STEPS].reverse().find(z => z < prev) || prev); };

  const currentScale = zoom / 100;
  React.useEffect(() => { setIsMounted(true); }, []);

  // Prevent navigation for all links inside the editor canvas
  React.useEffect(() => {
    const handleCaptureClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && document.getElementById('editor-content')?.contains(link)) {
        // Allow clicks on links that are part of the editor UI (insertion menu, etc.)
        if (link.closest('.insert-menu') || link.closest('.block-controls') || link.closest('.help-center')) {
          return;
        }

        // Prevent navigation but allow selection by not stopping propagation
        e.preventDefault();
      }
    };

    // Click on rt-content with data-sidebar-section → open that section in sidebar
    const handleSidebarFocus = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-sidebar-section]');
      if (target) {
        const sectionId = target.getAttribute('data-sidebar-section');
        if (sectionId) window.dispatchEvent(new CustomEvent('block-section-focus', { detail: sectionId }));
      }
    };

    document.addEventListener('click', handleCaptureClick, true);
    document.addEventListener('dblclick', handleSidebarFocus);
    return () => {
      document.removeEventListener('click', handleCaptureClick, true);
      document.removeEventListener('dblclick', handleSidebarFocus);
    };
  }, []);

  // Listener for 'open-help' event from UserMenu
  React.useEffect(() => {
    const handleOpenHelp = () => setIsHelpOpen(true);
    window.addEventListener('open-help', handleOpenHelp);
    return () => window.removeEventListener('open-help', handleOpenHelp);
  }, []);

  // Shared Reveal System: Fast & Reliable
  React.useEffect(() => {
    const handleReveal = (e: Event) => {
      const target = e.target as HTMLImageElement;
      if (target.tagName === 'IMG' && target.hasAttribute('data-siti-reveal')) {
        target.classList.remove('project-img-placeholder');
        target.style.background = 'transparent';
      }
    };

    document.addEventListener('load', handleReveal, true);
    
    const timer = setInterval(() => {
      const pending = document.querySelectorAll('img[data-siti-reveal].project-img-placeholder');
      pending.forEach(img => {
        if ((img as HTMLImageElement).complete) {
          (img as HTMLElement).classList.remove('project-img-placeholder');
          (img as HTMLElement).style.background = 'transparent';
        }
      });
    }, 500);

    return () => {
      document.removeEventListener('load', handleReveal, true);
      clearInterval(timer);
    };
  }, [currentPage?.blocks]);

  if (!isMounted) return <div className="flex-1 bg-zinc-100" />;

  if (!currentPage) return (
    <div className="flex-1 flex items-center justify-center text-zinc-400 bg-zinc-50 uppercase text-[10px] font-black tracking-widest">
      Seleziona una pagina per iniziare
    </div>
  );

  return (
    <div data-tour="canvas" className={cn("flex-1 overflow-hidden flex flex-col bg-zinc-200 transition-colors duration-500")}>
      <FontLoader font={font} />

      {/* TOOLBAR TOP */}
      <CanvasToolbar
        viewport={viewport}
        setViewport={setViewport}
        undo={undo}
        redo={redo}
        historyIndex={historyIndex}
        historyLength={historyLength}
        zoom={zoom}
        setZoom={setZoom}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        ZOOM_STEPS={ZOOM_STEPS}
        leftSidebarCollapsed={leftSidebarCollapsed}
        rightSidebarCollapsed={rightSidebarCollapsed}
        setLeftSidebarCollapsed={setLeftSidebarCollapsed}
        setRightSidebarCollapsed={setRightSidebarCollapsed}
        setIsHelpOpen={setIsHelpOpen}
        selectedBlockId={selectedBlockId}
        selectBlock={selectBlock}
        isDark={isDark}
        updateProjectSettings={updateProjectSettings}
      />

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-12 flex justify-center scroll-smooth bg-zinc-100/50 custom-scrollbar relative"
      >
        <style>{`
          #editor-content { font-family: '${font}', sans-serif !important; }
          #editor-content * { font-family: inherit !important; }
          #editor-content { 
            background-color: ${themeBg} !important; 
            color: ${themeText} !important; 
            --global-h1-fs: ${toPx(project?.settings?.typography?.h1Size, '4rem')};
            --global-h2-fs: ${toPx(project?.settings?.typography?.h2Size, '3rem')};
            --global-h3-fs: ${toPx(project?.settings?.typography?.h3Size, '2rem')};
            --global-h4-fs: ${toPx(project?.settings?.typography?.h4Size, '1.5rem')};
            --global-h5-fs: ${toPx(project?.settings?.typography?.h5Size, '1.25rem')};
            --global-h6-fs: ${toPx(project?.settings?.typography?.h6Size, '1.1rem')};
            --global-body-fs: ${toPx(project?.settings?.typography?.bodySize, '1rem')};
          }
          #editor-content .insert-menu * { color: #18181b !important; }
          #editor-content .insert-menu button:hover * { color: #ffffff !important; }
          #editor-content .block-wrapper:hover { outline: 2px solid #3b82f6; }
          .block-wrapper { background-color: inherit; }
          .canvas-desktop { width: 1280px; }
          .canvas-tablet { width: 768px; }
          .canvas-mobile { width: 390px; }
          #editor-content a { pointer-events: none !important; }
          #editor-content a:has([contenteditable]), #editor-content a:has([data-placeholder]) { pointer-events: auto !important; }

          /* Sidebar edit hint on non-inline-editable text */
          #editor-content .block-wrapper .rt-content:not([contenteditable]) {
            position: relative;
            cursor: default;
          }
          #editor-content .block-wrapper .rt-content:not([contenteditable]):hover::after {
            content: 'Modifica dalla sidebar →';
            position: absolute;
            top: -1.75rem;
            right: 0;
            font-size: 10px;
            font-weight: 600;
            color: #3b82f6;
            background: white;
            border: 1px solid #dbeafe;
            padding: 2px 8px;
            border-radius: 6px;
            white-space: nowrap;
            pointer-events: none;
            z-index: 50;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            font-family: system-ui, sans-serif !important;
          }
        `}</style>

        <main
          id="editor-content"
          className={cn(
            "shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] min-h-screen relative pb-20 transition-all duration-500 origin-top",
            isDark ? "dark" : "light",
            viewport === 'desktop' ? "canvas-desktop" :
              viewport === 'tablet' ? "canvas-tablet" : "canvas-mobile"
          )}
          style={{
            backgroundColor: themeBg,
            display: 'flow-root',
            transform: `scale(${currentScale})`,
            transformOrigin: 'top center',
          }}
        >
          {currentPage.blocks.length === 0 ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md mx-auto px-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center mb-6">
                  <Layout size={28} className="text-zinc-300" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-800 mb-2" style={{ color: '#18181b' }}>Pagina vuota</h3>
                <p className="text-sm text-zinc-500 mb-8" style={{ color: '#71717a' }}>Inizia aggiungendo i blocchi per costruire la tua pagina.</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'navigation' as const, label: 'Navigazione', icon: Menu },
                    { type: 'hero' as const, label: 'Hero', icon: Square },
                    { type: 'text' as const, label: 'Testo', icon: Type },
                    { type: 'contact' as const, label: 'Contatti', icon: Layout },
                  ].map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => addBlock(type)}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-zinc-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
                      style={{ color: '#18181b', borderColor: '#e4e4e7', backgroundColor: '#ffffff' }}
                    >
                      <Icon size={16} className="text-zinc-400 group-hover:text-blue-600 shrink-0" />
                      <span className="text-sm font-medium" style={{ color: '#3f3f46' }}>{label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-zinc-400 mt-6" style={{ color: '#a1a1aa' }}>
                  Oppure scegli dalla libreria blocchi nella sidebar sinistra
                </p>
              </div>
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
                  <div className="insert-menu absolute top-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-3xl p-3 grid grid-cols-2 gap-2 min-w-[320px] animate-in zoom-in-95 fade-in duration-200 z-[80]">
                    <div className="col-span-2 px-3 py-1 mb-1 border-b border-zinc-100">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Inserisci Blocco Inizio</span>
                    </div>
                    {INSERT_OPTIONS.map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() => { addBlock(opt.type as any, 0); setShowMenuAt(null); }}
                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all group text-left border border-zinc-100 text-zinc-900"
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
                      <EditorBlockWrapper
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
                      <div className="insert-menu absolute top-10 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-2xl border border-zinc-200 shadow-[0_30px_70px_rgba(0,0,0,0.25)] rounded-[2rem] p-3 grid grid-cols-2 gap-2 min-w-[340px] animate-in zoom-in-90 fade-in slide-in-from-top-4 duration-300 z-[90]">
                        <div className="col-span-2 px-3 py-1 mb-1 border-b border-zinc-100 flex justify-between items-center">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Aggiungi Sezione</span>
                          <button onClick={() => setShowMenuAt(null)} className="text-zinc-400 hover:text-zinc-900 transition-colors"><Trash2 size={12} /></button>
                        </div>
                        {INSERT_OPTIONS.map((opt) => (
                          <button
                            key={opt.type}
                            onClick={() => { addBlock(opt.type as any, index + 1); setShowMenuAt(null); }}
                            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all group text-left border border-zinc-100 hover:border-zinc-900 text-zinc-900"
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

              {/* Final Paste Option */}
              {hasCopiedBlock && (
                <div className="p-12 border-2 border-dashed border-zinc-200 m-8 rounded-[3rem] flex flex-col items-center gap-4 group/paste">
                   <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest opacity-50">Hai un blocco copiato negli appunti</p>
                   <button 
                    onClick={() => pasteBlock()} 
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
                   >
                    <ClipboardIcon size={18} /> Incolla Blocco a Fine Pagina
                   </button>
                </div>
              )}
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
