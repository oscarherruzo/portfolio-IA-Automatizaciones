"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = { full_name?: string; email?: string; company_name?: string; sector?: string; plan?: string; tokens_used?: number; created_at?: string };
type Tab = "perfil" | "seguridad" | "plan";

export default function SettingsPage() {
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [name, setName]         = useState("");
  const [company, setCompany]   = useState("");
  const [sector, setSector]     = useState("");
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [tab, setTab]           = useState<Tab>("perfil");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
        if (data) {
          setProfile({ ...data, email: user.email });
          setName(data.full_name || "");
          setCompany(data.company_name || "");
          setSector(data.sector || "");
        }
      });
    });
  }, []);

  async function saveProfile() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ full_name: name, company_name: company, sector }).eq("id", user.id);
      setProfile(prev => prev ? { ...prev, full_name: name, company_name: company, sector } : prev);
    }
    setSaved(true); setTimeout(() => setSaved(false), 2000); setSaving(false);
  }

  async function changePassword() {
    if (newPassword.length < 6) { setPasswordMsg("Mínimo 6 caracteres"); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg("Las contraseñas no coinciden"); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { setPasswordMsg("Error: " + error.message); }
    else { setPasswordMsg("✓ Contraseña actualizada"); setNewPassword(""); setConfirmPassword(""); }
    setChangingPassword(false);
    setTimeout(() => setPasswordMsg(""), 4000);
  }

  if (!profile) return <div style={{ padding: "40px", color: "var(--text-3)" }}>Cargando...</div>;

  const tokenLimit = profile.plan === "pro" ? 50000 : profile.plan === "agency" ? 999999 : 10000;
  const tokenPct   = Math.min(100, Math.round(((profile.tokens_used || 0) / tokenLimit) * 100));

  return (
    <div style={{ padding: "24px 32px", maxWidth: "700px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>⚙️ Configuración</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>Gestiona tu cuenta y preferencias</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "var(--bg-2)", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        {(["perfil", "seguridad", "plan"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 20px", borderRadius: "7px", border: "none", cursor: "pointer",
            background: tab === t ? "var(--surface)" : "transparent",
            color: tab === t ? "var(--text-1)" : "var(--text-3)",
            fontWeight: tab === t ? 600 : 400, fontSize: "0.85rem",
            boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.3)" : "none"
          }}>
            {t === "perfil" ? "👤 Perfil" : t === "seguridad" ? "🔒 Seguridad" : "⭐ Mi Plan"}
          </button>
        ))}
      </div>

      {/* PERFIL */}
      {tab === "perfil" && (
        <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "28px" }}>

          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--accent-dim)", border: "1px solid rgba(59,127,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)" }}>
              {(name || profile.email || "?")[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-1)" }}>{name || "Sin nombre"}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>{profile.email}</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { label: "Nombre completo", val: name,    set: setName,    placeholder: "Tu nombre y apellidos" },
              { label: "Empresa",         val: company, set: setCompany, placeholder: "Nombre de tu empresa" },
              { label: "Sector",          val: sector,  set: setSector,  placeholder: "Ej: Hostelería, Tecnología..." },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>{f.label}</label>
                <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                  style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-1)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Email</label>
              <input value={profile.email || ""} disabled
                style={{ width: "100%", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-3)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
            </div>
            <button onClick={saveProfile} disabled={saving}
              style={{ padding: "11px 24px", borderRadius: "8px", border: "none", background: saved ? "#3fb950" : "var(--accent)", color: "white", fontWeight: 700, cursor: "pointer", width: "fit-content", transition: "background 0.2s" }}>
              {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}

      {/* SEGURIDAD */}
      {tab === "seguridad" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "28px" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "6px" }}>Cambiar contraseña</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginBottom: "20px" }}>Mínimo 6 caracteres</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña"
                style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-1)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
              />
              <input
                type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirmar nueva contraseña"
                style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-1)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
              />
              {passwordMsg && (
                <div style={{ fontSize: "0.82rem", color: passwordMsg.startsWith("✓") ? "#3fb950" : "#ef4444", fontWeight: 600 }}>{passwordMsg}</div>
              )}
              <button onClick={changePassword} disabled={changingPassword || !newPassword}
                style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "var(--accent)", color: "white", fontWeight: 700, cursor: "pointer", width: "fit-content", opacity: !newPassword ? 0.5 : 1 }}>
                {changingPassword ? "Actualizando..." : "Cambiar contraseña"}
              </button>
            </div>
          </div>

          <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "24px" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "6px" }}>Sesión activa</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginBottom: "12px" }}>Estás conectado como <strong>{profile.email}</strong></p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>
              Cuenta creada el {profile.created_at ? new Date(profile.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "—"}
            </p>
          </div>
        </div>
      )}

      {/* PLAN */}
      {tab === "plan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", marginBottom: "4px" }}>Plan actual</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent)", textTransform: "capitalize" }}>{profile.plan || "Free"}</div>
              </div>
              <a href="mailto:oscarherruzom@gmail.com" style={{ background: "var(--accent)", color: "white", textDecoration: "none", padding: "8px 18px", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem" }}>
                Mejorar plan →
              </a>
            </div>

            <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
              <span style={{ color: "var(--text-2)", fontWeight: 600 }}>⚡ Tokens usados</span>
              <span style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                {(profile.tokens_used || 0).toLocaleString()} / {tokenLimit.toLocaleString()}
              </span>
            </div>
            <div style={{ height: "8px", background: "var(--bg-3)", borderRadius: "100px", overflow: "hidden", marginBottom: "6px" }}>
              <div style={{ height: "100%", borderRadius: "100px", width: `${tokenPct}%`, background: tokenPct > 85 ? "#ef4444" : tokenPct > 60 ? "#ffa657" : "var(--accent)", transition: "width 0.3s" }} />
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{tokenPct}% usado</div>
          </div>

          <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "24px" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "12px" }}>¿Necesitas más recursos?</h3>
            <p style={{ fontSize: "0.84rem", color: "var(--text-3)", marginBottom: "16px", lineHeight: 1.6 }}>
              Escríbeme directamente y te configuro el plan que mejor se adapte a tu negocio.
            </p>
            <a href="mailto:oscarherruzom@gmail.com" style={{ display: "inline-block", background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-1)", textDecoration: "none", padding: "9px 20px", borderRadius: "8px", fontWeight: 600, fontSize: "0.85rem" }}>
              Contactar a Oscar →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
