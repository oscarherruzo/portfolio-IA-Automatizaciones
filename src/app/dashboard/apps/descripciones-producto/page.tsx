"use client";
import { useState } from "react";
import SaveResultButton from "@/components/apps/SaveResultButton";

const FORMATOS = [
  { id: "web",      label: "Tienda online",    desc: "SEO + conversión para ecommerce" },
  { id: "amazon",   label: "Amazon / Miravia", desc: "Bullet points + keywords" },
  { id: "instagram", label: "Instagram / Redes", desc: "Emocional + hashtags" },
  { id: "ficha",    label: "Ficha técnica",    desc: "Especificaciones detalladas" },
];

const S: Record<string, React.CSSProperties> = {
  page:  { padding: "32px 40px", maxWidth: "1000px" },
  h1:    { fontSize: "1.3rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: "4px" },
  card:  { background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "24px" },
  label: { fontSize: "0.7rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" },
  input: { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-1)", fontSize: "0.875rem", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "var(--font-body)" },
};

export default function DescripcionesProductoPage() {
  const [formato, setFormato]   = useState("web");
  const [producto, setProducto] = useState("");
  const [publico, setPublico]   = useState("");
  const [output, setOutput]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);
  const [historial, setHistorial] = useState<{ producto: string; output: string }[]>([]);
  const [selectedHist, setSelectedHist] = useState<number | null>(null);

  async function generar() {
    if (!producto.trim()) return;
    setLoading(true); setOutput(""); setSelectedHist(null);
    const fmt = FORMATOS.find(f => f.id === formato)!;
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content:
        `Eres un experto en copywriting de producto y ecommerce. Crea una descripción optimizada para "${fmt.label}".\n\nProducto: ${producto}\n${publico ? `Público objetivo: ${publico}\n` : ""}Formato: ${fmt.desc}\n\nLa descripción debe ser persuasiva, clara y orientada a la conversión. Incluye los beneficios antes que las características. En español.`
      }] })
    });
    const data = await res.json();
    if (data.message) {
      setOutput(data.message);
      setHistorial(h => [{ producto: producto.slice(0, 40), output: data.message }, ...h.slice(0, 4)]);
    }
    setLoading(false);
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={S.page}>
      <div style={{ marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={S.h1}>Descripciones de Producto</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>Copy persuasivo optimizado para cada canal de venta</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={S.card}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={S.label}>Formato de destino</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {FORMATOS.map(f => (
                    <button key={f.id} onClick={() => setFormato(f.id)} style={{
                      padding: "10px 12px", borderRadius: "8px", border: "1px solid",
                      borderColor: formato === f.id ? "#fb923c" : "var(--border)",
                      background: formato === f.id ? "rgba(251,146,60,0.1)" : "var(--bg-2)",
                      cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)", transition: "all 0.15s",
                    }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: formato === f.id ? "#fb923c" : "var(--text-1)", display: "block" }}>{f.label}</span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{f.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={S.label}>Producto</label>
                <textarea value={producto} onChange={e => setProducto(e.target.value)} rows={5} placeholder="Nombre del producto, características principales, materiales, dimensiones, precio, cualquier dato relevante..." style={{ ...S.input, resize: "none" }} />
              </div>
              <div>
                <label style={S.label}>Público objetivo <span style={{ fontWeight: 400 }}>(opcional)</span></label>
                <input value={publico} onChange={e => setPublico(e.target.value)} placeholder="Ej: Mujeres 25-40 años interesadas en diseño de interiores" style={S.input} />
              </div>
              <button onClick={generar} disabled={loading || !producto.trim()} style={{ padding: "11px", background: "#fb923c", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", fontFamily: "var(--font-body)", opacity: loading || !producto.trim() ? 0.6 : 1 }}>
                {loading ? "Generando descripción..." : "Generar descripción"}
              </button>
            </div>
          </div>

          {historial.length > 0 && (
            <div style={S.card}>
              <div style={S.label}>Generados anteriormente</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {historial.map((h, i) => (
                  <button key={i} onClick={() => { setOutput(h.output); setSelectedHist(i); }} style={{
                    padding: "8px 12px", borderRadius: "7px", border: "1px solid",
                    borderColor: selectedHist === i ? "#fb923c" : "var(--border)",
                    background: selectedHist === i ? "rgba(251,146,60,0.08)" : "var(--bg-2)",
                    cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)", transition: "all 0.15s",
                    fontSize: "0.82rem", color: "var(--text-2)",
                  }}>
                    {h.producto}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Output */}
        <div>
          {output ? (
            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "#fb923c", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{FORMATOS.find(f => f.id === formato)?.label}</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-2)", marginTop: "2px" }}>Descripción generada</div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={generar} style={{ padding: "6px 12px", background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)", borderRadius: "7px", cursor: "pointer", fontSize: "0.78rem", fontFamily: "var(--font-body)" }}>Regenerar</button>
                  <SaveResultButton content={output} appName="Descripciones de Producto" title={`${FORMATOS.find(f => f.id === formato)?.label}`} />
                  <button onClick={copy} style={{ padding: "6px 14px", background: copied ? "var(--green)" : "var(--accent)", border: "none", color: "#fff", borderRadius: "7px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, fontFamily: "var(--font-body)", transition: "background 0.2s" }}>
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>
              <textarea value={output} onChange={e => setOutput(e.target.value)} rows={22} style={{ ...S.input, resize: "none", lineHeight: 1.7 }} />
            </div>
          ) : (
            <div style={{ ...S.card, textAlign: "center", padding: "80px 24px", color: "var(--text-3)" }}>
              <div style={{ fontSize: "2.5rem", opacity: 0.2, marginBottom: "16px" }}>▤</div>
              <p style={{ fontSize: "0.875rem" }}>La descripción generada aparecerá aquí</p>
              <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>Selecciona el formato, describe el producto y genera el copy.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
