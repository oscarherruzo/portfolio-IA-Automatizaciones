"use client";
import { useState } from "react";
import SaveResultButton from "@/components/apps/SaveResultButton";
const REDES = [{ id: "linkedin", label: "LinkedIn", icon: "💼", color: "#0077b5" }, { id: "instagram", label: "Instagram", icon: "📸", color: "#e1306c" }, { id: "twitter", label: "Twitter/X", icon: "🐦", color: "#1da1f2" }, { id: "facebook", label: "Facebook", icon: "👥", color: "#4267b2" }];
const TONOS = ["Profesional", "Cercano", "Inspirador", "Humorístico", "Urgente"];
export default function ContenidoRedesPage() {
  const [red, setRed] = useState("linkedin");
  const [tono, setTono] = useState("Profesional");
  const [tema, setTema] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ red: string; tema: string; content: string }[]>([]);
  async function generar() {
    if (!tema.trim()) return;
    setLoading(true); setOutput("");
    const redInfo = REDES.find(r => r.id === red);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: `Crea un post para ${redInfo?.label} sobre: "${tema}". Tono: ${tono}. Sigue el formato correcto para ${redInfo?.label} con hashtags si aplica.` }] }) });
      const data = await res.json();
      if (data.message) { setOutput(data.message); setHistory(h => [{ red: redInfo?.label || "", tema, content: data.message }, ...h.slice(0, 4)]); }
    } finally { setLoading(false); }
  }
  const redActiva = REDES.find(r => r.id === red);
  return (
    <div style={{ padding: "24px 32px", maxWidth: "1100px" }}>
      <div style={{ marginBottom: "28px" }}><h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>✍️ Generador de Contenido</h1><p style={{ color: "#7d8590", fontSize: "0.875rem" }}>Posts y copys para redes sociales en segundos</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div><label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Red social</label><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>{REDES.map(r => <button key={r.id} onClick={() => setRed(r.id)} style={{ padding: "10px", borderRadius: "8px", border: `1px solid ${red === r.id ? r.color : "#30363d"}`, background: red === r.id ? `${r.color}15` : "#1c2128", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.83rem", fontWeight: red === r.id ? 700 : 400, color: red === r.id ? r.color : "#7d8590", fontFamily: "'DM Sans',sans-serif" }}><span>{r.icon}</span>{r.label}</button>)}</div></div>
          <div><label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Tono</label><div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>{TONOS.map(t => <button key={t} onClick={() => setTono(t)} style={{ padding: "5px 12px", borderRadius: "20px", border: `1px solid ${tono === t ? "#2f81f7" : "#30363d"}`, background: tono === t ? "rgba(47,129,247,0.15)" : "transparent", color: tono === t ? "#2f81f7" : "#7d8590", fontSize: "0.78rem", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: tono === t ? 600 : 400 }}>{t}</button>)}</div></div>
          <div><label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Tema del post *</label><textarea value={tema} onChange={e => setTema(e.target.value)} placeholder={`¿Sobre qué quieres publicar en ${redActiva?.label}?`} rows={4} style={{ width: "100%", padding: "10px 12px", resize: "vertical" }} /></div>
          <button className="btn-primary" onClick={generar} disabled={loading || !tema.trim()} style={{ width: "100%", padding: "10px" }}>{loading ? "Generando con IA..." : `Generar post para ${redActiva?.label}`}</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {output ? (
            <div className="card" style={{ padding: "0", flex: 1 }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #30363d", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>{redActiva?.icon}</span>
                <span style={{ fontWeight: 600, fontSize: "0.875rem", color: redActiva?.color }}>{redActiva?.label}</span>
                <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#7d8590" }}>{output.length} caracteres</span>
              </div>
              <div style={{ padding: "16px", whiteSpace: "pre-wrap", fontSize: "0.875rem", lineHeight: 1.7, flex: 1 }}>{output}</div>
              <div style={{ padding: "12px 16px", borderTop: "1px solid #30363d", display: "flex", gap: "8px" }}>
                <button className="btn-secondary" style={{ fontSize: "0.78rem" }} onClick={() => navigator.clipboard.writeText(output)}>Copiar</button>
                <SaveResultButton appId="contenido-redes" appName="Generador de Contenido" outputText={output} inputText={tema} />
                <button className="btn-secondary" style={{ fontSize: "0.78rem" }} onClick={generar}>Regenerar</button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: "40px", textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: "2rem", marginBottom: "10px" }}>✍️</div>
              <div style={{ color: "#7d8590", fontSize: "0.83rem" }}>El contenido generado aparecerá aquí</div>
            </div>
          )}
          {history.length > 0 && (
            <div><div style={{ fontSize: "0.72rem", color: "#7d8590", fontWeight: 600, textTransform: "uppercase", marginBottom: "6px" }}>Generados antes</div>
            {history.map((h, i) => <div key={i} className="card" style={{ padding: "10px 14px", marginBottom: "6px", cursor: "pointer" }} onClick={() => setOutput(h.content)}><div style={{ fontSize: "0.78rem", fontWeight: 600, marginBottom: "2px" }}>{h.red} · {h.tema}</div><div style={{ fontSize: "0.72rem", color: "#7d8590", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.content.substring(0, 80)}...</div></div>)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
