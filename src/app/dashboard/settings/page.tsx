"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const S: Record<string, React.CSSProperties> = {
  page:    { padding: "32px 40px", maxWidth: "760px" },
  h1:      { fontSize: "1.3rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: "4px" },
  section: { background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "24px", marginBottom: "16px" },
  sTitle:  { fontSize: "0.85rem", fontWeight: 700, color: "var(--text-1)", marginBottom: "18px", paddingBottom: "14px", borderBottom: "1px solid var(--border)" },
  label:   { fontSize: "0.7rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" },
  input:   { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-1)", fontSize: "0.875rem", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "var(--font-body)", transition: "border-color 0.15s" },
  row:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" },
  field:   { display: "flex", flexDirection: "column", gap: "6px" },
};

type Profile = { full_name?: string; company_name?: string; plan?: string; tokens_used?: number; email?: string };

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>({});
  const [email, setEmail]     = useState("");
  const [name, setName]       = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [pwd, setPwd]         = useState({ current: "", next: "", confirm: "" });
  const [pwdMsg, setPwdMsg]   = useState("");
  const [pwdOk, setPwdOk]     = useState(false);
  const [delConfirm, setDelConfirm] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email || "");
      supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
        if (data) {
          setProfile(data);
          setName(data.full_name || "");
          setCompany(data.company_name || "");
        }
      });
    });
  }, []);

  async function saveProfile() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ full_name: name, company_name: company }).eq("id", user.id);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  }

  async function changePassword() {
    setPwdMsg(""); setPwdOk(false);
    if (!pwd.next || pwd.next !== pwd.confirm) { setPwdMsg("Las contraseñas no coinciden"); return; }
    if (pwd.next.length < 6) { setPwdMsg("Mínimo 6 caracteres"); return; }
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pwd.next });
    if (error) setPwdMsg(error.message);
    else { setPwdOk(true); setPwd({ current: "", next: "", confirm: "" }); setPwdMsg("Contraseña actualizada correctamente"); }
  }

  const PLAN_LABELS: Record<string, { label: string; color: string }> = {
    free: { label: "Gratuito", color: "var(--text-3)" },
    basic: { label: "Básico", color: "var(--accent)" },
    pro: { label: "Profesional", color: "var(--purple)" },
    agency: { label: "Agencia", color: "var(--amber)" },
  };
  const planInfo = PLAN_LABELS[profile.plan || "free"] || PLAN_LABELS.free;
  const tokenLimit = profile.plan === "agency" ? 999999 : profile.plan === "pro" ? 50000 : 10000;
  const tokenPct = Math.min(100, Math.round(((profile.tokens_used || 0) / tokenLimit) * 100));

  return (
    <div style={S.page}>
      <div style={{ marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={S.h1}>Configuración</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>Gestiona tu cuenta, seguridad y preferencias</p>
      </div>

      {/* Plan */}
      <div style={{ ...S.section, background: "linear-gradient(135deg, rgba(59,127,255,0.05) 0%, var(--surface) 60%)", borderColor: "rgba(59,127,255,0.2)" }}>
        <div style={S.sTitle as React.CSSProperties}>Plan activo</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: planInfo.color }}>{planInfo.label}</span>
            <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginTop: "4px" }}>{(profile.tokens_used || 0).toLocaleString()} / {tokenLimit.toLocaleString()} tokens usados este mes</p>
          </div>
          <a href="mailto:oscarherruzom@gmail.com?subject=Cambiar plan" style={{ padding: "8px 18px", background: "var(--accent)", color: "#fff", borderRadius: "8px", textDecoration: "none", fontSize: "0.82rem", fontWeight: 600 }}>
            Cambiar plan
          </a>
        </div>
        <div style={{ background: "var(--bg-3)", borderRadius: "100px", height: "6px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${tokenPct}%`, background: tokenPct > 85 ? "var(--rose)" : tokenPct > 60 ? "var(--amber)" : "var(--accent)", borderRadius: "100px", transition: "width 0.5s" }} />
        </div>
        <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "6px" }}>{tokenPct}% de cuota mensual utilizada</p>
      </div>

      {/* Profile */}
      <div style={S.section}>
        <div style={S.sTitle as React.CSSProperties}>Datos de perfil</div>
        <div style={S.row as React.CSSProperties}>
          <div style={S.field as React.CSSProperties}>
            <label style={S.label}>Nombre completo</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" style={S.input} />
          </div>
          <div style={S.field as React.CSSProperties}>
            <label style={S.label}>Empresa <span style={{ fontWeight: 400 }}>(opcional)</span></label>
            <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Nombre de tu empresa" style={S.input} />
          </div>
        </div>
        <div style={{ ...S.field as React.CSSProperties, marginBottom: "18px" }}>
          <label style={S.label}>Email</label>
          <input value={email} readOnly style={{ ...S.input, opacity: 0.6, cursor: "default" }} />
          <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "4px" }}>El email no se puede cambiar. Contacta con soporte si necesitas actualizarlo.</p>
        </div>
        <button onClick={saveProfile} disabled={saving} style={{ padding: "10px 24px", background: saved ? "var(--green)" : "var(--accent)", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", fontFamily: "var(--font-body)", transition: "background 0.2s" }}>
          {saving ? "Guardando..." : saved ? "Cambios guardados" : "Guardar cambios"}
        </button>
      </div>

      {/* Password */}
      <div style={S.section}>
        <div style={S.sTitle as React.CSSProperties}>Seguridad</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "380px" }}>
          <div style={S.field as React.CSSProperties}>
            <label style={S.label}>Nueva contraseña</label>
            <input type="password" value={pwd.next} onChange={e => setPwd(p => ({ ...p, next: e.target.value }))} placeholder="Nueva contraseña (mín. 6 caracteres)" style={S.input} />
          </div>
          <div style={S.field as React.CSSProperties}>
            <label style={S.label}>Confirmar contraseña</label>
            <input type="password" value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} placeholder="Repite la nueva contraseña" style={S.input} />
          </div>
          {pwdMsg && (
            <p style={{ fontSize: "0.8rem", color: pwdOk ? "var(--green)" : "var(--rose)", padding: "8px 12px", borderRadius: "7px", background: pwdOk ? "var(--green-dim)" : "var(--rose-dim)" }}>{pwdMsg}</p>
          )}
          <button onClick={changePassword} disabled={!pwd.next || !pwd.confirm} style={{ padding: "10px 24px", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", fontFamily: "var(--font-body)", width: "fit-content" }}>
            Actualizar contraseña
          </button>
        </div>
      </div>

      {/* Danger */}
      <div style={{ ...S.section, borderColor: "rgba(251,113,133,0.2)" }}>
        <div style={{ ...S.sTitle as React.CSSProperties, color: "var(--rose)", borderColor: "rgba(251,113,133,0.15)" }}>Zona de peligro</div>
        <p style={{ fontSize: "0.875rem", color: "var(--text-3)", marginBottom: "16px", lineHeight: 1.6 }}>
          Eliminar tu cuenta es una acción permanente e irreversible. Se borrarán todos tus datos, automatizaciones y resultados guardados.
        </p>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input value={delConfirm} onChange={e => setDelConfirm(e.target.value)} placeholder='Escribe "eliminar" para confirmar' style={{ ...S.input, maxWidth: "280px" }} />
          <button
            disabled={delConfirm.toLowerCase() !== "eliminar"}
            onClick={() => alert("Contacta con oscarherruzom@gmail.com para eliminar tu cuenta.")}
            style={{ padding: "10px 20px", background: delConfirm.toLowerCase() === "eliminar" ? "var(--rose)" : "var(--bg-2)", border: "1px solid", borderColor: delConfirm.toLowerCase() === "eliminar" ? "var(--rose)" : "var(--border)", color: delConfirm.toLowerCase() === "eliminar" ? "#fff" : "var(--text-3)", borderRadius: "8px", cursor: delConfirm.toLowerCase() === "eliminar" ? "pointer" : "not-allowed", fontWeight: 600, fontSize: "0.875rem", fontFamily: "var(--font-body)", whiteSpace: "nowrap", transition: "all 0.2s" }}
          >
            Eliminar cuenta
          </button>
        </div>
      </div>
    </div>
  );
}
