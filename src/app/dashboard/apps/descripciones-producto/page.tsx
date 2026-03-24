"use client";
import { useState } from "react";
import SaveResultButton from "@/components/apps/SaveResultButton";

const FORMATOS = [
  { id: "web",         label: "Tienda online",     icon: "🌐" },
  { id: "amazon",      label: "Amazon / Miravia",  icon: "📦" },
  { id: "instagram",   label: "Instagram / Redes", icon: "📸" },
  { id: "ficha",       label: "Ficha técnica",     icon: "📋" },
];

export default function DescripcionesProductoPage() {
  const [formato, setFormato] = useState("web");
  const [producto, setProducto] = useState("");
  const [publico, setPublico] = useState("");
  const [output, setOutput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState<{ producto: string; output: string }[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  async function generar() {
    if (!producto.trim()) return;
    setLoading(true); setOutput(""); setSelected(null);
    const fmt = FORMATOS.find(f => f.id === formato);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content:
          `Genera una descripción de producto para formato "${fmt?.label}".\nProducto: ${producto}\n${publico ? `Público objetivo: ${publico}\n` : ""}Incluye: descripción principal atractiva, beneficios clave, características técnicas si aplica, y CTA. Optimizado para SEO. En español.`
        }] })
      });
      const data = await res.json();
      if (data.message) {
        setOutput(data.message);
        setHistorial(h => [{ producto, output: data.message }, ...h.slice(0,4)]);
      }
    } finally { setLoading(false); }
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1100px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>🛒 Descripciones de Producto</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>Copy persuasivo que convierte visitas en ventas</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Formato</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {FORMATOS.map(f => (
                <button key={f.id} onClick={() => setFormato(f.id)} style={{
                  padding: "10px", borderRadius: "8px", border: "1px solid",
                  borderColor: formato === f.id ? "#fb923c" : "var(--border)",
                  background: formato === f.id ? "rgba(251,146,60,0.1)" : "var(--bg-2)",
                  color: formato === f.id ? "#fb923c" : "var(--text-2)",
                  cursor: "pointer", fontSize: "0.82rem", fontWeight: formato === f.id ? 700 : 400
                }}>
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Producto *</label>
            <textarea
              value={producto}
              onChange={e => setProducto(e.target.value)}
              placeholder="Describe tu producto: nombre, características, materiales, tamaño, precio..."
              rows={5}
              style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", color: "var(--text-1)", fontSize: "0.84rem", resize: "none", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Público objetivo (opcional)</label>
            <input
              value={publico}
              onChange={e => setPublico(e.target.value)}
              placeholder="Ej: madres con hijos, profesionales 30-45 años..."
              style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", color: "var(--text-1)", fontSize: "0.84rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <button
            onClick={generar}
            disabled={loading || !producto.trim()}
            style={{
              padding: "11px", borderRadius: "8px", border: "none",
              background: loading || !producto.trim() ? "var(--bg-3)" : "#fb923c",
              color: loading || !producto.trim() ? "var(--text-3)" : "#fff",
              fontWeight: 700, fontSize: "0.88rem", cursor: loading || !producto.trim() ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Generando..." : "🛒 Generar descripción"}
          </button>

          {historial.length > 0 && (
            <div>
              <p style={{ fontSize: "0.72rem", color: "var(--text-3)", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>Historial</p>
              {historial.map((h, i) => (
                <button key={i} onClick={() => { setOutput(h.output); setSelected(i); }} style={{
                  width: "100%", padding: "8px 12px", background: selected === i ? "var(--accent-dim)" : "var(--bg-2)",
                  border: `1px solid ${selected === i ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "6px", marginBottom: "4px", cursor: "pointer", textAlign: "left",
                  fontSize: "0.75rem", color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                }}>
                  📦 {h.producto.slice(0, 40)}...
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: "var(--bg-2)", borderRadius: "12px", border: "1px solid var(--border)", padding: "20px", minHeight: "400px" }}>
          {output ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fb923c", textTransform: "uppercase" }}>Descripción generada</span>
                <button
                  onClick={() => navigator.clipboard.writeText(output)}
                  style={{ background: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text-2)", padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem" }}
                >
                  Copiar
                </button>
                <SaveResultButton appId="descripciones-producto" appName="Descripciones de Producto" outputText={output} inputText={producto} />
              </div>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.83rem", lineHeight: 1.7, color: "var(--text-1)", margin: 0, fontFamily: "inherit" }}>{output}</pre>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)", gap: "8px" }}>
              <span style={{ fontSize: "2.5rem" }}>🛒</span>
              <span>La descripción aparecerá aquí</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
