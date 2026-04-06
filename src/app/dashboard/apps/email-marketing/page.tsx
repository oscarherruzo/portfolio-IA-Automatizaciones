"use client";
import { useState } from "react";
import SaveResultButton from "@/components/apps/SaveResultButton";

const TIPOS = [
  { id: "bienvenida",   label: "Secuencia de bienvenida", desc: "Para nuevos suscriptores o clientes" },
  { id: "newsletter",   label: "Newsletter",               desc: "Novedades y contenido de valor" },
  { id: "promo",        label: "Email promocional",        desc: "Oferta o descuento especial" },
  { id: "reactivacion", label: "Reactivación",             desc: "Para clientes o leads inactivos" },
  { id: "abandono",     label: "Carrito abandonado",       desc: "Recuperar ventas perdidas" },
];

const S: Record<string, React.CSSProperties> = {
  page:  { padding: "32px 40px", maxWidth: "1000px" },
  h1:    { fontSize: "1.3rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: "4px" },
  card:  { background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "24px" },
  label: { fontSize: "0.7rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" },
  input: { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-1)", fontSize: "0.875rem", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "var(--font-body)" },
};

export default function EmailMarketingPage() {
  const [tipo, setTipo]         = useState("newsletter");
  const [contexto, setContexto] = useState("");
  const [output, setOutput]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);

  async function generar() {
    if (!contexto.trim()) return;
    setLoading(true); setOutput("");
    const tipoInfo = TIPOS.find(t => t.id === tipo);
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content:
        `Eres un experto en email marketing con alta tasa de conversión. Crea un email de tipo "${tipoInfo?.label}".\n\nContexto del negocio y objetivo:\n${contexto}\n\nEstructura tu respuesta así:\nASUNTO: [línea de asunto atractiva con máx 50 caracteres]\nPREVIEW: [texto de vista previa, máx 90 caracteres]\n---\n[Cuerpo del email con saludo, desarrollo, CTA claro y despedida]\n\nTono profesional pero cercano, en español. Que genere acción.`
      }] })
    });
    const data = await res.json();
    if (data.message) setOutput(data.message);
    setLoading(false);
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  // Extract subject line for display
  const subjectLine = output.match(/ASUNTO:\s*(.+)/)?.[1] || "";

  return (
    <div style={S.page}>
      <div style={{ marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={S.h1}>Email Marketing</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>Genera emails con alta tasa de apertura y conversión con inteligencia artificial</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px" }}>
        {/* Form */}
        <div style={S.card}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={S.label}>Tipo de email</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {TIPOS.map(t => (
                  <button key={t.id} onClick={() => setTipo(t.id)} style={{
                    padding: "10px 12px", borderRadius: "8px", border: "1px solid",
                    borderColor: tipo === t.id ? "#f472b6" : "var(--border)",
                    background: tipo === t.id ? "rgba(244,114,182,0.1)" : "var(--bg-2)",
                    cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)", transition: "all 0.15s",
                  }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: tipo === t.id ? "#f472b6" : "var(--text-1)", display: "block" }}>{t.label}</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={S.label}>Contexto y objetivo</label>
              <textarea value={contexto} onChange={e => setContexto(e.target.value)} rows={7} placeholder="Describe tu negocio, el producto o servicio que promueves, el objetivo del email y el público al que va dirigido..." style={{ ...S.input, resize: "none" }} />
            </div>
            <button onClick={generar} disabled={loading || !contexto.trim()} style={{ padding: "11px", background: "#f472b6", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", fontFamily: "var(--font-body)", opacity: loading || !contexto.trim() ? 0.6 : 1 }}>
              {loading ? "Generando email..." : "Generar email"}
            </button>
          </div>
        </div>

        {/* Output */}
        <div>
          {output ? (
            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "#f472b6", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{TIPOS.find(t => t.id === tipo)?.label}</div>
                  {subjectLine && <div style={{ fontSize: "0.82rem", color: "var(--text-2)", marginTop: "4px", fontStyle: "italic" }}>"{subjectLine}"</div>}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={generar} style={{ padding: "6px 12px", background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)", borderRadius: "7px", cursor: "pointer", fontSize: "0.78rem", fontFamily: "var(--font-body)" }}>Regenerar</button>
                  <SaveResultButton content={output} appName="Email Marketing" title={`${TIPOS.find(t => t.id === tipo)?.label}`} />
                  <button onClick={copy} style={{ padding: "6px 14px", background: copied ? "var(--green)" : "var(--accent)", border: "none", color: "#fff", borderRadius: "7px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, fontFamily: "var(--font-body)", transition: "background 0.2s" }}>
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>
              <textarea value={output} onChange={e => setOutput(e.target.value)} rows={22} style={{ ...S.input, resize: "none", lineHeight: 1.7 }} />
            </div>
          ) : (
            <div style={{ ...S.card, textAlign: "center", padding: "80px 24px", color: "var(--text-3)" }}>
              <div style={{ fontSize: "2.5rem", opacity: 0.2, marginBottom: "16px" }}>◊</div>
              <p style={{ fontSize: "0.875rem" }}>El email generado aparecerá aquí</p>
              <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>Selecciona el tipo y describe el contexto del email.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
