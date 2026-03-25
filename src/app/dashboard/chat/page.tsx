"use client";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string; created_at?: string };
type Session = { id: string; preview: string; created_at: string };

const SUGGESTIONS = [
  "¿Cómo automatizo la atención al cliente con IA?",
  "Dame ideas para conseguir más clientes este mes",
  "¿Qué métricas debo medir en mi negocio?",
  "Redacta un email profesional para un cliente moroso",
  "¿Cómo mejorar mis descripciones de producto?",
  "Dame un plan de contenidos para redes sociales",
];

export default function ChatPage() {
  const [messages, setMessages]     = useState<Message[]>([]);
  const [sessions, setSessions]     = useState<Session[]>([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [totalTokens, setTotalTokens] = useState(0);
  const [showHistory, setShowHistory] = useState(true);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setLoadingHistory(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch últimas conversaciones agrupadas por día
    const { data } = await supabase
      .from("chat_messages")
      .select("id, content, role, created_at")
      .eq("user_id", user.id)
      .eq("role", "user")
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setSessions(data.map(m => ({
        id: m.id,
        preview: m.content.slice(0, 60) + (m.content.length > 60 ? "..." : ""),
        created_at: m.created_at,
      })));
    }
    setLoadingHistory(false);
  }

  async function loadConversation(messageId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Cargar los mensajes alrededor de ese mensaje
    const { data: msg } = await supabase.from("chat_messages").select("created_at").eq("id", messageId).single();
    if (!msg) return;

    const dayStart = new Date(msg.created_at);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(msg.created_at);
    dayEnd.setHours(23, 59, 59, 999);

    const { data } = await supabase
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("user_id", user.id)
      .gte("created_at", dayStart.toISOString())
      .lte("created_at", dayEnd.toISOString())
      .order("created_at", { ascending: true });

    if (data) setMessages(data as Message[]);
  }

  function newChat() {
    setMessages([]);
    setTotalTokens(0);
    textareaRef.current?.focus();
  }

  async function sendMessage(text?: string) {
    const content = (text || input).trim();
    if (!content || loading) return;
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    if (textareaRef.current) { textareaRef.current.style.height = "auto"; }
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
        setTotalTokens(t => t + (data.tokens || 0));
        loadSessions();
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Error al conectar. Inténtalo de nuevo." }]);
    } finally { setLoading(false); }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  }

  function copyMsg(content: string) {
    navigator.clipboard.writeText(content);
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 0px)", overflow: "hidden" }}>

      {/* Historial lateral */}
      {showHistory && (
        <div style={{ width: "240px", flexShrink: 0, borderRight: "1px solid var(--border)", background: "var(--bg-2)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 14px 10px", borderBottom: "1px solid var(--border)" }}>
            <button onClick={newChat} style={{ width: "100%", padding: "9px", background: "var(--accent)", border: "none", color: "white", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
              + Nueva conversación
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            <p style={{ fontSize: "0.65rem", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", padding: "4px 6px", marginBottom: "4px" }}>Recientes</p>
            {loadingHistory ? (
              <p style={{ fontSize: "0.78rem", color: "var(--text-3)", padding: "8px 6px" }}>Cargando...</p>
            ) : sessions.length === 0 ? (
              <p style={{ fontSize: "0.78rem", color: "var(--text-3)", padding: "8px 6px" }}>Sin conversaciones</p>
            ) : sessions.map(s => (
              <button key={s.id} onClick={() => loadConversation(s.id)} style={{
                width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: "7px",
                background: "transparent", border: "none", cursor: "pointer", marginBottom: "2px",
                transition: "background 0.15s"
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ fontSize: "0.8rem", color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "2px" }}>{s.preview}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>{timeAgo(s.created_at)}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat principal */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px", background: "var(--bg-2)" }}>
          <button onClick={() => setShowHistory(!showHistory)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: "1rem", padding: "4px" }}>
            ☰
          </button>
          <span style={{ fontWeight: 700, color: "var(--text-1)", fontSize: "0.95rem" }}>💬 Chat IA</span>
          <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
            {totalTokens > 0 && `${totalTokens.toLocaleString()} tokens`}
          </span>
        </div>

        {/* Mensajes */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
          {messages.length === 0 ? (
            <div style={{ maxWidth: "600px", margin: "40px auto", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>✨</div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-1)", marginBottom: "8px" }}>¿En qué te ayudo hoy?</h2>
              <p style={{ color: "var(--text-3)", fontSize: "0.875rem", marginBottom: "28px" }}>
                Soy tu asistente de IA para negocios. Pregúntame lo que quieras.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", textAlign: "left" }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => sendMessage(s)} style={{
                    padding: "12px 14px", borderRadius: "10px", background: "var(--surface)",
                    border: "1px solid var(--border)", cursor: "pointer", textAlign: "left",
                    fontSize: "0.82rem", color: "var(--text-2)", lineHeight: 1.4,
                    transition: "border-color 0.15s"
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  >{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  {m.role === "assistant" && (
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent-dim)", border: "1px solid rgba(59,127,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", flexShrink: 0 }}>✨</div>
                  )}
                  <div style={{ maxWidth: "75%" }}>
                    <div style={{
                      padding: "12px 16px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: m.role === "user" ? "var(--accent)" : "var(--surface)",
                      color: m.role === "user" ? "white" : "var(--text-1)",
                      border: m.role === "assistant" ? "1px solid var(--border)" : "none",
                      fontSize: "0.875rem", lineHeight: 1.7, whiteSpace: "pre-wrap"
                    }}>
                      {m.content}
                    </div>
                    {m.role === "assistant" && (
                      <button onClick={() => copyMsg(m.content)} style={{ marginTop: "4px", background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: "0.7rem", padding: "2px 4px" }}>
                        copiar
                      </button>
                    )}
                  </div>
                  {m.role === "user" && (
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", flexShrink: 0, color: "white", fontWeight: 700 }}>T</div>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent-dim)", border: "1px solid rgba(59,127,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", flexShrink: 0 }}>✨</div>
                  <div style={{ padding: "12px 16px", borderRadius: "16px 16px 16px 4px", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", gap: "4px", alignItems: "center" }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", animation: `pulse 1.2s ${i*0.2}s infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", background: "var(--bg-2)" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje... (Enter para enviar, Shift+Enter para nueva línea)"
              rows={1}
              style={{
                flex: 1, background: "var(--surface)", border: "1px solid var(--border-bright)",
                borderRadius: "12px", padding: "12px 16px", color: "var(--text-1)",
                fontSize: "0.875rem", resize: "none", outline: "none", lineHeight: 1.6,
                minHeight: "48px", maxHeight: "160px", fontFamily: "var(--font-body)"
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                padding: "12px 20px", background: loading || !input.trim() ? "var(--bg-3)" : "var(--accent)",
                border: "none", borderRadius: "12px", color: loading || !input.trim() ? "var(--text-3)" : "white",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.875rem",
                flexShrink: 0, transition: "all 0.15s"
              }}
            >
              {loading ? "..." : "↑"}
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: "0.68rem", color: "var(--text-3)", marginTop: "8px", maxWidth: "760px", margin: "8px auto 0" }}>
            La IA puede cometer errores. Verifica información importante.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}
