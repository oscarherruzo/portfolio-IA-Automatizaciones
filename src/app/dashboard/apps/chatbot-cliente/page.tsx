"use client";
import { useState, useRef, useEffect } from "react";

type Msg = { role: "user" | "assistant"; content: string };
type Config = { business_name?: string; business_description?: string; tone?: string; welcome_message?: string };
type Tab = "configurar" | "probar";

export default function ChatbotClientePage() {
  const [tab, setTab]           = useState<Tab>("configurar");
  const [config, setConfig]     = useState<Config>({ business_name: "", business_description: "", tone: "profesional", welcome_message: "¡Hola! ¿En qué puedo ayudarte hoy?" });
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    fetch("/api/chatbot").then(r => r.json()).then(data => {
      if (data) setConfig(data);
    });
  }, []);

  useEffect(() => {
    if (tab === "probar" && messages.length === 0) {
      setMessages([{ role: "assistant", content: config.welcome_message || "¡Hola! ¿En qué puedo ayudarte?" }]);
    }
  }, [tab]);

  async function saveConfig() {
    setSaving(true);
    await fetch("/api/chatbot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
    setSaved(true); setTimeout(() => setSaved(false), 2000); setSaving(false);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const newMsgs: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(newMsgs); setInput(""); setLoading(true);
    const systemPrompt = `Eres el asistente virtual de "${config.business_name || "este negocio"}". 
${config.business_description ? `Información del negocio: ${config.business_description}` : ""}
Tono: ${config.tone || "profesional"}. Responde siempre en español. Sé conciso y útil.`;
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: newMsgs, systemPrompt }) });
      const data = await res.json();
      if (data.message) setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
    } finally { setLoading(false); }
  }

  const inp = { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "9px 12px", color: "var(--text-1)", fontSize: "0.85rem", outline: "none", width: "100%", boxSizing: "border-box" as const };

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1000px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>💬 Chatbot de Atención</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>Configura y prueba tu chatbot personalizado</p>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "var(--bg-2)", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        {(["configurar","probar"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 20px", borderRadius: "7px", border: "none", cursor: "pointer", background: tab === t ? "var(--surface)" : "transparent", color: tab === t ? "var(--text-1)" : "var(--text-3)", fontWeight: tab === t ? 600 : 400, fontSize: "0.85rem", boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.3)" : "none" }}>
            {t === "configurar" ? "⚙️ Configurar" : "▶ Probar en vivo"}
          </button>
        ))}
      </div>

      {tab === "configurar" && (
        <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "28px", maxWidth: "600px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Nombre del negocio</label>
              <input value={config.business_name || ""} onChange={e => setConfig(c => ({...c, business_name: e.target.value}))} placeholder="Ej: Clínica Dental García" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Descripción del negocio</label>
              <textarea value={config.business_description || ""} onChange={e => setConfig(c => ({...c, business_description: e.target.value}))} placeholder="¿A qué te dedicas? ¿Qué servicios ofreces? ¿Cuál es tu horario?..." rows={5} style={{ ...inp, resize: "vertical" }} />
              <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "4px" }}>Cuanto más detallado, mejor responderá la IA</div>
            </div>
            <div>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Tono de comunicación</label>
              <select value={config.tone || "profesional"} onChange={e => setConfig(c => ({...c, tone: e.target.value}))} style={inp}>
                <option value="profesional">Profesional y formal</option>
                <option value="cercano">Cercano y amigable</option>
                <option value="tecnico">Técnico y preciso</option>
                <option value="informal">Informal y desenfadado</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Mensaje de bienvenida</label>
              <textarea value={config.welcome_message || ""} onChange={e => setConfig(c => ({...c, welcome_message: e.target.value}))} rows={2} style={{ ...inp, resize: "none" }} />
            </div>
            <button onClick={saveConfig} disabled={saving} style={{ padding: "11px 24px", background: saved ? "#3fb950" : "var(--accent)", border: "none", color: "white", borderRadius: "8px", cursor: "pointer", fontWeight: 700, width: "fit-content", transition: "background 0.2s" }}>
              {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar configuración"}
            </button>
          </div>
        </div>
      )}

      {tab === "probar" && (
        <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden", height: "520px", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>💬 {config.business_name || "Tu chatbot"}</span>
            <button onClick={() => setMessages([{ role: "assistant", content: config.welcome_message || "¡Hola! ¿En qué puedo ayudarte?" }])} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: "0.78rem" }}>Reiniciar</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                {m.role === "assistant" && <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", flexShrink: 0 }}>💬</div>}
                <div style={{ maxWidth: "75%", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? "var(--accent)" : "var(--bg-2)", color: m.role === "user" ? "white" : "var(--text-1)", border: m.role === "assistant" ? "1px solid var(--border)" : "none", fontSize: "0.875rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div style={{ display: "flex", gap: "8px" }}><div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>💬</div><div style={{ padding: "10px 14px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "14px 14px 14px 4px", color: "var(--text-3)", fontSize: "0.85rem" }}>Escribiendo...</div></div>}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: "8px" }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), send())} placeholder="Escribe como si fuera un cliente..." style={{ ...inp, flex: 1 }} />
            <button onClick={send} disabled={!input.trim() || loading} style={{ background: input.trim() && !loading ? "var(--accent)" : "var(--bg-3)", border: "none", borderRadius: "8px", padding: "0 16px", cursor: input.trim() ? "pointer" : "not-allowed", color: "white", fontWeight: 700 }}>↑</button>
          </div>
        </div>
      )}
    </div>
  );
}
