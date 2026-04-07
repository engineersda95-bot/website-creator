'use server';

import { createClient } from '@/lib/supabase/server';
import { canCreateProject } from '@/lib/permissions';

interface PageInput {
  id: string;
  title: string;
  slug: string;
  blocks: any[];
  seo?: any;
  language?: string;
}

interface CreateProjectInput {
  projectId: string;
  name: string;
  subdomain: string;
  settings: any;
  initialPages: PageInput[];
}

export async function createProject(
  input: CreateProjectInput
): Promise<{ success: boolean; project?: any; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Non autenticato' };

  const check = await canCreateProject(user.id);
  if (!check.allowed) return { success: false, error: check.reason };

  const { data: project, error: projError } = await supabase
    .from('projects')
    .insert({
      id: input.projectId,
      user_id: user.id, // sempre dal JWT, mai dal client
      name: input.name,
      subdomain: input.subdomain,
      settings: input.settings,
    })
    .select()
    .single();

  if (projError || !project) {
    return { success: false, error: projError?.message || 'Errore durante la creazione del sito' };
  }

  if (input.initialPages.length > 0) {
    const defaultLang = (input.settings as any)?.defaultLanguage || 'it';

    // Extract nav/footer from the first page that has them and save to site_globals
    const globalsToInsert: any[] = [];
    for (const page of input.initialPages) {
      const lang = page.language || defaultLang;
      const navBlock = page.blocks?.find((b: any) => b.type === 'navigation');
      const footerBlock = page.blocks?.find((b: any) => b.type === 'footer');
      if (navBlock && !globalsToInsert.some(g => g.language === lang && g.type === 'navigation')) {
        globalsToInsert.push({ project_id: input.projectId, language: lang, type: 'navigation', content: navBlock.content ?? {}, style: navBlock.style ?? {} });
      }
      if (footerBlock && !globalsToInsert.some(g => g.language === lang && g.type === 'footer')) {
        globalsToInsert.push({ project_id: input.projectId, language: lang, type: 'footer', content: footerBlock.content ?? {}, style: footerBlock.style ?? {} });
      }
    }
    if (globalsToInsert.length > 0) {
      const { error: globalsError } = await supabase.from('site_globals').insert(globalsToInsert);
      if (globalsError) console.error('[createProject] site_globals error:', globalsError);
    }

    // Strip nav/footer from page blocks before inserting
    const { error: pagesError } = await supabase.from('pages').insert(
      input.initialPages.map((p) => ({
        ...p,
        project_id: input.projectId,
        blocks: (p.blocks ?? []).filter((b: any) => b.type !== 'navigation' && b.type !== 'footer'),
      }))
    );
    if (pagesError) console.error('[createProject] Pages error:', pagesError);
  }

  return { success: true, project };
}
