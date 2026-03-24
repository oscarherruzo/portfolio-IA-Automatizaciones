"use client";
import { useState, useEffect } from "react";
import { timeAgo, formatDate } from "@/lib/utils";

type Note = { id: string; note: string; created_at: string };

const CATALOG_APPS = [
  { id: "gestor-citas",           icon: "📅", name: "Gestor de Citas",             color: "#2f81f7" },
  { id: "chatbot-cliente",        icon: "💬", name: "Chatbot de Atención",         color: "#3fb950" },
  { id: "faq-inteligente",        icon: "🧠", name: "FAQ Inteligente",              color: "#58a6ff" },
  { id: "contenido-redes",        icon: "✍️", name: "Generador de Contenido",      color: "#a371f7" },
  { id: "email-marketing",        icon: "📨", name: "Email Marketing IA",          color: "#f472b6" },
  { id: "descripciones-producto", icon: "🛒", name: "Descripciones de Producto",   color: "#fb923c" },
  { id: "asistente-ventas",       icon: "🤝", name: "Asistente de Ventas",         color: "#f85149" },
  { id: "generador-presupuestos", icon: "💰", name: "Generador de Presupuestos",   color: "#22d3ee" },
  { id: "analizador-reviews",     icon: "⭐", name: "Analizador de Reseñas",       color: "#ffa657" },
  { id: "resumidor-reuniones",    icon: "📝", name: "Resumidor de Reuniones",      color: "#34d399" },
  { id: "analisis-competencia",   icon: "🔍", name: "Análisis de Competencia",     color: "#818cf8" },
  { id: "redactor-contratos",     icon: "📋", name: "Redactor de Contratos",       color: "#e879f9" },
];

type UserProfile = {
  id: string; full_name: string; email: string;
  plan: string; tokens_used: number; created_at: string;
  automations_count?: number; runs_count?: number;
};
type Run = {
  id: string; status: string; tokens_used: number;
  created_at: string; user_id: string;
  automations?: { name: string; type: string };
};
type Tab = "usuarios" | "actividad";
type SortField = "created_at" | "tokens_used" | "runs_count";

export default function AdminPanel() {
  const [users, setUsers]             = useState<UserProfile[]>([]);
  const [runs, setRuns]               = useState<Run[]>([]);
  const [dailyTokens, setDailyTokens] = useState<Record<string, number>>({});
  const [search, setSearch]           = useState("");
  const [loading, setLoading]         = useState(true);
  const [updating, setUpdating]       = useState<string | null>(null);
  const [tab, setTab]                 = useState<Tab>("usuarios");
  const [sortField, setSortField]     = useState<SortField>("created_at");
  const [sortAsc, setSortAsc]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast]             = useState<string | null>(null);

  // Notas y mensajes
  const [notesModal, setNotesModal]     = useState<UserProfile | null>(null);
  const [notes, setNotes]               = useState<{id:string;note:string;created_at:string}[]>([]);
  const [newNote, setNewNote]           = useState("");
  const [msgModal, setMsgModal]         = useState<UserProfile | null>(null);
  const [msgSubject, setMsgSubject]     = useState("");
  const [msgBody, setMsgBody]           = useState("");
  const [sendingMsg, setSendingMsg]     = useState(false);

  // Modal de gestión de apps
  const [appsModal, setAppsModal]         = useState<UserProfile | null>(null);
  const [userApps, setUserApps]           = useState<string[]>([]);
  const [savingApps, setSavingApps]       = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (data.users) setUsers(data.users);
  }

  async function fetchActivity() {
    const res = await fetch("/api/admin/activity");
    const data = await res.json();
    if (data.runs) setRuns(data.runs);
    if (data.dailyTokens) setDailyTokens(data.dailyTokens);
  }

  async function loadAll() {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchActivity()]);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  // Abrir modal de apps de un usuario
  async function openAppsModal(user: UserProfile) {
    setAppsModal(user);
    const res = await fetch(`/api/admin/assign?user_id=${user.id}`);
    const data = await res.json();
    setUserApps(data.apps || []);
  }

  function toggleApp(appId: string) {
    setUserApps(prev =>
      prev.includes(appId) ? prev.filter(a => a !== appId) : [...prev, appId]
    );
  }

  async function saveApps() {
    if (!appsModal) return;
    setSavingApps(true);
    await fetch("/api/admin/assign", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: appsModal.id, app_ids: userApps }),
    });
    setSavingApps(false);
    setAppsModal(null);
    showToast(`Apps actualizadas para ${appsModal.full_name || appsModal.email}`);
  }

  async function giftTokens(userId: string, currentTokens: number, amount: number) {
    setUpdating(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokens_used: Math.max(0, currentTokens - amount) }),
    });
    await fetchUsers();
    showToast(`+${amount.toLocaleString()} tokens añadidos`);
    setUpdating(null);
  }

  async function deleteUser(userId: string) {
    setUpdating(userId);
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setUsers(prev => prev.filter(u => u.id !== userId));
    setConfirmDelete(null);
    showToast("Usuario eliminado");
    setUpdating(null);
  }

  

  async function deleteNote(id: string) {
    await fetch("/api/admin/notes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  

  function exportCSV() {
    const header = "Email,Nombre,Tokens,Automatizaciones,Ejecuciones,Registro";
    const rows = users.map(u =>
      `${u.email},${u.full_name || ""},${u.tokens_used},${u.automations_count},${u.runs_count},${formatDate(u.created_at)}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "usuarios.csv"; a.click();
    showToast("CSV exportado");
  }

  function toggleSort(field: SortField) {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  }

  async function openNotesModal(user: UserProfile) {
    setNotesModal(user);
    const res = await fetch(`/api/admin/notes?user_id=${user.id}`);
    const data = await res.json();
    setNotes(data);
  }

  async function addNote() {
    if (!newNote.trim() || !notesModal) return;
    await fetch("/api/admin/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: notesModal.id, note: newNote }) });
    setNewNote("");
    const res = await fetch(`/api/admin/notes?user_id=${notesModal.id}`);
    setNotes(await res.json());
  }

  async function sendMessage() {
    if (!msgSubject.trim() || !msgBody.trim() || !msgModal) return;
    setSendingMsg(true);
    await fetch("/api/admin/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: msgModal.id, subject: msgSubject, body: msgBody }) });
    setMsgModal(null); setMsgSubject(""); setMsgBody("");
    showToast("Mensaje enviado");
    setSendingMsg(false);
  }

  const filtered = users
    .filter(u =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = (a[sortField] ?? 0) as string | number;
      const bv = (b[sortField] ?? 0) as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortAsc ? cmp : -cmp;
    });

  const stats = {
    total:     users.length,
    tokens:    users.reduce((acc, u) => acc + (u.tokens_used || 0), 0),
    runs:      users.reduce((acc, u) => acc + (u.runs_count || 0), 0),
    avgTokens: users.length > 0 ? Math.round(users.reduce((acc, u) => acc + (u.tokens_used || 0), 0) / users.length) : 0,
    };

  const maxDaily = Math.max(...Object.values(dailyTokens), 1);

  const SortIcon = ({ field }: { field: SortField }) => (
    <span style={{ marginLeft: "4px", opacity: sortField === field ? 1 : 0.3, fontSize: "0.65rem" }}>
      {sortField === field ? (sortAsc ? "↑" : "↓") : "↕"}
    </span>
  );

  if (loading) return (
    <div style={{ padding: "60px", display: "flex", alignItems: "center", gap: "12px", color: "var(--text-3)" }}>
      <div style={{ width: "20px", height: "20px", border: "2px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      Cargando centro de mando...
    </div>
  );

  return (
    <div style={{ padding: "32px", maxWidth: "1280px" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", zIndex: 9999,
          background: "var(--accent)", color: "white", padding: "10px 20px",
          borderRadius: "10px", fontWeight: 600, fontSize: "0.85rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
        }}>{toast}</div>
      )}

      {/* Modal gestión de apps */}
      {appsModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "28px", width: "480px", maxWidth: "95vw"
          }}>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-1)", marginBottom: "4px" }}>
                Gestionar Apps
              </h2>
              <p style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>
                {appsModal.full_name || appsModal.email} — selecciona las apps a las que tiene acceso
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
              {CATALOG_APPS.map(app => {
                const active = userApps.includes(app.id);
                return (
                  <div
                    key={app.id}
                    onClick={() => toggleApp(app.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "12px 16px", borderRadius: "10px", cursor: "pointer",
                      background: active ? `${app.color}15` : "var(--bg-2)",
                      border: `1px solid ${active ? app.color + "50" : "var(--border)"}`,
                      transition: "all 0.15s"
                    }}
                  >
                    <div style={{
                      width: "20px", height: "20px", borderRadius: "4px", flexShrink: 0,
                      background: active ? app.color : "var(--bg-3)",
                      border: `1px solid ${active ? app.color : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.7rem", color: "white", fontWeight: 700
                    }}>
                      {active ? "✓" : ""}
                    </div>
                    <span style={{ fontSize: "1rem" }}>{app.icon}</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 500, color: active ? "var(--text-1)" : "var(--text-2)" }}>
                      {app.name}
                    </span>
                    {active && (
                      <span style={{
                        marginLeft: "auto", fontSize: "0.68rem", fontWeight: 700,
                        color: app.color, background: `${app.color}20`,
                        padding: "2px 8px", borderRadius: "100px"
                      }}>ACTIVA</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setAppsModal(null)}
                style={{
                  background: "var(--bg-2)", border: "1px solid var(--border)",
                  color: "var(--text-2)", padding: "9px 20px", borderRadius: "8px",
                  cursor: "pointer", fontSize: "0.85rem"
                }}
              >Cancelar</button>
              <button
                onClick={saveApps}
                disabled={savingApps}
                style={{
                  background: "var(--accent)", border: "none",
                  color: "white", padding: "9px 20px", borderRadius: "8px",
                  cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
                  opacity: savingApps ? 0.6 : 1
                }}
              >{savingApps ? "Guardando..." : `Guardar (${userApps.length} apps)`}</button>
            </div>
          </div>
        </div>
      )}


      {/* Modal notas */}
      {notesModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", width: "440px", maxWidth: "95vw" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "4px" }}>📝 Notas internas</h2>
            <p style={{ color: "var(--text-3)", fontSize: "0.8rem", marginBottom: "16px" }}>{notesModal.email}</p>
            <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {notes.length === 0 ? <p style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>Sin notas</p> : notes.map(n => (
                <div key={n.id} style={{ background: "var(--bg-2)", borderRadius: "8px", padding: "10px 12px", fontSize: "0.82rem", color: "var(--text-2)", borderLeft: "3px solid var(--accent)" }}>
                  {n.note}
                  <div style={{ fontSize: "0.68rem", color: "var(--text-3)", marginTop: "4px" }}>{new Date(n.created_at).toLocaleDateString("es-ES")}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} placeholder="Escribe una nota..." style={{ flex: 1, background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 12px", color: "var(--text-1)", fontSize: "0.85rem", outline: "none" }} />
              <button onClick={addNote} style={{ background: "var(--accent)", border: "none", color: "white", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem" }}>+</button>
            </div>
            <button onClick={() => setNotesModal(null)} style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)", padding: "9px", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem" }}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Modal mensaje directo */}
      {msgModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", width: "460px", maxWidth: "95vw" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "4px" }}>✉️ Enviar mensaje a</h2>
            <p style={{ color: "var(--text-3)", fontSize: "0.8rem", marginBottom: "16px" }}>{msgModal.email}</p>
            <input value={msgSubject} onChange={e => setMsgSubject(e.target.value)} placeholder="Asunto" style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 12px", color: "var(--text-1)", fontSize: "0.85rem", outline: "none", marginBottom: "10px", boxSizing: "border-box" }} />
            <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)} placeholder="Escribe tu mensaje..." rows={5} style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 12px", color: "var(--text-1)", fontSize: "0.85rem", outline: "none", resize: "none", marginBottom: "16px", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setMsgModal(null)} style={{ flex: 1, background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)", padding: "9px", borderRadius: "8px", cursor: "pointer" }}>Cancelar</button>
              <button onClick={sendMessage} disabled={sendingMsg} style={{ flex: 2, background: "var(--accent)", border: "none", color: "white", padding: "9px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, opacity: sendingMsg ? 0.7 : 1 }}>
                {sendingMsg ? "Enviando..." : "✉️ Enviar mensaje"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Notas */}
      {notesModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", width: "460px", maxWidth: "95vw", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-1)", marginBottom: "2px" }}>📝 Notas internas</h2>
              <p style={{ color: "var(--text-3)", fontSize: "0.78rem" }}>{notesModal.email} — solo visibles para el admin</p>
            </div>
            <div style={{ flex: 1, overflowY: "auto", marginBottom: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {notes.length === 0 && <p style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>Sin notas todavía</p>}
              {notes.map(n => (
                <div key={n.id} style={{ background: "var(--bg-2)", borderRadius: "8px", padding: "10px 12px", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.83rem", color: "var(--text-1)", lineHeight: 1.5 }}>{n.note}</p>
                    <p style={{ margin: "4px 0 0", fontSize: "0.68rem", color: "var(--text-3)" }}>{new Date(n.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <button onClick={() => deleteNote(n.id)} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: "0.8rem", flexShrink: 0 }}>🗑</button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Añadir nota..." onKeyDown={e => e.key === "Enter" && addNote()}
                style={{ flex: 1, background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 12px", color: "var(--text-1)", fontSize: "0.85rem", outline: "none" }} />
              <button onClick={addNote} disabled={!newNote.trim()} style={{ background: "var(--accent)", border: "none", color: "white", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem" }}>Añadir</button>
              <button onClick={() => setNotesModal(null)} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem" }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Mensaje */}
      {msgModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", width: "460px", maxWidth: "95vw" }}>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-1)", marginBottom: "2px" }}>📨 Enviar notificación</h2>
              <p style={{ color: "var(--text-3)", fontSize: "0.78rem" }}>Aparecerá en el panel del usuario: {msgModal.email}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <input value={msgSubject} onChange={e => setMsgSubject(e.target.value)} placeholder="Título del mensaje"
                style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-1)", fontSize: "0.85rem", outline: "none" }} />
              <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)} placeholder="Contenido del mensaje..." rows={4}
                style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-1)", fontSize: "0.85rem", outline: "none", resize: "none" }} />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setMsgModal(null)} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)", padding: "9px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem" }}>Cancelar</button>
              <button onClick={sendMessage} disabled={sendingMsg || !msgSubject.trim() || !msgBody.trim()} style={{ background: "var(--accent)", border: "none", color: "white", padding: "9px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
                {sendingMsg ? "Enviando..." : "📨 Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-1)", marginBottom: "4px" }}>
            Panel de Administración 🛡️
          </h1>
          <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>
            {users.length} usuarios registrados
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={exportCSV} style={{
            background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)",
            padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600
          }}>⬇ Exportar CSV</button>
          <button onClick={loadAll} style={{
            background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent)",
            padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600
          }}>↻ Actualizar</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "28px" }}>
        {[
          { label: "Usuarios",      val: stats.total,                 col: "var(--accent)", icon: "👤" },
          { label: "Tokens Usados", val: stats.tokens.toLocaleString(), col: "var(--amber)", icon: "⚡" },
          { label: "Media Tokens",  val: stats.avgTokens.toLocaleString(), col: "#f472b6",  icon: "◈" },
          { label: "Ejecuciones",   val: stats.runs,                  col: "var(--green)",  icon: "▶" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--surface)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.65rem", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>
              {s.icon} {s.label}
            </div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: s.col }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "var(--bg-2)", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        {(["usuarios", "actividad"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 20px", borderRadius: "7px", border: "none", cursor: "pointer",
            background: tab === t ? "var(--surface)" : "transparent",
            color: tab === t ? "var(--text-1)" : "var(--text-3)",
            fontWeight: tab === t ? 600 : 400, fontSize: "0.85rem",
            boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
          }}>{t === "usuarios" ? `👥 Usuarios (${users.length})` : "📊 Actividad"}</button>
        ))}
      </div>

      {/* TAB USUARIOS */}
      {tab === "usuarios" && (
        <>
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Buscar por email o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "var(--bg-2)", border: "1px solid var(--border-bright)",
                padding: "9px 16px", borderRadius: "9px", color: "white",
                width: "300px", fontSize: "0.85rem", outline: "none"
              }}
            />
            <span style={{ marginLeft: "auto", color: "var(--text-3)", fontSize: "0.78rem" }}>
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "13px 20px", color: "var(--text-3)", fontSize: "0.7rem" }}>CLIENTE</th>
                  <th onClick={() => toggleSort("tokens_used")} style={{ padding: "13px 16px", color: "var(--text-3)", cursor: "pointer", fontSize: "0.7rem" }}>
                    TOKENS <SortIcon field="tokens_used" />
                  </th>
                  <th onClick={() => toggleSort("runs_count")} style={{ padding: "13px 16px", color: "var(--text-3)", cursor: "pointer", fontSize: "0.7rem" }}>
                    EJECUCIONES <SortIcon field="runs_count" />
                  </th>
                  <th onClick={() => toggleSort("created_at")} style={{ padding: "13px 16px", color: "var(--text-3)", cursor: "pointer", fontSize: "0.7rem" }}>
                    REGISTRO <SortIcon field="created_at" />
                  </th>
                  <th style={{ padding: "13px 20px", color: "var(--text-3)", textAlign: "right", fontSize: "0.7rem" }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border)", opacity: updating === u.id ? 0.4 : 1, transition: "opacity 0.2s" }}>
                    <td style={{ padding: "15px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                          background: `hsl(${(u.email?.charCodeAt(0) || 0) * 17 % 360}, 55%, 32%)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: "0.85rem", color: "white"
                        }}>
                          {(u.full_name || u.email || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-1)" }}>{u.full_name || "Sin nombre"}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "15px 16px" }}>
                      <div style={{ color: "var(--text-2)", fontWeight: 600 }}>{u.tokens_used?.toLocaleString()}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>{u.automations_count} automats.</div>
                    </td>
                    <td style={{ padding: "15px 16px", color: "var(--text-2)", fontWeight: 600 }}>{u.runs_count}</td>
                    <td style={{ padding: "15px 16px", color: "var(--text-3)", fontSize: "0.78rem" }}>{timeAgo(u.created_at)}</td>

                    <td style={{ padding: "15px 20px" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", alignItems: "center" }}>
                        {/* Notas internas */}
                        <button onClick={() => openNotesModal(u)} style={{ background: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text-2)", padding: "6px 8px", borderRadius: "7px", cursor: "pointer", fontSize: "0.72rem" }}>📝</button>
                        {/* Mensaje directo */}
                        <button onClick={() => setMsgModal(u)} style={{ background: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text-2)", padding: "6px 8px", borderRadius: "7px", cursor: "pointer", fontSize: "0.72rem" }}>✉️</button>
                        <button
                          onClick={() => { setMsgModal(u); }}
                          style={{
                            background: "var(--bg-3)", border: "1px solid var(--border)",
                            color: "var(--text-2)", padding: "6px 10px", borderRadius: "7px",
                            cursor: "pointer", fontSize: "0.72rem"
                          }}
                        >📨</button>
                        <button
                          onClick={() => openNotesModal(u)}
                          style={{
                            background: "var(--bg-3)", border: "1px solid var(--border)",
                            color: "var(--text-2)", padding: "6px 10px", borderRadius: "7px",
                            cursor: "pointer", fontSize: "0.72rem"
                          }}
                        >📝</button>
                        {/* Botón principal: gestionar apps */}
                        <button
                          onClick={() => openAppsModal(u)}
                          style={{
                            background: "var(--accent-dim)", border: "1px solid var(--accent)",
                            color: "var(--accent)", padding: "6px 12px", borderRadius: "7px",
                            cursor: "pointer", fontSize: "0.75rem", fontWeight: 600
                          }}
                        >🗂 Gestionar Apps</button>

                        {/* Regalar tokens */}
                        <button
                          onClick={() => giftTokens(u.id, u.tokens_used, 5000)}
                          style={{
                            background: "var(--bg-3)", border: "1px solid var(--border)",
                            color: "var(--text-2)", padding: "6px 10px", borderRadius: "7px",
                            cursor: "pointer", fontSize: "0.72rem"
                          }}
                        >+5k tokens</button>

                        {/* Eliminar */}
                        {confirmDelete === u.id ? (
                          <>
                            <button
                              onClick={() => deleteUser(u.id)}
                              style={{
                                background: "rgba(239,68,68,0.15)", border: "1px solid rgb(239,68,68)",
                                color: "rgb(239,68,68)", padding: "6px 10px", borderRadius: "7px",
                                cursor: "pointer", fontSize: "0.72rem", fontWeight: 700
                              }}
                            >¿Borrar?</button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              style={{
                                background: "var(--bg-3)", border: "1px solid var(--border)",
                                color: "var(--text-3)", padding: "6px 8px", borderRadius: "7px",
                                cursor: "pointer", fontSize: "0.72rem"
                              }}
                            >✕</button>
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(u.id)}
                            style={{
                              background: "var(--bg-3)", border: "1px solid var(--border)",
                              color: "var(--text-3)", padding: "6px 8px", borderRadius: "7px",
                              cursor: "pointer", fontSize: "0.72rem"
                            }}
                          >🗑</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ padding: "50px", textAlign: "center", color: "var(--text-3)" }}>
                No se encontraron usuarios
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB ACTIVIDAD */}
      {tab === "actividad" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "24px" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-2)", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              ⚡ Tokens consumidos (últimos 14 días)
            </h3>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "100px" }}>
              {Object.entries(dailyTokens).length === 0 ? (
                <p style={{ color: "var(--text-3)", fontSize: "0.85rem" }}>Sin datos todavía</p>
              ) : Object.entries(dailyTokens).map(([day, val]) => (
                <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{ fontSize: "0.58rem", color: "var(--text-3)" }}>{val > 0 ? val.toLocaleString() : ""}</div>
                  <div style={{
                    width: "100%", borderRadius: "4px 4px 0 0", background: "var(--accent)",
                    height: `${Math.max(4, (val / maxDaily) * 70)}px`,
                    opacity: 0.6 + (val / maxDaily) * 0.4
                  }} />
                  <div style={{ fontSize: "0.58rem", color: "var(--text-3)", whiteSpace: "nowrap" }}>{day}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                ▶ Últimas 50 ejecuciones
              </h3>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border)" }}>
                  {["AUTOMATIZACIÓN", "USUARIO", "TOKENS", "ESTADO", "HACE"].map(h => (
                    <th key={h} style={{ padding: "11px 20px", color: "var(--text-3)", fontWeight: 700, fontSize: "0.68rem", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {runs.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-3)" }}>Sin ejecuciones todavía</td></tr>
                ) : runs.map(r => {
                  const user = users.find(u => u.id === r.user_id);
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "13px 20px", color: "var(--text-1)", fontWeight: 500 }}>
                        {r.automations?.name || "—"}
                        <span style={{ marginLeft: "6px", fontSize: "0.68rem", color: "var(--text-3)" }}>{r.automations?.type}</span>
                      </td>
                      <td style={{ padding: "13px 20px", color: "var(--text-3)", fontSize: "0.78rem" }}>
                        {user?.email || r.user_id.slice(0, 8) + "..."}
                      </td>
                      <td style={{ padding: "13px 20px", color: "var(--amber)", fontWeight: 600 }}>{r.tokens_used}</td>
                      <td style={{ padding: "13px 20px" }}>
                        <span style={{
                          padding: "2px 8px", borderRadius: "100px", fontSize: "0.68rem", fontWeight: 700,
                          background: r.status === "success" ? "rgba(63,185,80,0.12)" : r.status === "error" ? "rgba(239,68,68,0.12)" : "rgba(255,166,0,0.12)",
                          color: r.status === "success" ? "var(--green)" : r.status === "error" ? "rgb(239,68,68)" : "orange",
                          border: `1px solid ${r.status === "success" ? "rgba(63,185,80,0.3)" : r.status === "error" ? "rgba(239,68,68,0.3)" : "rgba(255,166,0,0.3)"}`
                        }}>
                          {r.status === "success" ? "✓ OK" : r.status === "error" ? "✕ Error" : "⟳ Corriendo"}
                        </span>
                      </td>
                      <td style={{ padding: "13px 20px", color: "var(--text-3)", fontSize: "0.78rem" }}>{timeAgo(r.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
