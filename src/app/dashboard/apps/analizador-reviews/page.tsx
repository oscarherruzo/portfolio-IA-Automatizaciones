"use client";
import { useState } from "react";
import SaveResultButton from "@/components/apps/SaveResultButton";
type Review = { texto: string; sentimiento: string; respuesta: string; fecha: string };
export default function AnalizadorReviewsPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  async function analizar() {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: `Analiza esta reseña y responde en este formato exacto:\nSENTIMIENTO: [positivo/neutro/negativo]\nRESPUESTA: [respuesta profesional para publicar]\n\nReseña: "${input}"` }] }) });
      const data = await res.json();
      if (data.message) {
        const lines = data.message.split("\n");
        const sentLine = lines.find((l: string) => l.startsWith("SENTIMIENTO:")) || "";
        const sent = sentLine.replace("SENTIMIENTO:", "").trim().toLowerCase();
        const respIdx = data.message.indexOf("RESPUESTA:");
        const resp = respIdx >= 0 ? data.message.substring(respIdx + 10).trim() : data.message;
        setReviews(prev => [{ texto: input, sentimiento: sent || "neutro", respuesta: resp, fecha: new Date().toLocaleDateString("es-ES") }, ...prev]);
        setInput("");
      }
    } finally { setLoading(false); }
  }
  const positivas = reviews.filter(r => r.sentimiento.includes("positivo")).length;
  const negativas = reviews.filter(r => r.sentimiento.includes("negativo")).length;
  const sentColor = (s: string) => s.includes("positivo") ? "#3fb950" : s.includes("negativo") ? "#f85149" : "#ffa657";
  const sentIcon = (s: string) => s.includes("positivo") ? "😊" : s.includes("negativo") ? "😞" : "😐";
  return (
    <div style={{ padding: "24px 32px", maxWidth: "1000px" }}>
      <div style={{ marginBottom: "24px" }}><h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>⭐ Analizador de Reseñas</h1><p style={{ color: "#7d8590", fontSize: "0.875rem" }}>Analiza el sentimiento y genera respuestas profesionales automáticamente</p></div>
      {reviews.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "24px" }}>
          {[{ label: "Analizadas", value: reviews.length, color: "#2f81f7" }, { label: "Positivas", value: positivas, color: "#3fb950" }, { label: "Negativas", value: negativas, color: "#f85149" }].map(s => (
            <div key={s.label} className="card" style={{ padding: "14px", textAlign: "center" }}><div style={{ fontSize: "0.72rem", color: "#7d8590", textTransform: "uppercase", marginBottom: "4px" }}>{s.label}</div><div style={{ fontSize: "1.6rem", fontWeight: 700, fontFamily: "'DM Mono',monospace", color: s.color }}>{s.value}</div></div>
          ))}
        </div>
      )}
      <div className="card" style={{ padding: "16px", marginBottom: "20px" }}>
        <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Pega aquí una reseña para analizar</label>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder='"Fui a este restaurante y la verdad es que la comida estaba buena pero el servicio dejó mucho que desear..."' rows={4} style={{ width: "100%", padding: "10px 12px", resize: "vertical", marginBottom: "10px" }} />
        <button className="btn-primary" onClick={analizar} disabled={loading || !input.trim()} style={{ width: "100%" }}>{loading ? "Analizando con IA..." : "⭐ Analizar y generar respuesta"}</button>
      </div>
      {reviews.map((r, i) => (
        <div key={i} className="card" style={{ padding: "0", marginBottom: "12px" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #30363d", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.1rem" }}>{sentIcon(r.sentimiento)}</span>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: sentColor(r.sentimiento), textTransform: "uppercase" }}>{r.sentimiento}</span>
            <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#7d8590" }}>{r.fecha}</span>
          </div>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #30363d" }}>
            <div style={{ fontSize: "0.72rem", color: "#7d8590", fontWeight: 600, textTransform: "uppercase", marginBottom: "6px" }}>Reseña original</div>
            <div style={{ fontSize: "0.83rem", color: "#c9d1d9", lineHeight: 1.5, fontStyle: "italic" }}>"{r.texto}"</div>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: "0.72rem", color: "#3fb950", fontWeight: 600, textTransform: "uppercase", marginBottom: "6px" }}>Respuesta generada</div>
            <div style={{ fontSize: "0.83rem", lineHeight: 1.6, marginBottom: "10px" }}>{r.respuesta}</div>
            <button className="btn-secondary" style={{ fontSize: "0.75rem" }} onClick={() => navigator.clipboard.writeText(r.respuesta)}>Copiar respuesta</button>
                      <SaveResultButton appId="analizador-reviews" appName="Analizador de Reseñas" outputText={r.respuesta} inputText={r.texto} />
          </div>
        </div>
      ))}
    </div>
  );
}
