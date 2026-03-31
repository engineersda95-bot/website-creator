'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import {
  Plus, Globe, Clock, FileText, X, Utensils, Briefcase, Rocket,
  Trash2, Eye, Scissors, Dumbbell, Store, Stethoscope, Hotel, Camera,
  Settings as SettingsIcon, Image as ImageIcon, Sparkles,
  ChevronRight, ChevronLeft, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/auth/UserMenu';
import { useEditorStore } from '@/store/useEditorStore';
import { getBlocksFromTemplate, TEMPLATES, TEMPLATE_SETTINGS, TEMPLATE_PAGES } from '@/lib/templates';
import { TemplateWireframe, TemplatePreviewModal } from '@/components/editor/TemplatePreview';
import { ProjectCard } from '@/components/editor/cards/ProjectCard';
import { ProjectQuickEditModal } from '@/components/editor/modals/ProjectQuickEditModal';
import { AIGeneratorModal } from '@/components/editor/modals/AIGeneratorModal';
import { confirm } from '@/components/shared/ConfirmDialog';

const FontLoader = React.memo(({ font }: { font: string }) => {
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,700&display=swap`;
  return <link rel="stylesheet" href={googleFontUrl} />;
});
FontLoader.displayName = 'FontLoader';

const TEMPLATE_OPTIONS = [
  { id: 'blank', name: 'Foglio bianco', desc: 'Parti da zero', icon: FileText, color: 'bg-zinc-100 text-zinc-500' },
  { id: 'RISTORANTE', name: 'Ristorante', desc: 'Menu, recensioni, prenotazioni', icon: Utensils, color: 'bg-orange-50 text-orange-600' },
  { id: 'PROFESSIONISTA', name: 'Professionista', desc: 'Servizi, competenze, contatti', icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
  { id: 'landing', name: 'Agenzia & Startup', desc: 'Landing con CTA e portfolio', icon: Rocket, color: 'bg-violet-50 text-violet-600' },
  { id: 'SALONE', name: 'Salone & Estetica', desc: 'Trattamenti, listino, prenotazioni', icon: Scissors, color: 'bg-pink-50 text-pink-600' },
  { id: 'PALESTRA', name: 'Palestra & Fitness', desc: 'Corsi, trainer, abbonamenti', icon: Dumbbell, color: 'bg-red-50 text-red-600' },
  { id: 'NEGOZIO', name: 'Negozio & Bottega', desc: 'Prodotti, storia, dove siamo', icon: Store, color: 'bg-emerald-50 text-emerald-600' },
  { id: 'MEDICO', name: 'Studio Medico', desc: 'Specializzazioni, team, prenotazioni', icon: Stethoscope, color: 'bg-sky-50 text-sky-600' },
  { id: 'HOTEL', name: 'Hotel & B&B', desc: 'Camere, servizi, prenotazioni', icon: Hotel, color: 'bg-amber-50 text-amber-600' },
  { id: 'FOTOGRAFO', name: 'Fotografo & Creativo', desc: 'Portfolio, servizi, contatti', icon: Camera, color: 'bg-zinc-100 text-zinc-700' },
];

import { BUSINESS_TYPES, LANGUAGES } from '@/lib/editor-constants';

export function ProjectListClient({
  initialUser,
  initialProjects,
}: {
  initialUser: any;
  initialProjects: any[];
}) {
  const router = useRouter();
  const { setUser, initialize } = useEditorStore();
  const [projects, setProjects] = useState(initialProjects);
  const [showCreate, setShowCreate] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');

  // Business Details State
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('LocalBusiness');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessCity, setBusinessCity] = useState('');
  const [businessZIP, setBusinessZIP] = useState('');
  const [businessCountry, setBusinessCountry] = useState('Italia');
  const [businessLanguages, setBusinessLanguages] = useState<string[]>(['it']);
  const [servesCuisine, setServesCuisine] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [createStep, setCreateStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialUser) setUser(initialUser);
    initialize();
  }, [initialUser, setUser, initialize]);

  const handleCreateProject = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);

    const projId = uuidv4();
    const subdomain = newName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + projId.substring(0, 6);

    let logoPath = '';
    if (logoFile) {
      const extension = logoFile.name.split('.').pop();
      const filename = `logo-${Date.now()}.${extension}`;
      const { data: uploadData } = await supabase.storage
        .from('project-assets')
        .upload(`${projId}/${filename}`, logoFile);
      
      if (uploadData) {
        // Construct the relative path that the editor and static generator expect
        logoPath = `/assets/${filename}`;
      }
    }

    const initialSettings = {
      ...(TEMPLATE_SETTINGS[selectedTemplate] || { fontFamily: 'Outfit', primaryColor: '#3b82f6', secondaryColor: '#10b981' }),
      businessType,
      businessDetails: {
        address: businessAddress,
        city: businessCity,
        postalCode: businessZIP,
        country: businessCountry,
        phone: businessPhone,
        email: businessEmail,
        businessName: businessName || newName.trim(),
        servesCuisine: businessType === 'Restaurant' ? servesCuisine : undefined
      },
      languages: businessLanguages,
      defaultLanguage: businessLanguages[0] || 'it',
      metaTitle: (businessName || newName.trim()),
      favicon: logoPath || undefined,
      metaImage: logoPath || undefined,
      logo: logoPath || undefined
    };

    const { data: newProj } = await supabase
      .from('projects')
      .insert({
        id: projId,
        user_id: initialUser.id,
        name: newName.trim(),
        subdomain,
        settings: initialSettings,
      })
      .select()
      .single();

    if (newProj) {
      // Create home page with template blocks
      const templateBlocks = selectedTemplate !== 'blank' && selectedTemplate in TEMPLATES
        ? getBlocksFromTemplate(selectedTemplate as keyof typeof TEMPLATES)
        : [];

      const pagesToInsert = [
        { id: uuidv4(), project_id: projId, title: 'Home', slug: 'home', blocks: templateBlocks },
      ];

      // Add extra pages from template
      const extraPages = TEMPLATE_PAGES[selectedTemplate];
      if (extraPages) {
        for (const ep of extraPages) {
          pagesToInsert.push({
            id: uuidv4(),
            project_id: projId,
            title: ep.title,
            slug: ep.slug,
            blocks: ep.blocks.map((b: any) => ({ ...b, id: uuidv4() })),
          });
        }
      }

      await supabase.from('pages').insert(pagesToInsert);

      setProjects([newProj, ...projects]);
      setShowCreate(false);
      setNewName('');
      router.push(`/editor/${projId}`);
    }

    setIsCreating(false);
  };

  const handleCreateProjectFromAI = async (aiData: any) => {
    setIsCreating(true);
    setShowAIGenerator(false);

    const projId = uuidv4();
    const cleanBusinessName = (aiData.businessName || 'Nuovo Sito IA').trim();
    // Subdomain from business name
    const subdomain = cleanBusinessName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + projId.substring(0, 6);

    const { data: newProj, error: pError } = await supabase
      .from('projects')
      .insert({
        id: projId,
        user_id: initialUser.id,
        name: cleanBusinessName,
        subdomain,
        settings: aiData.settings,
      })
      .select()
      .single();

    if (pError) {
      console.error('[AI Create] Project error:', pError);
      setIsCreating(false);
      return;
    }

    if (newProj) {
      const pagesToInsert = aiData.pages.map((p: any) => ({
        id: p.id || uuidv4(),
        project_id: projId,
        title: p.slug === 'home' ? 'Home' : p.title,
        slug: p.slug,
        blocks: p.blocks,
        seo: {
          title: p.seo?.title || `${p.title} — ${aiData.businessName}`,
          description: p.seo?.description || `${p.title} di ${aiData.businessName}`,
        },
        language: aiData.language || 'it',
      }));

      const { error: pgError } = await supabase.from('pages').insert(pagesToInsert);
      if (pgError) console.error('[AI Create] Pages error:', pgError);

      setProjects([newProj, ...projects]);
      setShowCreate(false);
      router.push(`/editor/${projId}`);
    }

    setIsCreating(false);
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return ''; }
  };

  return (
    <div className="min-h-screen bg-zinc-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <FontLoader font="DM Sans" />
      {/* Header */}
      <header className="bg-white border-b border-zinc-200/80 sticky top-0 z-10">
        <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
                <span className="text-white font-black text-[10px]">SV</span>
              </div>
              <span className="text-sm font-bold text-zinc-900">SitiVetrina</span>
            </Link>
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-10">
        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">I miei siti</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {projects.length === 0 ? 'Crea il tuo primo sito per iniziare' : `${projects.length} ${projects.length === 1 ? 'sito' : 'siti'}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAIGenerator(true)}
              className="group flex items-center gap-2.5 px-6 py-2.5 text-sm font-black bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-950 text-white rounded-xl hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all active:scale-[0.97] border border-zinc-800 shadow-xl"
            >
              <div className="relative">
                <Sparkles size={16} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
                <div className="absolute inset-0 bg-indigo-400/20 blur-md rounded-full animate-pulse" />
              </div>
              Crea con IA
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-white text-zinc-900 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all active:scale-[0.97] shadow-sm"
            >
              <Plus size={16} />
              Nuovo sito
            </button>
          </div>
        </div>

        {/* Create project modal — Stepped wizard */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowCreate(false); setCreateStep(0); }} />
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
              {/* Header with step indicator */}
              <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-100">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-zinc-900">Crea nuovo sito</h2>
                  <div className="flex items-center gap-1.5">
                    {['Template', 'Progetto', 'Attività'].map((label, i) => (
                      <div key={label} className="flex items-center gap-1.5">
                        {i > 0 && <div className={cn("w-4 h-px", i <= createStep ? "bg-zinc-900" : "bg-zinc-200")} />}
                        <div className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                          i < createStep ? "bg-emerald-50 text-emerald-600" :
                          i === createStep ? "bg-zinc-900 text-white" :
                          "bg-zinc-100 text-zinc-400"
                        )}>
                          {i < createStep ? <Check size={10} /> : <span>{i + 1}</span>}
                          <span className="hidden sm:inline">{label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => { setShowCreate(false); setCreateStep(0); }} className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {/* Step 0: Template */}
                {createStep === 0 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Punto di partenza</label>

                    {/* AI Card */}
                    <button
                      type="button"
                      onClick={() => { setShowCreate(false); setCreateStep(0); setShowAIGenerator(true); }}
                      className="group w-full relative p-4 rounded-xl border-2 border-transparent bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-950 text-left overflow-hidden transition-all hover:shadow-[0_0_24px_rgba(79,70,229,0.25)] hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(99,102,241,0.15),transparent_60%)]" />
                      <div className="relative flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center shrink-0">
                          <div className="relative">
                            <Sparkles size={18} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
                            <div className="absolute inset-0 bg-indigo-400/30 blur-md rounded-full animate-pulse" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-black text-white">Crea con Intelligenza Artificiale</div>
                          <div className="text-[11px] text-zinc-400">Descrivi la tua attività e l'IA genera il sito completo in pochi secondi</div>
                        </div>
                        <ChevronRight size={16} className="text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-auto" />
                      </div>
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-zinc-100" />
                      <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">oppure scegli un template</span>
                      <div className="h-px flex-1 bg-zinc-100" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {TEMPLATE_OPTIONS.map((t) => (
                        <div
                          key={t.id}
                          className={cn(
                            "group relative p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3",
                            selectedTemplate === t.id
                              ? "border-zinc-900 bg-zinc-50 shadow-sm"
                              : "border-zinc-100 hover:border-zinc-300"
                          )}
                          onClick={() => setSelectedTemplate(t.id)}
                        >
                          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm", t.color)}>
                            <t.icon size={16} />
                          </div>
                          <div className="min-w-0 pr-6">
                            <div className={cn("text-[13px] font-bold truncate", t.id === 'ai' ? "text-white" : "text-zinc-900")}>{t.name}</div>
                            <div className={cn("text-[10px] truncate tracking-tight", t.id === 'ai' ? "text-zinc-400" : "text-zinc-400")}>{t.desc}</div>
                          </div>
                          {t.id !== 'blank' && t.id !== 'ai' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setPreviewTemplateId(t.id); }}
                              className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1 px-2 py-1 bg-zinc-100 hover:bg-blue-50 border border-zinc-200 hover:border-blue-200 rounded-lg text-[10px] font-semibold text-zinc-500 hover:text-blue-600 transition-all"
                            >
                              <Eye size={11} />
                              Preview
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1: Nome + Lingue */}
                {createStep === 1 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-200">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Nome del Progetto</label>
                      <input
                        className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all placeholder:text-zinc-300"
                        placeholder="Es. Progetto Pizzeria"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Lingue Supportate</label>
                      <div className="flex flex-wrap gap-2">
                        {LANGUAGES.map((l) => {
                          const isSelected = businessLanguages.includes(l.value);
                          return (
                            <button
                              key={l.value}
                              onClick={() => {
                                if (isSelected && businessLanguages.length > 1) {
                                  setBusinessLanguages(businessLanguages.filter(lang => lang !== l.value));
                                } else if (!isSelected) {
                                  setBusinessLanguages([...businessLanguages, l.value]);
                                }
                              }}
                              className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all",
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
                      <p className="text-[10px] text-zinc-400 font-medium italic">
                        La prima lingua selezionata sarà quella predefinita.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2: Business Details */}
                {createStep === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Dati Attività (Consigliato)</label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <input
                          className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all"
                          placeholder="Nome Pubblico Azienda"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="space-y-1.5">
                        <select
                          className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all"
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                        >
                          {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1">
                      {businessType === 'Restaurant' && (
                        <div className="space-y-1.5 animation-in slide-in-from-top-1 duration-200">
                          <input
                            className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all"
                            placeholder="Tipo di Cucina (es: Pizza, Mediterranea)"
                            value={servesCuisine}
                            onChange={(e) => setServesCuisine(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <input
                        className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all"
                        placeholder="Via e Numero"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-3">
                         <input
                          className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all"
                          placeholder="Città"
                          value={businessCity}
                          onChange={(e) => setBusinessCity(e.target.value)}
                        />
                        <input
                          className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all"
                          placeholder="CAP"
                          value={businessZIP}
                          onChange={(e) => setBusinessZIP(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <input
                        className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all"
                        placeholder="Paese"
                        value={businessCountry}
                        onChange={(e) => setBusinessCountry(e.target.value)}
                      />
                      <input
                        className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all"
                        placeholder="Email"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                      />
                      <input
                        className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all"
                        placeholder="Telefono"
                        value={businessPhone}
                        onChange={(e) => setBusinessPhone(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                      <div className="relative group/logo w-16 h-16 rounded-lg bg-white border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {logoPreview ? (
                          <img src={logoPreview} className="w-full h-full object-contain" alt="Logo preview" />
                        ) : (
                          <ImageIcon className="text-zinc-200" size={24} />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setLogoFile(file);
                              setLogoPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-bold text-zinc-900">Logo aziendale</div>
                        <div className="text-[10px] text-zinc-400">Clicca per caricare</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with navigation */}
              <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between bg-white">
                <div>
                  {createStep > 0 ? (
                    <button
                      onClick={() => setCreateStep(createStep - 1)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
                    >
                      <ChevronLeft size={14} />
                      Indietro
                    </button>
                  ) : (
                    <button
                      onClick={() => { setShowCreate(false); setCreateStep(0); }}
                      className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
                    >
                      Annulla
                    </button>
                  )}
                </div>
                <div>
                  {createStep < 2 ? (
                    <button
                      onClick={() => setCreateStep(createStep + 1)}
                      disabled={createStep === 1 && !newName.trim()}
                      className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all disabled:opacity-50"
                    >
                      Avanti
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateProject}
                      disabled={!newName.trim() || isCreating}
                      className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all disabled:opacity-50"
                    >
                      {isCreating ? 'Creazione...' : 'Crea sito'}
                      {!isCreating && <Check size={14} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects grid */}
        {projects.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 mx-auto bg-zinc-100 rounded-2xl flex items-center justify-center mb-5">
              <Globe size={28} className="text-zinc-300" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-800 mb-2">Nessun sito ancora</h3>
            <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
              Crea il tuo primo sito web in pochi minuti. Scegli un template o parti da zero.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all"
            >
              <Plus size={16} />
              Crea il tuo primo sito
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {projects.map((proj) => (
              <ProjectCard
                key={proj.id}
                project={proj}
                formatDate={formatDate}
                onEdit={(id) => setEditingProjectId(id)}
                isDeleting={deletingId === proj.id}
                onDelete={async (id, name) => {
                  if (!await confirm({ title: 'Elimina sito', message: `Vuoi eliminare "${name}"? Tutti i dati verranno persi.`, confirmLabel: 'Elimina', variant: 'danger' })) return;
                  setDeletingId(id);
                  await supabase.from('pages').delete().eq('project_id', id);
                  await supabase.from('projects').delete().eq('id', id);
                  setProjects(projects.filter(p => p.id !== id));
                  setDeletingId(null);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Template live preview modal */}
      {previewTemplateId && (
        <TemplatePreviewModal
          templateId={previewTemplateId}
          templateName={TEMPLATE_OPTIONS.find(t => t.id === previewTemplateId)?.name || ''}
          onClose={() => setPreviewTemplateId(null)}
        />
      )}

        {/* Quick Edit Modal */}
        {editingProjectId && (
          <ProjectQuickEditModal
            projectId={editingProjectId}
            project={projects.find(p => p.id === editingProjectId)}
            onClose={() => setEditingProjectId(null)}
            onSave={(updatedProj: any) => {
              setProjects(projects.map(p => p.id === updatedProj.id ? updatedProj : p));
              setEditingProjectId(null);
            }}
          />
        )}

        {/* AI Generator Modal */}
        {showAIGenerator && (
          <AIGeneratorModal
            user={initialUser}
            onClose={() => setShowAIGenerator(false)}
            onSuccess={handleCreateProjectFromAI}
          />
        )}
    </div>
  );
}
