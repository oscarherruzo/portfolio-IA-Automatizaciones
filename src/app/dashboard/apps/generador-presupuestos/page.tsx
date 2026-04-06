"use client";
import { useState, useEffect } from "react";

type Quote = { id: string; client_name: string; client_email?: string; title: string; content: string; amount?: number; status: string; valid_until?: string; created_at: string };

const TIPOS = [
  { id: "servicios",   label: "Servicios profesionales" },
  { id: "obra",        label: "Obra / Reformas" },
  { id: "software",    label: "Desarrollo software" },
  { id: "marketing",   label: "Marketing / Publicidad" },
  { id: "consultoria", label: "Consultoría" },
];

const STATUS: Record<string, { color: string; bg: string; label: string }> = {
  borrador:  { color: "var(--text-3)", bg: "var(--bg-3)", label: "Borrador" },
  enviado:   { color: "var(--accent)", bg: "var(--accent-dim)", label: "Enviado" },
  aceptado:  { color: "var(--green)", bg: "var(--green-dim)", label: "Aceptado" },
  rechazado: { color: "var(--rose)", bg: "var(--rose-dim)", label: "Rechazado" },
};

const S: Record<string, React.CSSProperties> = {
  page:  { padding: "32px 40px", maxWidth: "1200px" },
  h1:    { fontSize: "1.3rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: "4px" },
  card:  { background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "24px" },
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
  const [tab, setTab]           = useState<"nuevo" | "historial">("nuevo");

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
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content:
        `Eres un experto en presupuestos profesionales. Genera un presupuesto formal y detallado.\n\nTipo: "${tipoLabel}"\nCliente: "${clientName || "Cliente"}"\nDescripción del trabajo: ${description}\n\nIncluye:\n1. Encabezado profesional\n2. Partidas detalladas con descripción, unidades y precio unitario\n3. Subtotal, IVA 21%, TOTAL\n4. Condiciones de pago\n5. Validez del presupuesto (30 días)\n\nSé específico con los precios según el mercado actual español.`
      }] })
    });
    const data = await res.json();
    if (data.message) setOutput(data.message);
    setGenerating(false);
  }

  async function saveQuote() {
    if (!output || !clientName.trim()) return;
    setSaving(true);
    const amountMatch = output.match(/TOTAL[:\s]+[€]?\s*([0-9.,]+)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(",", ".")) : null;
    const res = await fetch("/api/quotes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_name: clientName, client_email: clientEmail, title: `${TIPOS.find(t => t.id === tipo)?.label} — ${clientName}`, content: output, amount, status: "borrador", valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0] })
    });
    if (res.ok) { await loadQuotes(); showToast("Presupuesto guardado"); setTab("historial"); }
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/quotes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    if (selectedQuote?.id === id) setSelectedQuote(prev => prev ? { ...prev, status } : null);
    showToast("Estado actualizado");
  }

  const totalAceptado = quotes.filter(q => q.status === "aceptado").reduce((acc, q) => acc + (q.amount || 0), 0);

  return (
    <div style={S.page}>
      {toast && <div style={{ position: "fixed", top: "24px", right: "24px", zIndex: 9999, background: "var(--green)", color: "#fff", padding: "10px 20px", borderRadius: "8px", fontWeight: 600, fontSize: "0.875rem", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>{toast}</div>}

      <div style={{ marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={S.h1}>Generador de Presupuestos</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>
          {quotes.length} presupuestos · {quotes.filter(q => q.status === "aceptado").length} aceptados
          {totalAceptado > 0 && ` · €${totalAceptado.toLocaleString()} facturado`}
        </p>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "var(--bg-2)", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        <button onClick={() => setTab("nuevo")} style={TAB(tab === "nuevo")}>Nuevo presupuesto</button>
        <button onClick={() => setTab("historial")} style={TAB(tab === "historial")}>Historial ({quotes.length})</button>
      </div>

      {tab === "nuevo" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "24px" }}>
          {/* Form */}
          <div style={S.card}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={S.label}>Tipo de presupuesto</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  {TIPOS.map(t => (
                    <button key={t.id} onClick={() => setTipo(t.id)} style={{
                      padding: "9px 12px", borderRadius: "7px", border: "1px solid",
                      borderColor: tipo === t.id ? "var(--teal)" : "var(--border)",
                      background: tipo === t.id ? "var(--teal-dim)" : "var(--bg-2)",
                      color: tipo === t.id ? "var(--teal)" : "var(--text-2)",
                      cursor: "pointer", textAlign: "left", fontSize: "0.875rem", fontWeight: tipo === t.id ? 600 : 400, fontFamily: "var(--font-body)", transition: "all 0.15s",
                    }}>{t.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={S.label}>Nombre del cliente</label>
                  <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Empresa o persona" style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Email del cliente</label>
                  <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="email@cliente.com" style={S.input} />
                </div>
              </div>
              <div>
                <label style={S.label}>Descripción del trabajo</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={8} placeholder="Describe detalladamente el trabajo a realizar, alcance, requisitos especiales, materiales incluidos..." style={{ ...S.input, resize: "none" }} />
              </div>
              <button onClick={generate} disabled={generating || !description.trim()} style={{ padding: "11px", background: "var(--teal)", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", fontFamily: "var(--font-body)", opacity: generating || !description.trim() ? 0.6 : 1 }}>
                {generating ? "Generando presupuesto..." : "Generar presupuesto con IA"}
              </button>
            </div>
          </div>

          {/* Output */}
          <div>
            {output ? (
              <div style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Presupuesto generado</div>
                    {clientName && <div style={{ fontSize: "0.82rem", color: "var(--text-2)", marginTop: "2px" }}>Para: {clientName}</div>}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => navigator.clipboard.writeText(output)} style={{ padding: "6px 12px", background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)", borderRadius: "7px", cursor: "pointer", fontSize: "0.78rem", fontFamily: "var(--font-body)" }}>Copiar</button>
                    <button onClick={saveQuote} disabled={saving || !clientName.trim()} style={{ padding: "6px 14px", background: "var(--accent)", border: "none", color: "#fff", borderRadius: "7px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, fontFamily: "var(--font-body)", opacity: !clientName.trim() ? 0.5 : 1 }}>
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </div>
                <textarea value={output} onChange={e => setOutput(e.target.value)} rows={26} style={{ ...S.input, resize: "none", lineHeight: 1.7, fontSize: "0.82rem", fontFamily: "'DM Mono', monospace" }} />
              </div>
            ) : (
              <div style={{ ...S.card, textAlign: "center", padding: "80px 24px", color: "var(--text-3)" }}>
                <div style={{ fontSize: "2.5rem", opacity: 0.2, marginBottom: "16px" }}>▦</div>
                <p style={{ fontSize: "0.875rem" }}>El presupuesto aparecerá aquí</p>
                <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>Completa el formulario y genera el presupuesto con IA.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "historial" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "48px", color: "var(--text-3)" }}>Cargando...</div>
            ) : quotes.length === 0 ? (
              <div style={{ ...S.card, textAlign: "center", padding: "48px", color: "var(--text-3)" }}>
                <p>No hay presupuestos guardados.</p>
              </div>
            ) : (
              quotes.map(q => {
                const s = STATUS[q.status] || STATUS.borrador;
                const isSelected = selectedQuote?.id === q.id;
                return (
                  <button key={q.id} onClick={() => setSelectedQuote(q)} style={{
                    ...S.card, padding: "14px 18px", textAlign: "left", cursor: "pointer",
                    borderColor: isSelected ? "var(--accent)" : "var(--border)",
                    background: isSelected ? "rgba(59,127,255,0.05)" : "var(--surface)",
                    fontFamily: "var(--font-body)", transition: "all 0.15s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-1)" }}>{q.client_name}</span>
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, color: s.color, background: s.bg, padding: "2px 8px", borderRadius: "100px", flexShrink: 0 }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>{q.title}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                      {q.amount && <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--teal)" }}>€{q.amount.toLocaleString()}</span>}
                      <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{new Date(q.created_at).toLocaleDateString("es-ES")}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div>
            {selectedQuote ? (
              <div style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-1)" }}>{selectedQuote.client_name}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-3)", marginTop: "2px" }}>{selectedQuote.title}</div>
                  </div>
                  <select value={selectedQuote.status} onChange={e => updateStatus(selectedQuote.id, e.target.value)} style={{ ...S.input, width: "140px", fontSize: "0.8rem", padding: "6px 10px" }}>
                    {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div style={{ ...S.input, height: "480px", overflowY: "auto", whiteSpace: "pre-wrap", lineHeight: 1.7, fontSize: "0.82rem", fontFamily: "'DM Mono', monospace", resize: "none" }}>
                  {selectedQuote.content}
                </div>
              </div>
            ) : (
              <div style={{ ...S.card, textAlign: "center", padding: "80px 24px", color: "var(--text-3)" }}>
                <p>Selecciona un presupuesto para ver el detalle</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
