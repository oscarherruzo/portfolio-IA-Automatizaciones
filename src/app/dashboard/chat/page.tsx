"use client";
import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "¿Cómo puedo automatizar la atención al cliente con IA?",
  "Dame ideas para mejorar la productividad de mi equipo",
  "¿Qué métricas debo medir en mi negocio?",
  "Redacta un email profesional para un cliente moroso",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function sendMessage(text?: string) {
    const content = (text || input).trim();
    if (!content || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
        setTotalTokens((t) => t + (data.tokens || 0));
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error al conectar con la IA. Inténtalo de nuevo." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", maxWidth: "860px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid #21262d",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
      }}>
        <div>
          <h1 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "2px" }}>Chat IA</h1>
          <p style={{ fontSize: "0.78rem", color: "#7d8590" }}>
            Llama 3.3 70B · Groq
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {totalTokens > 0 && (
            <span style={{ fontSize: "0.72rem", color: "#7d8590", fontFamily: "'DM Mono', monospace" }}>
              {totalTokens.toLocaleString()} tokens
            </span>
          )}
          {messages.length > 0 && (
            <button
              className="btn-secondary"
              style={{ fontSize: "0.78rem", padding: "4px 10px" }}
              onClick={() => { setMessages([]); setTotalTokens(0); }}
            >
              Nueva conversación
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: "60px", animation: "slideUp 0.4s ease both" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>💬</div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "6px" }}>
              Asistente de negocios con IA
            </h2>
            <p style={{ color: "#7d8590", fontSize: "0.875rem", marginBottom: "28px", lineHeight: 1.6 }}>
              Haz preguntas sobre tu negocio, pide ayuda con textos<br />
              o consulta estrategias de automatización.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", maxWidth: "560px", margin: "0 auto" }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  style={{
                    background: "#161b22", border: "1px solid #30363d", borderRadius: "8px",
                    padding: "10px 14px", textAlign: "left", cursor: "pointer",
                    fontSize: "0.78rem", color: "#7d8590", lineHeight: 1.4,
                    transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#484f58"; e.currentTarget.style.color = "#e6edf3"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#30363d"; e.currentTarget.style.color = "#7d8590"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: "flex",
                gap: "12px",
                flexDirection: m.role === "user" ? "row-reverse" : "row",
                animation: "slideUp 0.3s ease both",
              }}>
                {/* Avatar */}
                <div style={{
                  width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
                  background: m.role === "user" ? "#388bfd1a" : "#238636",
                  border: m.role === "user" ? "1px solid #388bfd44" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: m.role === "user" ? "0.72rem" : "0.9rem", fontWeight: 700,
                  color: m.role === "user" ? "#58a6ff" : "#fff",
                }}>
                  {m.role === "user" ? "TÚ" : "⚡"}
                </div>
                <div style={{
                  maxWidth: "75%",
                  background: m.role === "user" ? "#1c2128" : "#161b22",
                  border: `1px solid ${m.role === "user" ? "#30363d" : "#21262d"}`,
                  borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                  padding: "12px 16px",
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  color: "#e6edf3",
                }}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: "12px", animation: "fadeIn 0.2s ease both" }}>
                <div style={{
                  width: "30px", height: "30px", borderRadius: "50%",
                  background: "#238636", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "0.9rem",
                }}>⚡</div>
                <div style={{
                  background: "#161b22", border: "1px solid #21262d",
                  borderRadius: "12px 12px 12px 2px", padding: "14px 16px",
                  display: "flex", gap: "5px", alignItems: "center",
                }}>
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <div key={i} style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: "#7d8590",
                      animation: `pulse-dot 1s ${delay}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: "16px 24px", borderTop: "1px solid #21262d",
        background: "#0d1117", flexShrink: 0,
      }}>
        <div style={{
          display: "flex", gap: "10px", alignItems: "flex-end",
          background: "#161b22", border: "1px solid #30363d",
          borderRadius: "10px", padding: "10px 14px",
          transition: "border-color 0.15s",
        }}
          onFocusCapture={(e) => e.currentTarget.style.borderColor = "#2f81f7"}
          onBlurCapture={(e) => e.currentTarget.style.borderColor = "#30363d"}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta... (Enter para enviar, Shift+Enter para salto de línea)"
            rows={1}
            style={{
              flex: 1, background: "none", border: "none", resize: "none",
              lineHeight: 1.5, maxHeight: "120px", overflow: "auto",
              padding: 0, color: "#e6edf3", fontSize: "0.875rem",
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading ? "#238636" : "#21262d",
              border: "none", borderRadius: "6px",
              width: "32px", height: "32px", display: "flex",
              alignItems: "center", justifyContent: "center",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              fontSize: "0.9rem", transition: "background 0.15s", flexShrink: 0,
            }}
          >
            ↑
          </button>
        </div>
        <div style={{ fontSize: "0.68rem", color: "#7d8590", marginTop: "6px", textAlign: "center" }}>
          Impulsado por Llama 3.3 70B · Groq · Responde en español
        </div>
      </div>
    </div>
  );
}
