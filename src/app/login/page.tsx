"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("Email o contraseña incorrectos"); setLoading(false); }
    else { router.push("/dashboard"); router.refresh(); }
  }

  return (
    <div className="auth-wrap">
      <div className="bg-glow bg-glow-top" aria-hidden="true"/>
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">⚡</div>
          <div className="auth-logo-name"><em>Oscar</em> Herruzo</div>
          <div className="auth-logo-sub">Inicia sesión en tu cuenta</div>
        </div>
        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"14px"}}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@empresa.com" required autoComplete="email"/>
          </div>
          <div className="auth-field">
            <label htmlFor="pass">Contraseña</label>
            <input id="pass" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password"/>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-btn" disabled={loading} style={{marginTop:"6px"}}>
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>
        <div className="auth-footer">
          ¿No tienes cuenta?{" "}
          <Link href="/register">Regístrate gratis</Link>
        </div>
      </div>
    </div>
  );
}
