"use client";
import { useState, useRef, useEffect } from "react";
type Msg = { role: "user"|"assistant"; content: string };
export default function ChatbotClientePage() {
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const newMsgs: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(newMsgs); setInput(""); setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: newMsgs }) });
      const data = await res.json();
      if (data.message) setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
    } finally { setLoading(false); }
  }
  return (
    <div style={{ height: "calc(100vh - 0px)", display: "flex", flexDirection: "column", maxWidth: "860px", margin: "0 auto" }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #21262d", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div><h1 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "2px" }}>💬 Chatbot de Atención al Cliente</h1><p style={{ fontSize: "0.78rem", color: "#7d8590" }}>Prueba cómo responderá a tus clientes</p></div>
        <button className="btn-secondary" style={{ fontSize: "0.78rem" }} onClick={() => setMessages([{ role: "assistant", content: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?" }])}>Reiniciar</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0, background: m.role === "user" ? "#388bfd1a" : "#238636", border: m.role === "user" ? "1px solid #388bfd44" : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: m.role === "user" ? "0.65rem" : "0.85rem", fontWeight: 700, color: m.role === "user" ? "#58a6ff" : "#fff" }}>{m.role === "user" ? "TÚ" : "💬"}</div>
            <div style={{ maxWidth: "75%", background: m.role === "user" ? "#1c2128" : "#161b22", border: `1px solid ${m.role === "user" ? "#30363d" : "#21262d"}`, borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "10px 14px", fontSize: "0.875rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.content}</div>
          </div>
        ))}
        {loading && <div style={{ display: "flex", gap: "10px" }}><div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#238636", display: "flex", alignItems: "center", justifyContent: "center" }}>💬</div><div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: "12px 12px 12px 2px", padding: "12px 14px", color: "#7d8590", fontSize: "0.83rem" }}>Escribiendo...</div></div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "14px 24px", borderTop: "1px solid #21262d", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: "8px", background: "#161b22", border: "1px solid #30363d", borderRadius: "10px", padding: "8px 12px" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())} placeholder="Escribe como si fuera un cliente..." style={{ flex: 1, background: "none", border: "none", color: "#e6edf3", fontSize: "0.875rem", padding: 0 }} />
          <button onClick={send} disabled={!input.trim() || loading} style={{ background: input.trim() && !loading ? "#238636" : "#21262d", border: "none", borderRadius: "6px", width: "30px", height: "30px", cursor: input.trim() ? "pointer" : "not-allowed", color: "#fff", fontSize: "0.9rem" }}>↑</button>
        </div>
      </div>
    </div>
  );
}
