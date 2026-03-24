"use client";
import { useState } from "react";
type FAQ = { pregunta: string; respuesta: string };
export default function FaqInteligentePage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"base"|"test">("base");
  async function generarRespuesta() {
    if (!pregunta.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: `Genera una respuesta clara y profesional para esta pregunta frecuente de clientes: "${pregunta}"` }] }) });
      const data = await res.json();
      if (data.message) setRespuesta(data.message);
    } finally { setLoading(false); }
  }
  async function testFaq() {
    if (!testInput.trim() || faqs.length === 0) return;
    setLoading(true); setTestOutput("");
    const base = faqs.map(f => `P: ${f.pregunta}\nR: ${f.respuesta}`).join("\n\n");
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: `Usando esta base de conocimiento:\n\n${base}\n\nResponde a esta pregunta del cliente: "${testInput}"` }] }) });
      const data = await res.json();
      if (data.message) setTestOutput(data.message);
    } finally { setLoading(false); }
  }
  return (
    <div style={{ padding: "24px 32px", maxWidth: "1000px" }}>
      <div style={{ marginBottom: "24px" }}><h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>🧠 FAQ Inteligente</h1><p style={{ color: "#7d8590", fontSize: "0.875rem" }}>Crea tu base de conocimiento y prueba cómo responderá la IA</p></div>
      <div style={{ display: "flex", gap: "0", marginBottom: "20px", borderBottom: "1px solid #30363d" }}>
        {[{ id: "base", label: `Base de conocimiento (${faqs.length})` }, { id: "test", label: "Probar FAQ" }].map(t => <button key={t.id} onClick={() => setTab(t.id as "base"|"test")} style={{ padding: "10px 20px", background: "none", border: "none", borderBottom: `2px solid ${tab === t.id ? "#2f81f7" : "transparent"}`, color: tab === t.id ? "#2f81f7" : "#7d8590", fontWeight: tab === t.id ? 700 : 400, cursor: "pointer", fontSize: "0.875rem", fontFamily: "'DM Sans',sans-serif", marginBottom: "-1px" }}>{t.label}</button>)}
      </div>
      {tab === "base" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div className="card" style={{ padding: "16px" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, marginBottom: "12px" }}>Añadir pregunta</div>
            <input value={pregunta} onChange={e => setPregunta(e.target.value)} placeholder="¿Cuáles son vuestros horarios?" style={{ width: "100%", padding: "8px 12px", marginBottom: "8px" }} />
            <button className="btn-secondary" onClick={generarRespuesta} disabled={loading || !pregunta.trim()} style={{ width: "100%", marginBottom: "10px", fontSize: "0.78rem" }}>{loading ? "Generando..." : "✨ Generar respuesta con IA"}</button>
            {respuesta && <><textarea value={respuesta} onChange={e => setRespuesta(e.target.value)} rows={4} style={{ width: "100%", padding: "8px 12px", resize: "vertical", marginBottom: "8px" }} /><button className="btn-primary" onClick={() => { if (pregunta && respuesta) { setFaqs(prev => [...prev, { pregunta, respuesta }]); setPregunta(""); setRespuesta(""); } }} style={{ width: "100%" }}>+ Añadir a la base</button></>}
          </div>
          <div>
            {faqs.length === 0 ? <div className="card" style={{ padding: "32px", textAlign: "center" }}><div style={{ fontSize: "2rem", marginBottom: "8px" }}>🧠</div><div style={{ color: "#7d8590", fontSize: "0.83rem" }}>Añade preguntas frecuentes de tus clientes</div></div>
            : faqs.map((f, i) => <div key={i} className="card" style={{ padding: "14px", marginBottom: "8px" }}><div style={{ fontWeight: 600, fontSize: "0.83rem", marginBottom: "6px", color: "#58a6ff" }}>{f.pregunta}</div><div style={{ fontSize: "0.78rem", color: "#c9d1d9", lineHeight: 1.5 }}>{f.respuesta.substring(0, 120)}...</div><button onClick={() => setFaqs(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#7d8590", cursor: "pointer", fontSize: "0.72rem", marginTop: "6px" }}>Eliminar</button></div>)}
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: "600px" }}>
          <div className="card" style={{ padding: "16px", marginBottom: "16px" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Simula una pregunta de cliente</label>
            <input value={testInput} onChange={e => setTestInput(e.target.value)} placeholder="Escribe una pregunta como si fuera un cliente..." style={{ width: "100%", padding: "8px 12px", marginBottom: "10px" }} onKeyDown={e => e.key === "Enter" && testFaq()} />
            <button className="btn-primary" onClick={testFaq} disabled={loading || !testInput.trim() || faqs.length === 0} style={{ width: "100%" }}>{loading ? "Consultando base..." : "Probar respuesta"}</button>
            {faqs.length === 0 && <div style={{ fontSize: "0.75rem", color: "#ffa657", marginTop: "8px" }}>Añade preguntas a la base de conocimiento primero</div>}
          </div>
          {testOutput && <div className="card" style={{ padding: "16px" }}><div style={{ fontSize: "0.72rem", color: "#3fb950", fontWeight: 600, textTransform: "uppercase", marginBottom: "8px" }}>Respuesta de la IA</div><div style={{ fontSize: "0.875rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{testOutput}</div></div>}
        </div>
      )}
    </div>
  );
}
