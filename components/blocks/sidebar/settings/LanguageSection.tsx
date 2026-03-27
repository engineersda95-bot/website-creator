'use client';

import React, { useState } from 'react';
import { Globe, Plus, Trash2, Check } from 'lucide-react';
import { ProjectSettings } from '@/types/editor';
import { cn } from '@/lib/utils';

interface LanguageSectionProps {
  project: any;
  updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
}

const AVAILABLE_LANGUAGES = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export const LanguageSection: React.FC<LanguageSectionProps> = ({
  project,
  updateProjectSettings,
}) => {
  const settings = project?.settings || {};
  const languages = settings.languages || ['it'];
  const defaultLanguage = settings.defaultLanguage || 'it';
  const [isAdding, setIsAdding] = useState(false);

  const handleAddLanguage = (code: string) => {
    if (languages.includes(code)) return;
    updateProjectSettings({
      languages: [...languages, code]
    });
    setIsAdding(false);
  };

  const handleRemoveLanguage = (code: string) => {
    if (code === defaultLanguage) {
      alert("Non puoi rimuovere la lingua predefinita.");
      return;
    }
    updateProjectSettings({
      languages: languages.filter((l: string) => l !== code)
    });
  };

  const handleSetDefault = (code: string) => {
    updateProjectSettings({
      defaultLanguage: code
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between group/title">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center transition-colors group-hover/title:bg-indigo-600 group-hover/title:text-white">
            <Globe size={16} />
          </div>
          <h3 className="text-sm font-bold text-zinc-900">Lingue del Sito</h3>
        </div>
      </div>

      <div className="space-y-2">
        {languages.map((langCode: string) => {
          const langInfo = AVAILABLE_LANGUAGES.find(l => l.code === langCode);
          const isDefault = langCode === defaultLanguage;
          
          return (
            <div 
              key={langCode}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border transition-all",
                isDefault ? "bg-indigo-50 border-indigo-200" : "bg-white border-zinc-100"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{langInfo?.flag}</span>
                <div>
                  <div className="text-sm font-bold text-zinc-900">
                    {langInfo?.name}
                    {isDefault && <span className="ml-2 text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">Default</span>}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono uppercase">{langCode}</div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {!isDefault && (
                  <button
                    onClick={() => handleSetDefault(langCode)}
                    className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                    title="Imposta come predefinita"
                  >
                    <Check size={14} />
                  </button>
                )}
                {languages.length > 1 && !isDefault && (
                  <button
                    onClick={() => handleRemoveLanguage(langCode)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                    title="Rimuovi lingua"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-zinc-100 rounded-xl text-zinc-400 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all text-sm font-bold"
        >
          <Plus size={16} />
          Aggiungi lingua
        </button>
      ) : (
        <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Scegli lingua</span>
            <button onClick={() => setIsAdding(false)} className="text-zinc-400 hover:text-zinc-600 font-bold text-xs uppercase">Chiudi</button>
          </div>
          <div className="grid grid-cols-1 gap-1">
            {AVAILABLE_LANGUAGES.filter(l => !languages.includes(l.code)).map((l) => (
              <button
                key={l.code}
                onClick={() => handleAddLanguage(l.code)}
                className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-all text-left border border-transparent hover:border-zinc-100"
              >
                <span className="text-lg">{l.flag}</span>
                <span className="text-sm font-bold text-zinc-900">{l.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
