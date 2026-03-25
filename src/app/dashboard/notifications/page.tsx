"use client";
import { useState, useEffect } from "react";
import { timeAgo } from "@/lib/utils";

type Notification = { id: string; title: string; message: string; type: string; read: boolean; created_at: string };

const TYPE_STYLES: Record<string, { bg: string; color: string; icon: string }> = {
  info:    { bg: "rgba(47,129,247,0.1)",  color: "#2f81f7", icon: "ℹ️" },
  success: { bg: "rgba(63,185,80,0.1)",   color: "#3fb950", icon: "✅" },
  warning: { bg: "rgba(255,166,0,0.1)",   color: "#ffa657", icon: "⚠️" },
  error:   { bg: "rgba(239,68,68,0.1)",   color: "#ef4444", icon: "❌" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(data => { setNotifications(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  async function markRead(id: string) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: "all" }) });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  const unread = notifications.filter(n => !n.read).length;

  if (loading) return <div style={{ padding: "40px", color: "var(--text-3)" }}>Cargando...</div>;

  return (
    <div style={{ padding: "24px 32px", maxWidth: "760px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>🔔 Notificaciones</h1>
          <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>
            {unread > 0 ? `${unread} sin leer` : "Todas leídas"}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)", padding: "7px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
            Marcar todas como leídas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-3)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔔</div>
          <div style={{ fontWeight: 600, marginBottom: "6px" }}>Sin notificaciones</div>
          <div style={{ fontSize: "0.85rem" }}>Cuando recibas mensajes o alertas aparecerán aquí</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {notifications.map(n => {
            const style = TYPE_STYLES[n.type] || TYPE_STYLES.info;
            return (
              <div
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                style={{
                  padding: "16px 20px", borderRadius: "12px",
                  background: n.read ? "var(--surface)" : style.bg,
                  border: `1px solid ${n.read ? "var(--border)" : style.color + "40"}`,
                  cursor: n.read ? "default" : "pointer",
                  display: "flex", gap: "14px", alignItems: "flex-start",
                  transition: "all 0.15s"
                }}
              >
                <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{style.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: n.read ? 500 : 700, color: "var(--text-1)", marginBottom: "4px", fontSize: "0.9rem" }}>
                    {n.title}
                    {!n.read && <span style={{ marginLeft: "8px", fontSize: "0.65rem", fontWeight: 700, color: style.color, background: style.bg, padding: "2px 7px", borderRadius: "100px", border: `1px solid ${style.color}40` }}>NUEVO</span>}
                  </div>
                  <div style={{ fontSize: "0.84rem", color: "var(--text-2)", lineHeight: 1.5, marginBottom: "6px" }}>{n.message}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{timeAgo(n.created_at)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
