"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
    setLoading(true); setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name }, emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
    else { setSuccess(true); setTimeout(() => router.push("/dashboard"), 1000); }
  }

  return (
    <div className="auth-wrap">
      <div className="bg-glow bg-glow-top" aria-hidden="true"/>
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">⚡</div>
          <div className="auth-logo-name"><em>Oscar</em> Herruzo</div>
          <div className="auth-logo-sub">Crea tu cuenta gratuita</div>
        </div>
        {success ? (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:"2.5rem",marginBottom:"12px"}}>✅</div>
            <div style={{fontWeight:700,fontSize:"1rem",color:"var(--text-1)",marginBottom:"6px"}}>¡Cuenta creada!</div>
            <div style={{color:"var(--text-3)",fontSize:"0.83rem"}}>Redirigiendo...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            <div className="auth-field">
              <label htmlFor="name">Nombre completo</label>
              <input id="name" type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Tu nombre" required autoComplete="name"/>
            </div>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@empresa.com" required autoComplete="email"/>
            </div>
            <div className="auth-field">
              <label htmlFor="pass">Contraseña</label>
              <input id="pass" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required autoComplete="new-password"/>
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="auth-btn" disabled={loading} style={{marginTop:"6px"}}>
              {loading ? "Creando cuenta..." : "Crear cuenta gratuita"}
            </button>
          </form>
        )}
        <div className="auth-footer">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
