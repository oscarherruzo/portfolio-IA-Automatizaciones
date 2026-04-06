"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const TOOLS = ["Groq · Llama 3.3","GPT-4o","Next.js 15","Make","n8n","Supabase","WhatsApp Business","Google Calendar","HubSpot"];

const SERVICES = [
  { icon:"⬡", title:"Chatbot de Atención al Cliente", desc:"Asistente inteligente que responde a tus clientes 24/7 con el tono y conocimiento de tu negocio. Configuración en minutos, resultados inmediatos.", tools:"Groq · GPT-4o · WhatsApp", color:"si-blue" },
  { icon:"◈", title:"Generador de Presupuestos", desc:"Crea presupuestos profesionales detallados con partidas, IVA y condiciones en segundos. Historial completo con seguimiento de estado.", tools:"Llama 3.3 · PDF Export", color:"si-purple" },
  { icon:"◉", title:"Gestor de Citas Online", desc:"Sistema de reservas 24/7 con panel de gestión, servicios configurables, horarios personalizados y página pública de booking.", tools:"Supabase · Google Calendar", color:"si-amber" },
  { icon:"◎", title:"Asistente de Ventas CRM", desc:"Pipeline de leads con IA para generar propuestas comerciales, rebatir objeciones y crear emails de seguimiento que convierten.", tools:"GPT-4o · HubSpot", color:"si-green" },
  { icon:"◊", title:"Analizador de Reseñas", desc:"Analiza reseñas de Google con análisis de sentimiento y genera respuestas profesionales personalizadas de forma automática.", tools:"Llama 3.3 · Google API", color:"si-teal" },
  { icon:"▣", title:"FAQ Inteligente", desc:"Base de conocimiento con IA que responde preguntas de clientes al instante. Aprende de tu negocio y mejora con cada interacción.", tools:"Groq · Supabase", color:"si-rose" },
];

const MORE_APPS = [
  {name:"Contenido para Redes",desc:"Posts y copys optimizados"},
  {name:"Email Marketing",desc:"Campañas que convierten"},
  {name:"Resumen de Reuniones",desc:"Actas y tareas automáticas"},
  {name:"Análisis de Competencia",desc:"DAFO estratégico con IA"},
  {name:"Redactor de Contratos",desc:"Legal en minutos"},
  {name:"Descripciones de Producto",desc:"Copy que vende"},
];

const STEPS = [
  {n:"01",title:"Diagnóstico gratuito",desc:"Analizamos tu negocio en una reunión de 30 minutos para identificar los procesos que más tiempo te cuestan."},
  {n:"02",title:"Configuración personalizada",desc:"Acceso a tu plataforma con las apps seleccionadas, configuradas con la identidad y datos de tu empresa."},
  {n:"03",title:"Integración en tu web",desc:"Widget embebible listo para producción. Un copy-paste y tu IA está visible para tus clientes en menos de 2 minutos."},
  {n:"04",title:"La plataforma trabaja sola",desc:"Monitoriza resultados desde tu panel. Nosotros gestionamos actualizaciones, soporte y mejoras continuas."},
];

const PLANS = [
  { name:"Básico", price:"297", period:"pago único", desc:"Para autónomos y pequeños negocios que quieren una primera automatización funcionando.", features:["1 app de IA incluida","10.000 tokens / mes","Widget embebible","Panel de cliente","Email de soporte"], missing:["Integraciones avanzadas","Apps adicionales","Soporte prioritario"], cta:"Empezar con Básico", fill:false },
  { name:"Profesional", price:"597", period:"al mes", desc:"Para negocios que quieren escalar con múltiples automatizaciones funcionando en paralelo.", features:["Hasta 6 apps de IA","50.000 tokens / mes","CRM de leads incluido","Integraciones Make / n8n","Soporte prioritario 24h","Actualizaciones incluidas"], missing:[], cta:"Solicitar acceso", fill:true, best:true },
  { name:"Agencia", price:"custom", period:"precio según proyecto", desc:"Para agencias y empresas que necesitan soluciones a medida, API propia o multicliente.", features:["Apps ilimitadas","Tokens ilimitados","Multicliente / White-label","API propia","Integraciones custom","SLA garantizado"], missing:[], cta:"Hablamos", fill:false },
];

const TESTIMONIALS = [
  { text:"Teníamos 15 preguntas frecuentes que respondíamos manualmente cada día. Ahora el chatbot lo hace en segundos y el equipo se dedica a lo que importa.", name:"Laura M.", role:"Directora, Clínica Dental en Madrid", av:"av1" },
  { text:"El generador de presupuestos nos ahorra 2 horas al día. Antes tardábamos una tarde entera en montar un presupuesto, ahora sale en 30 segundos.", name:"Carlos R.", role:"CEO, Empresa de Reformas en Barcelona", av:"av2" },
  { text:"Las reseñas de Google las respondía yo personalmente. Con el analizador de Oscar, cada respuesta es personalizada y profesional. Los clientes lo notan.", name:"Ana P.", role:"Propietaria, Restaurante en Sevilla", av:"av3" },
];

const FAQS = [
  {q:"¿Necesito conocimientos técnicos para usar la plataforma?",a:"No. Todo está configurado y listo para usar. El widget se instala con un copy-paste en tu web y el panel es tan sencillo como cualquier app del móvil."},
  {q:"¿Cuánto tarda en estar todo funcionando?",a:"En menos de 24 horas desde que confirmamos el proyecto. La reunión de diagnóstico suele ser el mismo día o al siguiente."},
  {q:"¿Puedo probar antes de pagar?",a:"Sí. Hacemos una demo personalizada con tus datos reales para que veas exactamente cómo funcionará en tu negocio antes de tomar ninguna decisión."},
  {q:"¿Mis datos están seguros?",a:"Toda la información se almacena en Supabase con RLS (Row Level Security). Cada empresa solo accede a sus propios datos. Nunca compartimos datos entre clientes."},
  {q:"¿Qué pasa si necesito una automatización que no está en el catálogo?",a:"Los planes Profesional y Agencia incluyen desarrollos custom. Cuéntame qué necesitas y buscamos la solución. Trabajamos con Make y n8n para conectar prácticamente cualquier herramienta."},
  {q:"¿Puedo cancelar en cualquier momento?",a:"El plan Básico es un pago único sin permanencia. El plan Profesional tiene facturación mensual y puedes cancelar cuando quieras con 30 días de aviso."},
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq]   = useState<number|null>(null);
  const [form, setForm]         = useState({name:"",email:"",company:"",message:""});
  const [formState, setFormState] = useState<"idle"|"loading"|"success"|"error">("idle");

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, {passive:true});
    return () => window.removeEventListener("scroll", h);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { setFormState("error"); return; }
    setFormState("loading");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({access_key:"3c73e5d7-3dbc-4297-9020-0c4bcced6661",...form, subject:`Nuevo contacto: ${form.name} · ${form.company||"Sin empresa"}`}),
      });
      setFormState(res.ok ? "success" : "error");
      if (res.ok) setForm({name:"",email:"",company:"",message:""});
    } catch { setFormState("error"); }
  }

  return (
    <>
      <div className="noise-overlay" aria-hidden />
      <div className="bg-glow bg-glow-top" aria-hidden />
      <div className="bg-glow bg-glow-mid" aria-hidden />

      {/* NAV */}
      <nav className={"oh-nav" + (scrolled ? " scrolled" : "")}>
        <Link href="/" className="oh-logo">
          <span className="oh-logo-first">Oscar</span>
          <span className="oh-logo-last">Herruzo</span>
          <span className="oh-logo-dot"> ·</span>
        </Link>
        <ul className="oh-nav-links">
          <li><a href="#servicios">Servicios</a></li>
          <li><a href="#proceso">Proceso</a></li>
          <li><a href="#precios">Precios</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
        <div className="oh-nav-actions" style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
          <Link href="/login" className="btn-ghost">Entrar</Link>
          <a href="#contacto" className="btn-nav">Solicitar demo</a>
        </div>
        <button className="oh-hamburger" aria-label="Menú" onClick={() => setMenuOpen(o => !o)}>
          <span style={{transform:menuOpen?"rotate(45deg) translate(5px,5px)":undefined}}/>
          <span style={{opacity:menuOpen?0:1}}/>
          <span style={{transform:menuOpen?"rotate(-45deg) translate(5px,-5px)":undefined}}/>
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={"oh-mobile-menu" + (menuOpen ? " open" : "")}>
        <div className="oh-mobile-logo">
          <span className="oh-logo-first" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.6rem",fontStyle:"italic",color:"var(--text-2)"}}>Oscar</span>
          <span className="oh-logo-last" style={{fontFamily:"var(--font-display)",fontSize:"1.4rem",fontWeight:700,color:"var(--text-1)"}}>Herruzo</span>
        </div>
        <ul>
          {[["#servicios","Servicios"],["#proceso","Proceso"],["#precios","Precios"],["#contacto","Contacto"]].map(([href,label]) => (
            <li key={href}><a href={href} onClick={() => setMenuOpen(false)}>{label}</a></li>
          ))}
          <li style={{marginTop:"2rem"}}><Link href="/login" onClick={() => setMenuOpen(false)} style={{fontSize:"1rem",color:"var(--text-2)",textDecoration:"none"}}>Iniciar sesión</Link></li>
        </ul>
      </div>

      {/* HERO */}
      <section className="oh-hero">
        <div className="animate-slide-up">
          <div className="hero-label">
            <span className="pulse-dot" aria-hidden />
            12 automatizaciones de IA para negocios
          </div>
          <h1 className="oh-h1">
            Automatizaciones de IA<br />
            que <em>trabajan por ti</em><br />
            sin esfuerzo técnico
          </h1>
          <p className="hero-desc">
            Chatbots, generadores de presupuestos, gestores de citas, CRM con IA y mucho más.
            Todo configurado, todo en español, todo listo en menos de 24 horas.
          </p>
          <div className="hero-btns">
            <a href="#contacto" className="btn-primary">Solicitar demo gratuita <span>→</span></a>
            <a href="#servicios" className="btn-outline">Ver todas las apps</a>
          </div>
          <div className="hero-social">
            <div className="social-faces" aria-hidden>
              <div className="face f1">L</div>
              <div className="face f2">C</div>
              <div className="face f3">A</div>
              <div className="face f4">M</div>
            </div>
            <p className="social-text"><strong>+20 negocios</strong> ya automatizan con esta plataforma</p>
          </div>
        </div>

        <div className="oh-hero-visual animate-slide-up-1" aria-hidden>
          <div className="vis-card">
            <div className="corner-tl"/><div className="corner-br"/>
            <div className="vis-header">
              <span className="vis-title"><span className="pulse-dot-green"/>Automatizaciones activas</span>
              <span className="vis-badge">En vivo</span>
            </div>
            <div className="flow-list">
              {[
                {icon:"⬡",label:"Chatbot de Atención",sub:"Responde en &lt;2 seg",cls:"fi-blue",status:"Activo",sts:"fs-ok"},
                {icon:"◈",label:"Generador de Presupuestos",sub:"3 nuevos hoy",cls:"fi-purple",status:"En uso",sts:"fs-run"},
                {icon:"◉",label:"Gestor de Citas",sub:"5 reservas hoy",cls:"fi-amber",status:"Activo",sts:"fs-ok"},
                {icon:"◎",label:"Asistente de Ventas",sub:"12 leads activos",cls:"fi-green",status:"Activo",sts:"fs-ok"},
              ].map((row,i) => (
                <div key={i}>
                  <div className="flow-row">
                    <div className={"flow-icon "+row.cls}>{row.icon}</div>
                    <div className="flow-info">
                      <div className="flow-name">{row.label}</div>
                      <div className="flow-sub" dangerouslySetInnerHTML={{__html:row.sub}}/>
                    </div>
                    <span className={"flow-status "+row.sts}>{row.status}</span>
                  </div>
                  {i<3 && <div className="flow-connector"/>}
                </div>
              ))}
            </div>
            <div className="vis-metric">
              <div><div className="metric-val">98.4%</div><div className="metric-label">Tasa de respuesta</div></div>
              <span className="metric-up">+12% este mes</span>
            </div>
          </div>
        </div>
      </section>

      {/* LOGOS */}
      <div className="logos-section">
        <p className="logos-label">Tecnologías integradas</p>
        <div className="logos-row">{TOOLS.map(t => <span key={t} className="tool-pill">{t}</span>)}</div>
      </div>

      {/* SERVICES */}
      <section id="servicios" className="oh-section">
        <div className="oh-section-inner">
          <span className="section-tag">Catálogo de apps</span>
          <h2 className="oh-h2">Cada app resuelve<br />un problema real</h2>
          <p className="section-desc" style={{marginBottom:"3.5rem"}}>
            Sin configuración técnica, sin integraciones complejas. Elige las apps que necesitas
            y en 24 horas están funcionando en tu negocio.
          </p>
          <div className="services-grid">
            {SERVICES.map(s => (
              <div key={s.title} className="srv">
                <div className={"srv-icon "+s.color}>{s.icon}</div>
                <div className="srv-title">{s.title}</div>
                <p className="srv-desc">{s.desc}</p>
                <div className="srv-tools">{s.tools}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:"2rem",padding:"1.5rem 2rem",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"var(--radius)",display:"flex",flexWrap:"wrap",gap:"0.75rem 2rem",alignItems:"center"}}>
            <span style={{fontSize:"0.75rem",color:"var(--text-3)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginRight:"0.5rem"}}>Y además:</span>
            {MORE_APPS.map(a => (
              <span key={a.name} style={{fontSize:"0.85rem",color:"var(--text-2)"}}>
                <strong style={{color:"var(--text-1)",fontWeight:600}}>{a.name}</strong>
                <span style={{color:"var(--text-3)"}}> — {a.desc}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="proceso" className="oh-section oh-section--dark">
        <div className="oh-section-inner">
          <div className="process-grid">
            <div>
              <span className="section-tag">Cómo funciona</span>
              <h2 className="oh-h2">De cero a funcionando<br />en menos de 24 horas</h2>
              <p className="section-desc" style={{marginBottom:"3rem"}}>Sin técnicos, sin reuniones interminables. El proceso está diseñado para que puedas centrarte en tu negocio mientras la IA hace el resto.</p>
              <div className="steps">
                {STEPS.map((s,i) => (
                  <div key={s.n}>
                    <div className="step">
                      <div className="step-num">{s.n}</div>
                      <div className="step-body"><h3>{s.title}</h3><p>{s.desc}</p></div>
                    </div>
                    {i < STEPS.length-1 && <div className="step-line"/>}
                  </div>
                ))}
              </div>
            </div>
            <div className="process-card">
              <div className="pc-header">
                <div className="pc-avatar">⬡</div>
                <div>
                  <div className="pc-name">Asistente Virtual — Clínica García</div>
                  <div className="pc-role">Configurado · En producción</div>
                </div>
              </div>
              <div className="chat-log">
                <div className="msg bot">¡Hola! Soy el asistente de Clínica García. ¿En qué puedo ayudarte hoy?</div>
                <div className="msg user">¿Tenéis disponibilidad esta semana para una limpieza?</div>
                <div className="msg bot">Sí, tenemos hueco el miércoles a las 10h y el viernes a las 17h. ¿Cuál te va mejor? Te reservo el horario ahora mismo.</div>
                <div className="msg user">El miércoles perfecto</div>
                <div className="msg bot">Reserva confirmada para el miércoles a las 10:00h. Te enviamos un recordatorio 24h antes.</div>
              </div>
              <div className="pc-flow-label">Pipeline de automatización</div>
              <div className="mini-flow">
                {[
                  {icon:"⬡",text:"Mensaje de cliente recibido"},
                  {icon:"◎",text:"IA procesa intención y contexto"},
                  {icon:"◉",text:"Reserva creada en el sistema"},
                  {icon:"◊",text:"Email de confirmación enviado"},
                ].map((r,i) => (
                  <div key={i}>
                    <div className="mf-row">
                      <div className="mf-icon fi-blue">{r.icon}</div>
                      <span className="mf-text">{r.text}</span>
                      <span className="mf-ok">✓</span>
                    </div>
                    {i < 3 && <div className="mf-line"/>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="oh-section">
        <div className="oh-section-inner">
          <span className="section-tag">Clientes</span>
          <h2 className="oh-h2" style={{marginBottom:"3rem"}}>Resultados reales,<br />negocios reales</h2>
          <div className="testi-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="testi">
                <div className="stars">★★★★★</div>
                <p className="testi-text">"{t.text}"</p>
                <div className="testi-author">
                  <div className={"testi-av "+t.av}>{t.name[0]}</div>
                  <div><div className="testi-name">{t.name}</div><div className="testi-role">{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precios" className="oh-section oh-section--dark">
        <div className="oh-section-inner">
          <span className="section-tag">Planes</span>
          <h2 className="oh-h2" style={{marginBottom:"0.75rem"}}>Precios claros,<br />sin sorpresas</h2>
          <p className="section-desc" style={{marginBottom:"3.5rem"}}>Sin permanencia en el plan Básico. Sin letra pequeña. Si no funciona, no cobro.</p>
          <div className="pricing-grid">
            {PLANS.map(p => (
              <div key={p.name} className={"plan-card"+(p.best?" plan-card--best":"")}>
                {p.best && <div className="best-badge">Más popular</div>}
                <div className="plan-name">{p.name}</div>
                {p.price==="custom"
                  ? <div className="plan-price plan-price--custom">A medida</div>
                  : <div className="plan-price"><sup>€</sup>{p.price}</div>
                }
                <div className="plan-period">{p.period}</div>
                <p style={{fontSize:"0.83rem",color:"var(--text-3)",margin:"1rem 0 0",lineHeight:1.6}}>{p.desc}</p>
                <hr className="plan-hr"/>
                <ul className="plan-features">
                  {p.features.map(f => <li key={f}>{f}</li>)}
                  {p.missing?.map(f => <li key={f} className="no">{f}</li>)}
                </ul>
                <a href="#contacto" className={"plan-cta "+(p.fill?"plan-cta-fill":"plan-cta-out")}>{p.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="oh-section">
        <div className="oh-section-inner">
          <span className="section-tag">Preguntas frecuentes</span>
          <h2 className="oh-h2" style={{textAlign:"center",marginBottom:"3rem"}}>Todo lo que necesitas saber</h2>
          <div className="faq-wrap">
            {FAQS.map((item,i) => (
              <div key={i} className={"faq-item"+(openFaq===i?" open":"")}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq===i?null:i)}>
                  {item.q}
                  <span className="faq-icon">+</span>
                </button>
                <div className="faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / CONTACT */}
      <section id="contacto" className="cta-section oh-section">
        <div className="cta-glow" aria-hidden/>
        <div className="cta-inner">
          <span className="section-tag">Contacto</span>
          <h2 className="oh-h2">¿Listo para automatizar<br />tu negocio?</h2>
          <p className="cta-desc">Cuéntame en qué trabajas y qué te gustaría automatizar. En menos de 24 horas te propongo una solución concreta y te hago una demo con tus datos reales.</p>
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cf-name">Nombre</label>
                <input id="cf-name" type="text" placeholder="Tu nombre" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className={formState==="error"&&!form.name?"is-error":""}/>
                <span className={"field-error"+(formState==="error"&&!form.name?" visible":"")} aria-live="polite">Campo requerido</span>
              </div>
              <div className="form-group">
                <label htmlFor="cf-email">Email</label>
                <input id="cf-email" type="email" placeholder="tu@empresa.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className={formState==="error"&&!form.email?"is-error":""}/>
                <span className={"field-error"+(formState==="error"&&!form.email?" visible":"")} aria-live="polite">Campo requerido</span>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="cf-company">Empresa <span className="label-optional">(opcional)</span></label>
              <input id="cf-company" type="text" placeholder="Nombre de tu empresa o proyecto" value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))}/>
            </div>
            <div className="form-group">
              <label htmlFor="cf-msg">¿Qué quieres automatizar?</label>
              <textarea id="cf-msg" rows={4} placeholder="Ej: Responder preguntas de mis clientes, generar presupuestos más rápido, gestionar mis citas online..." value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} className={formState==="error"&&!form.message?"is-error":""}/>
              <span className={"field-error"+(formState==="error"&&!form.message?" visible":"")} aria-live="polite">Campo requerido</span>
            </div>
            <button type="submit" disabled={formState==="loading"||formState==="success"} className={"btn-submit"+(formState==="loading"?" loading":"")+(formState==="success"?" success":"")}>
              <span className="btn-submit-spinner" aria-hidden/>
              <span className="btn-submit-text">{formState==="success"?"Mensaje enviado — te respondo en 24h":"Enviar y solicitar demo gratuita"}</span>
              <span className="btn-submit-arrow">→</span>
            </button>
          </form>
          <p className="cta-note">Sin compromiso · Demo gratuita · Respuesta en menos de 24h</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="oh-footer">
        <Link href="/" className="oh-logo">
          <span className="oh-logo-first">Oscar</span>
          <span className="oh-logo-last">Herruzo</span>
        </Link>
        <ul className="footer-links">
          <li><a href="#servicios">Servicios</a></li>
          <li><a href="#precios">Precios</a></li>
          <li><Link href="/login">Acceso clientes</Link></li>
          <li><a href="mailto:oscarherruzom@gmail.com">Contacto</a></li>
        </ul>
        <p className="footer-copy">© 2025 Oscar Herruzo · IA para Negocios</p>
      </footer>
    </>
  );
}
