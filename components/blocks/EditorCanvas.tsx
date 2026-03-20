'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { getBlockComponent } from './BlockRegistry';
import { Trash2, ChevronUp, ChevronDown, Monitor, Tablet, Smartphone, Moon, Sun, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const EditorCanvas: React.FC = () => {
  const { 
    project, 
    currentPage, 
    updateBlock, 
    removeBlock, 
    moveBlockUp, 
    moveBlockDown, 
    selectedBlockId, 
    selectBlock, 
    viewport, 
    setViewport,
    updateProjectSettings,
    projectPages
  } = useEditorStore();

  const isDark = project?.settings?.appearance === 'dark';
  const font = project?.settings?.fontFamily || 'Outfit';
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap`;

  if (!currentPage) return (
    <div className="flex-1 flex items-center justify-center text-zinc-400 bg-zinc-50 uppercase text-[10px] font-black tracking-widest">
      Seleziona una pagina per iniziare
    </div>
  );

  return (
    <div className={cn("flex-1 overflow-hidden flex flex-col bg-zinc-200 transition-colors duration-500")}>
      <link rel="stylesheet" href={googleFontUrl} />
      
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
        </div>

        <div className="flex items-center gap-4">
           <div className="h-4 w-px bg-zinc-200" />
           <button 
             onClick={() => updateProjectSettings({ appearance: isDark ? 'light' : 'dark' })}
             className={cn("flex items-center gap-3 px-4 py-2 rounded-full text-xs font-black transition-all border shadow-sm", isDark ? "bg-zinc-900 text-amber-400 border-zinc-800 hover:bg-zinc-800" : "bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50")}
           >
             {isDark ? <Moon size={14}/> : <Sun size={14}/>}
             <span className="uppercase tracking-widest">{isDark ? 'Tema Dark' : 'Tema Light'}</span>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 flex justify-center scroll-smooth bg-zinc-100/50">
        <style>{`
          #editor-content {
            font-family: '${font}', sans-serif !important;
          }
          #editor-content * {
            font-family: inherit !important;
          }
          .dark#editor-content {
            background-color: #0c0c0e !important;
          }
          /* Custom responsive widths for editor */
          .canvas-desktop { max-width: 100%; width: 1200px; }
          .canvas-tablet { width: 768px; }
          .canvas-mobile { width: 390px; }
        `}</style>
        
        <div 
          id="editor-content"
          className={cn(
            "bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] min-h-screen relative pb-20 transition-all duration-700 origin-top",
            isDark ? "dark" : "light",
            viewport === 'desktop' ? "canvas-desktop" : 
            viewport === 'tablet' ? "canvas-tablet" : "canvas-mobile"
          )}
        >
          {currentPage.blocks.length === 0 ? (
            <div className="p-20 text-center text-zinc-300 border-4 border-dashed m-12 rounded-[3rem] uppercase text-[10px] font-black tracking-widest flex flex-col items-center gap-4">
              <Plus className="opacity-20" size={48} />
              Trascina o clicca un blocco per iniziare
            </div>
          ) : (
            currentPage.blocks.map((block, index) => {
              const Component = getBlockComponent(block.type);
              const isSelected = selectedBlockId === block.id;

              // Dynamic defaults based on Global Theme Settings
              const theme = project?.settings?.themeColors;
              const defaultBg = isDark 
                ? (theme?.dark?.bg || '#0c0c0e') 
                : (theme?.light?.bg || '#ffffff');
              const defaultText = isDark 
                ? (theme?.dark?.text || '#ffffff') 
                : (theme?.light?.text || '#000000');

              // Merge styles but skip undefined values from block.style
              // so that the default theme colors can shine through when reset
              const cleanedBlockStyle = Object.entries(block.style || {}).reduce((acc, [key, val]) => {
                if (val !== undefined && val !== null) acc[key] = val;
                return acc;
              }, {} as any);

              const activeStyle = {
                backgroundColor: defaultBg,
                textColor: defaultText,
                ...cleanedBlockStyle,
                ...(viewport !== 'desktop' ? (block.responsiveStyles?.[viewport] || {}) : {})
              };
              
              return (
                <div 
                  key={block.id} 
                  onClick={(e) => {
                    e.stopPropagation();
                    selectBlock(block.id);
                  }}
                  className={cn(
                    "group relative transition-all cursor-pointer outline outline-0",
                    block.type === 'navigation' ? "z-50" : "z-0",
                    isSelected ? "outline-4 outline-blue-500/30 z-50" : "hover:outline-2 hover:outline-zinc-200"
                  )}
                >
                   {/* Selection Indicator */}
                   {isSelected && (
                     <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none z-20" />
                   )}

                  <Component 
                    content={block.content} 
                    style={activeStyle} 
                    isEditing={true}
                    project={project || undefined}
                    allPages={projectPages}
                    onUpdate={(newContent: any) => updateBlock(block.id, newContent)}
                  />
                  
                  {/* Block Controls - Repositioned and stylized */}
                  <div className="absolute right-6 top-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 bg-zinc-900/90 backdrop-blur-md shadow-2xl rounded-2xl p-2 border border-white/20 z-40 transform translate-x-4 group-hover:translate-x-0">
                    <div className="flex items-center gap-1 pr-2 mr-2 border-r border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">
                       Blocco
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); moveBlockUp(block.id); }}
                      className="p-2 hover:bg-white/20 text-white rounded-xl transition-colors disabled:opacity-20"
                      disabled={index === 0}
                      title="Sposta Su"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); moveBlockDown(block.id); }}
                      className="p-2 hover:bg-white/20 text-white rounded-xl transition-colors disabled:opacity-20"
                      disabled={index === currentPage.blocks.length - 1}
                      title="Sposta Giu"
                    >
                      <ChevronDown size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                      className="p-2 hover:bg-red-500 text-white rounded-xl transition-colors"
                      title="Elimina"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
