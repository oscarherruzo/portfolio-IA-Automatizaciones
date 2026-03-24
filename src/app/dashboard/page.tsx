import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { generateActivityData, getActivityLevel, timeAgo, AUTOMATION_TYPES } from "@/lib/utils";
import Link from "next/link";

const DAYS   = ["L","M","X","J","V","S","D"];
const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function getMonthLabels() {
  const labels: { month: string; col: number }[] = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay());
  let lastMonth = -1;
  for (let w = 0; w < 52; w++) {
    const d = new Date(start); d.setDate(d.getDate() + w * 7);
    if (d.getMonth() !== lastMonth) {
      labels.push({ month: MONTHS[d.getMonth()], col: w });
      lastMonth = d.getMonth();
    }
  }
  return labels;
}

const COLORS = ["#0e4429","#006d32","#26a641","#39d353"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: automations },
    { data: recentRuns },
    { data: activeApps },
    { data: savedResults },
    { data: notifications },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("automations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("automation_runs").select("*, automations(name,type)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("user_app_access").select("app_id").eq("user_id", user.id),
    supabase.from("saved_results").select("id, app_name, title, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
    supabase.from("notifications").select("*").eq("user_id", user.id).eq("read", false).order("created_at", { ascending: false }).limit(5),
  ]);

  const allRuns      = recentRuns || [];
  const activityData = generateActivityData(allRuns);
  const monthLabels  = getMonthLabels();
  const totalRuns    = (automations || []).reduce((acc, a) => acc + (a.runs_count || 0), 0);
  const successRuns  = allRuns.filter(r => r.status === "success").length;
  const totalTokens  = profile?.tokens_used || 0;
  const activeAutos  = (automations || []).filter(a => a.is_active).length;
  const tokenLimit   = profile?.plan === "agency" ? 999999 : profile?.plan === "pro" ? 50000 : 10000;
  const tokenPct     = Math.min(100, Math.round((totalTokens / tokenLimit) * 100));
  const firstName    = profile?.full_name?.split(" ")[0] || (user as any).user_metadata?.full_name?.split(" ")[0] || "de nuevo";
  const unread       = (notifications || []).length;

  return (
    <div style={{ padding: "32px", maxWidth: "1280px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--text-1)", marginBottom: "4px" }}>
            Bienvenido, {firstName} 👋
          </h1>
          <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>
            {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {unread > 0 && (
            <Link href="/dashboard/notifications" style={{
              display: "flex", alignItems: "center", gap: "6px", textDecoration: "none",
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "rgb(239,68,68)", padding: "7px 14px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 600
            }}>
              🔔 {unread} sin leer
            </Link>
          )}
          <Link href="/dashboard/catalog" style={{
            background: "var(--accent)", color: "white", textDecoration: "none",
            padding: "8px 18px", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem"
          }}>+ Añadir app</Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Ejecuciones", value: totalRuns, color: "var(--green)", icon: "▶" },
          { label: "Apps activas", value: (activeApps || []).length, color: "var(--accent)", icon: "⚡" },
          { label: "Tokens usados", value: totalTokens.toLocaleString(), color: "var(--purple)", icon: "◈" },
          { label: "Tasa de éxito", value: totalRuns > 0 ? `${Math.round((successRuns/allRuns.length||1)*100)}%` : "—", color: "var(--amber)", icon: "✓" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--surface)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tokens progress */}
      <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-2)" }}>⚡ Tokens del mes</span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
            {totalTokens.toLocaleString()} / {tokenLimit.toLocaleString()} ({tokenPct}%)
          </span>
        </div>
        <div style={{ background: "var(--bg-3)", borderRadius: "100px", height: "8px", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: "100px", transition: "width 0.5s ease",
            width: `${tokenPct}%`,
            background: tokenPct > 85 ? "rgb(239,68,68)" : tokenPct > 60 ? "var(--amber)" : "var(--accent)"
          }} />
        </div>
        {tokenPct > 80 && (
          <p style={{ fontSize: "0.75rem", color: "var(--amber)", marginTop: "6px" }}>
            ⚠️ Estás al {tokenPct}% de tu cuota. Contacta con Oscar para ampliarla.
          </p>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>

        {/* Apps instaladas */}
        <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>🗂 Mis Apps</h3>
            <Link href="/dashboard/catalog" style={{ fontSize: "0.75rem", color: "var(--accent)", textDecoration: "none" }}>Ver catálogo →</Link>
          </div>
          {(activeApps || []).length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-3)", fontSize: "0.85rem" }}>
              No tienes apps activas.<br/>
              <Link href="/dashboard/catalog" style={{ color: "var(--accent)", textDecoration: "none" }}>Solicita al admin →</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {(activeApps || []).slice(0,6).map(a => {
                const APP_MAP: Record<string, { icon: string; name: string; color: string; href: string }> = {
                  "gestor-citas":           { icon: "📅", name: "Citas",         color: "#2f81f7", href: "/dashboard/apps/gestor-citas" },
                  "chatbot-cliente":        { icon: "💬", name: "Chatbot",       color: "#3fb950", href: "/dashboard/apps/chatbot-cliente" },
                  "faq-inteligente":        { icon: "🧠", name: "FAQ",           color: "#58a6ff", href: "/dashboard/apps/faq-inteligente" },
                  "contenido-redes":        { icon: "✍️", name: "Contenido",     color: "#a371f7", href: "/dashboard/apps/contenido-redes" },
                  "email-marketing":        { icon: "📨", name: "Email",         color: "#f472b6", href: "/dashboard/apps/email-marketing" },
                  "descripciones-producto": { icon: "🛒", name: "Producto",      color: "#fb923c", href: "/dashboard/apps/descripciones-producto" },
                  "asistente-ventas":       { icon: "🤝", name: "Ventas",        color: "#f85149", href: "/dashboard/apps/asistente-ventas" },
                  "generador-presupuestos": { icon: "💰", name: "Presupuestos",  color: "#22d3ee", href: "/dashboard/apps/generador-presupuestos" },
                  "analizador-reviews":     { icon: "⭐", name: "Reseñas",       color: "#ffa657", href: "/dashboard/apps/analizador-reviews" },
                  "resumidor-reuniones":    { icon: "📝", name: "Reuniones",     color: "#34d399", href: "/dashboard/apps/resumidor-reuniones" },
                  "analisis-competencia":   { icon: "🔍", name: "Competencia",   color: "#818cf8", href: "/dashboard/apps/analisis-competencia" },
                  "redactor-contratos":     { icon: "📋", name: "Contratos",     color: "#e879f9", href: "/dashboard/apps/redactor-contratos" },
                };
                const app = APP_MAP[a.app_id] || { icon: "⚡", name: a.app_id, color: "var(--accent)", href: "/dashboard/catalog" };
                return (
                  <Link key={a.app_id} href={app.href} style={{
                    display: "flex", alignItems: "center", gap: "8px", textDecoration: "none",
                    background: "var(--bg-2)", borderRadius: "8px", padding: "10px 12px",
                    border: `1px solid ${app.color}30`, transition: "border-color 0.15s"
                  }}>
                    <span style={{ fontSize: "1.1rem" }}>{app.icon}</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-1)" }}>{app.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Últimas ejecuciones */}
        <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>▶ Actividad reciente</h3>
            <Link href="/dashboard/automations" style={{ fontSize: "0.75rem", color: "var(--accent)", textDecoration: "none" }}>Ver todo →</Link>
          </div>
          {allRuns.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-3)", fontSize: "0.85rem" }}>Sin actividad todavía</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {allRuns.map(r => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", borderRadius: "8px", background: "var(--bg-2)" }}>
                  <span style={{
                    width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                    background: r.status === "success" ? "var(--green)" : r.status === "error" ? "#ef4444" : "var(--amber)"
                  }} />
                  <span style={{ fontSize: "0.82rem", color: "var(--text-1)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {(r as any).automations?.name || "Automatización"}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-3)", flexShrink: 0 }}>{timeAgo(r.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resultados guardados */}
      {(savedResults || []).length > 0 && (
        <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "20px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>💾 Resultados guardados</h3>
            <Link href="/dashboard/results" style={{ fontSize: "0.75rem", color: "var(--accent)", textDecoration: "none" }}>Ver todos →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
            {(savedResults || []).map(r => (
              <Link key={r.id} href="/dashboard/results" style={{
                display: "flex", flexDirection: "column", gap: "6px", textDecoration: "none",
                background: "var(--bg-2)", borderRadius: "8px", padding: "12px", border: "1px solid var(--border)"
              }}>
                <span style={{ fontSize: "1.2rem" }}>{"📁"}</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.title || r.app_name}
                </span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>{timeAgo(r.created_at)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Actividad anual */}
      <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "24px", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
          📊 Actividad — {totalRuns} ejecuciones
        </h3>
        <div style={{ overflowX: "auto" }}>
          <div style={{ position: "relative", minWidth: "fit-content" }}>
            <div style={{ display: "flex", gap: "2px", marginBottom: "4px", marginLeft: "24px" }}>
              {monthLabels.map(({ month, col }) => (
                <div key={col} style={{ position: "absolute", left: `${col * 14 + 24}px`, fontSize: "0.65rem", color: "var(--text-3)" }}>{month}</div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "2px", marginTop: "18px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginRight: "4px" }}>
                {DAYS.map(d => <div key={d} style={{ height: "12px", fontSize: "0.6rem", color: "var(--text-3)", lineHeight: "12px" }}>{d}</div>)}
              </div>
              {activityData.map((week, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {week.map((count, di) => {
                    const level = getActivityLevel(count);
                    return (
                      <div key={di} title={`${count} ejecuciones`} style={{
                        width: "12px", height: "12px", borderRadius: "2px",
                        background: level === 0 ? "var(--bg-3)" : COLORS[level - 1]
                      }} />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}