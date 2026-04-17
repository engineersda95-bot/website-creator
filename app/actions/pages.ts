'use server';

import { createClient } from '@/lib/supabase/server';
import { canCreatePage, getUserLimits } from '@/lib/permissions';
import { randomUUID } from 'crypto';

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

interface TranslatePageInput {
  sourcePageId: string;
  projectId: string;
  targetLanguage: string;
  title: string;
  slug: string;
}

export async function translatePage(
  input: TranslatePageInput
): Promise<{ success: boolean; page?: any; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Non autenticato' };

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', input.projectId)
    .eq('user_id', user.id)
    .single();

  if (!project) return { success: false, error: 'Sito non trovato o accesso negato' };

  const limits = await getUserLimits(user.id);
  if (!limits?.can_multilang) return { success: false, error: 'Il tuo piano non include il supporto multilingua' };

  const check = await canCreatePage(user.id, input.projectId);
  if (!check.allowed) return { success: false, error: check.reason };

  const { data: sourcePage } = await supabase
    .from('pages')
    .select('*')
    .eq('id', input.sourcePageId)
    .eq('project_id', input.projectId)
    .single();

  if (!sourcePage) return { success: false, error: 'Pagina sorgente non trovata' };

  // Assign translations_group_id if source page doesn't have one yet
  let groupId = sourcePage.translations_group_id;
  if (!groupId) {
    groupId = randomUUID();
    await supabase.from('pages').update({ translations_group_id: groupId }).eq('id', input.sourcePageId);
  }

  const { data: page, error } = await supabase
    .from('pages')
    .insert({
      id: randomUUID(),
      project_id: input.projectId,
      title: input.title,
      slug: input.slug,
      language: input.targetLanguage,
      blocks: sourcePage.blocks ?? [],
      seo: sourcePage.seo ?? null,
      translations_group_id: groupId,
    })
    .select()
    .single();

  if (error || !page) {
    if (error?.code === '23505') {
      return { success: false, error: 'Uno slug identico esiste già per questa lingua.' };
    }
    return { success: false, error: error?.message || 'Errore durante la traduzione della pagina' };
  }

  // Copy site_globals from source language to target language if none exist yet
  const sourceLang = sourcePage.language || 'it';
  if (sourceLang !== input.targetLanguage) {
    const { data: existingTargetGlobals } = await supabase
      .from('site_globals')
      .select('type')
      .eq('project_id', input.projectId)
      .eq('language', input.targetLanguage);

    const existingTypes = new Set((existingTargetGlobals || []).map((g: any) => g.type));
    const missingTypes = (['navigation', 'footer'] as const).filter(t => !existingTypes.has(t));

    if (missingTypes.length > 0) {
      const { data: sourceGlobals } = await supabase
        .from('site_globals')
        .select('*')
        .eq('project_id', input.projectId)
        .eq('language', sourceLang)
        .in('type', missingTypes);

      if (sourceGlobals?.length) {
        await supabase.from('site_globals').insert(
          sourceGlobals.map((g: any) => ({
            project_id: input.projectId,
            language: input.targetLanguage,
            type: g.type,
            content: g.content,
            style: g.style,
          }))
        );
      }
    }
  }

  // Also update the source page in the returned data so the caller can update its translations_group_id
  return { success: true, page, sourceGroupId: groupId } as any;
}
