"use client";
import { useState, useEffect } from "react";

type FAQ = { id: string; question: string; answer: string; category: string };
type Tab = "base" | "test";

const S = {
  page: { padding: "32px 40px", maxWidth: "1100px" } as React.CSSProperties,
  header: { marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" } as React.CSSProperties,
  h1: { fontSize: "1.3rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: "4px" } as React.CSSProperties,
  sub: { color: "var(--text-3)", fontSize: "0.82rem" } as React.CSSProperties,
  card: { background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "24px" } as React.CSSProperties,
  label: { fontSize: "0.7rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: "6px" },
  input: { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-1)", fontSize: "0.875rem", outline: "none", width: "100%", boxSizing: "border-box" as const, fontFamily: "var(--font-body)", transition: "border-color 0.15s" } as React.CSSProperties,
  btn: (active: boolean) => ({ padding: "10px 20px", borderRadius: "8px", border: "none", background: active ? "var(--accent)" : "var(--surface-2)", color: active ? "#fff" : "var(--text-2)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.15s", fontFamily: "var(--font-body)" }) as React.CSSProperties,
};

export default function FaqInteligentePage() {
  const [faqs, setFaqs]     = useState<FAQ[]>([]);
  const [tab, setTab]       = useState<Tab>("base");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("General");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [testing, setTesting] = useState(false);
  const [toast, setToast]   = useState("");

  function msg(t: string) { setToast(t); setTimeout(() => setToast(""), 3000); }

  useEffect(() => {
    fetch("/api/faq").then(r => r.json()).then(d => setFaqs(Array.isArray(d) ? d : []));
  }, []);

  async function generate() {
    if (!question.trim()) return;
    setGenerating(true);
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: `Genera una respuesta clara y profesional para esta FAQ de empresa: "${question}"\n\nLa respuesta debe ser concisa, directa y en tono profesional. Máximo 3 párrafos.` }] }) });
    const data = await res.json();
    if (data.message) setAnswer(data.message);
    setGenerating(false);
  }

  async function save() {
    if (!question.trim() || !answer.trim()) return;
    setSaving(true);
    const res = await fetch("/api/faq", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, answer, category }) });
    if (res.ok) { const d = await res.json(); setFaqs(p => [...p, d]); setQuestion(""); setAnswer(""); msg("Pregunta guardada correctamente"); }
    setSaving(false);
  }

  async function del(id: string) {
    await fetch("/api/faq", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setFaqs(p => p.filter(f => f.id !== id));
  }

  async function test() {
    if (!testInput.trim()) return;
    setTesting(true); setTestOutput("");
    const base = faqs.map(f => `Pregunta: ${f.question}\nRespuesta: ${f.answer}`).join("\n\n");
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: `Eres un asistente de atención al cliente. Usa esta base de conocimiento para responder:\n\n${base}\n\nPregunta del cliente: "${testInput}"\n\nResponde de forma natural y directa.` }] }) });
    const data = await res.json();
    if (data.message) setTestOutput(data.message);
    setTesting(false);
  }

  const TAB_STYLE = (active: boolean): React.CSSProperties => ({
    padding: "7px 18px", borderRadius: "7px", border: "none", cursor: "pointer",
    background: active ? "var(--surface)" : "transparent",
    color: active ? "var(--text-1)" : "var(--text-3)",
    fontWeight: active ? 600 : 400, fontSize: "0.85rem",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
    fontFamily: "var(--font-body)", transition: "all 0.15s",
  });

  return (
    <div style={S.page}>
      {toast && (
        <div style={{ position: "fixed", top: "24px", right: "24px", zIndex: 9999, background: "var(--green)", color: "#fff", padding: "10px 20px", borderRadius: "8px", fontWeight: 600, fontSize: "0.875rem", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          {toast}
        </div>
      )}

      <div style={S.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={S.h1}>Base de Conocimiento</h1>
            <p style={S.sub}>{faqs.length} {faqs.length === 1 ? "pregunta" : "preguntas"} en la base · {[...new Set(faqs.map(f => f.category))].length} categorías</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--green-dim)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "100px", padding: "5px 14px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--green)", fontWeight: 600 }}>FAQ Inteligente activa</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "var(--bg-2)", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        <button onClick={() => setTab("base")} style={TAB_STYLE(tab === "base")}>Base de conocimiento ({faqs.length})</button>
        <button onClick={() => setTab("test")} style={TAB_STYLE(tab === "test")}>Probar chatbot</button>
      </div>

      {tab === "base" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "24px" }}>
          {/* Form */}
          <div style={S.card}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-2)", marginBottom: "18px", letterSpacing: "0.02em" }}>Nueva entrada</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={S.label}>Categoría</label>
                <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Ej: Envíos, Pagos, Garantías..." style={S.input} />
              </div>
              <div>
                <label style={S.label}>Pregunta</label>
                <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="¿Cuál es el plazo de entrega?" rows={3} style={{ ...S.input, resize: "none" }} />
              </div>
              <button onClick={generate} disabled={generating || !question.trim()} style={{ ...S.btn(!generating && question.trim().length > 0), background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid rgba(59,127,255,0.3)" }}>
                {generating ? "Generando respuesta..." : "Generar respuesta con IA"}
              </button>
              {answer && (
                <div>
                  <label style={S.label}>Respuesta generada</label>
                  <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={6} style={{ ...S.input, resize: "vertical" }} />
                </div>
              )}
              {answer && (
                <button onClick={save} disabled={saving} style={S.btn(true)}>
                  {saving ? "Guardando..." : "Guardar en la base"}
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {faqs.length === 0 ? (
              <div style={{ ...S.card, textAlign: "center", padding: "48px", color: "var(--text-3)" }}>
                <div style={{ fontSize: "2rem", marginBottom: "12px", opacity: 0.4 }}>◈</div>
                <p style={{ fontSize: "0.875rem" }}>Aún no hay preguntas en la base.</p>
                <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>Añade la primera usando el formulario.</p>
              </div>
            ) : (
              faqs.map(f => (
                <div key={f.id} style={{ ...S.card, padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--accent)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{f.category}</div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-1)", marginBottom: "6px" }}>{f.question}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-3)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{f.answer}</div>
                    </div>
                    <button onClick={() => del(f.id)} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: "1rem", padding: "4px", flexShrink: 0, borderRadius: "4px" }} title="Eliminar">×</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === "test" && (
        <div style={{ maxWidth: "640px" }}>
          <div style={{ ...S.card, marginBottom: "16px" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-2)", marginBottom: "14px" }}>Simula una pregunta de cliente</h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <input value={testInput} onChange={e => setTestInput(e.target.value)} onKeyDown={e => e.key === "Enter" && test()} placeholder="Escribe una pregunta como si fueras un cliente..." style={{ ...S.input, flex: 1 }} />
              <button onClick={test} disabled={testing || !testInput.trim()} style={{ ...S.btn(true), whiteSpace: "nowrap" }}>
                {testing ? "Buscando..." : "Probar"}
              </button>
            </div>
            {faqs.length === 0 && (
              <p style={{ fontSize: "0.78rem", color: "var(--amber)", marginTop: "10px" }}>Añade preguntas a la base primero para poder probar el chatbot.</p>
            )}
          </div>

          {testOutput && (
            <div style={{ ...S.card, borderLeft: "3px solid var(--accent)" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Respuesta del asistente</div>
              <p style={{ fontSize: "0.875rem", color: "var(--text-1)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{testOutput}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
