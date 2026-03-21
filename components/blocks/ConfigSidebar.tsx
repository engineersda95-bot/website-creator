'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import {
   X,
   Monitor,
   Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlobalSettings } from './sidebar/GlobalSettings';
import { NavigationContent } from './sidebar/block-editors/NavigationContent';
import { NavigationStyle } from './sidebar/block-editors/NavigationStyle';
import { HeroContent } from './sidebar/block-editors/HeroContent';
import { HeroStyle } from './sidebar/block-editors/HeroStyle';
import { TextContent } from './sidebar/block-editors/TextContent';
import { TextStyle } from './sidebar/block-editors/TextStyle';
import { FooterContent } from './sidebar/block-editors/FooterContent';
import { FooterStyle } from './sidebar/block-editors/FooterStyle';
import { LegacyContent } from './sidebar/LegacyContent';

export const ConfigSidebar: React.FC = () => {
   const { 
      project, 
      projectPages, 
      selectedBlockId, 
      currentPage, 
      updateBlock, 
      updateProjectSettings, 
      viewport, 
      updateBlockStyle 
   } = useEditorStore();
   
   const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');
   const [isMounted, setIsMounted] = useState(false);

   React.useEffect(() => {
      setIsMounted(true);
   }, []);

   const selectedBlock = currentPage?.blocks.find(b => b.id === selectedBlockId);

   if (!isMounted) return null;

   // Global Settings (No block selected)
   if (!selectedBlock) {
      return (
         <div className="w-80 shrink-0 z-20 bg-white border-l border-zinc-200 flex flex-col h-full shadow-sm animate-in slide-in-from-right duration-500 overflow-y-auto">
            <GlobalSettings 
               project={project} 
               updateProjectSettings={updateProjectSettings} 
               viewport={viewport} 
            />
         </div>
      );
   }

   // Block Specific Handlers
   const updateContent = (newContent: any) => {
      updateBlock(selectedBlock.id, { ...selectedBlock.content, ...newContent });
   };

   const updateStyle = (newStyle: any) => {
      updateBlockStyle(selectedBlock.id, newStyle);
   };

   const getStyleValue = (key: string, defaultValue: any) => {
      if (viewport === 'desktop') return selectedBlock.style?.[key] ?? defaultValue;
      return selectedBlock.responsiveStyles?.[viewport]?.[key] ?? selectedBlock.style?.[key] ?? defaultValue;
   };

   // Content Editor Selection
   const renderContentEditor = () => {
      switch (selectedBlock.type) {
         case 'navigation':
            return <NavigationContent selectedBlock={selectedBlock} updateContent={updateContent} updateStyle={updateStyle} getStyleValue={getStyleValue} />;
         case 'hero':
            return <HeroContent selectedBlock={selectedBlock} updateContent={updateContent} updateStyle={updateStyle} getStyleValue={getStyleValue} />;
         case 'text':
            return <TextContent selectedBlock={selectedBlock} updateContent={updateContent} />;
         case 'footer':
            return <FooterContent selectedBlock={selectedBlock} updateContent={updateContent} projectPages={projectPages} />;
         default:
            return <LegacyContent selectedBlock={selectedBlock} updateContent={updateContent} updateStyle={updateStyle} />;
      }
   };

   // Style Editor Selection
   const renderStyleEditor = () => {
      switch (selectedBlock.type) {
         case 'navigation':
            return <NavigationStyle selectedBlock={selectedBlock} updateStyle={updateStyle} getStyleValue={getStyleValue} project={project} />;
         case 'hero':
            return <HeroStyle selectedBlock={selectedBlock} updateStyle={updateStyle} getStyleValue={getStyleValue} project={project} />;
         case 'text':
            return <TextStyle selectedBlock={selectedBlock} updateStyle={updateStyle} getStyleValue={getStyleValue} project={project} />;
         case 'footer':
            return <FooterStyle selectedBlock={selectedBlock} updateStyle={updateStyle} getStyleValue={getStyleValue} project={project} />;
         default:
            // For now, non-validated blocks don't have a specific style editor assigned here
            // but they will use the shared Legacy content if needed.
            // Actually, I'll just return null or a message for style of non-validated blocks
            return <div className="p-6 text-zinc-400 text-xs text-center italic">Personalizzazione stile non ancora disponibile per questo modulo.</div>;
      }
   };

   return (
      <div className="w-80 shrink-0 z-20 bg-white border-l border-zinc-200 flex flex-col h-full shadow-sm animate-in slide-in-from-right duration-200">
         <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-2">
               <div className={cn(
                  "px-2 py-1 rounded-md flex items-center gap-1.5 border animate-in fade-in zoom-in duration-300",
                  viewport === 'desktop' ? "bg-zinc-100 border-zinc-200 text-zinc-400" : "bg-indigo-50 border-indigo-100 text-indigo-600"
               )}>
                  {viewport === 'desktop' ? <Monitor size={10} /> : <Smartphone size={10} />}
                  <span className="text-[9px] font-black uppercase tracking-tight">Stai modificando: {viewport}</span>
               </div>
               <div className="truncate max-w-[150px] uppercase text-[10px] font-black text-zinc-400 tracking-wider">
                  Edit: {selectedBlock.type}
               </div>
            </div>
            <button
               onClick={() => useEditorStore.getState().selectBlock(null)}
               className="p-1.5 hover:bg-zinc-100 rounded text-zinc-400 transition-colors"
            >
               <X size={18} />
            </button>
         </div>

         <div className="flex border-b border-zinc-200 bg-zinc-50/50">
            <button
               onClick={() => setActiveTab('content')}
               className={cn(
                  "flex-1 py-3 text-xs font-bold transition-all border-b-2 uppercase tracking-widest",
                  activeTab === 'content' ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"
               )}
            >
               Contenuto
            </button>
            <button
               onClick={() => setActiveTab('style')}
               className={cn(
                  "flex-1 py-3 text-xs font-bold transition-all border-b-2 uppercase tracking-widest",
                  activeTab === 'style' ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"
               )}
            >
               Stile
            </button>
         </div>

         <div className="flex-1 overflow-y-auto w-full">
            {activeTab === 'content' ? (
               <div className="p-6 space-y-8 animate-in fade-in duration-500">
                  {renderContentEditor()}
               </div>
            ) : (
               <div className="p-6 space-y-8 animate-in fade-in duration-500">
                  {renderStyleEditor()}
               </div>
            )}
         </div>
      </div>
   );
};
