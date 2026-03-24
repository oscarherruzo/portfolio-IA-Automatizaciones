import Link from "next/link";

const APPS_PREVIEW = [
  { icon: "📅", name: "Gestor de Citas",       color: "#2f81f7", desc: "Reservas 24/7 automáticas" },
  { icon: "💬", name: "Chatbot de Atención",   color: "#3fb950", desc: "Soporte sin esfuerzo" },
  { icon: "✍️", name: "Contenido para Redes",  color: "#a371f7", desc: "Posts en segundos" },
  { icon: "💰", name: "Presupuestos IA",        color: "#22d3ee", desc: "Profesionales al instante" },
  { icon: "📝", name: "Actas de Reunión",       color: "#34d399", desc: "Tareas y decisiones auto" },
  { icon: "🤝", name: "Asistente de Ventas",   color: "#f85149", desc: "Propuestas que convierten" },
  { icon: "⭐", name: "Reseñas Google",        color: "#ffa657", desc: "Respuestas automáticas" },
  { icon: "🔍", name: "Análisis Competencia",  color: "#818cf8", desc: "DAFO con IA" },
  { icon: "📨", name: "Email Marketing",       color: "#f472b6", desc: "Campañas que convierten" },
  { icon: "🛒", name: "Descripciones Producto",color: "#fb923c", desc: "Copy que vende" },
  { icon: "🧠", name: "FAQ Inteligente",       color: "#58a6ff", desc: "Base de conocimiento IA" },
  { icon: "📋", name: "Redactor Contratos",    color: "#e879f9", desc: "Legal en minutos" },
];

const STATS = [
  { val: "12+",  label: "Apps de IA listas" },
  { val: "24/7", label: "Disponibilidad" },
  { val: "30s",  label: "Tiempo de respuesta" },
  { val: "100%", label: "En español" },
];

const HOW = [
  { n: "01", title: "Te registro en la plataforma", desc: "Acceso personalizado con las apps que necesita tu negocio." },
  { n: "02", title: "Eliges tus automatizaciones",  desc: "12 apps de IA listas para usar, sin configuración técnica." },
  { n: "03", title: "Conectas a tu web",            desc: "Widget embebible en cualquier web en menos de 2 minutos." },
  { n: "04", title: "La IA trabaja por ti",         desc: "Responde clientes, genera contenido y cierra ventas solo." },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "'DM Sans', sans-serif" }}>

      {/* NAV */}
      <nav style={{ borderBottom: "1px solid #21262d", padding: "0 48px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(13,17,23,0.96)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
          <span style={{ fontFamily: "serif", fontSize: "1.1rem", fontWeight: 400, color: "#8b949e", fontStyle: "italic" }}>Oscar</span>
          <span style={{ fontSize: "1rem", fontWeight: 800, color: "#e6edf3", letterSpacing: "-0.02em" }}>Herruzo</span>
          <span style={{ color: "#2f81f7", fontWeight: 800 }}>·</span>
          <span style={{ fontSize: "0.78rem", color: "#7d8590", fontWeight: 500 }}>IA para Negocios</span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Link href="/pricing" style={{ color: "#8b949e", textDecoration: "none", padding: "6px 14px", fontSize: "0.875rem" }}>Precios</Link>
          <Link href="/login"   style={{ color: "#8b949e", textDecoration: "none", padding: "6px 14px", fontSize: "0.875rem" }}>Entrar</Link>
          <Link href="/register" style={{ background: "#2f81f7", color: "#fff", textDecoration: "none", padding: "7px 18px", borderRadius: "8px", fontSize: "0.875rem", fontWeight: 700 }}>
            Solicitar acceso →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "96px 48px 80px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(47,129,247,0.1)", border: "1px solid rgba(47,129,247,0.3)", borderRadius: "100px", padding: "4px 14px", fontSize: "0.75rem", fontWeight: 600, color: "#2f81f7", marginBottom: "28px" }}>
          ⚡ 12 automatizaciones con IA listas para usar
        </div>
        <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "24px", maxWidth: "800px" }}>
          IA que trabaja por tu negocio,{" "}
          <span style={{ color: "#2f81f7" }}>sin que tú muevas un dedo</span>
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#8b949e", maxWidth: "580px", lineHeight: 1.7, marginBottom: "40px" }}>
          Chatbots, generadores de contenido, gestores de citas, analizadores de reseñas y mucho más. 
          Todo configurado, todo en español, todo listo en minutos.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/register" style={{ background: "#2f81f7", color: "#fff", textDecoration: "none", padding: "14px 28px", borderRadius: "10px", fontWeight: 700, fontSize: "1rem" }}>
            Empezar gratis →
          </Link>
          <Link href="/pricing" style={{ border: "1px solid #30363d", color: "#e6edf3", textDecoration: "none", padding: "14px 28px", borderRadius: "10px", fontWeight: 600, fontSize: "1rem" }}>
            Ver planes
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "0 48px 80px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "#21262d", borderRadius: "14px", overflow: "hidden", border: "1px solid #21262d" }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: "#0d1117", padding: "28px", textAlign: "center" }}>
              <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#2f81f7", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>{s.val}</div>
              <div style={{ fontSize: "0.82rem", color: "#7d8590" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* APPS GRID */}
      <section style={{ padding: "0 48px 96px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "12px" }}>
            Todo lo que necesita tu negocio
          </h2>
          <p style={{ color: "#7d8590", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
            Cada app está diseñada para un problema real. Sin configuración, sin código, sin complicaciones.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
          {APPS_PREVIEW.map(app => (
            <div key={app.name} style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: "12px", padding: "20px", display: "flex", gap: "14px", alignItems: "flex-start", transition: "border-color 0.2s" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${app.color}20`, border: `1px solid ${app.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>
                {app.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#e6edf3", marginBottom: "3px" }}>{app.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#7d8590" }}>{app.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "80px 48px", background: "#161b22", borderTop: "1px solid #21262d", borderBottom: "1px solid #21262d" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "12px" }}>Así de fácil es empezar</h2>
            <p style={{ color: "#7d8590" }}>Sin técnicos, sin integraciones complejas, sin curva de aprendizaje.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px" }}>
            {HOW.map(h => (
              <div key={h.n}>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#2f81f7", fontFamily: "'DM Mono', monospace", marginBottom: "12px", opacity: 0.4 }}>{h.n}</div>
                <div style={{ fontWeight: 700, marginBottom: "8px", color: "#e6edf3" }}>{h.title}</div>
                <div style={{ fontSize: "0.84rem", color: "#7d8590", lineHeight: 1.6 }}>{h.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "96px 48px", textAlign: "center", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "16px" }}>
          ¿Listo para automatizar tu negocio?
        </h2>
        <p style={{ color: "#7d8590", fontSize: "1rem", marginBottom: "36px" }}>
          Escríbeme y en 24h tienes tu plataforma configurada y lista.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" style={{ background: "#2f81f7", color: "#fff", textDecoration: "none", padding: "14px 32px", borderRadius: "10px", fontWeight: 700, fontSize: "1rem" }}>
            Solicitar acceso →
          </Link>
          <a href="mailto:oscarherruzom@gmail.com" style={{ border: "1px solid #30363d", color: "#e6edf3", textDecoration: "none", padding: "14px 32px", borderRadius: "10px", fontWeight: 600, fontSize: "1rem" }}>
            Hablar con Oscar
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #21262d", padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#7d8590", fontSize: "0.82rem" }}>
        <span>© 2025 Oscar Herruzo · IA para Negocios</span>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link href="/pricing" style={{ color: "#7d8590", textDecoration: "none" }}>Precios</Link>
          <Link href="/login"   style={{ color: "#7d8590", textDecoration: "none" }}>Entrar</Link>
          <a href="mailto:oscarherruzom@gmail.com" style={{ color: "#7d8590", textDecoration: "none" }}>Contacto</a>
        </div>
      </footer>
    </div>
  );
}
