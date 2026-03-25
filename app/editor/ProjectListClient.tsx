'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import {
  Plus, Globe, Clock, FileText, X, Utensils, Briefcase, Rocket,
  Trash2, Eye, Scissors, Dumbbell, Store, Stethoscope, Hotel, Camera
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
  const [isCreating, setIsCreating] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialUser) setUser(initialUser);
    initialize();
  }, [initialUser, setUser, initialize]);

  const handleCreateProject = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);

    const projId = uuidv4();
    const subdomain = newName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + projId.substring(0, 6);

    const { data: newProj } = await supabase
      .from('projects')
      .insert({
        id: projId,
        user_id: initialUser.id,
        name: newName.trim(),
        subdomain,
        settings: TEMPLATE_SETTINGS[selectedTemplate] || { fontFamily: 'Outfit', primaryColor: '#3b82f6', secondaryColor: '#10b981' },
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

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Nome del sito</label>
                  <input
                    autoFocus
                    className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-lg focus:border-zinc-400 outline-none transition-all"
                    placeholder="Es. La Mia Pizzeria"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Template iniziale</label>
                  <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                    {TEMPLATE_OPTIONS.map((t) => (
                      <div
                        key={t.id}
                        className={cn(
                          "rounded-xl border-2 transition-all overflow-hidden cursor-pointer",
                          selectedTemplate === t.id
                            ? "border-zinc-900 shadow-sm"
                            : "border-zinc-100 hover:border-zinc-300"
                        )}
                        onClick={() => setSelectedTemplate(t.id)}
                      >
                        {/* Wireframe preview */}
                        <div className="h-28 bg-zinc-50 border-b border-zinc-100 relative group/card">
                          <TemplateWireframe templateId={t.id} />
                          {t.id !== 'blank' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setPreviewTemplateId(t.id); }}
                              className="absolute top-2 right-2 p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-all shadow-sm opacity-0 group-hover/card:opacity-100"
                              title="Anteprima completa"
                            >
                              <Eye size={13} />
                            </button>
                          )}
                        </div>
                        {/* Info */}
                        <div className="p-3 flex items-center gap-2.5">
                          <div className={cn("w-8 h-8 rounded-md flex items-center justify-center shrink-0", t.color)}>
                            <t.icon size={14} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-zinc-900">{t.name}</div>
                            <div className="text-[10px] text-zinc-400 truncate">{t.desc}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-2">
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
                <div className="px-4 py-2.5 border-t border-zinc-100 flex items-center justify-end">
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
    </div>
  );
}
