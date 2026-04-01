/**
 * cleanup-storage — Supabase Edge Function
 *
 * Pulizia settimanale degli asset orfani nel bucket 'project-assets'.
 *
 * Cosa fa:
 *  1. Per ogni utente/progetto attivo: trova i file nello storage e rimuove
 *     quelli non referenziati in nessuna pagina né nei global settings del progetto.
 *  2. Cancella tutti i file rimasti in ai-temp/ (zombie da generazioni abbandonate).
 *
 * Come deployare (quando pronto):
 *   supabase functions deploy cleanup-storage --no-verify-jwt
 *
 * Come schedulare (Supabase Dashboard > Edge Functions > cleanup-storage > Cron):
 *   0 3 * * 1   (ogni lunedì alle 03:00 UTC)
 *
 * Oppure via SQL:
 *   select cron.schedule('cleanup-storage', '0 3 * * 1',
 *     $$select net.http_post(
 *       url := 'https://<project-ref>.supabase.co/functions/v1/cleanup-storage',
 *       headers := '{"Authorization": "Bearer <service-role-key>"}'::jsonb
 *     )$$
 *   );
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BUCKET = 'project-assets';
const AI_TEMP_PREFIX = 'ai-temp';
// Conserva i file ai-temp più recenti di questa soglia (sicurezza extra)
const AI_TEMP_TTL_MS = 60 * 60 * 1000; // 1 ora

Deno.serve(async (req: Request) => {
  // Accetta solo POST (dal cron o da chiamata manuale autenticata)
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // service role per leggere tutti i dati
  );

  const report = {
    projects_scanned: 0,
    files_removed: 0,
    ai_temp_removed: 0,
    errors: [] as string[],
  };

  // ── 1. PULIZIA ASSET ORFANI PER PROGETTO ────────────────────────────────

  // Carica tutti i progetti con le loro settings
  const { data: projects, error: projErr } = await supabase
    .from('projects')
    .select('id, user_id, settings');

  if (projErr) {
    return new Response(JSON.stringify({ error: projErr.message }), { status: 500 });
  }

  for (const project of projects ?? []) {
    try {
      report.projects_scanned++;

      const prefix = `${project.user_id}/${project.id}`;

      // Lista file nello storage per questo progetto
      const { data: storageFiles, error: listErr } = await supabase.storage
        .from(BUCKET)
        .list(prefix);

      if (listErr || !storageFiles?.length) continue;

      // Carica tutte le pagine del progetto
      const { data: pages } = await supabase
        .from('pages')
        .select('blocks, seo')
        .eq('project_id', project.id);

      // Serializza tutto il contenuto referenziabile in un'unica stringa
      // per fare una semplice ricerca per sottostringa del filename
      const allContent = JSON.stringify({
        pages: pages ?? [],
        settings: project.settings ?? {},
      });

      const toDelete: string[] = [];

      for (const file of storageFiles) {
        // Se il filename non appare da nessuna parte nel contenuto → orfano
        if (!allContent.includes(file.name)) {
          toDelete.push(`${prefix}/${file.name}`);
        }
      }

      if (toDelete.length > 0) {
        const { error: removeErr } = await supabase.storage
          .from(BUCKET)
          .remove(toDelete);

        if (removeErr) {
          report.errors.push(`[${project.id}] remove error: ${removeErr.message}`);
        } else {
          report.files_removed += toDelete.length;
        }
      }
    } catch (e: any) {
      report.errors.push(`[${project.id}] unexpected: ${e?.message}`);
    }
  }

  // ── 2. PULIZIA AI-TEMP ZOMBIE ────────────────────────────────────────────

  try {
    // Lista tutte le cartelle utente dentro ai-temp/
    const { data: userFolders } = await supabase.storage
      .from(BUCKET)
      .list(AI_TEMP_PREFIX);

    for (const folder of userFolders ?? []) {
      const folderPath = `${AI_TEMP_PREFIX}/${folder.name}`;

      const { data: tempFiles } = await supabase.storage
        .from(BUCKET)
        .list(folderPath);

      if (!tempFiles?.length) continue;

      const now = Date.now();
      const toDelete = tempFiles
        .filter(f => {
          if (!f.created_at) return true; // senza data → elimina
          return now - new Date(f.created_at).getTime() > AI_TEMP_TTL_MS;
        })
        .map(f => `${folderPath}/${f.name}`);

      if (toDelete.length > 0) {
        const { error: removeErr } = await supabase.storage
          .from(BUCKET)
          .remove(toDelete);

        if (removeErr) {
          report.errors.push(`[ai-temp/${folder.name}] remove error: ${removeErr.message}`);
        } else {
          report.ai_temp_removed += toDelete.length;
        }
      }
    }
  } catch (e: any) {
    report.errors.push(`[ai-temp] unexpected: ${e?.message}`);
  }

  // ── RISPOSTA ─────────────────────────────────────────────────────────────

  console.log('[cleanup-storage]', JSON.stringify(report));

  return new Response(JSON.stringify(report), {
    headers: { 'Content-Type': 'application/json' },
  });
});
