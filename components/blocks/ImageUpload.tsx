'use client';

import React, { useRef } from 'react';
import { ImageIcon, Upload, X } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (base64: string) => void;
  label?: string;
  hidePreview?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label = "Immagine", hidePreview = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("L'immagine è troppo grande (max 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-600 block">{label}</label>
      
      {!hidePreview && value ? (
        <div className="relative group rounded-xl overflow-hidden border border-zinc-200 aspect-video bg-zinc-100">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="p-2 bg-white rounded-full text-zinc-900 hover:scale-110 transition-transform"
             >
               <Upload size={18} />
             </button>
             <button 
               onClick={() => onChange('')}
               className="p-2 bg-white rounded-full text-red-600 hover:scale-110 transition-transform"
             >
               <X size={18} />
             </button>
          </div>
        </div>
      ) : !hidePreview ? (
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-video border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center text-zinc-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all group"
        >
          <div className="p-3 bg-zinc-50 rounded-full group-hover:bg-blue-100 transition-colors mb-2">
            <Upload size={20} />
          </div>
          <span className="text-xs font-medium">Carica Immagine</span>
          <span className="text-[10px] opacity-60 mt-1">PNG, JPG fino a 2MB</span>
        </button>
      ) : (
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-2 bg-zinc-900 text-white rounded-xl text-[10px] font-bold uppercase transition-all hover:bg-zinc-800"
        >
          Sostituisci Immagine
        </button>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};
