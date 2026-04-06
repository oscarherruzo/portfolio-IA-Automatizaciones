"use client";
import { useState, useRef, useEffect } from "react";

type Msg = { role: "user" | "assistant"; content: string };
type Config = { business_name?: string; business_description?: string; tone?: string; welcome_message?: string };
type Tab = "configurar" | "probar";

const TONES = [
  { value: "profesional", label: "Profesional y formal" },
  { value: "cercano", label: "Cercano y amigable" },
  { value: "tecnico", label: "Técnico y preciso" },
  { value: "informal", label: "Informal y desenfadado" },
];

const S: Record<string, React.CSSProperties> = {
  page:  { padding: "32px 40px", maxWidth: "960px" },
  h1:    { fontSize: "1.3rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: "4px" },
  sub:   { color: "var(--text-3)", fontSize: "0.82rem" },
  card:  { background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "24px" },
  label: { fontSize: "0.7rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" },
  input: { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px", color: "var(--text-1)", fontSize: "0.875rem", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "var(--font-body)" },
};

export default function ChatbotClientePage() {
  const [tab, setTab]   = useState<Tab>("configurar");
  const [config, setConfig] = useState<Config>({ business_name: "", business_description: "", tone: "profesional", welcome_message: "¡Hola! ¿En qué puedo ayudarte hoy?" });
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { fetch("/api/chatbot").then(r => r.json()).then(data => { if (data) setConfig(data); }); }, []);
  useEffect(() => {
    if (tab === "probar" && messages.length === 0)
      setMessages([{ role: "assistant", content: config.welcome_message || "¡Hola! ¿En qué puedo ayudarte?" }]);
  }, [tab]);

  async function saveConfig() {
    setSaving(true);
    await fetch("/api/chatbot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
    setSaved(true); setTimeout(() => setSaved(false), 2500); setSaving(false);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const newMsgs: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(newMsgs); setInput(""); setLoading(true);
    const systemPrompt = `Eres el asistente virtual de "${config.business_name || "esta empresa"}". ${config.business_description ? `Información: ${config.business_description}` : ""} Tono: ${config.tone || "profesional"}. Responde siempre en español. Sé conciso y útil.`;
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: newMsgs, systemPrompt }) });
      const data = await res.json();
      if (data.message) setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
    } finally { setLoading(false); }
  }

  const TAB = (active: boolean): React.CSSProperties => ({
    padding: "7px 18px", borderRadius: "7px", border: "none", cursor: "pointer",
    background: active ? "var(--surface)" : "transparent",
    color: active ? "var(--text-1)" : "var(--text-3)",
    fontWeight: active ? 600 : 400, fontSize: "0.85rem",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
    fontFamily: "var(--font-body)", transition: "all 0.15s",
  });

  return (
    <div style={S.page}>
      <div style={{ marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={S.h1}>Chatbot de Atención</h1>
            <p style={S.sub}>Configura y prueba tu asistente virtual personalizado</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--green-dim)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "100px", padding: "5px 14px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--green)", fontWeight: 600 }}>Chatbot activo</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "var(--bg-2)", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        <button onClick={() => setTab("configurar")} style={TAB(tab === "configurar")}>Configuración</button>
        <button onClick={() => setTab("probar")} style={TAB(tab === "probar")}>Vista previa</button>
      </div>

      {tab === "configurar" && (
        <div style={{ maxWidth: "580px" }}>
          <div style={S.card}>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={S.label}>Nombre de la empresa</label>
                <input value={config.business_name || ""} onChange={e => setConfig(c => ({ ...c, business_name: e.target.value }))} placeholder="Ej: Clínica Dental García" style={S.input} />
                <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "4px" }}>El chatbot se presentará con este nombre</p>
              </div>
              <div>
                <label style={S.label}>Descripción del negocio</label>
                <textarea value={config.business_description || ""} onChange={e => setConfig(c => ({ ...c, business_description: e.target.value }))} placeholder="¿A qué te dedicas? ¿Qué servicios ofreces? ¿Cuál es tu horario? ¿Dónde estás ubicado?&#10;&#10;Cuanto más detallado, mejor responderá la IA." rows={6} style={{ ...S.input, resize: "vertical" }} />
              </div>
              <div>
                <label style={S.label}>Tono de comunicación</label>
                <select value={config.tone || "profesional"} onChange={e => setConfig(c => ({ ...c, tone: e.target.value }))} style={S.input}>
                  {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Mensaje de bienvenida</label>
                <textarea value={config.welcome_message || ""} onChange={e => setConfig(c => ({ ...c, welcome_message: e.target.value }))} placeholder="¡Hola! ¿En qué puedo ayudarte hoy?" rows={2} style={{ ...S.input, resize: "none" }} />
              </div>
              <button onClick={saveConfig} disabled={saving} style={{ padding: "11px 24px", background: saved ? "var(--green)" : "var(--accent)", border: "none", color: "white", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", transition: "background 0.2s", fontFamily: "var(--font-body)" }}>
                {saving ? "Guardando..." : saved ? "Configuración guardada" : "Guardar configuración"}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "probar" && (
        <div style={{ maxWidth: "520px" }}>
          <div style={{ ...S.card, padding: "0", overflow: "hidden" }}>
            {/* Chat header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-2)", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--accent-dim)", border: "1px solid rgba(59,127,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>⬡</div>
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-1)" }}>{config.business_name || "Asistente Virtual"}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--green)", display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
                  En línea
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: "16px", height: "380px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "80%", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                    background: m.role === "user" ? "var(--accent)" : "var(--bg-2)",
                    color: m.role === "user" ? "#fff" : "var(--text-1)",
                    border: m.role === "assistant" ? "1px solid var(--border)" : "none",
                    fontSize: "0.875rem", lineHeight: 1.6,
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex" }}>
                  <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "14px 14px 14px 2px", padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                      {[0,1,2].map(i => <span key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--text-3)", animation: `pulse-dot 1.2s ${i*0.2}s infinite` }} />)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: "8px" }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Escribe un mensaje..." style={{ ...S.input, flex: 1 }} />
              <button onClick={send} disabled={loading || !input.trim()} style={{ padding: "10px 16px", background: "var(--accent)", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", fontFamily: "var(--font-body)", transition: "background 0.15s" }}>
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
