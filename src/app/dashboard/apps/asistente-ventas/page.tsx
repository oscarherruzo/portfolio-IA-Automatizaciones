"use client";
import { useState, useEffect } from "react";

type Lead = { id: string; name: string; email?: string; phone?: string; company?: string; status: string; notes?: string; value?: number; created_at: string };
type Tab = "leads" | "generar";

const STATUS = { nuevo: { color: "#2f81f7", bg: "rgba(47,129,247,0.1)", label: "Nuevo" }, contactado: { color: "#a371f7", bg: "rgba(163,113,247,0.1)", label: "Contactado" }, propuesta: { color: "#ffa657", bg: "rgba(255,166,87,0.1)", label: "Propuesta" }, cerrado: { color: "#3fb950", bg: "rgba(63,185,80,0.1)", label: "Cerrado ✓" }, perdido: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "Perdido" } };

const HERRAMIENTAS = [
  { id: "propuesta",  icon: "📄", label: "Propuesta comercial",  placeholder: "Describe el cliente, su problema y tu solución..." },
  { id: "email",      icon: "📧", label: "Email de seguimiento", placeholder: "¿Con quién fue la reunión y de qué se habló?" },
  { id: "lead",       icon: "🎯", label: "Cualificar lead",      placeholder: "Empresa, cargo, necesidad, presupuesto aproximado..." },
  { id: "objecion",   icon: "🛡️", label: "Rebatir objeción",    placeholder: "¿Qué objeción puso el cliente? (precio, tiempo...)" },
];

export default function AsistenteVentasPage() {
  const [tab, setTab]       = useState<Tab>("leads");
  const [leads, setLeads]   = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState("");
  const [tool, setTool]     = useState("propuesta");
  const [toolInput, setToolInput] = useState("");
  const [toolOutput, setToolOutput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", status: "nuevo", notes: "", value: "" });

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function loadLeads() {
    const res = await fetch("/api/leads");
    const data = await res.json();
    setLeads(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { loadLeads(); }, []);

  async function saveLead() {
    if (!form.name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, value: form.value ? parseFloat(form.value) : null }) });
    if (res.ok) { await loadLeads(); setShowForm(false); setForm({ name: "", email: "", phone: "", company: "", status: "nuevo", notes: "", value: "" }); showToast("✓ Lead añadido"); }
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  }

  async function deleteLead(id: string) {
    await fetch("/api/leads", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setLeads(prev => prev.filter(l => l.id !== id));
    showToast("Lead eliminado");
  }

  async function generate() {
    if (!toolInput.trim()) return;
    setGenerating(true); setToolOutput("");
    const prompts: Record<string,string> = {
      propuesta: `Genera una propuesta comercial profesional y persuasiva basada en: ${toolInput}. Incluye: presentación, problema detectado, solución propuesta, beneficios, precio orientativo y CTA.`,
      email: `Redacta un email de seguimiento post-reunión profesional y que motive a avanzar: ${toolInput}`,
      lead: `Cualifica este lead del 1 al 10 con justificación detallada. Indica probabilidad de cierre y próximos pasos recomendados: ${toolInput}`,
      objecion: `Genera una respuesta profesional, empática y persuasiva para esta objeción de ventas: ${toolInput}`
    };
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: prompts[tool] }] }) });
    const data = await res.json();
    if (data.message) setToolOutput(data.message);
    setGenerating(false);
  }

  const filtered = leads.filter(l => filterStatus === "todos" || l.status === filterStatus);
  const pipeline = { total: leads.length, valor: leads.filter(l => l.status !== "perdido").reduce((a,l) => a + (l.value || 0), 0), cerrados: leads.filter(l => l.status === "cerrado").length };

  const inp = { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "9px 12px", color: "var(--text-1)", fontSize: "0.85rem", outline: "none", width: "100%", boxSizing: "border-box" as const };

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1200px" }}>
      {toast && <div style={{ position: "fixed", top: "24px", right: "24px", zIndex: 9999, background: "var(--accent)", color: "white", padding: "10px 20px", borderRadius: "10px", fontWeight: 600 }}>{toast}</div>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>🤝 Asistente de Ventas</h1>
          <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>{pipeline.total} leads · {pipeline.cerrados} cerrados · {pipeline.valor > 0 ? `${pipeline.valor.toLocaleString()}€ en pipeline` : "Pipeline vacío"}</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ background: "var(--accent)", border: "none", color: "white", padding: "8px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>+ Añadir lead</button>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "var(--bg-2)", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        {(["leads","generar"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 20px", borderRadius: "7px", border: "none", cursor: "pointer", background: tab === t ? "var(--surface)" : "transparent", color: tab === t ? "var(--text-1)" : "var(--text-3)", fontWeight: tab === t ? 600 : 400, fontSize: "0.85rem", boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.3)" : "none" }}>
            {t === "leads" ? `👥 CRM Leads (${leads.length})` : "✨ Herramientas IA"}
          </button>
        ))}
      </div>

      {tab === "leads" && (
        <>
          <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
            {[{ val: "todos", label: `Todos (${leads.length})` }, ...Object.entries(STATUS).map(([val, s]) => ({ val, label: `${s.label} (${leads.filter(l => l.status === val).length})` }))].map(f => (
              <button key={f.val} onClick={() => setFilterStatus(f.val)} style={{ padding: "5px 12px", borderRadius: "100px", border: "1px solid", borderColor: filterStatus === f.val ? "var(--accent)" : "var(--border)", background: filterStatus === f.val ? "var(--accent-dim)" : "var(--bg-2)", color: filterStatus === f.val ? "var(--accent)" : "var(--text-3)", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>{f.label}</button>
            ))}
          </div>

          <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border)" }}>
                  {["LEAD", "EMPRESA", "CONTACTO", "VALOR", "ESTADO", ""].map(h => (
                    <th key={h} style={{ padding: "12px 16px", color: "var(--text-3)", fontWeight: 700, fontSize: "0.68rem", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--text-3)" }}>Sin leads{filterStatus !== "todos" ? " en este estado" : ". Añade tu primer lead arriba"}</td></tr>
                ) : filtered.map(l => {
                  const st = STATUS[l.status as keyof typeof STATUS] || STATUS.nuevo;
                  return (
                    <tr key={l.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 600, color: "var(--text-1)" }}>{l.name}</div>
                        {l.notes && <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{l.notes.slice(0,50)}{l.notes.length > 50 ? "..." : ""}</div>}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text-2)" }}>{l.company || "—"}</td>
                      <td style={{ padding: "12px 16px", color: "var(--text-3)", fontSize: "0.78rem" }}>{l.email || l.phone || "—"}</td>
                      <td style={{ padding: "12px 16px", color: l.value ? "var(--green)" : "var(--text-3)", fontWeight: l.value ? 600 : 400 }}>{l.value ? `${l.value.toLocaleString()}€` : "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ padding: "3px 9px", borderRadius: "100px", fontSize: "0.68rem", fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: "5px" }}>
                          <select onChange={e => updateStatus(l.id, e.target.value)} value={l.status} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)", padding: "4px 6px", borderRadius: "6px", fontSize: "0.7rem", outline: "none" }}>
                            {Object.entries(STATUS).map(([val, s]) => <option key={val} value={val}>{s.label}</option>)}
                          </select>
                          <button onClick={() => deleteLead(l.id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "4px 7px", borderRadius: "6px", cursor: "pointer", fontSize: "0.7rem" }}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "generar" && (
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {HERRAMIENTAS.map(h => (
              <button key={h.id} onClick={() => { setTool(h.id); setToolInput(""); setToolOutput(""); }} style={{ padding: "12px 14px", borderRadius: "9px", border: "1px solid", borderColor: tool === h.id ? "var(--accent)" : "var(--border)", background: tool === h.id ? "var(--accent-dim)" : "var(--surface)", cursor: "pointer", textAlign: "left", display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "1.2rem" }}>{h.icon}</span>
                <span style={{ fontSize: "0.85rem", fontWeight: tool === h.id ? 600 : 400, color: tool === h.id ? "var(--accent)" : "var(--text-1)" }}>{h.label}</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <textarea value={toolInput} onChange={e => setToolInput(e.target.value)} placeholder={HERRAMIENTAS.find(h => h.id === tool)?.placeholder} rows={5} style={{ ...inp, resize: "vertical" }} />
            <button onClick={generate} disabled={generating || !toolInput.trim()} style={{ padding: "11px", background: generating || !toolInput.trim() ? "var(--bg-3)" : "var(--accent)", border: "none", color: generating || !toolInput.trim() ? "var(--text-3)" : "white", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>
              {generating ? "Generando..." : `✨ Generar ${HERRAMIENTAS.find(h => h.id === tool)?.label}`}
            </button>
            {toolOutput && (
              <div style={{ background: "var(--bg-2)", borderRadius: "10px", border: "1px solid var(--border)", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>Resultado</span>
                  <button onClick={() => navigator.clipboard.writeText(toolOutput)} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: "0.75rem" }}>Copiar</button>
                </div>
                <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.83rem", color: "var(--text-1)", margin: 0, fontFamily: "inherit", lineHeight: 1.7 }}>{toolOutput}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", width: "460px", maxWidth: "95vw" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "18px" }}>Añadir lead</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Nombre *" style={inp} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <input value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))} placeholder="Empresa" style={inp} />
                <input value={form.value} onChange={e => setForm(f => ({...f, value: e.target.value}))} placeholder="Valor estimado €" type="number" style={inp} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="Email" style={inp} />
                <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="Teléfono" style={inp} />
              </div>
              <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} style={inp}>
                {Object.entries(STATUS).map(([val, s]) => <option key={val} value={val}>{s.label}</option>)}
              </select>
              <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Notas sobre el lead..." rows={3} style={{ ...inp, resize: "none" }} />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)", padding: "9px", borderRadius: "8px", cursor: "pointer" }}>Cancelar</button>
              <button onClick={saveLead} disabled={saving || !form.name.trim()} style={{ flex: 2, background: "var(--accent)", border: "none", color: "white", padding: "9px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, opacity: !form.name.trim() ? 0.5 : 1 }}>
                {saving ? "Guardando..." : "✓ Guardar lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
