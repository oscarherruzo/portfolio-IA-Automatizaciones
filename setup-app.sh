#!/bin/bash

# globals.css
cat > app/globals.css << 'EOF'
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0a0a0f; --surface: #16213e; --surface2: #0f3460;
  --accent: #e94560; --text: #eaeaea; --muted: #8892a4;
  --border: rgba(255,255,255,0.08); --radius: 12px;
  --font: 'DM Sans', system-ui, sans-serif; --font-mono: 'DM Mono', monospace;
}
html, body { height: 100%; font-family: var(--font); background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }
::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
input, textarea, select { font-family: var(--font); background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 14px; padding: 9px 12px; transition: border-color 0.15s; }
input:focus, textarea:focus, select:focus { outline: none; border-color: rgba(233,69,96,0.5); }
input::placeholder, textarea::placeholder { color: var(--muted); }
button { font-family: var(--font); cursor: pointer; }
EOF

# layout.tsx
cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'IA para Negocios', description: 'Panel de gestión de asistentes IA' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}</body></html>
}
EOF

# page.tsx (root redirect)
cat > app/page.tsx << 'EOF'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
export default async function RootPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'superadmin') redirect('/admin/dashboard')
  else redirect('/dashboard')
}
EOF

# auth callback
cat > app/auth/callback/route.ts << 'EOF'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  if (code) {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}/dashboard`)
  }
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
EOF

echo "✓ Archivos base creados"
