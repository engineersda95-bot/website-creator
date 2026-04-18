'use server';

import { createClient } from '@/lib/supabase/server';
import { canUseAI } from '@/lib/permissions';
import {
  improveText,
  translateBlogPost,
  type ImproveTextInput,
  type TranslateBlogInput,
  type AITextAction,
  type AITextTone,
} from '@/lib/ai/blog';

export async function improveTextWithAI(
  input: ImproveTextInput,
): Promise<{ result: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non autenticato');

  const aiCheck = await canUseAI(user.id);
  if (!aiCheck.allowed) throw new Error(aiCheck.reason);

  const result = await improveText(input);
  await supabase.rpc('increment_ai_usage', { p_user_id: user.id });
  return { result };
}

export async function translateBlogPostWithAI(
  input: TranslateBlogInput,
): Promise<{ title: string; excerpt: string; body: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non autenticato');

  const aiCheck = await canUseAI(user.id);
  if (!aiCheck.allowed) throw new Error(aiCheck.reason);

  const result = await translateBlogPost(input);
  await supabase.rpc('increment_ai_usage', { p_user_id: user.id });
  return result;
}
