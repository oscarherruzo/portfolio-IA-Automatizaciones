"use client";
import { useState } from "react";
import SaveResultButton from "@/components/apps/SaveResultButton";

type Resultado = { acta: string; tareas: string[]; decisiones: string[]; proximos: string[] } | null;

export default function ResumidorReunionesPage() {
  const [input, setInput]     = useState("");
  const [resultado, setResultado] = useState<Resultado>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState<string | null>(null);
  const [historial, setHistorial] = useState<{ fecha: string; participantes: string }[]>([]);

  async function resumir() {
    if (!input.trim()) return;
    setLoading(true); setResultado(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content:
          `Analiza esta transcripción/notas de reunión y responde EXACTAMENTE en este formato JSON (sin markdown):
{"acta":"resumen ejecutivo en 3-4 frases","tareas":["tarea 1 - responsable","tarea 2 - responsable"],"decisiones":["decisión 1","decisión 2"],"proximos":["próximo paso 1","próximo paso 2"]}

Transcripción:\n${input}`
        }] })
      });
      const data = await res.json();
      if (data.message) {
        try {
          const clean = data.message.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(clean);
          setResultado(parsed);
          setHistorial(h => [{ fecha: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }), participantes: `${input.split(" ").length} palabras procesadas` }, ...h.slice(0,4)]);
        } catch { setResultado({ acta: data.message, tareas: [], decisiones: [], proximos: [] }); }
      }
    } finally { setLoading(false); }
  }

  function copiar(texto: string, key: string) {
    navigator.clipboard.writeText(texto);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const Section = ({ title, items, color, icon, copyKey }: { title: string; items: string[]; color: string; icon: string; copyKey: string }) => (
    <div style={{ background: "var(--bg-2)", borderRadius: "10px", border: `1px solid ${color}30`, padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color, textTransform: "uppercase" }}>{icon} {title}</span>
        <button onClick={() => copiar(items.join("\n"), copyKey)} style={{ background: "transparent", border: "none", color: copied === copyKey ? "#3fb950" : "var(--text-3)", cursor: "pointer", fontSize: "0.72rem" }}>
          {copied === copyKey ? "✓" : "copiar"}
        </button>
      </div>
      {items.length === 0 ? (
        <p style={{ color: "var(--text-3)", fontSize: "0.8rem", margin: 0 }}>No detectado</p>
      ) : (
        <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {items.map((item, i) => (
            <li key={i} style={{ fontSize: "0.83rem", color: "var(--text-2)", lineHeight: 1.5 }}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1100px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>📝 Resumidor de Reuniones</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>Pega la transcripción y obtén acta, tareas y decisiones al instante</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Pega aquí la transcripción de la reunión o tus notas..."
            rows={16}
            style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "14px", color: "var(--text-1)", fontSize: "0.85rem", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }}
          />
          <button
            onClick={resumir}
            disabled={loading || !input.trim()}
            style={{
              padding: "12px", borderRadius: "8px", border: "none",
              background: loading || !input.trim() ? "var(--bg-3)" : "#34d399",
              color: loading || !input.trim() ? "var(--text-3)" : "#000",
              fontWeight: 700, fontSize: "0.9rem", cursor: loading || !input.trim() ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Analizando reunión..." : "📝 Resumir reunión"}
          </button>

          {historial.length > 0 && (
            <div>
              <p style={{ fontSize: "0.72rem", color: "var(--text-3)", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>Historial</p>
              {historial.map((h, i) => (
                <div key={i} style={{ padding: "8px 12px", background: "var(--bg-2)", borderRadius: "6px", marginBottom: "4px", fontSize: "0.75rem", color: "var(--text-3)" }}>
                  {h.fecha} · {h.participantes}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {resultado ? (
            <>
              <div style={{ background: "var(--bg-2)", borderRadius: "10px", border: "1px solid rgba(52,211,153,0.3)", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#34d399", textTransform: "uppercase" }}>📄 Acta ejecutiva</span>
                  <button onClick={() => copiar(resultado.acta, "acta")} style={{ background: "transparent", border: "none", color: copied === "acta" ? "#3fb950" : "var(--text-3)", cursor: "pointer", fontSize: "0.72rem" }}>
                    {copied === "acta" ? "✓" : "copiar"}
                  </button>
                </div>
                <SaveResultButton appId="resumidor-reuniones" appName="Resumidor de Reuniones" outputText={resultado.acta} inputText={input} />
                <p style={{ fontSize: "0.85rem", color: "var(--text-1)", lineHeight: 1.6, margin: 0 }}>{resultado.acta}</p>
              </div>
              <Section title="Tareas asignadas"   items={resultado.tareas}     color="#f472b6" icon="✅" copyKey="tareas" />
              <Section title="Decisiones tomadas" items={resultado.decisiones} color="#fbbf24" icon="⚡" copyKey="decisiones" />
              <Section title="Próximos pasos"     items={resultado.proximos}   color="#818cf8" icon="→"  copyKey="proximos" />
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)", gap: "10px", minHeight: "300px" }}>
              <span style={{ fontSize: "3rem" }}>📝</span>
              <span style={{ fontSize: "0.85rem" }}>El resumen aparecerá aquí</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
