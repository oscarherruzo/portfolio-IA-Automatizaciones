#!/bin/bash

# Login page
cat > "app/(auth)/login/page.tsx" << 'EOF'
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [success, setSuccess] = useState<string|null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null); setSuccess(null)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email o contraseña incorrectos')
      else { router.push('/dashboard'); router.refresh() }
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
      if (error) setError(error.message)
      else setSuccess('Revisa tu email para confirmar la cuenta.')
    }
    setLoading(false)
  }

  const inp: React.CSSProperties = { width:'100%', padding:'10px 13px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#eaeaea', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }
  const lbl: React.CSSProperties = { fontSize:11, color:'#8892a4', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.08em' }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0a0f', padding:20, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:'#e94560', margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>✦</div>
          <h1 style={{ fontSize:22, fontWeight:600, color:'#eaeaea', margin:0 }}>IA para Negocios</h1>
          <p style={{ fontSize:13, color:'#8892a4', marginTop:6 }}>{mode==='login'?'Accede a tu panel':'Crea tu cuenta'}</p>
        </div>
        <div style={{ background:'#16213e', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:28 }}>
          <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:10, padding:3, marginBottom:24 }}>
            {(['login','register'] as const).map(m => (
              <button key={m} onClick={()=>{setMode(m);setError(null);setSuccess(null)}} style={{ flex:1, padding:'8px 0', border:'none', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit', background:mode===m?'#e94560':'transparent', color:mode===m?'#fff':'#8892a4' }}>
                {m==='login'?'Entrar':'Registrarse'}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {mode==='register' && <div><label style={lbl}>Nombre completo</label><input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Tu nombre" required style={inp}/></div>}
            <div><label style={lbl}>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" required style={inp}/></div>
            <div><label style={lbl}>Contraseña</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required minLength={6} style={inp}/></div>
            {error && <div style={{ padding:'10px 12px', borderRadius:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#fca5a5', fontSize:13 }}>{error}</div>}
            {success && <div style={{ padding:'10px 12px', borderRadius:8, background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', color:'#86efac', fontSize:13 }}>{success}</div>}
            <button type="submit" disabled={loading} style={{ padding:'11px 0', borderRadius:10, border:'none', background:loading?'rgba(233,69,96,0.5)':'#e94560', color:'#fff', fontSize:14, fontWeight:600, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', marginTop:4 }}>
              {loading?'Cargando...':mode==='login'?'Entrar':'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
EOF

# Admin layout
cat > "app/(admin)/layout.tsx" << 'EOF'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/ui/AdminSidebar'
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'superadmin') redirect('/dashboard')
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      <AdminSidebar profile={profile} />
      <main style={{ flex:1, padding:'28px 32px', overflowY:'auto' }}>{children}</main>
    </div>
  )
}
EOF

# Admin dashboard placeholder
mkdir -p "app/(admin)/dashboard"
cat > "app/(admin)/dashboard/page.tsx" << 'EOF'
export default function AdminDashboard() {
  return <div style={{ color:'#eaeaea' }}><h1 style={{ fontSize:24, fontWeight:600, marginBottom:8 }}>Panel de administración</h1><p style={{ color:'#8892a4' }}>Bienvenido, superadmin. Aquí verás las estadísticas globales.</p></div>
}
EOF

# Dashboard layout
cat > "app/(dashboard)/layout.tsx" << 'EOF'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/ui/DashboardSidebar'
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: business } = await supabase.from('businesses').select('*').eq('owner_id', user.id).single()
  if (!business) redirect('/dashboard/onboarding')
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      <DashboardSidebar profile={profile} business={business} />
      <main style={{ flex:1, padding:'28px 32px', overflowY:'auto' }}>{children}</main>
    </div>
  )
}
EOF

# Dashboard home placeholder
mkdir -p "app/(dashboard)/dashboard"
cat > "app/(dashboard)/dashboard/page.tsx" << 'EOF'
export default function Dashboard() {
  return <div style={{ color:'#eaeaea' }}><h1 style={{ fontSize:24, fontWeight:600, marginBottom:8 }}>Mi panel</h1><p style={{ color:'#8892a4' }}>Bienvenido a tu panel de IA.</p></div>
}
EOF

# Onboarding
cat > app/dashboard/onboarding/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
function slugify(t: string) { return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') }
export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const slug = slugify(name) + '-' + Math.random().toString(36).slice(2,6)
    const { error } = await supabase.from('businesses').insert({ owner_id:user.id, name, slug, plan:'basic', status:'trial' })
    if (error) setError('Error al crear el negocio.')
    else { router.push('/dashboard'); router.refresh() }
    setLoading(false)
  }
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0a0f', padding:20, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🏢</div>
          <h1 style={{ fontSize:22, fontWeight:600, color:'#eaeaea', margin:0 }}>Configura tu negocio</h1>
          <p style={{ fontSize:13, color:'#8892a4', marginTop:8 }}>Solo un dato para empezar.</p>
        </div>
        <div style={{ background:'#16213e', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:28 }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ fontSize:11, color:'#8892a4', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.08em' }}>Nombre del negocio</label>
              <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Clínica Salud+" required style={{ width:'100%', padding:'10px 13px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#eaeaea', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }}/>
            </div>
            {error && <div style={{ padding:'10px 12px', borderRadius:8, background:'rgba(239,68,68,0.1)', color:'#fca5a5', fontSize:13 }}>{error}</div>}
            <button type="submit" disabled={loading||!name.trim()} style={{ padding:'11px 0', borderRadius:10, border:'none', background:loading||!name.trim()?'rgba(233,69,96,0.4)':'#e94560', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              {loading?'Creando...':'Empezar →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
EOF

echo "✓ Páginas creadas"
