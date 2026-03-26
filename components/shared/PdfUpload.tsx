'use client';

import React, { useRef } from 'react';
import { FileText, Upload, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdfUploadProps {
  value?: string;
  filename?: string;
  onChange: (base64: string, filename?: string) => void;
  label?: string;
}

export const PdfUpload: React.FC<PdfUploadProps> = ({ 
  value, 
  filename,
  onChange, 
  label = "Documento PDF"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert("Il file deve essere un PDF");
      return;
    }

    if (file.size > 15 * 1024 * 1024) { // 15MB for PDFs
      alert("Il file è troppo grande (max 15MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onChange(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">{label}</label>
      </div>
      
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-zinc-200 p-4 bg-zinc-50 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
            <FileText size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-zinc-900 truncate">{filename || 'Documento Caricato'}</p>
            <p className="text-[10px] text-zinc-500">PDF Pronto</p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="p-1.5 hover:bg-zinc-200 rounded-md text-zinc-600 transition-colors"
               title="Sostituisci"
             >
               <Upload size={14} />
             </button>
             <button 
               onClick={() => onChange('', '')}
               className="p-1.5 hover:bg-red-50 rounded-md text-red-600 transition-colors"
               title="Rimuovi"
             >
               <Trash2 size={14} />
             </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-6 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center text-zinc-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all group"
        >
          <div className="p-2 bg-zinc-50 rounded-full group-hover:bg-blue-100 transition-colors mb-2">
            <Upload size={18} />
          </div>
          <span className="text-xs font-medium">Carica PDF</span>
          <span className="text-[10px] opacity-60 mt-1">Fino a 15MB</span>
        </button>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="application/pdf" 
        className="hidden" 
      />
    </div>
  );
};
