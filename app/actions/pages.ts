'use server';

import { createClient } from '@/lib/supabase/server';
import { canCreatePage } from '@/lib/permissions';

interface CreatePageInput {
  id: string;
  projectId: string;
  title: string;
  slug: string;
  language: string;
  blocks?: any[];
  seo?: any;
}

export async function createPage(
  input: CreatePageInput
): Promise<{ success: boolean; page?: any; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Non autenticato' };

  // Verifica che l'utente sia proprietario del progetto
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', input.projectId)
    .eq('user_id', user.id)
    .single();

  if (!project) return { success: false, error: 'Sito non trovato o accesso negato' };

  const check = await canCreatePage(user.id, input.projectId);
  if (!check.allowed) return { success: false, error: check.reason };

  const { data: page, error } = await supabase
    .from('pages')
    .insert({
      id: input.id,
      project_id: input.projectId,
      title: input.title,
      slug: input.slug,
      language: input.language,
      blocks: input.blocks ?? [],
      seo: input.seo,
    })
    .select()
    .single();

  if (error || !page) {
    if (error?.code === '23505') {
      return { success: false, error: 'Uno slug identico esiste già per questa lingua.' };
    }
    return { success: false, error: error?.message || 'Errore durante la creazione della pagina' };
  }

  return { success: true, page };
}
