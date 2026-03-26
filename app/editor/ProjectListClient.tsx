'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import {
  Plus, Globe, Clock, FileText, X, Utensils, Briefcase, Rocket,
  Trash2, Eye, Scissors, Dumbbell, Store, Stethoscope, Hotel, Camera,
  Settings as SettingsIcon, Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/auth/UserMenu';
import { useEditorStore } from '@/store/useEditorStore';
import { getBlocksFromTemplate, TEMPLATES, TEMPLATE_SETTINGS, TEMPLATE_PAGES } from '@/lib/templates';
import { TemplateWireframe, TemplatePreviewModal } from '@/components/editor/TemplatePreview';

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
  const [businessLanguage, setBusinessLanguage] = useState('it');
  const [servesCuisine, setServesCuisine] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
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
      language: businessLanguage,
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

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return ''; }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
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
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all active:scale-[0.97]"
          >
            <Plus size={16} />
            Nuovo sito
          </button>
        </div>

        {/* Create project modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
              <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-100">
                <h2 className="text-lg font-bold text-zinc-900">Crea nuovo sito</h2>
                <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {/* Nome Sito & Template Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Punto di partenza</label>
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
                            <div className="text-[13px] font-bold text-zinc-900 truncate">{t.name}</div>
                            <div className="text-[10px] text-zinc-400 truncate tracking-tight">{t.desc}</div>
                          </div>
                          {t.id !== 'blank' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setPreviewTemplateId(t.id); }}
                              className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 bg-white border border-zinc-100 rounded-lg text-zinc-400 hover:text-blue-500 hover:border-blue-100 transition-all opacity-0 group-hover:opacity-100"
                              title="Anteprima"
                            >
                              <Eye size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Nome del Progetto</label>
                      <input
                        className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all placeholder:text-zinc-300"
                        placeholder="Es. Progetto Pizzeria"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Lingua Sito</label>
                      <select
                        className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all"
                        value={businessLanguage}
                        onChange={(e) => setBusinessLanguage(e.target.value)}
                      >
                        {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-zinc-100" />

                {/* Business Details Section */}
                <div className="space-y-4">
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

                  <div className="grid grid-cols-3 gap-3 pb-2">
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

              <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-2 bg-white">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!newName.trim() || isCreating}
                  className="px-5 py-2 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all disabled:opacity-50"
                >
                  {isCreating ? 'Creazione...' : 'Crea sito'}
                </button>
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
              <div
                key={proj.id}
                className="group relative bg-white border border-zinc-200 rounded-xl overflow-hidden hover:shadow-md hover:border-zinc-300 transition-all"
              >
                <Link href={`/editor/${proj.id}`} className="block">
                  <div className="h-32 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
                    <Globe size={28} className="text-zinc-200" />
                  </div>
                  <div className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                        {proj.name}
                      </h3>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        proj.live_url ? "bg-emerald-500" : "bg-zinc-300"
                      )} />
                    </div>
                    <p className="text-xs text-zinc-400 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Globe size={11} />
                        {proj.subdomain}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatDate(proj.created_at)}
                      </span>
                    </p>
                  </div>
                </Link>
                <div className="px-4 py-2.5 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingProjectId(proj.id)}
                      className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                      title="Impostazioni attività"
                    >
                      <SettingsIcon size={14} />
                    </button>
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm(`Vuoi eliminare "${proj.name}"? Tutti i dati verranno persi.`)) return;
                      await supabase.from('pages').delete().eq('project_id', proj.id);
                      await supabase.from('projects').delete().eq('id', proj.id);
                      setProjects(projects.filter(p => p.id !== proj.id));
                    }}
                    className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Elimina sito"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
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
        <QuickEditModal
          projectId={editingProjectId}
          project={projects.find(p => p.id === editingProjectId)}
          onClose={() => setEditingProjectId(null)}
          onSave={(updatedProj: any) => {
            setProjects(projects.map(p => p.id === updatedProj.id ? updatedProj : p));
            setEditingProjectId(null);
          }}
        />
      )}
    </div>
  );
}

function QuickEditModal({ projectId, project, onClose, onSave }: any) {
  const [name, setName] = useState(project.name);
  const [bName, setBName] = useState(project.settings?.businessDetails?.businessName || '');
  const [bType, setBType] = useState(project.settings?.businessType || 'LocalBusiness');
  const [email, setEmail] = useState(project.settings?.businessDetails?.email || '');
  const [phone, setPhone] = useState(project.settings?.businessDetails?.phone || '');
  const [address, setAddress] = useState(project.settings?.businessDetails?.address || '');
  const [city, setCity] = useState(project.settings?.businessDetails?.city || '');
  const [zip, setZip] = useState(project.settings?.businessDetails?.postalCode || '');
  const [country, setCountry] = useState(project.settings?.businessDetails?.country || 'Italia');
  const [lang, setLang] = useState(project.settings?.language || 'it');
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
      language: lang,
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
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Lingua</label>
              <select value={lang} onChange={e => setLang(e.target.value)} className="w-full px-3.5 py-2 border border-zinc-200 rounded-lg focus:border-zinc-400 outline-none text-sm">
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
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
