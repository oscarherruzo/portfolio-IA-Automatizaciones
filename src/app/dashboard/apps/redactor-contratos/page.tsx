"use client";
import { useState } from "react";
import SaveResultButton from "@/components/apps/SaveResultButton";

const TIPOS = [
  { id: "servicios",   label: "Contrato de servicios",    icon: "💼" },
  { id: "nda",         label: "NDA / Confidencialidad",   icon: "🔒" },
  { id: "freelance",   label: "Contrato freelance",       icon: "💻" },
  { id: "colaboracion",label: "Acuerdo de colaboración",  icon: "🤝" },
  { id: "arrendamiento",label: "Arrendamiento",           icon: "🏠" },
];

export default function RedactorContratosPage() {
  const [tipo, setTipo]       = useState("servicios");
  const [partes, setPartes]   = useState("");
  const [objeto, setObjeto]   = useState("");
  const [output, setOutput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);

  async function generar() {
    if (!partes.trim() || !objeto.trim()) return;
    setLoading(true); setOutput("");
    const tipoLabel = TIPOS.find(t => t.id === tipo)?.label;
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content:
          `Redacta un "${tipoLabel}" profesional.\n\nPartes: ${partes}\n\nObjeto del contrato / detalles: ${objeto}\n\nIncluye: partes identificadas, objeto, condiciones, precio/forma de pago si aplica, duración, confidencialidad, resolución de conflictos, y firmas. Formato legal estándar español. Añade una nota al final indicando que es una plantilla orientativa.`
        }] })
      });
      const data = await res.json();
      if (data.message) setOutput(data.message);
    } finally { setLoading(false); }
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1000px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>📋 Redactor de Contratos</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>Contratos profesionales en minutos · Siempre revisa con un abogado</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Tipo de contrato</label>
            {TIPOS.map(t => (
              <button key={t.id} onClick={() => setTipo(t.id)} style={{
                width: "100%", padding: "9px 12px", borderRadius: "7px", border: "1px solid",
                borderColor: tipo === t.id ? "#e879f9" : "var(--border)",
                background: tipo === t.id ? "rgba(232,121,249,0.1)" : "var(--bg-2)",
                color: tipo === t.id ? "#e879f9" : "var(--text-2)",
                cursor: "pointer", textAlign: "left", marginBottom: "5px",
                fontSize: "0.84rem", fontWeight: tipo === t.id ? 700 : 400
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Partes del contrato</label>
            <textarea
              value={partes}
              onChange={e => setPartes(e.target.value)}
              placeholder="Ej: Parte A: Juan García, autónomo. Parte B: Empresa SL, con CIF..."
              rows={4}
              style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", color: "var(--text-1)", fontSize: "0.84rem", resize: "none", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Objeto y detalles</label>
            <textarea
              value={objeto}
              onChange={e => setObjeto(e.target.value)}
              placeholder="Describe el servicio, duración, precio, condiciones especiales..."
              rows={5}
              style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", color: "var(--text-1)", fontSize: "0.84rem", resize: "none", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <button
            onClick={generar}
            disabled={loading || !partes.trim() || !objeto.trim()}
            style={{
              padding: "11px", borderRadius: "8px", border: "none",
              background: loading || !partes.trim() || !objeto.trim() ? "var(--bg-3)" : "#e879f9",
              color: loading || !partes.trim() || !objeto.trim() ? "var(--text-3)" : "#fff",
              fontWeight: 700, fontSize: "0.88rem", cursor: "pointer"
            }}
          >
            {loading ? "Redactando contrato..." : "📋 Generar contrato"}
          </button>
        </div>

        <div style={{ background: "var(--bg-2)", borderRadius: "12px", border: "1px solid var(--border)", padding: "20px", minHeight: "500px" }}>
          {output ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#e879f9", textTransform: "uppercase" }}>Contrato generado</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  style={{ background: "var(--bg-3)", border: "1px solid var(--border)", color: copied ? "#3fb950" : "var(--text-2)", padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}
                >
                  {copied ? "✓ Copiado" : "Copiar"}
                </button>
                <SaveResultButton appId="redactor-contratos" appName="Redactor de Contratos" outputText={output} inputText={objeto} />
              </div>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.8rem", lineHeight: 1.7, color: "var(--text-1)", margin: 0, fontFamily: "inherit" }}>{output}</pre>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)", gap: "8px" }}>
              <span style={{ fontSize: "2.5rem" }}>📋</span>
              <span>El contrato aparecerá aquí</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
