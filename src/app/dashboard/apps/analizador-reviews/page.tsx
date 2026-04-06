"use client";
import { useState } from "react";

const RATINGS = [1,2,3,4,5];

const S: Record<string, React.CSSProperties> = {
  page:  { padding: "32px 40px", maxWidth: "1000px" },
  h1:    { fontSize: "1.3rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: "4px" },
  sub:   { color: "var(--text-3)", fontSize: "0.82rem" },
  card:  { background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "24px" },
  label: { fontSize: "0.7rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" },
  input: { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-1)", fontSize: "0.875rem", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "var(--font-body)" },
};

type Sentiment = "positivo" | "negativo" | "neutral" | null;

export default function AnalizadorReviewsPage() {
  const [review, setReview]   = useState("");
  const [rating, setRating]   = useState(5);
  const [author, setAuthor]   = useState("");
  const [response, setResponse] = useState("");
  const [sentiment, setSentiment] = useState<Sentiment>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const SENTIMENT_COLOR: Record<string, string> = {
    positivo: "var(--green)", negativo: "var(--rose)", neutral: "var(--amber)"
  };
  const SENTIMENT_BG: Record<string, string> = {
    positivo: "var(--green-dim)", negativo: "var(--rose-dim)", neutral: "var(--amber-dim)"
  };

  async function analyze() {
    if (!review.trim()) return;
    setAnalyzing(true); setResponse(""); setSentiment(null);
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: `Eres un experto en gestión de reputación online. Analiza esta reseña y genera una respuesta profesional.\n\nReseña de ${author || "cliente"} (${stars} ${rating}/5):\n"${review}"\n\nResponde en formato JSON exactamente así:\n{"sentimiento":"positivo|negativo|neutral","respuesta":"texto de respuesta profesional en primera persona del plural, máximo 3 párrafos"}\n\nSolo JSON, sin markdown.`
        }]
      })
    });
    const data = await res.json();
    if (data.message) {
      try {
        const clean = data.message.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        setSentiment(parsed.sentimiento as Sentiment);
        setResponse(parsed.respuesta);
      } catch {
        setResponse(data.message);
        setSentiment("neutral");
      }
    }
    setAnalyzing(false);
  }

  return (
    <div style={S.page}>
      <div style={{ marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={S.h1}>Analizador de Reseñas</h1>
        <p style={S.sub}>Analiza el sentimiento y genera respuestas profesionales para reseñas de clientes</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Input */}
        <div style={S.card}>
          <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-2)", marginBottom: "18px" }}>Reseña del cliente</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={S.label}>Valoración</label>
              <div style={{ display: "flex", gap: "6px" }}>
                {RATINGS.map(r => (
                  <button key={r} onClick={() => setRating(r)} style={{
                    fontSize: "1.4rem", background: "none", border: "none", cursor: "pointer",
                    color: r <= rating ? "#f59e0b" : "var(--border)", transition: "color 0.15s",
                    lineHeight: 1,
                  }}>★</button>
                ))}
                <span style={{ fontSize: "0.82rem", color: "var(--text-3)", alignSelf: "center", marginLeft: "4px" }}>{rating}/5</span>
              </div>
            </div>
            <div>
              <label style={S.label}>Nombre del autor <span style={{ fontWeight: 400 }}>(opcional)</span></label>
              <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Ej: María García" style={S.input} />
            </div>
            <div>
              <label style={S.label}>Texto de la reseña</label>
              <textarea value={review} onChange={e => setReview(e.target.value)} rows={7} placeholder="Pega aquí la reseña de Google, Trustpilot u otras plataformas..." style={{ ...S.input, resize: "none" }} />
            </div>
            <button onClick={analyze} disabled={analyzing || !review.trim()} style={{ padding: "11px", background: "var(--accent)", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", fontFamily: "var(--font-body)", transition: "all 0.15s", opacity: analyzing || !review.trim() ? 0.6 : 1 }}>
              {analyzing ? "Analizando reseña..." : "Analizar y generar respuesta"}
            </button>
          </div>
        </div>

        {/* Output */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {sentiment && (
            <div style={{ ...S.card, padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: SENTIMENT_BG[sentiment], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
                {sentiment === "positivo" ? "+" : sentiment === "negativo" ? "−" : "○"}
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Sentimiento detectado</div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: SENTIMENT_COLOR[sentiment], textTransform: "capitalize", marginTop: "2px" }}>{sentiment}</div>
              </div>
            </div>
          )}

          {response && (
            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-2)" }}>Respuesta sugerida</h3>
                <button onClick={() => navigator.clipboard.writeText(response)} style={{ fontSize: "0.75rem", color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}>
                  Copiar
                </button>
              </div>
              <textarea value={response} onChange={e => setResponse(e.target.value)} rows={12} style={{ ...S.input, resize: "none", lineHeight: 1.7 }} />
              <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "8px" }}>Edita la respuesta antes de publicarla si es necesario</p>
            </div>
          )}

          {!sentiment && !analyzing && (
            <div style={{ ...S.card, textAlign: "center", padding: "48px 24px", color: "var(--text-3)" }}>
              <div style={{ fontSize: "2rem", opacity: 0.3, marginBottom: "12px" }}>◊</div>
              <p style={{ fontSize: "0.875rem" }}>Pega una reseña para ver el análisis de sentimiento y la respuesta generada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
