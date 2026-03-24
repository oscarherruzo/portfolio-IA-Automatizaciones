"use client";
import { useState } from "react";
import SaveResultButton from "@/components/apps/SaveResultButton";
const HERRAMIENTAS = [{ id: "propuesta", icon: "📄", label: "Propuesta comercial", placeholder: "Describe el cliente, su problema y tu solución..." }, { id: "email", icon: "📧", label: "Email de seguimiento", placeholder: "¿Con quién tuviste la reunión y de qué tratasteis?" }, { id: "lead", icon: "🎯", label: "Cualificar lead", placeholder: "Describe al lead: empresa, cargo, necesidad, presupuesto..." }, { id: "objecion", icon: "🛡️", label: "Rebatir objeción", placeholder: "¿Qué objeción puso el cliente? (precio, tiempo, competencia...)" }];
export default function AsistenteVentasPage() {
  const [tool, setTool] = useState("propuesta");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const toolInfo = HERRAMIENTAS.find(t => t.id === tool);
  async function ejecutar() {
    if (!input.trim()) return;
    setLoading(true); setOutput("");
    const prompts: Record<string,string> = { propuesta: `Genera una propuesta comercial profesional basada en: ${input}`, email: `Redacta un email de seguimiento post-reunión basado en: ${input}`, lead: `Cualifica este lead del 1 al 10 con justificación detallada: ${input}`, objecion: `Genera una respuesta profesional y persuasiva para esta objeción: ${input}` };
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: prompts[tool] }] }) });
      const data = await res.json();
      if (data.message) setOutput(data.message);
    } finally { setLoading(false); }
  }
  return (
    <div style={{ padding: "24px 32px", maxWidth: "1100px" }}>
      <div style={{ marginBottom: "28px" }}><h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>🤝 Asistente de Ventas</h1><p style={{ color: "#7d8590", fontSize: "0.875rem" }}>Propuestas, emails y estrategias de venta con IA</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "24px" }}>
        {HERRAMIENTAS.map(t => <button key={t.id} onClick={() => { setTool(t.id); setOutput(""); }} style={{ padding: "14px 10px", borderRadius: "8px", border: `1px solid ${tool === t.id ? "#2f81f7" : "#30363d"}`, background: tool === t.id ? "rgba(47,129,247,0.1)" : "#1c2128", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", fontSize: "0.78rem", fontWeight: tool === t.id ? 700 : 400, color: tool === t.id ? "#2f81f7" : "#7d8590", fontFamily: "'DM Sans',sans-serif", textAlign: "center", transition: "all 0.15s" }}><span style={{ fontSize: "1.3rem" }}>{t.icon}</span>{t.label}</button>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="card" style={{ padding: "16px" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>{toolInfo?.label}</label>
            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={toolInfo?.placeholder} rows={8} style={{ width: "100%", padding: "10px 12px", resize: "vertical", marginBottom: "10px" }} />
            <button className="btn-primary" onClick={ejecutar} disabled={loading || !input.trim()} style={{ width: "100%" }}>{loading ? "Generando con IA..." : `Generar ${toolInfo?.label}`}</button>
          </div>
        </div>
        <div>
          {output ? (
            <div className="card" style={{ padding: "0" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #30363d", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>{toolInfo?.icon}</span>
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{toolInfo?.label}</span>
              </div>
              <div style={{ padding: "16px", whiteSpace: "pre-wrap", fontSize: "0.875rem", lineHeight: 1.7, maxHeight: "460px", overflowY: "auto" }}>{output}</div>
              <div style={{ padding: "12px 16px", borderTop: "1px solid #30363d", display: "flex", gap: "8px" }}>
                <button className="btn-secondary" style={{ fontSize: "0.78rem" }} onClick={() => navigator.clipboard.writeText(output)}>Copiar</button>
                <SaveResultButton appId="asistente-ventas" appName="Asistente de Ventas" outputText={output} inputText={input} />
                <button className="btn-secondary" style={{ fontSize: "0.78rem" }} onClick={ejecutar}>Regenerar</button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: "40px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "10px" }}>{toolInfo?.icon}</div>
              <div style={{ color: "#7d8590", fontSize: "0.83rem" }}>El resultado aparecerá aquí</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
