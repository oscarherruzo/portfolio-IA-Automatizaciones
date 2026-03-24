"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = { full_name?: string; email?: string; company?: string; phone?: string; created_at?: string };
type ApiToken = { id: string; token: string; name: string; last_used_at: string | null; created_at: string };
type Invitation = { id: string; email: string; accepted: boolean; created_at: string };

type Tab = "perfil" | "api" | "invitaciones";

export default function SettingsPage() {
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [name, setName]           = useState("");
  const [company, setCompany]     = useState("");
  const [phone, setPhone]         = useState("");
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [tab, setTab]             = useState<Tab>("perfil");

  const [apiTokens, setApiTokens] = useState<ApiToken[]>([]);
  const [newTokenName, setNewTokenName] = useState("");
  const [creatingToken, setCreatingToken] = useState(false);
  const [visibleToken, setVisibleToken] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
        if (data) { setProfile(data); setName(data.full_name || ""); setCompany(data.company || ""); setPhone(data.phone || ""); }
      });
      supabase.from("api_tokens").select("*").eq("user_id", user.id).order("created_at").then(({ data }) => setApiTokens(data || []));
    });
    fetch("/api/invitations").then(r => r.json()).then(data => setInvitations(Array.isArray(data) ? data : []));
  }, []);

  async function saveProfile() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) { await supabase.from("profiles").update({ full_name: name, company, phone }).eq("id", user.id); }
    setSaved(true); setTimeout(() => setSaved(false), 2000); setSaving(false);
  }

  async function createToken() {
    setCreatingToken(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("api_tokens").insert([{ user_id: user.id, name: newTokenName || "Token principal" }]).select().single();
    if (data) { setApiTokens(prev => [...prev, data]); setVisibleToken(data.id); setNewTokenName(""); }
    setCreatingToken(false);
  }

  async function deleteToken(id: string) {
    await supabase.from("api_tokens").delete().eq("id", id);
    setApiTokens(prev => prev.filter(t => t.id !== id));
  }

  async function sendInvitation() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    await fetch("/api/invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: inviteEmail }) });
    const res = await fetch("/api/invitations");
    setInvitations(await res.json());
    setInviteEmail(""); setInviting(false); setInviteSent(true); setTimeout(() => setInviteSent(false), 3000);
  }

  function copyToken(token: string, id: string) {
    navigator.clipboard.writeText(token); setCopied(id); setTimeout(() => setCopied(null), 2000);
  }

  if (!profile) return <div style={{ padding: "40px", color: "var(--text-3)" }}>Cargando...</div>;

  return (
    <div style={{ padding: "24px 32px", maxWidth: "760px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>⚙️ Configuración</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>Gestiona tu cuenta, API keys e invitaciones</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "var(--bg-2)", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        {(["perfil", "api", "invitaciones"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 20px", borderRadius: "7px", border: "none", cursor: "pointer",
            background: tab === t ? "var(--surface)" : "transparent",
            color: tab === t ? "var(--text-1)" : "var(--text-3)",
            fontWeight: tab === t ? 600 : 400, fontSize: "0.85rem",
            boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.3)" : "none", textTransform: "capitalize"
          }}>{t === "perfil" ? "👤 Perfil" : t === "api" ? "🔑 API Keys" : "👥 Invitaciones"}</button>
        ))}
      </div>

      {/* Perfil */}
      {tab === "perfil" && (
        <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { label: "Nombre completo", val: name, set: setName, placeholder: "Tu nombre" },
              { label: "Empresa",         val: company, set: setCompany, placeholder: "Tu empresa" },
              { label: "Teléfono",        val: phone, set: setPhone, placeholder: "+34 600 000 000" },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>{f.label}</label>
                <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                  style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-1)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Email</label>
              <input value={profile.email || ""} disabled
                style={{ width: "100%", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-3)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
            </div>
            <button onClick={saveProfile} disabled={saving}
              style={{ padding: "11px 24px", borderRadius: "8px", border: "none", background: saved ? "var(--green)" : "var(--accent)", color: "white", fontWeight: 700, cursor: "pointer", width: "fit-content" }}>
              {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}

      {/* API Keys */}
      {tab === "api" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "24px" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-1)", marginBottom: "6px" }}>Crear nuevo token</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginBottom: "16px" }}>Usa el token para llamar a las apps desde tu propio código</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <input value={newTokenName} onChange={e => setNewTokenName(e.target.value)} placeholder="Nombre del token (ej: Mi web)"
                style={{ flex: 1, background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "9px 14px", color: "var(--text-1)", fontSize: "0.85rem", outline: "none" }} />
              <button onClick={createToken} disabled={creatingToken}
                style={{ background: "var(--accent)", border: "none", color: "white", padding: "9px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
                {creatingToken ? "..." : "Crear"}
              </button>
            </div>
          </div>

          {apiTokens.length > 0 && (
            <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden" }}>
              {apiTokens.map(t => (
                <div key={t.id} style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "4px" }}>{t.name}</div>
                    <code style={{ fontSize: "0.75rem", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                      {visibleToken === t.id ? t.token : `${t.token.slice(0,8)}${"•".repeat(20)}${t.token.slice(-6)}`}
                    </code>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => setVisibleToken(visibleToken === t.id ? null : t.id)}
                      style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-3)", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.72rem" }}>
                      {visibleToken === t.id ? "Ocultar" : "Ver"}
                    </button>
                    <button onClick={() => copyToken(t.token, t.id)}
                      style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: copied === t.id ? "var(--green)" : "var(--text-2)", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.72rem", fontWeight: 600 }}>
                      {copied === t.id ? "✓" : "Copiar"}
                    </button>
                    <button onClick={() => deleteToken(t.id)}
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "rgb(239,68,68)", padding: "5px 8px", borderRadius: "6px", cursor: "pointer", fontSize: "0.72rem" }}>
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: "rgba(59,127,255,0.06)", borderRadius: "10px", border: "1px solid rgba(59,127,255,0.2)", padding: "16px" }}>
            <p style={{ fontSize: "0.82rem", color: "var(--text-2)", margin: "0 0 8px 0", fontWeight: 600 }}>📖 Uso de la API</p>
            <pre style={{ fontSize: "0.78rem", color: "var(--text-3)", margin: 0, fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>{`POST https://tudominio.com/api/public/{token}
Content-Type: application/json

{
  "app_id": "generador-presupuestos",
  "input": "Descripción del trabajo..."
}`}</pre>
          </div>
        </div>
      )}

      {/* Invitaciones */}
      {tab === "invitaciones" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "24px" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "6px" }}>Invitar colaborador</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginBottom: "16px" }}>Envía un enlace de registro a alguien de tu equipo</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="email@empresa.com"
                style={{ flex: 1, background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "9px 14px", color: "var(--text-1)", fontSize: "0.85rem", outline: "none" }} />
              <button onClick={sendInvitation} disabled={inviting || !inviteEmail.trim()}
                style={{ background: inviteSent ? "var(--green)" : "var(--accent)", border: "none", color: "white", padding: "9px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
                {inviteSent ? "✓ Enviada" : inviting ? "..." : "Invitar"}
              </button>
            </div>
          </div>

          {invitations.length > 0 && (
            <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase" }}>
                Invitaciones enviadas
              </div>
              {invitations.map(inv => (
                <div key={inv.id} style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-1)" }}>{inv.email}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>
                      {new Date(inv.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                    </span>
                    <span style={{
                      padding: "2px 8px", borderRadius: "100px", fontSize: "0.68rem", fontWeight: 700,
                      background: inv.accepted ? "rgba(63,185,80,0.1)" : "var(--bg-3)",
                      color: inv.accepted ? "var(--green)" : "var(--text-3)",
                      border: `1px solid ${inv.accepted ? "rgba(63,185,80,0.3)" : "var(--border)"}`
                    }}>
                      {inv.accepted ? "✓ Aceptada" : "Pendiente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
