import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export default async function WidgetPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: automations } = await supabase.from("automations").select("id, name, type").eq("user_id", user.id).eq("is_active", true);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return (
    <div style={{ padding: "24px 32px", maxWidth: "860px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>Widget para tu web</h1>
        <p style={{ color: "#7d8590", fontSize: "0.875rem" }}>Añade un asistente IA a tu sitio web con un solo snippet de código</p>
      </div>
      {(automations || []).length === 0 ? (
        <div className="card" style={{ padding: "40px", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "10px" }}>⚡</div>
          <div style={{ fontWeight: 600, marginBottom: "6px" }}>No tienes automatizaciones activas</div>
          <div style={{ color: "#7d8590", fontSize: "0.83rem" }}>Instala una del catálogo primero.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {(automations || []).map((a) => {
            const snippet = `<!-- Widget IA para Negocios: ${a.name} -->\n<script>\n  window.IANegocios = {\n    automationId: "${a.id}",\n    userId: "${user.id}",\n    apiUrl: "${appUrl}/api/widget"\n  };\n</script>\n<script src="${appUrl}/widget.js" async></script>`;
            return (
              <div key={a.id} className="card" style={{ padding: "0" }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #30363d", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{a.name}</span>
                  <span style={{ fontSize: "0.68rem", fontFamily: "'DM Mono', monospace", background: "rgba(63,185,80,0.1)", color: "#3fb950", border: "1px solid rgba(63,185,80,0.2)", borderRadius: "4px", padding: "2px 6px" }}>{a.type}</span>
                </div>
                <div style={{ padding: "16px" }}>
                  <div style={{ fontSize: "0.78rem", color: "#7d8590", marginBottom: "10px" }}>Pega este código antes del <code style={{ background: "#1c2128", padding: "1px 4px", borderRadius: "3px", color: "#58a6ff" }}>&lt;/body&gt;</code> de tu web:</div>
                  <pre style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: "6px", padding: "14px", fontSize: "0.78rem", overflowX: "auto", lineHeight: 1.6, color: "#e6edf3", margin: 0, whiteSpace: "pre-wrap", fontFamily: "'DM Mono', monospace" }}>{snippet}</pre>
                </div>
              </div>
            );
          })}
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "14px" }}>Cómo instalar</div>
            {[["1","Copia el snippet de la automatización que quieras usar"],["2","Pégalo antes del </body> en el HTML de tu web"],["3","Aparecerá un botón flotante ⚡ en tu web"],["4","Funciona en WordPress, Shopify, HTML puro, etc."]].map(([n, text]) => (
              <div key={n} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "0.83rem", marginBottom: "8px" }}>
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0, background: "rgba(47,129,247,0.15)", border: "1px solid rgba(47,129,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, color: "#2f81f7" }}>{n}</div>
                <span style={{ color: "#c9d1d9", paddingTop: "2px" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
