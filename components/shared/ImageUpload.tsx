'use client';

import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/shared/Toast';

interface ImageUploadProps {
  value?: string;
  onChange: (base64: string, filename?: string) => void;
  label?: React.ReactNode;
  hidePreview?: boolean;
  onImageLoad?: (dimensions: { width: number; height: number }) => void;
  showSEOStatus?: boolean;
  /** Current alt text value – renders an inline alt-text field when provided */
  altValue?: string;
  /** Called when the user edits the alt text */
  onAltChange?: (alt: string) => void;
  /** Called once right after the user picks a file, with the cleaned filename */
  onFilenameSelect?: (filename: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  value, 
  onChange, 
  label = "Immagine", 
  hidePreview = false,
  onImageLoad,
  showSEOStatus = false,
  altValue,
  onAltChange,
  onFilenameSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = React.useState<{width: number, height: number} | null>(null);

  React.useEffect(() => {
    if (value && typeof value === 'string' && (value.startsWith('http') || value.startsWith('/assets') || value.startsWith('data:'))) {
      const img = new Image();
      img.onload = () => {
        const dims = { width: img.naturalWidth, height: img.naturalHeight };
        setDimensions(dims);
        if (onImageLoad) onImageLoad(dims);
      };
      img.src = value;
    } else if (!value) {
      setDimensions(null);
    }
  }, [value, onImageLoad]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast("L'immagine è troppo grande (max 10MB)", 'error');
      return;
    }

    // Auto-fill alt text with filename (no extension) if field is empty
    if (onFilenameSelect) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      onFilenameSelect(nameWithoutExt);
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onChange(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  const seoStatus = dimensions ? (
    dimensions.width < 600 || dimensions.height < 315 ? { color: 'text-red-500', bg: 'bg-red-500', label: 'Non verrà visualizzata' } : 
    dimensions.width < 1200 || dimensions.height < 630 ? { color: 'text-amber-500', bg: 'bg-amber-500', label: 'Non ottimizzata' } : 
    { color: 'text-emerald-500', bg: 'bg-emerald-500', label: 'Qualità Ottimale (OK)' }
  ) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">{label}</label>
      </div>
      
      {!hidePreview && value ? (
        <div className="relative group rounded-xl overflow-hidden border border-zinc-200 aspect-video bg-zinc-100 shadow-sm">
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
          <span className="text-[10px] opacity-60 mt-1">PNG, JPG fino a 10MB</span>
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

      {/* Inline Alt Text field */}
      {onAltChange !== undefined && (
        <div className="space-y-1 pt-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block px-1">
            Testo Alternativo (Alt / SEO)
          </label>
          <input
            type="text"
            value={altValue ?? ''}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder=""
            className="w-full p-2.5 border border-zinc-200 rounded-xl text-[12px] bg-zinc-50 focus:bg-white focus:border-zinc-400 transition-all outline-none"
          />
        </div>
      )}

      {showSEOStatus && seoStatus && dimensions && (
        <div className="mt-2 p-3 bg-zinc-50 border border-zinc-100 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1 duration-200 shadow-sm">
          <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-200/50">
             <div className={cn("w-2 h-2 rounded-full", seoStatus.bg)} />
             <span className={cn("text-[10px] font-bold uppercase tracking-tight", seoStatus.color)}>
               {dimensions.width} x {dimensions.height} px: {seoStatus.label}
             </span>
          </div>
          <div className="space-y-1.5">
             <p className="text-[10px] text-zinc-600 leading-tight">
                <span className="font-bold text-blue-600">GOAL:</span> Target ottimale <span className="font-bold">1200 x 630 px</span>.
             </p>
             <p className="text-[9px] text-zinc-400 leading-tight italic">
                Un titolo chiaro e una CTA (Call to Action) nell'immagine aumentano drasticamente i clic!
             </p>
          </div>
        </div>
      )}
    </div>
  );
};
