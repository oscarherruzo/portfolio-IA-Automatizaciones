"use client";
import { useState, useEffect } from "react";

type Lead = { id: string; name: string; email?: string; phone?: string; company?: string; status: string; notes?: string; value?: number; created_at: string };
type Tab = "leads" | "herramientas";

const STATUS: Record<string, { color: string; bg: string; label: string }> = {
  nuevo:      { color: "#3b7fff", bg: "rgba(59,127,255,0.1)", label: "Nuevo" },
  contactado: { color: "var(--purple)", bg: "var(--purple-dim)", label: "Contactado" },
  propuesta:  { color: "var(--amber)", bg: "var(--amber-dim)", label: "Propuesta" },
  cerrado:    { color: "var(--green)", bg: "var(--green-dim)", label: "Cerrado" },
  perdido:    { color: "var(--rose)", bg: "var(--rose-dim)", label: "Perdido" },
};

const HERRAMIENTAS = [
  { id: "propuesta",  label: "Propuesta comercial",  placeholder: "Describe el cliente, su problema y tu solución..." },
  { id: "email",      label: "Email de seguimiento",  placeholder: "¿Con quién fue la reunión y de qué se habló?" },
  { id: "lead",       label: "Cualificar lead",       placeholder: "Empresa, cargo, necesidad, presupuesto aproximado..." },
  { id: "objecion",   label: "Rebatir objeción",      placeholder: "¿Qué objeción puso el cliente? Ej: precio, tiempo, necesita pensar..." },
];

const S: Record<string, React.CSSProperties> = {
  page:  { padding: "32px 40px", maxWidth: "1200px" },
  h1:    { fontSize: "1.3rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: "4px" },
  card:  { background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "20px" },
  label: { fontSize: "0.7rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" },
  input: { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-1)", fontSize: "0.875rem", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "var(--font-body)" },
};

const TAB = (active: boolean): React.CSSProperties => ({
  padding: "7px 18px", borderRadius: "7px", border: "none", cursor: "pointer",
  background: active ? "var(--surface)" : "transparent",
  color: active ? "var(--text-1)" : "var(--text-3)",
  fontWeight: active ? 600 : 400, fontSize: "0.85rem",
  boxShadow: active ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
  fontFamily: "var(--font-body)", transition: "all 0.15s",
});

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
  const [filter, setFilter] = useState("todos");
  const [form, setForm]     = useState({ name: "", email: "", phone: "", company: "", status: "nuevo", notes: "", value: "" });

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
    if (res.ok) { await loadLeads(); setShowForm(false); setForm({ name: "", email: "", phone: "", company: "", status: "nuevo", notes: "", value: "" }); showToast("Lead añadido correctamente"); }
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
    const prompts: Record<string, string> = {
      propuesta:  `Eres un experto en ventas B2B. Genera una propuesta comercial persuasiva y profesional.\n\nContexto: ${toolInput}\n\nIncluye: introducción que conecta con el problema, solución propuesta, beneficios concretos (cuantificados si es posible), inversión orientativa, next steps claros.`,
      email:      `Escribe un email de seguimiento comercial natural y no invasivo.\n\nContexto de la reunión: ${toolInput}\n\nEl email debe: recordar la conversación, reforzar el valor, resolver posibles dudas y proponer un siguiente paso concreto.`,
      lead:       `Analiza este lead y determina si merece dedicarle tiempo.\n\nDatos del lead: ${toolInput}\n\nEvalúa: encaje con cliente ideal, nivel de urgencia, capacidad de decisión y presupuesto. Da una puntuación del 1-10 y recomienda la siguiente acción.`,
      objecion:   `Eres un experto en manejo de objeciones. Responde a esta objeción de ventas de forma empática y efectiva.\n\nObjeción: ${toolInput}\n\nDa 3 formas diferentes de rebatirla, de más suave a más directa.`,
    };
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: prompts[tool] }] }) });
    const data = await res.json();
    if (data.message) setToolOutput(data.message);
    setGenerating(false);
  }

  const filtered = filter === "todos" ? leads : leads.filter(l => l.status === filter);
  const pipelineValue = leads.filter(l => l.status !== "perdido").reduce((acc, l) => acc + (l.value || 0), 0);

  return (
    <div style={S.page}>
      {toast && <div style={{ position: "fixed", top: "24px", right: "24px", zIndex: 9999, background: "var(--green)", color: "#fff", padding: "10px 20px", borderRadius: "8px", fontWeight: 600, fontSize: "0.875rem", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>{toast}</div>}

      <div style={{ marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={S.h1}>Asistente de Ventas</h1>
            <p style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>{leads.length} leads · Pipeline activo: {pipelineValue > 0 ? `€${pipelineValue.toLocaleString()}` : "—"}</p>
          </div>
        </div>
      </div>

      {/* Stats rápidos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginBottom: "24px" }}>
        {Object.entries(STATUS).map(([key, s]) => {
          const count = leads.filter(l => l.status === key).length;
          return (
            <button key={key} onClick={() => setFilter(filter === key ? "todos" : key)} style={{
              padding: "12px 14px", background: filter === key ? s.bg : "var(--surface)", border: "1px solid",
              borderColor: filter === key ? s.color : "var(--border)", borderRadius: "var(--radius)",
              cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)", transition: "all 0.15s",
            }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: s.color }}>{count}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: "2px" }}>{s.label}</div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "var(--bg-2)", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        <button onClick={() => setTab("leads")} style={TAB(tab === "leads")}>Pipeline de leads</button>
        <button onClick={() => setTab("herramientas")} style={TAB(tab === "herramientas")}>Herramientas IA</button>
      </div>

      {tab === "leads" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
            <button onClick={() => setShowForm(!showForm)} style={{ padding: "9px 18px", background: "var(--accent)", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", fontFamily: "var(--font-body)" }}>
              {showForm ? "Cancelar" : "+ Nuevo lead"}
            </button>
          </div>

          {showForm && (
            <div style={{ ...S.card, marginBottom: "20px" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-2)", marginBottom: "16px" }}>Nuevo lead</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "12px" }}>
                {[{label:"Nombre *",key:"name",ph:"Nombre completo"},{label:"Email",key:"email",ph:"email@empresa.com"},{label:"Empresa",key:"company",ph:"Nombre empresa"}].map(f => (
                  <div key={f.key}>
                    <label style={S.label}>{f.label}</label>
                    <input value={(form as any)[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} placeholder={f.ph} style={S.input} />
                  </div>
                ))}
                {[{label:"Teléfono",key:"phone",ph:"+34 600..."},{label:"Valor est. (€)",key:"value",ph:"0"},{label:"Estado",key:"status",ph:""}].map(f => (
                  <div key={f.key}>
                    <label style={S.label}>{f.label}</label>
                    {f.key === "status" ? (
                      <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))} style={S.input}>
                        {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    ) : (
                      <input type={f.key === "value" ? "number" : "text"} value={(form as any)[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} placeholder={f.ph} style={S.input} />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={S.label}>Notas</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} rows={2} placeholder="Contexto, necesidades, próximo paso..." style={{ ...S.input, resize: "none" }} />
              </div>
              <button onClick={saveLead} disabled={saving || !form.name.trim()} style={{ padding: "10px 20px", background: "var(--accent)", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", fontFamily: "var(--font-body)" }}>
                {saving ? "Guardando..." : "Añadir lead"}
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "48px", color: "var(--text-3)" }}>Cargando leads...</div>
          ) : filtered.length === 0 ? (
            <div style={{ ...S.card, textAlign: "center", padding: "48px", color: "var(--text-3)" }}>
              <div style={{ fontSize: "2rem", opacity: 0.2, marginBottom: "12px" }}>◎</div>
              <p>No hay leads {filter !== "todos" ? `con estado "${STATUS[filter]?.label}"` : "todavía"}.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filtered.map(lead => {
                const s = STATUS[lead.status] || STATUS.nuevo;
                return (
                  <div key={lead.id} style={{ ...S.card, padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr auto auto", gap: "16px", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-1)" }}>{lead.name}</span>
                        {lead.company && <span style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>· {lead.company}</span>}
                        {lead.value && <span style={{ fontSize: "0.78rem", color: "var(--green)", fontWeight: 600, marginLeft: "auto" }}>€{lead.value.toLocaleString()}</span>}
                      </div>
                      {lead.notes && <p style={{ fontSize: "0.8rem", color: "var(--text-3)", paddingLeft: "18px" }}>{lead.notes}</p>}
                    </div>
                    <select value={lead.status} onChange={e => updateStatus(lead.id, e.target.value)} style={{ ...S.input, width: "140px", fontSize: "0.8rem", padding: "6px 10px", color: s.color, background: s.bg, borderColor: s.color + "40" }}>
                      {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <button onClick={() => deleteLead(lead.id)} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: "1.1rem", padding: "4px 8px", borderRadius: "4px" }}>×</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "herramientas" && (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px" }}>
          <div style={S.card}>
            <label style={S.label}>Herramienta</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "18px" }}>
              {HERRAMIENTAS.map(h => (
                <button key={h.id} onClick={() => { setTool(h.id); setToolInput(""); setToolOutput(""); }} style={{
                  padding: "10px 14px", borderRadius: "8px", border: "1px solid",
                  borderColor: tool === h.id ? "var(--rose)" : "var(--border)",
                  background: tool === h.id ? "var(--rose-dim)" : "var(--bg-2)",
                  color: tool === h.id ? "var(--rose)" : "var(--text-2)",
                  cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: tool === h.id ? 600 : 400, transition: "all 0.15s",
                }}>{h.label}</button>
              ))}
            </div>
            <label style={S.label}>Contexto</label>
            <textarea value={toolInput} onChange={e => setToolInput(e.target.value)} rows={8} placeholder={HERRAMIENTAS.find(h => h.id === tool)?.placeholder} style={{ ...S.input, resize: "none", marginBottom: "12px" }} />
            <button onClick={generate} disabled={generating || !toolInput.trim()} style={{ width: "100%", padding: "10px", background: "var(--rose)", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", fontFamily: "var(--font-body)", opacity: generating || !toolInput.trim() ? 0.6 : 1 }}>
              {generating ? "Generando..." : "Generar"}
            </button>
          </div>

          <div>
            {toolOutput ? (
              <div style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-2)" }}>{HERRAMIENTAS.find(h => h.id === tool)?.label}</div>
                  <button onClick={() => navigator.clipboard.writeText(toolOutput)} style={{ padding: "6px 14px", background: "var(--accent)", border: "none", color: "#fff", borderRadius: "7px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, fontFamily: "var(--font-body)" }}>Copiar</button>
                </div>
                <textarea value={toolOutput} onChange={e => setToolOutput(e.target.value)} rows={24} style={{ ...S.input, resize: "none", lineHeight: 1.7 }} />
              </div>
            ) : (
              <div style={{ ...S.card, textAlign: "center", padding: "80px 24px", color: "var(--text-3)" }}>
                <div style={{ fontSize: "2.5rem", opacity: 0.2, marginBottom: "16px" }}>◎</div>
                <p style={{ fontSize: "0.875rem" }}>Selecciona una herramienta e introduce el contexto</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
