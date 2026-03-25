"use client";
import { useState, useEffect } from "react";

type Review = { id: string; author?: string; rating?: number; content: string; sentiment?: string; response?: string; responded: boolean; source: string; review_date?: string; created_at: string };

const SENTIMENT_STYLE: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  positivo: { color: "#3fb950", bg: "rgba(63,185,80,0.1)",  label: "Positivo", icon: "😊" },
  neutro:   { color: "#ffa657", bg: "rgba(255,166,87,0.1)", label: "Neutro",   icon: "😐" },
  negativo: { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  label: "Negativo", icon: "😞" },
};

export default function AnalizadorReviewsPage() {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [loading, setLoading]   = useState(true);
  const [input, setInput]       = useState("");
  const [author, setAuthor]     = useState("");
  const [rating, setRating]     = useState(5);
  const [analyzing, setAnalyzing] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [filter, setFilter]     = useState("todas");
  const [toast, setToast]       = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function loadReviews() {
    const res = await fetch("/api/reviews");
    const data = await res.json();
    setReviews(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { loadReviews(); }, []);

  async function analyzeAndSave() {
    if (!input.trim()) return;
    setAnalyzing(true);
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: `Analiza esta reseña y responde SOLO en este JSON sin markdown:\n{"sentiment":"positivo|neutro|negativo","response":"respuesta profesional para publicar"}\n\nReseña: "${input}"` }] }) });
    const data = await res.json();
    let sentiment = "neutro";
    let response = "";
    if (data.message) {
      try {
        const parsed = JSON.parse(data.message.replace(/```json|```/g, "").trim());
        sentiment = parsed.sentiment || "neutro";
        response = parsed.response || "";
      } catch { sentiment = "neutro"; response = data.message; }
    }
    const saveRes = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: input, author: author || "Anónimo", rating, sentiment, response, source: "google", review_date: new Date().toISOString().split("T")[0] }) });
    if (saveRes.ok) { await loadReviews(); setInput(""); setAuthor(""); setRating(5); showToast("✓ Reseña analizada y guardada"); }
    setAnalyzing(false);
  }

  async function generateResponse(review: Review) {
    setRespondingId(review.id);
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: `Genera una respuesta profesional, empática y que cuide la reputación del negocio para esta reseña ${review.sentiment || ""}:\n"${review.content}"` }] }) });
    const data = await res.json();
    if (data.message) {
      await fetch("/api/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: review.id, response: data.message, responded: true }) });
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, response: data.message, responded: true } : r));
      showToast("✓ Respuesta generada");
    }
    setRespondingId(null);
  }

  const filtered = reviews.filter(r => filter === "todas" || r.sentiment === filter || (filter === "sin-responder" && !r.responded));
  const stats = { total: reviews.length, positivas: reviews.filter(r => r.sentiment === "positivo").length, negativas: reviews.filter(r => r.sentiment === "negativo").length, pendientes: reviews.filter(r => !r.responded).length, avgRating: reviews.filter(r => r.rating).length > 0 ? (reviews.filter(r => r.rating).reduce((a, r) => a + (r.rating || 0), 0) / reviews.filter(r => r.rating).length).toFixed(1) : "—" };

  const inp = { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "9px 12px", color: "var(--text-1)", fontSize: "0.85rem", outline: "none", width: "100%", boxSizing: "border-box" as const };

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1100px" }}>
      {toast && <div style={{ position: "fixed", top: "24px", right: "24px", zIndex: 9999, background: "var(--accent)", color: "white", padding: "10px 20px", borderRadius: "10px", fontWeight: 600 }}>{toast}</div>}

      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>⭐ Analizador de Reseñas</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>{stats.total} reseñas · {stats.pendientes} sin responder</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "10px", marginBottom: "24px" }}>
        {[
          { label: "Total",       val: stats.total,     color: "var(--accent)" },
          { label: "Positivas",   val: stats.positivas, color: "var(--green)" },
          { label: "Negativas",   val: stats.negativas, color: "#ef4444" },
          { label: "Sin responder",val: stats.pendientes,color: "var(--amber)" },
          { label: "Nota media",  val: stats.avgRating, color: "#fbbf24" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--surface)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.62rem", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>{s.label}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "20px" }}>
        {/* Formulario */}
        <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "20px", height: "fit-content" }}>
          <div style={{ fontWeight: 700, marginBottom: "14px" }}>Añadir reseña</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "8px", alignItems: "center" }}>
              <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Nombre del autor" style={inp} />
              <div style={{ display: "flex", gap: "2px" }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setRating(n)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", opacity: n <= rating ? 1 : 0.3 }}>⭐</button>
                ))}
              </div>
            </div>
            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Pega el texto de la reseña aquí..." rows={5} style={{ ...inp, resize: "none" }} />
            <button onClick={analyzeAndSave} disabled={analyzing || !input.trim()} style={{ padding: "10px", background: analyzing || !input.trim() ? "var(--bg-3)" : "var(--accent)", border: "none", color: analyzing || !input.trim() ? "var(--text-3)" : "white", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>
              {analyzing ? "Analizando con IA..." : "✨ Analizar y guardar"}
            </button>
          </div>
        </div>

        {/* Lista */}
        <div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
            {[{ val: "todas", label: "Todas" }, { val: "positivo", label: "😊 Positivas" }, { val: "neutro", label: "😐 Neutras" }, { val: "negativo", label: "😞 Negativas" }, { val: "sin-responder", label: "⏳ Sin responder" }].map(f => (
              <button key={f.val} onClick={() => setFilter(f.val)} style={{ padding: "5px 12px", borderRadius: "100px", border: "1px solid", borderColor: filter === f.val ? "var(--accent)" : "var(--border)", background: filter === f.val ? "var(--accent-dim)" : "var(--bg-2)", color: filter === f.val ? "var(--accent)" : "var(--text-3)", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>{f.label}</button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {loading ? (
              <div style={{ color: "var(--text-3)", padding: "20px" }}>Cargando...</div>
            ) : filtered.length === 0 ? (
              <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "40px", textAlign: "center", color: "var(--text-3)" }}>
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>⭐</div>
                <div style={{ fontWeight: 600 }}>Sin reseñas {filter !== "todas" ? "en este filtro" : "todavía"}</div>
              </div>
            ) : filtered.map(r => {
              const st = SENTIMENT_STYLE[r.sentiment || "neutro"] || SENTIMENT_STYLE.neutro;
              return (
                <div key={r.id} style={{ background: "var(--surface)", borderRadius: "12px", border: `1px solid ${r.responded ? "var(--border)" : "rgba(255,166,87,0.3)"}`, padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, color: "var(--text-1)" }}>{r.author || "Anónimo"}</span>
                      {r.rating && <span style={{ fontSize: "0.78rem" }}>{"⭐".repeat(r.rating)}</span>}
                      <span style={{ padding: "2px 8px", borderRadius: "100px", fontSize: "0.65rem", fontWeight: 700, background: st.bg, color: st.color }}>{st.icon} {st.label}</span>
                    </div>
                    {!r.responded && <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--amber)", background: "rgba(255,166,87,0.1)", padding: "2px 8px", borderRadius: "100px" }}>SIN RESPONDER</span>}
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "10px" }}>{r.content}</p>
                  {r.response ? (
                    <div style={{ background: "rgba(47,129,247,0.06)", border: "1px solid rgba(47,129,247,0.2)", borderRadius: "8px", padding: "10px 14px" }}>
                      <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--accent)", marginBottom: "4px" }}>RESPUESTA:</div>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-2)", lineHeight: 1.5 }}>{r.response}</div>
                      <button onClick={() => navigator.clipboard.writeText(r.response || "")} style={{ marginTop: "6px", background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "0.72rem" }}>Copiar respuesta</button>
                    </div>
                  ) : (
                    <button onClick={() => generateResponse(r)} disabled={respondingId === r.id} style={{ padding: "6px 14px", background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent)", borderRadius: "7px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, opacity: respondingId === r.id ? 0.6 : 1 }}>
                      {respondingId === r.id ? "Generando..." : "✨ Generar respuesta"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
