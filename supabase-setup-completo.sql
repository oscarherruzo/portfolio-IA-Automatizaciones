-- ============================================================
-- SETUP COMPLETO — Ejecutar TODO esto en Supabase SQL Editor
-- Crea todas las tablas necesarias para el sistema
-- ============================================================

-- PROFILES (si no existe ya)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  company_name text,
  sector text,
  plan text DEFAULT 'free',
  tokens_used integer DEFAULT 0,
  runs_today integer DEFAULT 0,
  last_reset_at date DEFAULT current_date,
  onboarding_done boolean DEFAULT false,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- AUTOMATIONS
CREATE TABLE IF NOT EXISTS public.automations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  type text NOT NULL,
  prompt_template text,
  config jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  runs_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own automations" ON public.automations;
CREATE POLICY "Users manage own automations" ON public.automations FOR ALL USING (auth.uid() = user_id);

-- AUTOMATION RUNS
CREATE TABLE IF NOT EXISTS public.automation_runs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id uuid REFERENCES public.automations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL CHECK (status IN ('running','success','error')),
  input_text text,
  output_text text,
  tokens_used integer DEFAULT 0,
  duration_ms integer,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own runs" ON public.automation_runs;
CREATE POLICY "Users manage own runs" ON public.automation_runs FOR ALL USING (auth.uid() = user_id);

-- CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  tokens_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own chat" ON public.chat_messages;
CREATE POLICY "Users manage own chat" ON public.chat_messages FOR ALL USING (auth.uid() = user_id);

-- USER APP ACCESS
CREATE TABLE IF NOT EXISTS public.user_app_access (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  app_id text NOT NULL,
  granted_by text,
  granted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, app_id)
);
ALTER TABLE public.user_app_access ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own app access" ON public.user_app_access;
CREATE POLICY "Users can view own app access" ON public.user_app_access FOR SELECT USING (auth.uid() = user_id);

-- SAVED RESULTS
CREATE TABLE IF NOT EXISTS public.saved_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  app_id text NOT NULL,
  app_name text NOT NULL,
  title text,
  input_text text,
  output_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.saved_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own results" ON public.saved_results;
CREATE POLICY "Users manage own results" ON public.saved_results FOR ALL USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own notifications" ON public.notifications;
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- ADMIN NOTES
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  note text NOT NULL,
  created_by text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- ADMIN MESSAGES
CREATE TABLE IF NOT EXISTS public.admin_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  read boolean DEFAULT false,
  sent_at timestamptz DEFAULT now()
);
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own messages" ON public.admin_messages;
DROP POLICY IF EXISTS "Users update own messages" ON public.admin_messages;
CREATE POLICY "Users read own messages"   ON public.admin_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own messages" ON public.admin_messages FOR UPDATE USING (auth.uid() = user_id);

-- GESTOR DE CITAS
CREATE TABLE IF NOT EXISTS public.appointment_services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  duration_minutes integer DEFAULT 60,
  price numeric(10,2),
  description text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own services" ON public.appointment_services;
CREATE POLICY "Users manage own services" ON public.appointment_services FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_id uuid REFERENCES public.appointment_services(id) ON DELETE SET NULL,
  service_name text NOT NULL,
  client_name text NOT NULL,
  client_email text,
  client_phone text,
  date date NOT NULL,
  time text NOT NULL,
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled','completed','waitlist')),
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own appointments" ON public.appointments;
CREATE POLICY "Users manage own appointments" ON public.appointments FOR ALL USING (auth.uid() = user_id);

-- FAQ
CREATE TABLE IF NOT EXISTS public.faq_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'General',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own faqs" ON public.faq_items;
CREATE POLICY "Users manage own faqs" ON public.faq_items FOR ALL USING (auth.uid() = user_id);

-- CHATBOT CONFIG
CREATE TABLE IF NOT EXISTS public.chatbot_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_name text,
  business_description text,
  tone text DEFAULT 'profesional',
  welcome_message text DEFAULT '¡Hola! ¿En qué puedo ayudarte?',
  active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.chatbot_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own chatbot" ON public.chatbot_config;
CREATE POLICY "Users manage own chatbot" ON public.chatbot_config FOR ALL USING (auth.uid() = user_id);

-- LEADS (CRM)
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  company text,
  status text DEFAULT 'nuevo' CHECK (status IN ('nuevo','contactado','propuesta','cerrado','perdido')),
  notes text,
  value numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own leads" ON public.leads;
CREATE POLICY "Users manage own leads" ON public.leads FOR ALL USING (auth.uid() = user_id);

-- PRESUPUESTOS
CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_name text NOT NULL,
  client_email text,
  title text NOT NULL,
  content text NOT NULL,
  amount numeric(10,2),
  status text DEFAULT 'borrador' CHECK (status IN ('borrador','enviado','aceptado','rechazado')),
  valid_until date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own quotes" ON public.quotes;
CREATE POLICY "Users manage own quotes" ON public.quotes FOR ALL USING (auth.uid() = user_id);

-- RESEÑAS
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source text DEFAULT 'google',
  author text,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  content text NOT NULL,
  sentiment text,
  response text,
  responded boolean DEFAULT false,
  review_date date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own reviews" ON public.reviews;
CREATE POLICY "Users manage own reviews" ON public.reviews FOR ALL USING (auth.uid() = user_id);

-- TRIGGER auto-crear perfil al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_automations_user ON public.automations(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_runs_user ON public.automation_runs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON public.chat_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON public.appointments(user_id, date);
CREATE INDEX IF NOT EXISTS idx_leads_user ON public.leads(user_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_results_user ON public.saved_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);

-- SCHEDULE CONFIG (horarios del negocio)
CREATE TABLE IF NOT EXISTS public.schedule_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_name text,
  business_address text,
  business_phone text,
  business_description text,
  slug text UNIQUE,
  working_days integer[] DEFAULT '{1,2,3,4,5}',
  start_time text DEFAULT '09:00',
  end_time text DEFAULT '19:00',
  slot_duration integer DEFAULT 30,
  break_start text,
  break_end text,
  active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.schedule_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own schedule" ON public.schedule_config;
CREATE POLICY "Users manage own schedule" ON public.schedule_config FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_slug ON public.schedule_config(slug);

-- SCHEDULE CONFIG
CREATE TABLE IF NOT EXISTS public.schedule_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_name text,
  business_address text,
  business_phone text,
  business_description text,
  business_color text DEFAULT '#6366f1',
  slug text UNIQUE,
  working_days integer[] DEFAULT '{1,2,3,4,5}',
  start_time text DEFAULT '09:00',
  end_time text DEFAULT '19:00',
  slot_duration integer DEFAULT 30,
  break_start text,
  break_end text,
  active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.schedule_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own schedule" ON public.schedule_config;
CREATE POLICY "Users manage own schedule" ON public.schedule_config FOR ALL USING (auth.uid() = user_id);

-- Columna duration_minutes en appointments
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 60;
CREATE INDEX IF NOT EXISTS idx_schedule_slug ON public.schedule_config(slug);
