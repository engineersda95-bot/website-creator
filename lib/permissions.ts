import { createClient } from '@/lib/supabase/server';

export interface UserLimits {
  plan_id: string;
  max_projects: number | null;
  max_pages_per_project: number | null;
  max_storage_mb: number | null;
  max_ai_per_month: number | null;
  max_articles_per_project: number | null;
  can_custom_domain: boolean;
  can_custom_scripts: boolean;
  can_multilang: boolean;
  can_remove_branding: boolean;
  storage_used_bytes: number;
  ai_used_this_month: number;
}

export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
}

export async function getUserLimits(userId: string): Promise<UserLimits | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_user_limits', { p_user_id: userId });
  if (error || !data?.length) return null;
  return data[0] as UserLimits;
}

export async function canCreateProject(userId: string): Promise<PermissionCheck> {
  const supabase = await createClient();
  const limits = await getUserLimits(userId);
  if (!limits) return { allowed: false, reason: 'Profilo non trovato' };

  if (limits.max_projects === null) return { allowed: true };

  const { count } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if ((count ?? 0) >= limits.max_projects) {
    return {
      allowed: false,
      reason: `Hai raggiunto il limite di ${limits.max_projects} ${limits.max_projects === 1 ? 'sito' : 'siti'} per il tuo piano`,
    };
  }

  return { allowed: true };
}

export async function canCreatePage(userId: string, projectId: string): Promise<PermissionCheck> {
  const supabase = await createClient();
  const limits = await getUserLimits(userId);
  if (!limits) return { allowed: false, reason: 'Profilo non trovato' };

  if (limits.max_pages_per_project === null) return { allowed: true };

  const { count } = await supabase
    .from('pages')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId);

  if ((count ?? 0) >= limits.max_pages_per_project) {
    return {
      allowed: false,
      reason: `Hai raggiunto il limite di ${limits.max_pages_per_project} pagine per sito`,
    };
  }

  return { allowed: true };
}

export async function canCreateArticle(userId: string, projectId: string): Promise<PermissionCheck> {
  const supabase = await createClient();
  const limits = await getUserLimits(userId);
  if (!limits) return { allowed: false, reason: 'Profilo non trovato' };

  if (limits.max_articles_per_project === null) return { allowed: true };

  const { count } = await supabase
    .from('blog_posts')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId);

  if ((count ?? 0) >= limits.max_articles_per_project) {
    return {
      allowed: false,
      reason: `Hai raggiunto il limite di ${limits.max_articles_per_project} articoli per sito`,
    };
  }

  return { allowed: true };
}

export async function canUseAI(userId: string): Promise<PermissionCheck> {
  const limits = await getUserLimits(userId);
  if (!limits) return { allowed: false, reason: 'Profilo non trovato' };

  if (limits.max_ai_per_month === null) return { allowed: true };

  if (limits.ai_used_this_month >= limits.max_ai_per_month) {
    return {
      allowed: false,
      reason: `Hai esaurito le ${limits.max_ai_per_month} generazioni AI disponibili questo mese`,
    };
  }

  return { allowed: true };
}
