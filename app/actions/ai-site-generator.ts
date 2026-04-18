'use server';

import { createClient } from '@/lib/supabase/server';
import { canUseAI, canCreateProject } from '@/lib/permissions';
import { generateProject, validateDescription, type AIGenerationData } from '@/lib/ai/site-generator';

export async function generateProjectWithAI(
  data: AIGenerationData,
): Promise<{ success: true; projectId: string } | { success: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'User not authenticated' };

  const aiCheck = await canUseAI(user.id);
  if (!aiCheck.allowed) return { success: false, error: aiCheck.reason! };

  const projectCheck = await canCreateProject(user.id);
  if (!projectCheck.allowed) return { success: false, error: projectCheck.reason! };

  // Lazy cleanup: remove ai-temp files for this user older than 30 minutes
  try {
    const TTL_MS = 30 * 60 * 1000;
    const prefix = `${user.id}/ai-temp`;
    const { data: staleFiles } = await supabase.storage.from('project-assets').list(prefix);
    if (staleFiles?.length) {
      const toDelete = staleFiles
        .filter(f => f.created_at && Date.now() - new Date(f.created_at).getTime() > TTL_MS)
        .map(f => `${prefix}/${f.name}`);
      if (toDelete.length > 0) await supabase.storage.from('project-assets').remove(toDelete);
    }
  } catch { /* best-effort */ }

  try {
    const result = await generateProject(data, user.id, supabase);
    if (!result.success) return result;

    const {
      projId,
      subdomain,
      cleanBusinessName,
      finalSettings,
      pagesToInsert,
      globalsToInsert,
      aiImageCount,
      logoStoragePath,
      logoOldUrl,
      logoNewRelativePath,
    } = result;

    // Logo migration: move from ai-temp to project folder server-side
    let processedSettings = finalSettings;
    let processedPages = pagesToInsert;

    if (logoStoragePath && logoOldUrl && logoNewRelativePath) {
      const logoFilename = logoStoragePath.split('/').pop() as string;
      const destPath = `${user.id}/${projId}/${logoFilename}`;
      const { error: moveError } = await supabase.storage
        .from('project-assets')
        .move(logoStoragePath, destPath);
      if (!moveError) {
        const serialized = JSON.stringify({ settings: finalSettings, pages: pagesToInsert })
          .replaceAll(logoOldUrl, logoNewRelativePath);
        const parsed = JSON.parse(serialized);
        processedSettings = parsed.settings;
        processedPages = parsed.pages;
      }
    }

    // Screenshot cleanup (fire and forget)
    if (data.screenshotStoragePaths?.length) {
      supabase.storage.from('project-assets').remove(data.screenshotStoragePaths).catch(() => {});
    }

    // Save project
    const { error: projError } = await supabase.from('projects').insert({
      id: projId,
      user_id: user.id,
      name: cleanBusinessName,
      subdomain,
      settings: processedSettings,
    });
    if (projError) throw new Error(projError.message);

    if (globalsToInsert.length > 0) {
      await supabase.from('site_globals').insert(globalsToInsert);
    }

    if (processedPages.length > 0) {
      const { error: pagesError } = await supabase.from('pages').insert(processedPages);
      if (pagesError) console.error('[AI Generator] Pages insert error:', pagesError);
    }

    // Increment credits: 1 base + 2 per AI-generated image
    await supabase.rpc('increment_ai_usage', { p_user_id: user.id });
    for (let i = 0; i < aiImageCount * 2; i++) {
      await supabase.rpc('increment_ai_usage', { p_user_id: user.id });
    }

    return { success: true, projectId: projId };
  } catch (error: any) {
    console.error('[AI Generator] Error:', error);
    return { success: false, error: error.message || 'Errore durante la generazione con IA.' };
  }
}

export async function validateProjectDescription(
  data: Parameters<typeof validateDescription>[0],
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isReady: false, questions: [], error: 'Non autenticato' };

  const aiCheck = await canUseAI(user.id);
  if (!aiCheck.allowed) return { isReady: false, questions: [], error: aiCheck.reason };

  try {
    const result = await validateDescription(data);
    await supabase.rpc('increment_ai_usage', { p_user_id: user.id });
    return result;
  } catch (error: any) {
    console.error('[AI Validation] Error:', error);
    const status = error?.status || error?.response?.status;
    if (status === 401)
      throw new Error('Servizio IA non disponibile. Controlla la configurazione API.');
    return { isReady: true, questions: [] };
  }
}
