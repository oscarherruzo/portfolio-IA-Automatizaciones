-- ============================================================
-- MIGRACIÓN v3 — Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Resultados guardados
CREATE TABLE IF NOT EXISTS public.saved_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  app_id text NOT NULL,
  app_name text NOT NULL,
  app_icon text DEFAULT '⚡',
  input_text text,
  output_text text NOT NULL,
  title text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.saved_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own results" ON public.saved_results FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_saved_results_user ON public.saved_results(user_id);

-- 2. Notificaciones in-app
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  type text DEFAULT 'info',
  read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- 3. Notas admin por usuario
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  note text NOT NULL,
  created_by text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- 4. Tokens de API pública
CREATE TABLE IF NOT EXISTS public.api_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  name text DEFAULT 'Token principal',
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tokens" ON public.api_tokens FOR ALL USING (auth.uid() = user_id);

-- 5. Invitaciones
CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  accepted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own invitations" ON public.invitations FOR ALL USING (auth.uid() = inviter_id);

-- 6. Campos extra en profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_done boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
