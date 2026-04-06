"use client";
import { useState } from "react";
import SaveResultButton from "@/components/apps/SaveResultButton";

const TIPOS = [
  { id: "servicios",    label: "Contrato de servicios",   desc: "Para prestación de servicios profesionales" },
  { id: "nda",          label: "NDA / Confidencialidad",  desc: "Acuerdo de no divulgación de información" },
  { id: "freelance",    label: "Contrato freelance",      desc: "Proyectos por encargo con autónomo" },
  { id: "colaboracion", label: "Acuerdo de colaboración", desc: "Entre empresas o profesionales" },
  { id: "arrendamiento",label: "Arrendamiento",           desc: "Alquiler de local, vivienda o activo" },
];

const S: Record<string, React.CSSProperties> = {
  page:  { padding: "32px 40px", maxWidth: "1000px" },
  h1:    { fontSize: "1.3rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: "4px" },
  card:  { background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "24px" },
  label: { fontSize: "0.7rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" },
  input: { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-1)", fontSize: "0.875rem", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "var(--font-body)" },
};

export default function RedactorContratosPage() {
  const [tipo, setTipo]       = useState("servicios");
  const [partes, setPartes]   = useState("");
  const [objeto, setObjeto]   = useState("");
  const [output, setOutput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);

  async function generar() {
    if (!partes.trim() || !objeto.trim()) return;
    setLoading(true); setOutput("");
    const tipoLabel = TIPOS.find(t => t.id === tipo)?.label;
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content:
        `Redacta un "${tipoLabel}" profesional con formato legal estándar español.\n\nPartes involucradas: ${partes}\n\nObjeto y condiciones: ${objeto}\n\nIncluye: identificación de partes, objeto del contrato, condiciones económicas, plazos, confidencialidad si aplica, causas de resolución, jurisdicción y espacio para firmas. Al final añade una nota indicando que es una plantilla orientativa y que debe revisarse por un abogado.`
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

  return (
    <div style={S.page}>
      <div style={{ marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={S.h1}>Redactor de Contratos</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>Contratos profesionales en minutos · Revisa siempre con un abogado antes de firmar</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "24px" }}>
        {/* Form */}
        <div style={S.card}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={S.label}>Tipo de contrato</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {TIPOS.map(t => (
                  <button key={t.id} onClick={() => setTipo(t.id)} style={{
                    padding: "10px 14px", borderRadius: "8px", border: "1px solid",
                    borderColor: tipo === t.id ? "#e879f9" : "var(--border)",
                    background: tipo === t.id ? "rgba(232,121,249,0.1)" : "var(--bg-2)",
                    cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)", transition: "all 0.15s",
                  }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: tipo === t.id ? "#e879f9" : "var(--text-1)", display: "block" }}>{t.label}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={S.label}>Partes involucradas</label>
              <textarea value={partes} onChange={e => setPartes(e.target.value)} rows={3} placeholder="Ej: Empresa A (Sociedad Limitada, CIF...) y Autónomo B (NIF...)" style={{ ...S.input, resize: "none" }} />
            </div>
            <div>
              <label style={S.label}>Objeto y condiciones</label>
              <textarea value={objeto} onChange={e => setObjeto(e.target.value)} rows={5} placeholder="Describe el trabajo a realizar, precio, plazos, forma de pago y cualquier condición especial..." style={{ ...S.input, resize: "none" }} />
            </div>
            <button onClick={generar} disabled={loading || !partes.trim() || !objeto.trim()} style={{ padding: "11px", background: "#e879f9", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", fontFamily: "var(--font-body)", opacity: loading || !partes.trim() || !objeto.trim() ? 0.6 : 1 }}>
              {loading ? "Redactando contrato..." : "Generar contrato"}
            </button>
          </div>
        </div>

        {/* Output */}
        <div>
          {output ? (
            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "#e879f9", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{TIPOS.find(t => t.id === tipo)?.label}</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-2)", marginTop: "2px" }}>Borrador generado</div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <SaveResultButton content={output} appName="Redactor de Contratos" title={`${TIPOS.find(t => t.id === tipo)?.label}`} />
                  <button onClick={copy} style={{ padding: "7px 14px", background: copied ? "var(--green)" : "var(--accent)", border: "none", color: "#fff", borderRadius: "7px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, fontFamily: "var(--font-body)", transition: "background 0.2s" }}>
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>
              <textarea value={output} onChange={e => setOutput(e.target.value)} rows={28} style={{ ...S.input, resize: "none", lineHeight: 1.7, fontSize: "0.82rem" }} />
            </div>
          ) : (
            <div style={{ ...S.card, textAlign: "center", padding: "80px 24px", color: "var(--text-3)" }}>
              <div style={{ fontSize: "2.5rem", opacity: 0.2, marginBottom: "16px" }}>▨</div>
              <p style={{ fontSize: "0.875rem" }}>El contrato aparecerá aquí</p>
              <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>Selecciona el tipo, indica las partes y el objeto del contrato.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
