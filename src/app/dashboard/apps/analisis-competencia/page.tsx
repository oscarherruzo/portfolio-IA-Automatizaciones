"use client";
import { useState } from "react";

type Analisis = { fortalezas: string[]; debilidades: string[]; oportunidades: string[]; amenazas: string[]; diferenciadores: string[]; estrategia: string } | null;

export default function AnalisisCompetenciaPage() {
  const [miNegocio, setMiNegocio]       = useState("");
  const [competidor, setCompetidor]     = useState("");
  const [analisis, setAnalisis]         = useState<Analisis>(null);
  const [loading, setLoading]           = useState(false);

  async function analizar() {
    if (!miNegocio.trim() || !competidor.trim()) return;
    setLoading(true); setAnalisis(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content:
          `Haz un análisis competitivo. Mi negocio: "${miNegocio}". Competidor/sector a analizar: "${competidor}".
Responde SOLO en JSON sin markdown:
{"fortalezas":["..."],"debilidades":["..."],"oportunidades":["..."],"amenazas":["..."],"diferenciadores":["ventaja competitiva 1","ventaja competitiva 2","ventaja competitiva 3"],"estrategia":"recomendación estratégica en 3-4 frases"}`
        }] })
      });
      const data = await res.json();
      if (data.message) {
        try {
          const clean = data.message.replace(/```json|```/g, "").trim();
          setAnalisis(JSON.parse(clean));
        } catch { setAnalisis({ fortalezas: [], debilidades: [], oportunidades: [], amenazas: [], diferenciadores: [], estrategia: data.message }); }
      }
    } finally { setLoading(false); }
  }

  const Card = ({ title, items, color, icon }: { title: string; items: string[]; color: string; icon: string }) => (
    <div style={{ background: "var(--bg-2)", borderRadius: "10px", border: `1px solid ${color}30`, padding: "16px" }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, color, textTransform: "uppercase", marginBottom: "10px" }}>{icon} {title}</div>
      <ul style={{ margin: 0, padding: "0 0 0 14px", display: "flex", flexDirection: "column", gap: "5px" }}>
        {items.map((item, i) => <li key={i} style={{ fontSize: "0.83rem", color: "var(--text-2)", lineHeight: 1.5 }}>{item}</li>)}
      </ul>
    </div>
  );

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1100px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>🔍 Análisis de Competencia</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>DAFO y estrategia competitiva con IA</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Tu negocio</label>
            <textarea
              value={miNegocio}
              onChange={e => setMiNegocio(e.target.value)}
              placeholder="Describe tu negocio, productos, mercado y clientes..."
              rows={5}
              style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", color: "var(--text-1)", fontSize: "0.84rem", resize: "none", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Competidor / Sector</label>
            <textarea
              value={competidor}
              onChange={e => setCompetidor(e.target.value)}
              placeholder="Describe a tu competidor o el sector que quieres analizar..."
              rows={5}
              style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", color: "var(--text-1)", fontSize: "0.84rem", resize: "none", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <button
            onClick={analizar}
            disabled={loading || !miNegocio.trim() || !competidor.trim()}
            style={{
              padding: "11px", borderRadius: "8px", border: "none",
              background: loading || !miNegocio.trim() || !competidor.trim() ? "var(--bg-3)" : "#818cf8",
              color: loading || !miNegocio.trim() || !competidor.trim() ? "var(--text-3)" : "#fff",
              fontWeight: 700, fontSize: "0.88rem", cursor: "pointer"
            }}
          >
            {loading ? "Analizando..." : "🔍 Analizar competencia"}
          </button>
        </div>

        <div>
          {analisis ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Card title="Fortalezas"    items={analisis.fortalezas}    color="#3fb950" icon="💪" />
                <Card title="Debilidades"   items={analisis.debilidades}   color="#f85149" icon="⚠️" />
                <Card title="Oportunidades" items={analisis.oportunidades} color="#2f81f7" icon="🚀" />
                <Card title="Amenazas"      items={analisis.amenazas}      color="#ffa657" icon="⚡" />
              </div>
              <div style={{ background: "var(--bg-2)", borderRadius: "10px", border: "1px solid rgba(129,140,248,0.3)", padding: "16px" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", marginBottom: "8px" }}>🎯 Diferenciadores clave</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {analisis.diferenciadores.map((d, i) => (
                    <span key={i} style={{ background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.3)", borderRadius: "100px", padding: "4px 12px", fontSize: "0.78rem", color: "#818cf8", fontWeight: 600 }}>{d}</span>
                  ))}
                </div>
              </div>
              <div style={{ background: "var(--surface)", borderRadius: "10px", border: "1px solid var(--border)", padding: "16px" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", marginBottom: "8px" }}>📊 Estrategia recomendada</div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-1)", lineHeight: 1.6, margin: 0 }}>{analisis.estrategia}</p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "300px", color: "var(--text-3)", gap: "10px" }}>
              <span style={{ fontSize: "3rem" }}>🔍</span>
              <span style={{ fontSize: "0.85rem" }}>El análisis aparecerá aquí</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
