import Link from "next/link";

const PLANES = [
  {
    name: "Básico",
    price: "297",
    period: "pago único",
    desc: "Para autónomos y pequeños negocios que quieren una primera automatización funcionando.",
    features: ["1 app de IA incluida", "10.000 tokens / mes", "Widget embebible", "Panel de cliente", "Email de soporte"],
    missing: ["Integraciones avanzadas", "Apps adicionales", "Soporte prioritario"],
    highlight: false,
    cta: "Solicitar acceso Básico",
    badge: null,
  },
  {
    name: "Profesional",
    price: "597",
    period: "al mes",
    desc: "Para negocios que quieren escalar con múltiples automatizaciones funcionando en paralelo.",
    features: ["Hasta 6 apps de IA", "50.000 tokens / mes", "CRM de leads incluido", "Integraciones Make / n8n", "Soporte prioritario 24h", "Actualizaciones incluidas"],
    missing: [],
    highlight: true,
    cta: "Solicitar acceso Profesional",
    badge: "Más popular",
  },
  {
    name: "Agencia",
    price: null,
    period: "precio según proyecto",
    desc: "Para agencias y empresas que necesitan soluciones a medida, API propia o multicliente.",
    features: ["Apps ilimitadas", "Tokens ilimitados", "Multicliente / White-label", "API propia", "Integraciones custom", "SLA garantizado"],
    missing: [],
    highlight: false,
    cta: "Contactar",
    badge: null,
  },
];

const FAQ = [
  { q: "¿Hay permanencia en los planes?", a: "El plan Básico es un pago único sin permanencia. El plan Profesional se factura mensualmente y puedes cancelar cuando quieras con 30 días de aviso." },
  { q: "¿Qué pasa si me quedo sin tokens?", a: "Te avisamos cuando llegues al 80% de tu cuota. Puedes ampliarla en cualquier momento contactando con nosotros." },
  { q: "¿Puedo cambiar de plan en cualquier momento?", a: "Sí. Puedes hacer upgrade o downgrade del plan Profesional cuando quieras. El cambio se aplica al siguiente ciclo de facturación." },
  { q: "¿Hacéis factura?", a: "Sí, emitimos factura en todos los planes. Somos autónomos en España, IVA incluido." },
];

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text-1)" }}>

      {/* NAV */}
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "0 48px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(7,11,18,0.95)", backdropFilter: "blur(20px)", zIndex: 100 }}>
        <Link href="/" className="oh-logo">
          <span className="oh-logo-first">Oscar</span>
          <span className="oh-logo-last">Herruzo</span>
          <span className="oh-logo-dot"> ·</span>
        </Link>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/login" className="btn-ghost">Entrar</Link>
          <a href="mailto:oscarherruzom@gmail.com" className="btn-nav">Solicitar demo</a>
        </div>
      </nav>

      {/* HEADER */}
      <div style={{ textAlign: "center", padding: "72px 48px 56px", maxWidth: "640px", margin: "0 auto" }}>
        <span className="section-tag">Precios</span>
        <h1 className="oh-h2" style={{ fontSize: "clamp(2rem,4vw,3rem)", marginBottom: "1rem" }}>Precios claros,<br />sin sorpresas</h1>
        <p style={{ color: "var(--text-2)", fontSize: "1rem", lineHeight: 1.7 }}>
          Sin permanencia en el plan Básico. Sin letra pequeña.<br />Si no funciona en tu negocio, no cobro.
        </p>
      </div>

      {/* PLANS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", maxWidth: "1000px", margin: "0 auto", padding: "0 48px 80px" }}>
        {PLANES.map(p => (
          <div key={p.name} className={"plan-card" + (p.highlight ? " plan-card--best" : "")}>
            {p.badge && <div className="best-badge">{p.badge}</div>}
            <div className="plan-name">{p.name}</div>
            {p.price ? (
              <div className="plan-price"><sup>€</sup>{p.price}</div>
            ) : (
              <div className="plan-price plan-price--custom">A medida</div>
            )}
            <div className="plan-period">{p.period}</div>
            <p style={{ fontSize: "0.83rem", color: "var(--text-3)", margin: "1rem 0 0", lineHeight: 1.6 }}>{p.desc}</p>
            <hr className="plan-hr" />
            <ul className="plan-features">
              {p.features.map(f => <li key={f}>{f}</li>)}
              {p.missing?.map(f => <li key={f} className="no">{f}</li>)}
            </ul>
            <a href="mailto:oscarherruzom@gmail.com" className={"plan-cta " + (p.highlight ? "plan-cta-fill" : "plan-cta-out")}>
              {p.cta}
            </a>
          </div>
        ))}
      </div>

      {/* COMPARISON NOTE */}
      <div style={{ maxWidth: "720px", margin: "0 auto 80px", padding: "0 48px", textAlign: "center" }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px 32px" }}>
          <p style={{ fontSize: "0.9rem", color: "var(--text-2)", lineHeight: 1.75 }}>
            Todos los planes incluyen <strong style={{ color: "var(--text-1)" }}>configuración completa</strong>, 
            {" "}<strong style={{ color: "var(--text-1)" }}>demo personalizada</strong> con tus datos reales 
            y <strong style={{ color: "var(--text-1)" }}>soporte por email</strong>. 
            La única diferencia es el número de apps activas, los tokens mensuales y el nivel de soporte.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: "660px", margin: "0 auto 80px", padding: "0 48px" }}>
        <h2 className="oh-h2" style={{ textAlign: "center", marginBottom: "2.5rem", fontSize: "1.6rem" }}>Preguntas frecuentes</h2>
        {FAQ.map((item, i) => (
          <div key={i} style={{ borderBottom: "1px solid var(--border)", padding: "20px 0" }}>
            <div style={{ fontWeight: 700, color: "var(--text-1)", marginBottom: "8px", fontSize: "0.9rem" }}>{item.q}</div>
            <p style={{ color: "var(--text-2)", fontSize: "0.875rem", lineHeight: 1.7 }}>{item.a}</p>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <footer className="oh-footer">
        <Link href="/" className="oh-logo">
          <span className="oh-logo-first">Oscar</span>
          <span className="oh-logo-last">Herruzo</span>
        </Link>
        <ul className="footer-links">
          <li><Link href="/">Inicio</Link></li>
          <li><Link href="/login">Acceso clientes</Link></li>
          <li><a href="mailto:oscarherruzom@gmail.com">Contacto</a></li>
        </ul>
        <p className="footer-copy">© 2025 Oscar Herruzo · IA para Negocios</p>
      </footer>
    </div>
  );
}
