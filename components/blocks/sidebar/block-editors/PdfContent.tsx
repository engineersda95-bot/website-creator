'use client';

import React from 'react';
import { SimpleInput, RichTextarea } from '../SharedSidebarComponents';
import { FileText, Type, AlignLeft } from 'lucide-react';

export const PdfContent = ({ selectedBlock, updateContent }: any) => {
  const content = selectedBlock?.content || {};
  
  const { 
    url = '', 
    title = '', 
    subtitle = '',
  } = content;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* PDF URL Input */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block px-1 flex items-center gap-2">
          <FileText size={12} className="text-blue-500" /> Documento PDF
        </label>
        <SimpleInput 
          label="URL del PDF (Google Drive o diretto)" 
          value={url} 
          onChange={(v) => updateContent({ url: v })} 
          placeholder="https://drive.google.com/file/d/..."
        />
        <p className="text-[10px] text-zinc-400 px-1 italic leading-relaxed">
          Inserisci l'URL di condivisione di Google Drive o un link diretto a un file PDF.
        </p>
      </div>

      {/* Header Info */}
      <div className="pt-6 border-t border-zinc-100 space-y-6">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block px-1 flex items-center gap-2">
          <Type size={12} className="text-zinc-400" /> Intestazione
        </label>
        
        <SimpleInput 
          label="Titolo" 
          value={title} 
          onChange={(v) => updateContent({ title: v })} 
          placeholder="es. Il Nostro Menu"
        />

        <RichTextarea 
          label="Descrizione" 
          value={subtitle} 
          onChange={(v) => updateContent({ subtitle: v })} 
          placeholder="es. Scopri i piatti del giorno..."
        />
      </div>

    </div>
  );
};
