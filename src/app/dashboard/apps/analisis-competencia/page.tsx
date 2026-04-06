"use client";
import { useState } from "react";

type Analisis = { fortalezas: string[]; debilidades: string[]; oportunidades: string[]; amenazas: string[]; diferenciadores: string[]; estrategia: string } | null;

const S: Record<string, React.CSSProperties> = {
  page:  { padding: "32px 40px", maxWidth: "1100px" },
  h1:    { fontSize: "1.3rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: "4px" },
  sub:   { color: "var(--text-3)", fontSize: "0.82rem" },
  card:  { background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "20px" },
  label: { fontSize: "0.7rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" },
  input: { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-1)", fontSize: "0.875rem", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "var(--font-body)", resize: "none" },
};

const QUADRANT = [
  { key: "fortalezas",    label: "Fortalezas",    accentColor: "var(--green)",  bgColor: "var(--green-dim)" },
  { key: "debilidades",   label: "Debilidades",   accentColor: "var(--rose)",   bgColor: "var(--rose-dim)" },
  { key: "oportunidades", label: "Oportunidades", accentColor: "var(--accent)", bgColor: "var(--accent-dim)" },
  { key: "amenazas",      label: "Amenazas",      accentColor: "var(--amber)",  bgColor: "var(--amber-dim)" },
];

export default function AnalisisCompetenciaPage() {
  const [miNegocio, setMiNegocio]   = useState("");
  const [competidor, setCompetidor] = useState("");
  const [analisis, setAnalisis]     = useState<Analisis>(null);
  const [loading, setLoading]       = useState(false);

  async function analizar() {
    if (!miNegocio.trim() || !competidor.trim()) return;
    setLoading(true); setAnalisis(null);
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content:
        `Eres un consultor estratégico experto. Realiza un análisis competitivo completo.\n\nMi negocio: "${miNegocio}"\nCompetidor / Sector a analizar: "${competidor}"\n\nResponde SOLO con JSON válido sin markdown:\n{"fortalezas":["f1","f2","f3"],"debilidades":["d1","d2","d3"],"oportunidades":["o1","o2","o3"],"amenazas":["a1","a2","a3"],"diferenciadores":["diferenciador clave 1","diferenciador clave 2","diferenciador clave 3"],"estrategia":"recomendación estratégica concreta en 3-4 frases"}`
      }] })
    });
    const data = await res.json();
    if (data.message) {
      try {
        const clean = data.message.replace(/```json|```/g, "").trim();
        setAnalisis(JSON.parse(clean));
      } catch { setAnalisis(null); }
    }
    setLoading(false);
  }

  return (
    <div style={S.page}>
      <div style={{ marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={S.h1}>Análisis de Competencia</h1>
        <p style={S.sub}>Informe DAFO y recomendación estratégica generados con inteligencia artificial</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px" }}>
        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={S.card}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={S.label}>Tu negocio</label>
                <textarea value={miNegocio} onChange={e => setMiNegocio(e.target.value)} rows={5} placeholder="Describe tu negocio, productos/servicios, mercado objetivo y propuesta de valor..." style={S.input} />
              </div>
              <div>
                <label style={S.label}>Competidor o sector</label>
                <textarea value={competidor} onChange={e => setCompetidor(e.target.value)} rows={5} placeholder="Nombre del competidor, descripción del sector o área de mercado a analizar..." style={S.input} />
              </div>
              <button onClick={analizar} disabled={loading || !miNegocio.trim() || !competidor.trim()} style={{ padding: "11px", background: "var(--purple)", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", fontFamily: "var(--font-body)", opacity: loading || !miNegocio.trim() || !competidor.trim() ? 0.6 : 1 }}>
                {loading ? "Analizando..." : "Generar análisis DAFO"}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {analisis ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {QUADRANT.map(q => (
                  <div key={q.key} style={{ background: "var(--surface)", border: `1px solid var(--border)`, borderRadius: "var(--radius)", padding: "18px", borderTop: `3px solid ${q.accentColor}` }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: q.accentColor, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>{q.label}</div>
                    <ul style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {((analisis as any)[q.key] as string[]).map((item, i) => (
                        <li key={i} style={{ display: "flex", gap: "8px", fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.55 }}>
                          <span style={{ color: q.accentColor, fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>—</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div style={{ ...S.card, borderLeft: "3px solid var(--purple)" }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--purple)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Diferenciadores clave</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {analisis.diferenciadores.map((d, i) => (
                    <span key={i} style={{ background: "var(--purple-dim)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: "100px", padding: "5px 14px", fontSize: "0.8rem", color: "var(--purple)", fontWeight: 600 }}>{d}</span>
                  ))}
                </div>
              </div>

              <div style={{ ...S.card, background: "linear-gradient(135deg, rgba(59,127,255,0.05) 0%, var(--surface) 60%)", borderColor: "rgba(59,127,255,0.25)" }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Recomendación estratégica</div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-1)", lineHeight: 1.75, margin: 0 }}>{analisis.estrategia}</p>
              </div>
            </div>
          ) : (
            <div style={{ ...S.card, textAlign: "center", padding: "72px 24px", color: "var(--text-3)" }}>
              <div style={{ fontSize: "2.5rem", opacity: 0.2, marginBottom: "16px" }}>◐</div>
              <p style={{ fontSize: "0.875rem" }}>El informe DAFO aparecerá aquí</p>
              <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>Describe tu negocio y el competidor para generar el análisis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
