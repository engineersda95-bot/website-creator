'use client';

import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
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
  MousePointer2,
  Columns,
  Plus,
  Menu,
  FileText,
  ShoppingBag
} from 'lucide-react';
import { PageManager } from '../editor/PageManager';

const blockLibrary: { type: BlockType; label: string; icon: any }[] = [
  { type: 'navigation', label: 'Main Navigation', icon: Menu },
  { type: 'hero', label: 'Hero Section', icon: Square },
  { type: 'text', label: 'Simple Text', icon: Type },
  { type: 'footer', label: 'Footer Section', icon: Layout },
];

export const BlockSidebar: React.FC = () => {
  const { addBlock } = useEditorStore();

  // NOTE: The provided code snippet for "ConfigSidebar theme color picker"
  // seems to be intended for a different component (ConfigSidebar) and
  // introduces undefined variables like 'project' and 'updateProjectSettings'
  // if placed directly into BlockSidebar.
  //
  // Assuming the primary instruction for BlockSidebar is to update its
  // block display to a grid layout with square buttons, and the color picker
  // part is a separate, possibly mis-placed, instruction for another component.
  //
  // To make the file syntactically correct and avoid breaking BlockSidebar,
  // I will apply the "grid layout with square buttons" change to the existing
  // block library display in BlockSidebar.
  //
  // The provided code snippet for theme colors is not directly applicable
  // to BlockSidebar without significant context and variable definitions.
  // If this was intended for a *new* ConfigSidebar component, that would be
  // a different task.
  //
  // For now, I will only adjust the existing block display in BlockSidebar
  // to match the "grid layout with square buttons" description, which is
  // already largely in place, but ensure the button styling is "square".

  return (
    <aside className="w-72 bg-white border-r border-zinc-200 flex flex-col h-full shadow-sm">
      <div className="p-6 space-y-8 overflow-y-auto flex-1">
        <PageManager />
        
        <div className="border-t border-zinc-100 pt-8">
          <div className="px-2 mb-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Aggiungi Elementi</h3>
            <p className="text-[10px] text-zinc-400 mt-1">Clicca per aggiungere alla pagina</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {blockLibrary.map((block) => (
              <button
                key={block.type}
                onClick={() => addBlock(block.type)}
                // Adjusted styling for more "square" appearance and consistent padding
                className="flex flex-col items-center justify-center aspect-square p-2 rounded-2xl border-2 border-zinc-100 hover:border-zinc-900 hover:shadow-xl transition-all group text-center"
              >
                <div className="p-2 text-zinc-400 group-hover:text-zinc-900 transition-colors">
                  <block.icon size={22} />
                </div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight group-hover:text-zinc-900">{block.label.split(' ')[0]}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          <MousePointer2 size={10} />
          <span>Editor Tips</span>
        </div>
        <p className="px-2 text-[10px] text-zinc-500 leading-relaxed mt-1">
          Clicca un elemento sul canvas per configurarlo nel dettaglio.
        </p>
      </div>
    </aside>
  );
};
