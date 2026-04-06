"use client";
import { useState } from "react";

const S: Record<string, React.CSSProperties> = {
  page:  { padding: "32px 40px", maxWidth: "1000px" },
  h1:    { fontSize: "1.3rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: "4px" },
  sub:   { color: "var(--text-3)", fontSize: "0.82rem" },
  card:  { background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "24px" },
  label: { fontSize: "0.7rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" },
  input: { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-1)", fontSize: "0.875rem", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "var(--font-body)" },
};

type Result = { resumen: string; decisiones: string[]; tareas: string[]; proximos_pasos: string } | null;

export default function ResumidorReunionesPage() {
  const [transcript, setTranscript] = useState("");
  const [participants, setParticipants] = useState("");
  const [date, setDate] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [loading, setLoading] = useState(false);

  async function summarize() {
    if (!transcript.trim()) return;
    setLoading(true); setResult(null);
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: `Analiza esta reunión y extrae la información clave.${participants ? `\nParticipantes: ${participants}` : ""}${date ? `\nFecha: ${date}` : ""}\n\nTranscripción:\n${transcript}\n\nResponde SOLO con JSON válido (sin markdown):\n{"resumen":"resumen ejecutivo en 2-3 oraciones","decisiones":["decisión 1","decisión 2"],"tareas":["Nombre: tarea con responsable y plazo si se menciona"],"proximos_pasos":"próximos pasos en 1-2 oraciones"}`
        }]
      })
    });
    const data = await res.json();
    if (data.message) {
      try {
        const clean = data.message.replace(/```json|```/g, "").trim();
        setResult(JSON.parse(clean));
      } catch { setResult(null); }
    }
    setLoading(false);
  }

  function copy() {
    if (!result) return;
    const text = `ACTA DE REUNIÓN${date ? ` — ${date}` : ""}\n${participants ? `Participantes: ${participants}\n` : ""}\nRESUMEN\n${result.resumen}\n\nDECISIONES TOMADAS\n${result.decisiones.map(d => `• ${d}`).join("\n")}\n\nTAREAS ASIGNADAS\n${result.tareas.map(t => `• ${t}`).join("\n")}\n\nPRÓXIMOS PASOS\n${result.proximos_pasos}`;
    navigator.clipboard.writeText(text);
  }

  return (
    <div style={S.page}>
      <div style={{ marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={S.h1}>Resumen de Reuniones</h1>
        <p style={S.sub}>Extrae decisiones, tareas y próximos pasos automáticamente de cualquier transcripción</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "24px" }}>
        {/* Input */}
        <div style={S.card}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={S.label}>Fecha de la reunión</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={S.input} />
              </div>
              <div>
                <label style={S.label}>Participantes</label>
                <input value={participants} onChange={e => setParticipants(e.target.value)} placeholder="Ana, Carlos, María..." style={S.input} />
              </div>
            </div>
            <div>
              <label style={S.label}>Transcripción o notas de la reunión</label>
              <textarea value={transcript} onChange={e => setTranscript(e.target.value)} rows={14} placeholder="Pega aquí la transcripción de la reunión, las notas tomadas durante la misma, o cualquier texto con el contenido de lo que se habló..." style={{ ...S.input, resize: "none" }} />
            </div>
            <button onClick={summarize} disabled={loading || !transcript.trim()} style={{ padding: "11px", background: "var(--accent)", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", fontFamily: "var(--font-body)", opacity: loading || !transcript.trim() ? 0.6 : 1 }}>
              {loading ? "Procesando reunión..." : "Generar acta con IA"}
            </button>
          </div>
        </div>

        {/* Output */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {result ? (
            <>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={copy} style={{ padding: "7px 16px", background: "var(--accent)", border: "none", color: "#fff", borderRadius: "7px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, fontFamily: "var(--font-body)" }}>
                  Copiar acta completa
                </button>
              </div>

              <div style={S.card}>
                <div style={{ fontSize: "0.65rem", color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Resumen ejecutivo</div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-1)", lineHeight: 1.7 }}>{result.resumen}</p>
              </div>

              <div style={S.card}>
                <div style={{ fontSize: "0.65rem", color: "var(--amber)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Decisiones tomadas ({result.decisiones.length})</div>
                <ul style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {result.decisiones.map((d, i) => (
                    <li key={i} style={{ display: "flex", gap: "10px", fontSize: "0.875rem", color: "var(--text-1)", lineHeight: 1.6 }}>
                      <span style={{ color: "var(--amber)", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>◆</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={S.card}>
                <div style={{ fontSize: "0.65rem", color: "var(--green)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Tareas asignadas ({result.tareas.length})</div>
                <ul style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {result.tareas.map((t, i) => (
                    <li key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "0.875rem", color: "var(--text-1)", lineHeight: 1.6 }}>
                      <span style={{ width: "18px", height: "18px", borderRadius: "4px", border: "1.5px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={S.card}>
                <div style={{ fontSize: "0.65rem", color: "var(--purple)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Próximos pasos</div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-1)", lineHeight: 1.7 }}>{result.proximos_pasos}</p>
              </div>
            </>
          ) : (
            <div style={{ ...S.card, textAlign: "center", padding: "60px 24px", color: "var(--text-3)" }}>
              <div style={{ fontSize: "2.5rem", opacity: 0.2, marginBottom: "16px" }}>◎</div>
              <p style={{ fontSize: "0.875rem" }}>El acta de la reunión aparecerá aquí</p>
              <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>Pega la transcripción o notas y genera el resumen automáticamente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
