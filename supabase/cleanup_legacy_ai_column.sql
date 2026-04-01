-- Rimozione colonne legacy da profiles
-- Queste colonne erano usate prima del sistema piani (permissions_system.sql)
-- Il limite AI è ora gestito dalla tabella plans tramite get_user_limits()

ALTER TABLE public.profiles DROP COLUMN IF EXISTS max_ai_generations;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS ai_generations_used;
