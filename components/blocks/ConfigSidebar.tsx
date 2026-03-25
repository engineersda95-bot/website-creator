'use client';

import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import {
   X,
   Monitor,
   Smartphone
} from 'lucide-react';
import { cn, getStyleValue as getStyleValueUtil } from '@/lib/utils';
import { GlobalSettings } from './sidebar/GlobalSettings';
import { BLOCK_DEFINITIONS } from '@/lib/block-definitions';

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
         <div data-tour="config-sidebar" className="w-80 shrink-0 z-20 bg-white border-l border-zinc-200/80 flex flex-col h-full animate-in slide-in-from-right duration-500 overflow-y-auto">
            <GlobalSettings
               project={project}
               updateProjectSettings={updateProjectSettings}
               viewport={viewport}
            />
         </div>
      );
   }

   // Definition from registry
   const definition = BLOCK_DEFINITIONS[selectedBlock.type];

   // Block Specific Handlers
   const updateContent = (newContent: any) => {
      updateBlock(selectedBlock.id, { ...selectedBlock.content, ...newContent });
   };

   const updateStyle = (newStyle: any) => {
      updateBlockStyle(selectedBlock.id, newStyle);
   };

   const getStyleValue = (key: string, defaultValue: any) => {
      return getStyleValueUtil(selectedBlock, viewport, key, defaultValue);
   };

   // Content Editor Selection
   const renderContentEditor = () => {
      if (!definition || !definition.contentEditor) {
         return <div className="p-6 text-zinc-400 text-xs text-center italic">Editor contenuti non disponibile.</div>;
      }
      const Component = definition.contentEditor;
      return <Component 
         selectedBlock={selectedBlock} 
         updateContent={updateContent} 
         updateStyle={updateStyle} 
         getStyleValue={getStyleValue} 
         projectPages={projectPages}
      />;
   };

   // Style Editor Selection
   const renderStyleEditor = () => {
      if (!definition || !definition.styleEditor) {
         return <div className="p-6 text-zinc-400 text-xs text-center italic">Editor stili non disponibile.</div>;
      }
      const Component = definition.styleEditor;
      return <Component 
         selectedBlock={selectedBlock} 
         updateContent={updateContent}
         updateStyle={updateStyle} 
         getStyleValue={getStyleValue} 
         project={project} 
      />;
   };

   return (
      <div data-tour="config-sidebar" className="w-80 shrink-0 z-20 bg-white border-l border-zinc-200/80 flex flex-col h-full animate-in slide-in-from-right duration-200">
         {/* Block header */}
         <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
               <div className="px-2 py-0.5 rounded bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wide shrink-0">
                  {selectedBlock.type}
               </div>
               {viewport !== 'desktop' && (
                  <div className={cn(
                     "flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide shrink-0",
                     "bg-indigo-50 text-indigo-600 border border-indigo-100"
                  )}>
                     <Smartphone size={9} />
                     {viewport}
                  </div>
               )}
            </div>
            <button
               onClick={() => useEditorStore.getState().selectBlock(null)}
               className="p-1 hover:bg-zinc-100 rounded-md text-zinc-400 hover:text-zinc-600 transition-colors"
            >
               <X size={16} />
            </button>
         </div>

         {/* Tabs */}
         <div className="flex border-b border-zinc-100 px-4">
            {(['content', 'style'] as const).map((tab) => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                     "flex-1 py-2.5 text-[11px] font-semibold transition-all border-b-2 capitalize",
                     activeTab === tab
                        ? "border-zinc-900 text-zinc-900"
                        : "border-transparent text-zinc-400 hover:text-zinc-600"
                  )}
               >
                  {tab === 'content' ? 'Contenuto' : 'Stile'}
               </button>
            ))}
         </div>

         {/* Editor content */}
         <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
            {activeTab === 'content' ? (
               <div className="p-5 space-y-6 animate-in fade-in duration-300">
                  {renderContentEditor()}
               </div>
            ) : (
               <div className="p-5 space-y-6 animate-in fade-in duration-300">
                  {renderStyleEditor()}
               </div>
            )}
         </div>
      </div>
   );
};
