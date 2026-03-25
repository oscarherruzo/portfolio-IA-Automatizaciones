"use client";
import { useState, useEffect } from "react";

type Quote = { id: string; client_name: string; client_email?: string; title: string; content: string; amount?: number; status: string; valid_until?: string; created_at: string };

const TIPOS = [
  { id: "servicios",    label: "Servicios profesionales", icon: "💼" },
  { id: "obra",         label: "Obra / Reformas",          icon: "🔨" },
  { id: "software",     label: "Desarrollo software",      icon: "💻" },
  { id: "marketing",    label: "Marketing / Publicidad",   icon: "📢" },
  { id: "consultoria",  label: "Consultoría",              icon: "📊" },
];

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  borrador:  { color: "var(--text-3)", bg: "var(--bg-3)" },
  enviado:   { color: "#2f81f7",       bg: "rgba(47,129,247,0.1)" },
  aceptado:  { color: "#3fb950",       bg: "rgba(63,185,80,0.1)" },
  rechazado: { color: "#ef4444",       bg: "rgba(239,68,68,0.1)" },
};

export default function GeneradorPresupuestosPage() {
  const [quotes, setQuotes]     = useState<Quote[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tipo, setTipo]         = useState("servicios");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [description, setDescription] = useState("");
  const [output, setOutput]     = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [toast, setToast]       = useState("");
  const [tab, setTab]           = useState<"nuevo"|"historial">("nuevo");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function loadQuotes() {
    const res = await fetch("/api/quotes");
    const data = await res.json();
    setQuotes(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { loadQuotes(); }, []);

  async function generate() {
    if (!description.trim()) return;
    setGenerating(true); setOutput("");
    const tipoLabel = TIPOS.find(t => t.id === tipo)?.label;
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: `Genera un presupuesto profesional detallado de tipo "${tipoLabel}" para el cliente "${clientName || "Cliente"}".\n\nDescripción del trabajo:\n${description}\n\nFormato: partidas detalladas con precios, subtotal, IVA 21%, total. Incluye condiciones de pago y validez. Sé específico y profesional.` }] }) });
    const data = await res.json();
    if (data.message) setOutput(data.message);
    setGenerating(false);
  }

  async function saveQuote() {
    if (!output || !clientName.trim()) return;
    setSaving(true);
    const amountMatch = output.match(/TOTAL[:\s]+([0-9.,]+)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(",",".")) : null;
    const res = await fetch("/api/quotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_name: clientName, client_email: clientEmail, title: `Presupuesto ${TIPOS.find(t => t.id === tipo)?.label} - ${clientName}`, content: output, amount, status: "borrador", valid_until: new Date(Date.now() + 30*86400000).toISOString().split("T")[0] }) });
    if (res.ok) { await loadQuotes(); showToast("✓ Presupuesto guardado"); setTab("historial"); }
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/quotes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    if (selectedQuote?.id === id) setSelectedQuote(prev => prev ? { ...prev, status } : null);
    showToast("Estado actualizado");
  }

  const inp = { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "9px 12px", color: "var(--text-1)", fontSize: "0.85rem", outline: "none", width: "100%", boxSizing: "border-box" as const };

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1200px" }}>
      {toast && <div style={{ position: "fixed", top: "24px", right: "24px", zIndex: 9999, background: "var(--accent)", color: "white", padding: "10px 20px", borderRadius: "10px", fontWeight: 600 }}>{toast}</div>}

      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>💰 Generador de Presupuestos</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>{quotes.length} presupuestos · {quotes.filter(q => q.status === "aceptado").length} aceptados</p>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "var(--bg-2)", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        {[{val:"nuevo",label:"✨ Nuevo presupuesto"},{val:"historial",label:`📋 Historial (${quotes.length})`}].map(t => (
          <button key={t.val} onClick={() => setTab(t.val as any)} style={{ padding: "7px 20px", borderRadius: "7px", border: "none", cursor: "pointer", background: tab === t.val ? "var(--surface)" : "transparent", color: tab === t.val ? "var(--text-1)" : "var(--text-3)", fontWeight: tab === t.val ? 600 : 400, fontSize: "0.85rem", boxShadow: tab === t.val ? "0 1px 4px rgba(0,0,0,0.3)" : "none" }}>{t.label}</button>
        ))}
      </div>

      {tab === "nuevo" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Tipo</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {TIPOS.map(t => (
                  <button key={t.id} onClick={() => setTipo(t.id)} style={{ padding: "9px 12px", borderRadius: "7px", border: "1px solid", borderColor: tipo === t.id ? "var(--accent)" : "var(--border)", background: tipo === t.id ? "var(--accent-dim)" : "var(--bg-2)", color: tipo === t.id ? "var(--accent)" : "var(--text-2)", cursor: "pointer", textAlign: "left", fontSize: "0.84rem", fontWeight: tipo === t.id ? 600 : 400 }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div>
                <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Cliente *</label>
                <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nombre cliente" style={inp} />
              </div>
              <div>
                <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Email</label>
                <input value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="email@cliente.com" style={inp} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Descripción del trabajo *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe el trabajo, materiales, horas, alcance..." rows={7} style={{ ...inp, resize: "vertical" }} />
            </div>
            <button onClick={generate} disabled={generating || !description.trim()} style={{ padding: "11px", background: generating || !description.trim() ? "var(--bg-3)" : "#22d3ee", border: "none", color: generating || !description.trim() ? "var(--text-3)" : "#000", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>
              {generating ? "Generando presupuesto..." : "💰 Generar presupuesto"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ flex: 1, background: "var(--bg-2)", borderRadius: "12px", border: "1px solid var(--border)", padding: "20px", minHeight: "400px" }}>
              {output ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#22d3ee", textTransform: "uppercase" }}>Presupuesto generado</span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => navigator.clipboard.writeText(output)} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: "0.75rem" }}>Copiar</button>
                    </div>
                  </div>
                  <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.82rem", lineHeight: 1.7, color: "var(--text-1)", margin: 0, fontFamily: "inherit" }}>{output}</pre>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)", gap: "8px" }}>
                  <span style={{ fontSize: "2.5rem" }}>💰</span>
                  <span>El presupuesto aparecerá aquí</span>
                </div>
              )}
            </div>
            {output && (
              <button onClick={saveQuote} disabled={saving || !clientName.trim()} style={{ padding: "11px", background: saving || !clientName.trim() ? "var(--bg-3)" : "var(--accent)", border: "none", color: saving || !clientName.trim() ? "var(--text-3)" : "white", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>
                {saving ? "Guardando..." : !clientName.trim() ? "Escribe el nombre del cliente para guardar" : "💾 Guardar presupuesto"}
              </button>
            )}
          </div>
        </div>
      )}

      {tab === "historial" && (
        <div style={{ display: "grid", gridTemplateColumns: selectedQuote ? "1fr 1fr" : "1fr", gap: "20px" }}>
          <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border)" }}>
                  {["CLIENTE", "TÍTULO", "IMPORTE", "ESTADO", "FECHA", ""].map(h => (
                    <th key={h} style={{ padding: "11px 16px", color: "var(--text-3)", fontWeight: 700, fontSize: "0.68rem", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quotes.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--text-3)" }}>Sin presupuestos todavía</td></tr>
                ) : quotes.map(q => {
                  const st = STATUS_STYLE[q.status] || STATUS_STYLE.borrador;
                  return (
                    <tr key={q.id} onClick={() => setSelectedQuote(q)} style={{ borderBottom: "1px solid var(--border)", cursor: "pointer", background: selectedQuote?.id === q.id ? "var(--accent-dim)" : "transparent" }}>
                      <td style={{ padding: "11px 16px", fontWeight: 600, color: "var(--text-1)" }}>{q.client_name}</td>
                      <td style={{ padding: "11px 16px", color: "var(--text-2)", fontSize: "0.78rem" }}>{q.title.slice(0,30)}...</td>
                      <td style={{ padding: "11px 16px", color: "var(--green)", fontWeight: 600 }}>{q.amount ? `${q.amount.toLocaleString()}€` : "—"}</td>
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: "100px", fontSize: "0.65rem", fontWeight: 700, background: st.bg, color: st.color, textTransform: "capitalize" }}>{q.status}</span>
                      </td>
                      <td style={{ padding: "11px 16px", color: "var(--text-3)", fontSize: "0.75rem" }}>{new Date(q.created_at).toLocaleDateString("es-ES")}</td>
                      <td style={{ padding: "11px 16px" }}>
                        <select onClick={e => e.stopPropagation()} onChange={e => updateStatus(q.id, e.target.value)} value={q.status} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)", padding: "3px 6px", borderRadius: "5px", fontSize: "0.7rem", outline: "none" }}>
                          <option value="borrador">Borrador</option>
                          <option value="enviado">Enviado</option>
                          <option value="aceptado">Aceptado</option>
                          <option value="rechazado">Rechazado</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {selectedQuote && (
            <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-1)", marginBottom: "2px" }}>{selectedQuote.client_name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{new Date(selectedQuote.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => navigator.clipboard.writeText(selectedQuote.content)} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem" }}>Copiar</button>
                  <button onClick={() => setSelectedQuote(null)} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: "0.85rem" }}>✕</button>
                </div>
              </div>
              <div style={{ overflowY: "auto", maxHeight: "500px" }}>
                <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.82rem", lineHeight: 1.7, color: "var(--text-1)", margin: 0, fontFamily: "inherit" }}>{selectedQuote.content}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
