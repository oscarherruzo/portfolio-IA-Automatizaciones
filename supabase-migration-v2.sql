-- ============================================================
-- MIGRACIÓN v2 — Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Campos Stripe en profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- 2. Tabla de acceso a apps por usuario
CREATE TABLE IF NOT EXISTS public.user_app_access (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  app_id text NOT NULL,
  granted_by text,
  granted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, app_id)
);

ALTER TABLE public.user_app_access ENABLE ROW LEVEL SECURITY;

-- El usuario puede ver sus propias apps
CREATE POLICY "Users can view own app access"
  ON public.user_app_access FOR SELECT
  USING (auth.uid() = user_id);

-- Solo service_role puede insertar/borrar (el admin lo hace via API con service_role)
-- No hacen falta policies de INSERT/DELETE porque usamos service_role desde la API

-- 3. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_user_app_access_user_id ON public.user_app_access(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
