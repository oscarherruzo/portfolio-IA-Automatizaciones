# ⚡ IA para Negocios

SaaS de automatizaciones empresariales con IA — Next.js 15 + Supabase + Groq.

## Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Auth + DB**: Supabase (PostgreSQL + Row Level Security)
- **IA**: Groq API · Llama 3.3 70B
- **Estilos**: GitHub dark theme, DM Sans + DM Mono

## Estructura

```
src/
  app/
    page.tsx              ← Landing
    login/page.tsx        ← Login
    register/page.tsx     ← Registro
    dashboard/
      layout.tsx          ← Layout con sidebar
      page.tsx            ← Dashboard principal (stats + activity graph)
      automations/page.tsx← CRUD automatizaciones + panel de ejecución
      chat/page.tsx       ← Chat conversacional con IA
      settings/page.tsx   ← Configuración de cuenta
    api/
      auth/callback/      ← OAuth callback
      chat/               ← POST → Groq chat
      automations/        ← GET/POST/PUT/DELETE
      automations/run/    ← POST → ejecutar automatización
  lib/
    supabase/client.ts    ← Browser client
    supabase/server.ts    ← Server client
    groq.ts               ← Groq + prompts por tipo
    utils.ts              ← Helpers + AUTOMATION_TYPES
  components/
    dashboard/SidebarClient.tsx
```

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno
cp .env.example .env.local
# Rellenar NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ANON_KEY, GROQ_API_KEY

# 3. Crear tablas en Supabase
# Ejecutar supabase-schema.sql en SQL Editor de tu proyecto

# 4. Iniciar
npm run dev
```

## Supabase

Ejecutar `supabase-schema.sql` en el SQL Editor del proyecto para crear:
- `profiles` — datos del usuario, plan, tokens
- `automations` — configuración de automatizaciones
- `automation_runs` — historial de ejecuciones
- `chat_messages` — historial de chat

## Automatizaciones disponibles

| Tipo | Descripción |
|------|-------------|
| `email` | Responder emails profesionales |
| `content` | Generar contenido de marketing |
| `summary` | Resumir documentos |
| `analysis` | Analizar datos y métricas |
| `chatbot` | Responder preguntas de clientes |
| `notification` | Redactar notificaciones |
