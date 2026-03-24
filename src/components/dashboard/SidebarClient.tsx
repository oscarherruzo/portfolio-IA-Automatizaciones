"use client";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useState, useEffect } from "react";

const NAV_TOP = [
  { href: "/dashboard",              icon: "▦",  label: "Resumen" },
  { href: "/dashboard/catalog",      icon: "🗂", label: "Catálogo de apps" },
  { href: "/dashboard/automations",  icon: "⚡", label: "Mis automatizaciones" },
  { href: "/dashboard/results",      icon: "📁", label: "Resultados guardados" },
];

const NAV_TOOLS = [
  { href: "/dashboard/widget",       icon: "🔌", label: "Widget para web" },
  { href: "/dashboard/chat",         icon: "💬", label: "Chat IA" },
  { href: "/dashboard/integrations", icon: "🔗", label: "Integraciones" },
];

const NAV_BOTTOM = [
  { href: "/dashboard/help",         icon: "❓", label: "Ayuda" },
  { href: "/dashboard/settings",     icon: "⚙", label: "Configuración" },
];

type Profile = { full_name?: string; email?: string; plan?: string; tokens_used?: number; company_name?: string } | null;
type User    = { email?: string } | null;

type Notification = { id: string; title: string; message: string; type: string; read: boolean; created_at: string };

export default function SidebarClient({ user, profile }: { user: User; profile: Profile }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs]       = useState(false);

  const displayName  = profile?.full_name || user?.email?.split("@")[0] || "Usuario";
  const displayEmail = user?.email || "";
  const plan         = profile?.plan || "free";
  const tokens       = profile?.tokens_used || 0;
  const isSuperAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || user?.email === "oscarherruzom@gmail.com";
  const initial      = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => Array.isArray(d) && setNotifications(d));
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: "all" }) });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const NavItem = ({ href, icon, label }: { href: string; icon: string; label: string }) => {
    const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
    return (
      <Link href={href} style={{
        display: "flex", alignItems: "center", gap: "9px",
        padding: "7px 10px", borderRadius: "8px", marginBottom: "1px",
        fontSize: "0.83rem", fontWeight: active ? 600 : 400, textDecoration: "none",
        color: active ? "var(--accent)" : "var(--text-3)",
        background: active ? "var(--accent-dim)" : "transparent",
        border: active ? "1px solid rgba(59,127,255,0.2)" : "1px solid transparent",
        transition: "all 0.15s",
      }}>
        <span style={{ fontSize: "0.9rem", width: "18px", textAlign: "center" }}>{icon}</span>
        {label}
      </Link>
    );
  };

  return (
    <aside style={{ width: "240px", minHeight: "100vh", flexShrink: 0, background: "var(--bg-2)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>

      {/* Logo */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid var(--border)" }}>
        <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: "0.35rem" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontWeight: 400, color: "var(--text-2)", fontStyle: "italic" }}>Oscar</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-1)" }}>Herruzo</span>
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>·</span>
        </Link>
      </div>

      {/* Profile + notificaciones */}
      <div style={{ padding: "12px 12px 10px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "8px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0, background: "var(--accent-dim)", border: "1px solid rgba(59,127,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "var(--accent)" }}>
            {initial}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile?.company_name || displayEmail}</div>
          </div>
          {/* Bell notificaciones */}
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: unread > 0 ? "var(--amber)" : "var(--text-3)", fontSize: "1rem", padding: "4px", flexShrink: 0 }}
          >
            🔔
            {unread > 0 && (
              <div style={{ position: "absolute", top: "0", right: "0", width: "14px", height: "14px", background: "#f85149", borderRadius: "50%", fontSize: "0.55rem", fontWeight: 700, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {unread > 9 ? "9+" : unread}
              </div>
            )}
          </button>
        </div>

        {/* Token bar */}
        <div style={{ fontSize: "0.65rem", color: "var(--text-3)", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
          <span>Tokens usados</span>
          <span style={{ color: tokens > 8000 ? "var(--rose)" : "var(--text-3)" }}>{tokens.toLocaleString()}</span>
        </div>
        <div style={{ height: "4px", background: "var(--bg-3)", borderRadius: "100px", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: "100px", transition: "width 0.3s",
            width: `${Math.min((tokens / 10000) * 100, 100)}%`,
            background: tokens > 8000 ? "var(--rose)" : tokens > 5000 ? "var(--amber)" : "var(--accent)"
          }} />
        </div>
      </div>

      {/* Dropdown notificaciones */}
      {showNotifs && (
        <div style={{ position: "absolute", top: "140px", left: "8px", right: "8px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", zIndex: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", maxHeight: "300px", overflowY: "auto" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-1)" }}>Notificaciones</span>
            {unread > 0 && <button onClick={markAllRead} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.72rem", cursor: "pointer" }}>Marcar leídas</button>}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--text-3)", fontSize: "0.82rem" }}>Sin notificaciones</div>
          ) : notifications.slice(0, 8).map(n => (
            <div key={n.id} style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", background: n.read ? "transparent" : "rgba(47,129,247,0.05)" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: n.read ? 400 : 600, color: "var(--text-1)", marginBottom: "2px" }}>{n.title}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-3)", lineHeight: 1.4 }}>{n.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px" }}>
        <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 10px", marginBottom: "4px", marginTop: "4px" }}>Principal</div>
        {NAV_TOP.map(n => <NavItem key={n.href} {...n} />)}

        <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 10px", marginBottom: "4px", marginTop: "14px" }}>Herramientas</div>
        {NAV_TOOLS.map(n => <NavItem key={n.href} {...n} />)}

        <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 10px", marginBottom: "4px", marginTop: "14px" }}>Soporte</div>
        {NAV_BOTTOM.map(n => <NavItem key={n.href} {...n} />)}

        {isSuperAdmin && (
          <>
            <div style={{ height: "1px", background: "var(--border)", margin: "12px 0" }} />
            <Link href="/dashboard/admin" style={{
              display: "flex", alignItems: "center", gap: "9px",
              padding: "7px 10px", borderRadius: "8px",
              fontSize: "0.83rem", fontWeight: 600, textDecoration: "none",
              color: pathname.startsWith("/dashboard/admin") ? "var(--rose)" : "var(--text-3)",
              background: pathname.startsWith("/dashboard/admin") ? "var(--rose-dim)" : "transparent",
              border: pathname.startsWith("/dashboard/admin") ? "1px solid rgba(251,113,133,0.2)" : "1px solid transparent",
            }}>
              <span>🛡</span> Panel Admin
            </Link>
          </>
        )}

        <Link href="/pricing" style={{ display: "block", margin: "14px 4px 0", padding: "12px", borderRadius: "10px", background: "var(--accent-dim)", border: "1px solid rgba(59,127,255,0.2)", textDecoration: "none" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, marginBottom: "4px", color: "var(--text-1)" }}>Ver planes</div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-3)", marginBottom: "8px", lineHeight: 1.4 }}>Activa más apps y aumenta tu cuota</div>
          <div style={{ textAlign: "center", background: "var(--accent)", color: "#fff", borderRadius: "6px", padding: "5px", fontSize: "0.73rem", fontWeight: 600 }}>Ver planes →</div>
        </Link>
      </nav>

      {/* Logout */}
      <div style={{ padding: "10px 8px", borderTop: "1px solid var(--border)" }}>
        <button onClick={handleLogout} className="logout-btn" style={{ width: "100%", background: "none", border: "1px solid transparent", color: "var(--text-3)", fontSize: "0.8rem", cursor: "pointer", padding: "7px 10px", borderRadius: "8px", textAlign: "left", display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-body)", transition: "all 0.15s" }}>
          <span>↩</span> Cerrar sesión
        </button>
        <style>{`.logout-btn:hover { background: var(--rose-dim) !important; color: var(--rose) !important; border-color: rgba(251,113,133,0.2) !important; }`}</style>
      </div>
    </aside>
  );
}
