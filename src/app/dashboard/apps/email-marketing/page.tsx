"use client";
import { useState } from "react";
import SaveResultButton from "@/components/apps/SaveResultButton";

const TIPOS = [
  { id: "bienvenida",   label: "Secuencia de bienvenida", icon: "👋", desc: "Emails para nuevos suscriptores" },
  { id: "newsletter",   label: "Newsletter mensual",      icon: "📰", desc: "Novedades y contenido de valor" },
  { id: "promo",        label: "Email promocional",       icon: "🎁", desc: "Oferta o descuento especial" },
  { id: "reactivacion", label: "Reactivación",            icon: "🔄", desc: "Para clientes inactivos" },
  { id: "abandono",     label: "Carrito abandonado",      icon: "🛒", desc: "Recuperar ventas perdidas" },
];

export default function EmailMarketingPage() {
  const [tipo, setTipo]       = useState("newsletter");
  const [contexto, setContexto] = useState("");
  const [output, setOutput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);

  async function generar() {
    if (!contexto.trim()) return;
    setLoading(true); setOutput("");
    const tipoInfo = TIPOS.find(t => t.id === tipo);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content:
          `Crea un email de tipo "${tipoInfo?.label}" con este contexto:\n\n${contexto}\n\nIncluye: asunto atractivo (ASUNTO:), preview text (PREVIEW:), cuerpo del email con estructura clara, y CTA fuerte. Tono profesional pero cercano. En español.`
        }] })
      });
      const data = await res.json();
      if (data.message) setOutput(data.message);
    } finally { setLoading(false); }
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1000px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>📨 Email Marketing IA</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>Genera emails que convierten en segundos</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Tipo de email</label>
            {TIPOS.map(t => (
              <button key={t.id} onClick={() => setTipo(t.id)} style={{
                width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid",
                borderColor: tipo === t.id ? "#f472b6" : "var(--border)",
                background: tipo === t.id ? "rgba(244,114,182,0.1)" : "var(--bg-2)",
                cursor: "pointer", textAlign: "left", marginBottom: "6px",
                display: "flex", flexDirection: "column", gap: "2px"
              }}>
                <span style={{ fontSize: "0.84rem", fontWeight: tipo === t.id ? 700 : 500, color: tipo === t.id ? "#f472b6" : "var(--text-1)" }}>
                  {t.icon} {t.label}
                </span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{t.desc}</span>
              </button>
            ))}
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Contexto de tu negocio</label>
            <textarea
              value={contexto}
              onChange={e => setContexto(e.target.value)}
              placeholder="¿De qué trata tu negocio? ¿Qué quieres comunicar en este email? ¿Hay alguna oferta o novedad?"
              rows={7}
              style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", color: "var(--text-1)", fontSize: "0.82rem", resize: "none", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <button
            onClick={generar}
            disabled={loading || !contexto.trim()}
            style={{
              padding: "11px", borderRadius: "8px", border: "none",
              background: loading || !contexto.trim() ? "var(--bg-3)" : "#f472b6",
              color: loading || !contexto.trim() ? "var(--text-3)" : "#fff",
              fontWeight: 700, fontSize: "0.88rem", cursor: loading || !contexto.trim() ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Generando email..." : "📨 Generar email"}
          </button>
        </div>

        <div style={{ background: "var(--bg-2)", borderRadius: "12px", border: "1px solid var(--border)", padding: "20px", minHeight: "500px", position: "relative" }}>
          {output ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f472b6", textTransform: "uppercase" }}>Email generado</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  style={{ background: "var(--bg-3)", border: "1px solid var(--border)", color: copied ? "#3fb950" : "var(--text-2)", padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}
                >
                  {copied ? "✓ Copiado" : "Copiar todo"}
                </button>
                <SaveResultButton appId="email-marketing" appName="Email Marketing IA" outputText={output} inputText={contexto} />
              </div>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.83rem", lineHeight: 1.7, color: "var(--text-1)", margin: 0, fontFamily: "inherit" }}>{output}</pre>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)", gap: "8px" }}>
              <span style={{ fontSize: "2.5rem" }}>📨</span>
              <span style={{ fontSize: "0.85rem" }}>El email aparecerá aquí</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
