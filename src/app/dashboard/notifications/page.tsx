"use client";
import { useState, useEffect } from "react";

type Notif = { id: string; title: string; body: string; type: string; read: boolean; link: string; created_at: string };

const TYPE_COLOR: Record<string, string> = { info: "var(--accent)", warning: "var(--amber)", success: "var(--green)", promo: "var(--purple)" };
const TYPE_ICON:  Record<string, string> = { info: "ℹ️", warning: "⚠️", success: "✅", promo: "🎁" };

export default function NotificationsPage() {
  const [notifs, setNotifs]   = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications").then(r => r.json()).then(data => { setNotifs(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  async function markRead(id: string) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: "all" }) });
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }

  const unread = notifs.filter(n => !n.read).length;

  if (loading) return <div style={{ padding: "40px", color: "var(--text-3)" }}>Cargando...</div>;

  return (
    <div style={{ padding: "24px 32px", maxWidth: "720px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>🔔 Notificaciones</h1>
          <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>{unread} sin leer</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)", padding: "7px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
            Marcar todas como leídas
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-3)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔔</div>
          <p>No tienes notificaciones</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {notifs.map(n => (
            <div key={n.id} onClick={() => !n.read && markRead(n.id)} style={{
              background: n.read ? "var(--surface)" : "var(--bg-2)",
              border: `1px solid ${n.read ? "var(--border)" : TYPE_COLOR[n.type] + "40"}`,
              borderRadius: "12px", padding: "16px 20px", cursor: n.read ? "default" : "pointer",
              borderLeft: `4px solid ${n.read ? "var(--border)" : TYPE_COLOR[n.type]}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{TYPE_ICON[n.type] || "ℹ️"}</span>
                  <div>
                    <div style={{ fontWeight: n.read ? 500 : 700, color: "var(--text-1)", marginBottom: "4px", fontSize: "0.9rem" }}>{n.title}</div>
                    <div style={{ fontSize: "0.83rem", color: "var(--text-3)", lineHeight: 1.5 }}>{n.body}</div>
                    {n.link && <a href={n.link} style={{ fontSize: "0.78rem", color: TYPE_COLOR[n.type], textDecoration: "none", marginTop: "4px", display: "inline-block" }}>Ver más →</a>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>
                    {new Date(n.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {!n.read && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: TYPE_COLOR[n.type], display: "block" }} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
