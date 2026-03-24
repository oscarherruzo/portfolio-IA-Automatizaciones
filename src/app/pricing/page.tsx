import Link from "next/link";

const PLANES = [
  {
    name: "Starter",
    price: "49",
    color: "#2f81f7",
    desc: "Para autónomos y pequeños negocios.",
    apps: 2,
    ejecuciones: "500 / mes",
    features: ["2 apps activas", "500 ejecuciones al mes", "Chat IA incluido", "Widget para tu web", "Soporte por email"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "99",
    color: "#a371f7",
    badge: "Más popular",
    desc: "Para negocios en crecimiento.",
    apps: 5,
    ejecuciones: "2.000 / mes",
    features: ["5 apps activas", "2.000 ejecuciones al mes", "Análisis y estadísticas", "Widget embebible", "Soporte prioritario"],
    highlight: true,
  },
  {
    name: "Agency",
    price: "249",
    color: "#ffa657",
    desc: "Para agencias y empresas.",
    apps: 12,
    ejecuciones: "Ilimitadas",
    features: ["Todas las apps", "Ejecuciones ilimitadas", "Panel multi-cliente", "API de integración", "Gestor dedicado"],
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3" }}>
      <nav style={{ borderBottom: "1px solid #30363d", padding: "0 32px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(13,17,23,0.95)", position: "sticky", top: 0, zIndex: 10 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "#e6edf3" }}>
          <div style={{ width: "28px", height: "28px", background: "#2f81f7", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>⚡</div>
          <span style={{ fontWeight: 700 }}>IA para Negocios</span>
        </Link>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/login" style={{ color: "#7d8590", textDecoration: "none", padding: "6px 12px", fontSize: "0.875rem" }}>Iniciar sesión</Link>
          <Link href="/register" style={{ background: "#2f81f7", color: "white", textDecoration: "none", padding: "7px 16px", borderRadius: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Empezar</Link>
        </div>
      </nav>

      <section style={{ padding: "72px 32px 48px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "16px" }}>Elige tu plan</h1>
        <p style={{ color: "#7d8590", fontSize: "1rem", maxWidth: "460px", margin: "0 auto" }}>Sin permanencia. Sin sorpresas. Cancela cuando quieras.</p>
      </section>

      <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 32px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {PLANES.map(plan => (
            <div key={plan.name} style={{
              background: plan.highlight ? "#161b22" : "#0d1117",
              border: `1px solid ${plan.highlight ? plan.color : "#30363d"}`,
              borderRadius: "16px", padding: "32px", position: "relative",
              boxShadow: plan.highlight ? `0 0 40px ${plan.color}20` : "none",
              display: "flex", flexDirection: "column"
            }}>
              {plan.badge && (
                <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#fff", borderRadius: "20px", padding: "3px 14px", fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap" }}>{plan.badge}</div>
              )}
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: plan.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>{plan.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "8px" }}>
                <span style={{ fontSize: "3rem", fontWeight: 800, lineHeight: 1 }}>{plan.price}€</span>
                <span style={{ color: "#7d8590", fontSize: "0.85rem" }}>/mes</span>
              </div>
              <p style={{ color: "#7d8590", fontSize: "0.82rem", marginBottom: "24px" }}>{plan.desc}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px", flex: 1 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: "10px", fontSize: "0.84rem" }}>
                    <span style={{ color: plan.color, flexShrink: 0, fontWeight: 700 }}>✓</span>
                    <span style={{ color: "#c9d1d9" }}>{f}</span>
                  </div>
                ))}
              </div>
              <a
                href="mailto:oscarherruzom@gmail.com"
                style={{
                  display: "block", width: "100%", padding: "13px", borderRadius: "10px",
                  textDecoration: "none", textAlign: "center",
                  background: plan.highlight ? plan.color : "transparent",
                  border: `1px solid ${plan.color}`,
                  color: plan.highlight ? "white" : plan.color,
                  fontWeight: 700, fontSize: "0.9rem", boxSizing: "border-box"
                }}
              >
                Contratar {plan.name}
              </a>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "64px", padding: "48px", background: "#161b22", borderRadius: "16px", border: "1px solid #30363d" }}>
          <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "12px" }}>¿Tienes dudas?</h3>
          <p style={{ color: "#7d8590", marginBottom: "20px" }}>Escríbeme y te explico qué plan se adapta mejor a tu negocio.</p>
          <a href="mailto:oscarherruzom@gmail.com" style={{ display: "inline-block", background: "#2f81f7", color: "white", textDecoration: "none", padding: "12px 28px", borderRadius: "10px", fontWeight: 700 }}>
            Contactar
          </a>
        </div>
      </section>
    </div>
  );
}
