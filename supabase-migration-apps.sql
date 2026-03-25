-- ============================================================
-- APPS FUNCIONALES — Ejecutar en Supabase SQL Editor
-- ============================================================

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

ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own services" ON public.appointment_services;
DROP POLICY IF EXISTS "Users manage own appointments" ON public.appointments;
CREATE POLICY "Users manage own services" ON public.appointment_services FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own appointments" ON public.appointments FOR ALL USING (auth.uid() = user_id);

-- FAQ BASE DE CONOCIMIENTO
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

-- LEADS (Asistente de ventas)
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
