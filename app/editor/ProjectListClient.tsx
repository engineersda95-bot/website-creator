'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import {
  Plus, Globe, ExternalLink, Clock, FileText, X,
  Layout, Utensils, Briefcase, Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProjectDomain } from '@/lib/url-utils';
import { UserMenu } from '@/components/auth/UserMenu';
import { useEditorStore } from '@/store/useEditorStore';

const TEMPLATES = [
  { id: 'blank', name: 'Foglio bianco', desc: 'Parti da zero con una pagina vuota', icon: FileText, color: 'bg-zinc-100 text-zinc-500' },
  { id: 'RISTORANTE', name: 'Ristorante', desc: 'Hero, menu, galleria e contatti', icon: Utensils, color: 'bg-orange-50 text-orange-600' },
  { id: 'PROFESSIONISTA', name: 'Professionista', desc: 'Servizi, chi siamo e contatti', icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
  { id: 'landing', name: 'Agenzia & Startup', desc: 'Landing completa con CTA', icon: Rocket, color: 'bg-violet-50 text-violet-600' },
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
        settings: { fontFamily: 'Outfit', primaryColor: '#3b82f6', secondaryColor: '#10b981' },
      })
      .select()
      .single();

    if (newProj) {
      // Create home page
      const pageId = uuidv4();
      await supabase.from('pages').insert({
        id: pageId,
        project_id: projId,
        title: 'Home',
        slug: 'home',
        blocks: [],
      });

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
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
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

      <main className="max-w-6xl mx-auto px-6 py-10">
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
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
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
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                          selectedTemplate === t.id
                            ? "border-zinc-900 bg-zinc-50"
                            : "border-zinc-100 hover:border-zinc-200"
                        )}
                      >
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", t.color)}>
                          <t.icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-zinc-900">{t.name}</div>
                          <div className="text-[11px] text-zinc-400 truncate">{t.desc}</div>
                        </div>
                      </button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => (
              <Link
                key={proj.id}
                href={`/editor/${proj.id}`}
                className="group bg-white border border-zinc-200 rounded-xl overflow-hidden hover:shadow-md hover:border-zinc-300 transition-all"
              >
                {/* Preview placeholder */}
                <div className="h-32 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
                  <Globe size={28} className="text-zinc-200" />
                </div>

                <div className="p-4">
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
