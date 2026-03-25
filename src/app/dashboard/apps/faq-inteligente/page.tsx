"use client";
import { useState, useEffect } from "react";

type FAQ = { id: string; question: string; answer: string; category: string };
type Tab = "base" | "test";

export default function FaqInteligentePage() {
  const [faqs, setFaqs]         = useState<FAQ[]>([]);
  const [tab, setTab]           = useState<Tab>("base");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer]     = useState("");
  const [category, setCategory] = useState("General");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [testing, setTesting]   = useState(false);
  const [toast, setToast]       = useState("");

  function msg(t: string) { setToast(t); setTimeout(() => setToast(""), 3000); }

  useEffect(() => {
    fetch("/api/faq").then(r => r.json()).then(d => setFaqs(Array.isArray(d) ? d : []));
  }, []);

  async function generate() {
    if (!question.trim()) return;
    setGenerating(true);
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: `Genera una respuesta clara y profesional para esta FAQ: "${question}"` }] }) });
    const data = await res.json();
    if (data.message) setAnswer(data.message);
    setGenerating(false);
  }

  async function save() {
    if (!question.trim() || !answer.trim()) return;
    setSaving(true);
    const res = await fetch("/api/faq", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, answer, category }) });
    if (res.ok) { const d = await res.json(); setFaqs(p => [...p, d]); setQuestion(""); setAnswer(""); msg("✓ FAQ guardada"); }
    setSaving(false);
  }

  async function del(id: string) {
    await fetch("/api/faq", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setFaqs(p => p.filter(f => f.id !== id));
  }

  async function test() {
    if (!testInput.trim()) return;
    setTesting(true); setTestOutput("");
    const base = faqs.map(f => `P: ${f.question}\nR: ${f.answer}`).join("\n\n");
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: `Base de conocimiento:\n\n${base}\n\nPregunta del cliente: "${testInput}"` }] }) });
    const data = await res.json();
    if (data.message) setTestOutput(data.message);
    setTesting(false);
  }

  const inp = { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "9px 12px", color: "var(--text-1)", fontSize: "0.85rem", outline: "none", width: "100%", boxSizing: "border-box" as const };

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1100px" }}>
      {toast && <div style={{ position: "fixed", top: "24px", right: "24px", zIndex: 9999, background: "var(--accent)", color: "white", padding: "10px 20px", borderRadius: "10px", fontWeight: 600 }}>{toast}</div>}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>🧠 FAQ Inteligente</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>{faqs.length} respuestas en tu base de conocimiento</p>
      </div>
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "var(--bg-2)", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        {(["base", "test"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 20px", borderRadius: "7px", border: "none", cursor: "pointer", background: tab === t ? "var(--surface)" : "transparent", color: tab === t ? "var(--text-1)" : "var(--text-3)", fontWeight: tab === t ? 600 : 400, fontSize: "0.85rem", boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.3)" : "none" }}>
            {t === "base" ? `📚 Base (${faqs.length})` : "🧪 Probar"}
          </button>
        ))}
      </div>
      {tab === "base" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "20px" }}>
          <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Categoría" style={inp} />
            <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Pregunta..." rows={3} style={{ ...inp, resize: "none" }} />
            <button onClick={generate} disabled={generating || !question.trim()} style={{ padding: "8px", background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent)", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem" }}>
              {generating ? "Generando..." : "✨ Generar respuesta con IA"}
            </button>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Respuesta..." rows={5} style={{ ...inp, resize: "vertical" }} />
            <button onClick={save} disabled={saving || !question.trim() || !answer.trim()} style={{ padding: "10px", background: "var(--accent)", border: "none", color: "white", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>
              {saving ? "Guardando..." : "💾 Guardar"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {faqs.length === 0 ? (
              <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "40px", textAlign: "center", color: "var(--text-3)" }}>Sin FAQs todavía</div>
            ) : faqs.map(f => (
              <div key={f.id} style={{ background: "var(--surface)", borderRadius: "10px", border: "1px solid var(--border)", padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, background: "var(--accent-dim)", color: "var(--accent)", padding: "2px 8px", borderRadius: "100px" }}>{f.category}</span>
                  <button onClick={() => del(f.id)} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer" }}>🗑</button>
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.87rem", color: "var(--text-1)", marginBottom: "4px" }}>{f.question}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-3)", lineHeight: 1.5 }}>{f.answer.slice(0, 150)}{f.answer.length > 150 ? "..." : ""}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "test" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <textarea value={testInput} onChange={e => setTestInput(e.target.value)} placeholder="Escribe una pregunta como cliente..." rows={5} style={{ ...inp, resize: "none", marginBottom: "10px" }} />
            <button onClick={test} disabled={testing || !testInput.trim()} style={{ width: "100%", padding: "11px", background: "var(--accent)", border: "none", color: "white", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>
              {testing ? "Buscando..." : "🧪 Probar"}
            </button>
          </div>
          <div style={{ background: "var(--bg-2)", borderRadius: "12px", border: "1px solid var(--border)", padding: "20px", minHeight: "200px" }}>
            {testOutput ? <div style={{ fontSize: "0.85rem", color: "var(--text-1)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{testOutput}</div>
              : <div style={{ color: "var(--text-3)", textAlign: "center", paddingTop: "40px" }}>La respuesta aparecerá aquí</div>}
          </div>
        </div>
      )}
    </div>
  );
}
