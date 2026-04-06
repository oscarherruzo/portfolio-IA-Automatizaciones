"use client";
import { useState } from "react";

const REDES = [
  { id: "linkedin", label: "LinkedIn", desc: "Profesional, reflexivo, con valor" },
  { id: "instagram", label: "Instagram", desc: "Visual, emocional, con hashtags" },
  { id: "twitter", label: "X / Twitter", desc: "Directo, conciso, impactante" },
  { id: "facebook", label: "Facebook", desc: "Conversacional, cercano" },
];
const TONOS = ["Profesional","Inspirador","Educativo","Entretenido","Urgente"];

const S: Record<string, React.CSSProperties> = {
  page:  { padding: "32px 40px", maxWidth: "1000px" },
  h1:    { fontSize: "1.3rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: "4px" },
  sub:   { color: "var(--text-3)", fontSize: "0.82rem" },
  card:  { background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "24px" },
  label: { fontSize: "0.7rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" },
  input: { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-1)", fontSize: "0.875rem", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "var(--font-body)" },
};

export default function ContenidoRedesPage() {
  const [red, setRed]       = useState("linkedin");
  const [tono, setTono]     = useState("Profesional");
  const [tema, setTema]     = useState("");
  const [contexto, setContexto] = useState("");
  const [output, setOutput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const redData = REDES.find(r => r.id === red)!;

  async function generate() {
    if (!tema.trim()) return;
    setGenerating(true); setOutput("");
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: `Eres un experto en marketing de contenidos y social media. Crea un post para ${redData.label}.\n\nTema: ${tema}\n${contexto ? `Contexto adicional: ${contexto}` : ""}\nTono: ${tono}\nEstilo ${redData.label}: ${redData.desc}\n\nCrea el post completo optimizado para ${redData.label}, incluyendo emojis si corresponde${red === "instagram" ? ", hashtags relevantes al final" : ""}${red === "twitter" ? " (máx 280 caracteres)" : ""}. Que sea directo, auténtico y que genere engagement.`
        }]
      })
    });
    const data = await res.json();
    if (data.message) setOutput(data.message);
    setGenerating(false);
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={S.page}>
      <div style={{ marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={S.h1}>Generador de Contenido</h1>
        <p style={S.sub}>Crea posts optimizados para cada red social con inteligencia artificial</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
        {/* Form */}
        <div style={S.card}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={S.label}>Red social</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {REDES.map(r => (
                  <button key={r.id} onClick={() => setRed(r.id)} style={{
                    padding: "10px 14px", borderRadius: "8px", border: "1px solid",
                    borderColor: red === r.id ? "var(--accent)" : "var(--border)",
                    background: red === r.id ? "var(--accent-dim)" : "var(--bg-2)",
                    cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)", transition: "all 0.15s",
                  }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: red === r.id ? "var(--accent)" : "var(--text-1)", display: "block" }}>{r.label}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={S.label}>Tono</label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {TONOS.map(t => (
                  <button key={t} onClick={() => setTono(t)} style={{
                    padding: "5px 12px", borderRadius: "100px", border: "1px solid",
                    borderColor: tono === t ? "var(--accent)" : "var(--border)",
                    background: tono === t ? "var(--accent-dim)" : "transparent",
                    color: tono === t ? "var(--accent)" : "var(--text-3)",
                    cursor: "pointer", fontSize: "0.78rem", fontWeight: tono === t ? 600 : 400, fontFamily: "var(--font-body)", transition: "all 0.15s",
                  }}>{t}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={S.label}>Tema del post</label>
              <input value={tema} onChange={e => setTema(e.target.value)} placeholder="Ej: Cómo mejorar la productividad con IA" style={S.input} />
            </div>

            <div>
              <label style={S.label}>Contexto adicional <span style={{ fontWeight: 400 }}>(opcional)</span></label>
              <textarea value={contexto} onChange={e => setContexto(e.target.value)} placeholder="Datos, estadísticas, anécdota personal, CTA específico..." rows={3} style={{ ...S.input, resize: "none" }} />
            </div>

            <button onClick={generate} disabled={generating || !tema.trim()} style={{ padding: "11px", background: "var(--accent)", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", fontFamily: "var(--font-body)", opacity: generating || !tema.trim() ? 0.6 : 1 }}>
              {generating ? "Generando contenido..." : `Crear post para ${redData.label}`}
            </button>
          </div>
        </div>

        {/* Output */}
        <div>
          {output ? (
            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{redData.label}</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-2)", marginTop: "2px" }}>Post generado</div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={generate} style={{ padding: "6px 12px", background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)", borderRadius: "7px", cursor: "pointer", fontSize: "0.78rem", fontFamily: "var(--font-body)" }}>
                    Regenerar
                  </button>
                  <button onClick={copy} style={{ padding: "6px 14px", background: copied ? "var(--green)" : "var(--accent)", border: "none", color: "#fff", borderRadius: "7px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, fontFamily: "var(--font-body)", transition: "background 0.2s" }}>
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>
              <textarea value={output} onChange={e => setOutput(e.target.value)} rows={16} style={{ ...S.input, resize: "none", lineHeight: 1.7 }} />
            </div>
          ) : (
            <div style={{ ...S.card, textAlign: "center", padding: "60px 24px", color: "var(--text-3)" }}>
              <div style={{ fontSize: "2.5rem", opacity: 0.2, marginBottom: "16px" }}>▣</div>
              <p style={{ fontSize: "0.875rem", marginBottom: "6px" }}>Tu post aparecerá aquí</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>Selecciona la red, el tono y el tema, luego genera el contenido.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
