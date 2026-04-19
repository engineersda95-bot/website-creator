import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/ai/text-to-image';
import { createClient } from '@/lib/supabase/server';
import { getUserLimits } from '@/lib/permissions';

export const runtime = 'nodejs';
export const maxDuration = 60;

const ALLOWED_RATIOS = new Set(['16:9', '4:3', '1:1', '9:16']);
const MAX_PROMPT_LENGTH = 300;
const CREDITS_COST = 2;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const limits = await getUserLimits(user.id);
  if (!limits) {
    return NextResponse.json({ error: 'Profilo non trovato' }, { status: 403 });
  }
  if (limits.max_ai_per_month !== null && limits.max_ai_per_month - limits.ai_used_this_month < CREDITS_COST) {
    return NextResponse.json({ error: 'Crediti insufficienti' }, { status: 403 });
  }

  const { prompt, aspectRatio } = await request.json();
  const trimmed = typeof prompt === 'string' ? prompt.trim() : '';
  if (!trimmed) {
    return NextResponse.json({ error: 'Prompt mancante' }, { status: 400 });
  }
  if (trimmed.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ error: `Prompt troppo lungo (max ${MAX_PROMPT_LENGTH} caratteri)` }, { status: 400 });
  }
  const ratio = ALLOWED_RATIOS.has(aspectRatio) ? aspectRatio : '16:9';

  let result;
  try {
    result = await generateImage(trimmed, ratio);
  } catch {
    return NextResponse.json({ error: 'Servizio di generazione immagini temporaneamente non disponibile, riprova tra qualche minuto' }, { status: 503 });
  }
  const cleanData = result.data.replace(/\s/g, '');

  await supabase.rpc('increment_ai_usage', { p_user_id: user.id });
  await supabase.rpc('increment_ai_usage', { p_user_id: user.id });

  return NextResponse.json({ data: cleanData, mimeType: result.mimeType });
}
