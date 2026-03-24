"use client";
import { useState } from "react";
import SaveResultButton from "@/components/apps/SaveResultButton";

const TIPOS = [
  { id: "servicios",    label: "Servicios profesionales", icon: "💼" },
  { id: "obra",         label: "Obra / Reformas",          icon: "🔨" },
  { id: "software",     label: "Desarrollo software",      icon: "💻" },
  { id: "marketing",    label: "Marketing / Publicidad",   icon: "📢" },
  { id: "consultoria",  label: "Consultoría",              icon: "📊" },
];

export default function GeneradorPresupuestosPage() {
  const [tipo, setTipo]       = useState("servicios");
  const [input, setInput]     = useState("");
  const [output, setOutput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [saved, setSaved]     = useState(false);

  async function guardar() {
    if (!output) return;
    setSaved(true);
    await fetch("/api/results", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: "generador-presupuestos", app_name: "Generador de Presupuestos", app_icon: "💰", input_text: input, output_text: output, title: `Presupuesto ${new Date().toLocaleDateString("es-ES")}` })
    });
    setTimeout(() => setSaved(false), 2000);
  }

  async function generar() {
    if (!input.trim()) return;
    setLoading(true); setOutput("");
    const tipoLabel = TIPOS.find(t => t.id === tipo)?.label;
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content:
          `Genera un presupuesto profesional detallado de tipo "${tipoLabel}" basado en esta descripción:\n\n${input}\n\nFormato: incluye partidas con precios estimados, subtotales, IVA (21%), total final, condiciones de pago y validez del presupuesto. Sé específico y profesional.`
        }] })
      });
      const data = await res.json();
      if (data.message) setOutput(data.message);
    } finally { setLoading(false); }
  }

  function copiar() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: "960px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>💰 Generador de Presupuestos</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>Genera presupuestos profesionales en segundos</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Tipo de presupuesto</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {TIPOS.map(t => (
                <button key={t.id} onClick={() => setTipo(t.id)} style={{
                  padding: "10px 14px", borderRadius: "8px", border: "1px solid",
                  borderColor: tipo === t.id ? "#22d3ee" : "var(--border)",
                  background: tipo === t.id ? "rgba(34,211,238,0.1)" : "var(--bg-2)",
                  color: tipo === t.id ? "#22d3ee" : "var(--text-2)",
                  cursor: "pointer", textAlign: "left", fontSize: "0.85rem", fontWeight: tipo === t.id ? 600 : 400
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Descripción del trabajo</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Describe el trabajo a presupuestar: alcance, materiales, horas estimadas, cliente..."
              rows={8}
              style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "12px", color: "var(--text-1)", fontSize: "0.85rem", resize: "vertical", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <button
            onClick={generar}
            disabled={loading || !input.trim()}
            style={{
              padding: "12px", borderRadius: "8px", border: "none",
              background: loading || !input.trim() ? "var(--bg-3)" : "#22d3ee",
              color: loading || !input.trim() ? "var(--text-3)" : "#000",
              fontWeight: 700, fontSize: "0.9rem", cursor: loading || !input.trim() ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Generando presupuesto..." : "💰 Generar presupuesto"}
          </button>
        </div>

        <div style={{ background: "var(--bg-2)", borderRadius: "12px", border: "1px solid var(--border)", padding: "20px", minHeight: "400px", position: "relative" }}>
          {output ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#22d3ee", textTransform: "uppercase" }}>Presupuesto generado</span>
                <button onClick={copiar} style={{ background: "var(--bg-3)", border: "1px solid var(--border)", color: copied ? "#3fb950" : "var(--text-2)", padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>
                  {copied ? "✓ Copiado" : "Copiar"}
                </button>
                <button onClick={guardar} style={{ background: saved ? "rgba(63,185,80,0.15)" : "var(--bg-3)", border: `1px solid ${saved ? "rgba(63,185,80,0.4)" : "var(--border)"}`, color: saved ? "var(--green)" : "var(--text-2)", padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>
                  {saved ? "✓ Guardado" : "💾 Guardar"}
                </button>
                <SaveResultButton appId="generador-presupuestos" appName="Generador de Presupuestos" outputText={output} inputText={input} />
              </div>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.83rem", lineHeight: 1.7, color: "var(--text-1)", margin: 0, fontFamily: "inherit" }}>{output}</pre>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)", gap: "8px" }}>
              <span style={{ fontSize: "2rem" }}>💰</span>
              <span style={{ fontSize: "0.85rem" }}>El presupuesto aparecerá aquí</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
