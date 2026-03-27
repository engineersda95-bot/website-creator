'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BUSINESS_TYPES, LANGUAGES } from '@/lib/editor-constants';
import { cn } from '@/lib/utils';

interface ProjectQuickEditModalProps {
  projectId: string;
  project: any;
  onClose: () => void;
  onSave: (updatedProj: any) => void;
}

export function ProjectQuickEditModal({ projectId, project, onClose, onSave }: ProjectQuickEditModalProps) {
  const [name, setName] = useState(project.name);
  const [bName, setBName] = useState(project.settings?.businessDetails?.businessName || '');
  const [bType, setBType] = useState(project.settings?.businessType || 'LocalBusiness');
  const [email, setEmail] = useState(project.settings?.businessDetails?.email || '');
  const [phone, setPhone] = useState(project.settings?.businessDetails?.phone || '');
  const [address, setAddress] = useState(project.settings?.businessDetails?.address || '');
  const [city, setCity] = useState(project.settings?.businessDetails?.city || '');
  const [zip, setZip] = useState(project.settings?.businessDetails?.postalCode || '');
  const [country, setCountry] = useState(project.settings?.businessDetails?.country || 'Italia');
  const [langs, setLangs] = useState<string[]>(project.settings?.languages || [project.settings?.language || project.settings?.defaultLanguage || 'it']);
  const [cuisine, setCuisine] = useState(project.settings?.businessDetails?.servesCuisine || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const updatedSettings = {
      ...project.settings,
      businessType: bType,
      businessDetails: {
        ...project.settings.businessDetails,
        businessName: bName,
        email,
        phone,
        address,
        city,
        postalCode: zip,
        country,
        priceRange: (project.settings?.businessDetails as any)?.priceRange, // Preserve existing if any
        servesCuisine: bType === 'Restaurant' ? cuisine : undefined
      },
      languages: langs,
      defaultLanguage: langs[0] || 'it',
      // Update metaTitle only if it follows the template pattern or is empty
      metaTitle: project.settings.metaTitle === `${project.settings.businessDetails?.businessName || project.name} - ` || !project.settings.metaTitle
        ? (bName || name)
        : project.settings.metaTitle
    };

    const { data, error } = await supabase
      .from('projects')
      .update({
        name,
        settings: updatedSettings
      })
      .eq('id', projectId)
      .select()
      .single();

    if (!error && data) {
      onSave(data);
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900">Impostazioni sito</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Nome Progetto</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg focus:border-zinc-400 outline-none text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Lingue Supportate</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) => {
                  const isSelected = langs.includes(l.value);
                  return (
                    <button
                      key={l.value}
                      onClick={() => {
                        if (isSelected && langs.length > 1) {
                          setLangs(langs.filter(la => la !== l.value));
                        } else if (!isSelected) {
                          setLangs([...langs, l.value]);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all",
                        isSelected
                          ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                          : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300"
                      )}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-zinc-400 font-medium italic mt-1">
                La prima lingua sarà quella predefinita.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Nome Azienda (SEO)</label>
              <input value={bName} onChange={e => setBName(e.target.value)} className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg focus:border-zinc-400 outline-none text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Settore</label>
              <select value={bType} onChange={e => setBType(e.target.value)} className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg focus:border-zinc-400 outline-none text-sm">
                {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          {bType === 'Restaurant' && (
            <div className="space-y-1 animation-in slide-in-from-top-1 duration-200">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Tipo di Cucina</label>
              <input value={cuisine} onChange={e => setCuisine(e.target.value)} placeholder="es: Mediterranea, Pesce" className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg focus:border-zinc-400 outline-none text-sm" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Via e Numero</label>
              <input value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg focus:border-zinc-400 outline-none text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Città</label>
                <input value={city} onChange={e => setCity(e.target.value)} className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg focus:border-zinc-400 outline-none text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">CAP</label>
                <input value={zip} onChange={e => setZip(e.target.value)} className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg focus:border-zinc-400 outline-none text-sm" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Email aziendale</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="example@business.it" className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg focus:border-zinc-400 outline-none text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Paese</label>
              <input value={country} onChange={e => setCountry(e.target.value)} className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg focus:border-zinc-400 outline-none text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Telefono</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg focus:border-zinc-400 outline-none text-sm" />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-500">Chiudi</button>
          <button onClick={handleSave} disabled={isSaving} className="px-5 py-2 text-sm font-semibold bg-zinc-900 text-white rounded-lg active:scale-95 disabled:opacity-50 transition-all">
            {isSaving ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
        </div>
      </div>
    </div>
  );
}
