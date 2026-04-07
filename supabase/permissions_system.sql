-- ============================================================
-- PERMISSIONS SYSTEM
-- Run this migration on Supabase SQL editor
-- ============================================================

-- 1. Tabella piani
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  -- Limiti quantitativi (NULL = illimitato)
  max_projects INTEGER,
  max_pages_per_project INTEGER,
  max_storage_mb INTEGER,
  max_ai_per_month INTEGER,
  max_articles_per_project INTEGER,  -- NULL = illimitato
  -- Feature flags
  can_custom_domain BOOLEAN NOT NULL DEFAULT false,
  can_custom_scripts BOOLEAN NOT NULL DEFAULT false,
  can_multilang BOOLEAN NOT NULL DEFAULT false,
  can_remove_branding BOOLEAN NOT NULL DEFAULT false,
  -- Ordinamento UI
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Piani di default
INSERT INTO public.plans
  (id, name, description, max_projects, max_pages_per_project, max_storage_mb, max_ai_per_month, max_articles_per_project,
   can_custom_domain, can_custom_scripts, can_multilang, can_remove_branding, sort_order)
VALUES
  ('free',    'Free',    'Piano gratuito',        1,    3,    50,    3,   10,   false, false, false, false, 0),
  ('starter', 'Starter', 'Per piccoli business',  3,    7,    500,   15,  50,   true,  false, false, false, 1),
  ('pro',     'Pro',     'Per professionisti',    10,   25,   2000,  50,  NULL, true,  true,  true,  false, 2),
  ('agency',  'Agency',  'Per agenzie',           NULL, NULL, 10000, 200, NULL, true,  true,  true,  true,  3)
ON CONFLICT (id) DO NOTHING;

-- 3. Estensione tabella profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_id TEXT REFERENCES public.plans(id) DEFAULT 'free',
  -- Override per singolo utente (NULL = usa il valore del piano)
  ADD COLUMN IF NOT EXISTS override_max_projects INTEGER,
  ADD COLUMN IF NOT EXISTS override_max_pages_per_project INTEGER,
  ADD COLUMN IF NOT EXISTS override_max_storage_mb INTEGER,
  ADD COLUMN IF NOT EXISTS override_max_ai_per_month INTEGER,
  ADD COLUMN IF NOT EXISTS override_max_articles_per_project INTEGER,
  -- Storage tracking (aggiornato da trigger su storage.objects)
  ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  -- Flag per notifiche future (es. email a 80% storage)
  ADD COLUMN IF NOT EXISTS storage_warning_sent_at TIMESTAMP WITH TIME ZONE,
  -- AI tracking mensile (il vecchio ai_generations_used rimane per analytics totale)
  ADD COLUMN IF NOT EXISTS ai_generations_this_month INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_month_reset_at TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('month', now()),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 4. RLS sulla tabella plans (pubblica in lettura, nessuno può modificare da client)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Plans are publicly readable" ON public.plans;
CREATE POLICY "Plans are publicly readable" ON public.plans
  FOR SELECT USING (true);

-- 5. Funzione centralizzata che restituisce i limiti effettivi di un utente
--    Applica override > piano, resetta il contatore AI se è un nuovo mese
CREATE OR REPLACE FUNCTION public.get_user_limits(p_user_id UUID)
RETURNS TABLE (
  plan_id TEXT,
  max_projects INTEGER,
  max_pages_per_project INTEGER,
  max_storage_mb INTEGER,
  max_ai_per_month INTEGER,
  max_articles_per_project INTEGER,
  can_custom_domain BOOLEAN,
  can_custom_scripts BOOLEAN,
  can_multilang BOOLEAN,
  can_remove_branding BOOLEAN,
  storage_used_bytes BIGINT,
  ai_used_this_month INTEGER
) AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
  v_plan public.plans%ROWTYPE;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
  SELECT * INTO v_plan FROM public.plans WHERE id = COALESCE(v_profile.plan_id, 'free');

  -- Reset mensile automatico del contatore AI
  IF date_trunc('month', now()) > date_trunc('month', COALESCE(v_profile.ai_month_reset_at, now() - INTERVAL '1 month')) THEN
    UPDATE public.profiles
    SET ai_generations_this_month = 0,
        ai_month_reset_at = date_trunc('month', now())
    WHERE id = p_user_id;
    v_profile.ai_generations_this_month := 0;
  END IF;

  RETURN QUERY SELECT
    COALESCE(v_profile.plan_id, 'free'),
    COALESCE(v_profile.override_max_projects,          v_plan.max_projects),
    COALESCE(v_profile.override_max_pages_per_project, v_plan.max_pages_per_project),
    COALESCE(v_profile.override_max_storage_mb,        v_plan.max_storage_mb),
    COALESCE(v_profile.override_max_ai_per_month,      v_plan.max_ai_per_month),
    COALESCE(v_profile.override_max_articles_per_project, v_plan.max_articles_per_project),
    v_plan.can_custom_domain,
    v_plan.can_custom_scripts,
    v_plan.can_multilang,
    v_plan.can_remove_branding,
    COALESCE(v_profile.storage_used_bytes, 0::BIGINT),
    COALESCE(v_profile.ai_generations_this_month, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Funzione per incrementare i contatori AI in modo atomico
CREATE OR REPLACE FUNCTION public.increment_ai_usage(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET
    ai_generations_this_month = ai_generations_this_month + 1,
    updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger per tracking automatico dello storage
--    Si attiva su INSERT/DELETE di file nel bucket 'project-assets'
CREATE OR REPLACE FUNCTION public.track_storage_usage()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_new_size BIGINT;
  v_old_size BIGINT;
  v_delta BIGINT;
  v_project_id TEXT;
BEGIN
  -- Il path è nel formato "{userId}/{projectId}/{filename}" — estraiamo il projectId (posizione 2)

  IF TG_OP = 'INSERT' AND NEW.bucket_id = 'project-assets' THEN
    v_project_id := split_part(NEW.name, '/', 2);
    v_new_size := COALESCE((NEW.metadata->>'size')::BIGINT, 0);

    SELECT user_id INTO v_user_id FROM public.projects WHERE id::text = v_project_id;
    IF v_user_id IS NOT NULL AND v_new_size > 0 THEN
      UPDATE public.profiles SET storage_used_bytes = storage_used_bytes + v_new_size WHERE id = v_user_id;
    END IF;

  ELSIF TG_OP = 'UPDATE' AND NEW.bucket_id = 'project-assets' THEN
    -- upsert: sottraiamo la vecchia dimensione e aggiungiamo la nuova
    v_project_id := split_part(NEW.name, '/', 2);
    v_new_size := COALESCE((NEW.metadata->>'size')::BIGINT, 0);
    v_old_size := COALESCE((OLD.metadata->>'size')::BIGINT, 0);
    v_delta := v_new_size - v_old_size;

    SELECT user_id INTO v_user_id FROM public.projects WHERE id::text = v_project_id;
    IF v_user_id IS NOT NULL AND v_delta <> 0 THEN
      UPDATE public.profiles SET storage_used_bytes = GREATEST(0, storage_used_bytes + v_delta) WHERE id = v_user_id;
    END IF;

  ELSIF TG_OP = 'DELETE' AND OLD.bucket_id = 'project-assets' THEN
    v_project_id := split_part(OLD.name, '/', 2);
    v_old_size := COALESCE((OLD.metadata->>'size')::BIGINT, 0);

    SELECT user_id INTO v_user_id FROM public.projects WHERE id::text = v_project_id;
    IF v_user_id IS NOT NULL AND v_old_size > 0 THEN
      UPDATE public.profiles SET storage_used_bytes = GREATEST(0, storage_used_bytes - v_old_size) WHERE id = v_user_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_storage_object_change ON storage.objects;
CREATE TRIGGER on_storage_object_change
  AFTER INSERT OR UPDATE OR DELETE ON storage.objects
  FOR EACH ROW EXECUTE FUNCTION public.track_storage_usage();

-- 8. Aggiorna trigger creazione profilo per includere plan_id e nuovi campi
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, plan_id, ai_month_reset_at)
  VALUES (new.id, 'free', date_trunc('month', now()))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Allinea profili esistenti con i nuovi default
UPDATE public.profiles
SET
  plan_id = COALESCE(plan_id, 'free'),
  ai_month_reset_at = COALESCE(ai_month_reset_at, date_trunc('month', now())),
  storage_used_bytes = COALESCE(storage_used_bytes, 0),
  ai_generations_this_month = COALESCE(ai_generations_this_month, 0)
WHERE plan_id IS NULL OR ai_month_reset_at IS NULL;
