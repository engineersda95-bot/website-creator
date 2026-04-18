'use server';

import { createClient } from '@/lib/supabase/server';
import { canUseAI } from '@/lib/permissions';
import {
  generateHtmlBlock as generateHtmlBlockCore,
  type GenerateHtmlBlockInput,
  type GenerateHtmlBlockResult,
} from '@/lib/ai/html-block';

export async function generateHtmlBlock(
  input: GenerateHtmlBlockInput,
): Promise<{ success: true; data: GenerateHtmlBlockResult } | { success: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autenticato.' };

  const aiCheck = await canUseAI(user.id);
  if (!aiCheck.allowed) return { success: false, error: aiCheck.reason ?? 'Crediti AI esauriti.' };

  try {
    const result = await generateHtmlBlockCore(input);

    if (typeof result.html !== 'string')
      return { success: false, error: 'Risposta AI non valida.' };

    await supabase.rpc('increment_ai_usage', { p_user_id: user.id });

    return {
      success: true,
      data: {
        html: result.html ?? '',
        css: result.css ?? '',
        js: result.js ?? '',
      },
    };
  } catch (err: any) {
    console.error('[AI HTML Block]', err);
    return { success: false, error: err.message || 'Errore durante la generazione AI.' };
  }
}
