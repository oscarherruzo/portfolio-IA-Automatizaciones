"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const APPS = [
  // --- Atención al Cliente ---
  { id: "gestor-citas",       icon: "📅", name: "Gestor de Citas",          tagline: "Reservas 24/7 con IA",          desc: "Tus clientes reservan citas online. La IA confirma, gestiona cancelaciones y envía recordatorios.", category: "Atención al Cliente", color: "#2f81f7", features: ["Calendario visual interactivo", "Confirmación automática", "Recordatorios inteligentes", "Widget para tu web"], type: "chatbot",  href: "/dashboard/apps/gestor-citas" },
  { id: "chatbot-cliente",    icon: "💬", name: "Chatbot de Atención",      tagline: "Soporte 24/7 sin esfuerzo",    desc: "Responde preguntas, resuelve dudas y escala a humano cuando sea necesario.", category: "Atención al Cliente", color: "#3fb950", features: ["Respuestas instantáneas 24/7", "Escalado a agente humano", "Aprende de tu negocio", "Widget para tu web"], type: "chatbot", href: "/dashboard/apps/chatbot-cliente" },
  { id: "faq-inteligente",    icon: "🧠", name: "FAQ Inteligente",          tagline: "Base de conocimiento con IA", desc: "Base de conocimiento que responde automáticamente las preguntas de tus clientes.", category: "Atención al Cliente", color: "#58a6ff", features: ["Respuestas desde tu base de datos", "Aprende de nuevas preguntas", "Búsqueda semántica", "Widget para tu web"], type: "chatbot", href: "/dashboard/apps/faq-inteligente" },

  // --- Marketing ---
  { id: "contenido-redes",    icon: "✍️", name: "Generador de Contenido",   tagline: "Posts y copys en segundos",   desc: "Genera posts para LinkedIn, Instagram y Twitter adaptados a tu tono de marca.", category: "Marketing", color: "#a371f7", features: ["Posts para 4 redes sociales", "Adaptado a tu tono de marca", "Hashtags optimizados", "Historial de contenido"], type: "content", href: "/dashboard/apps/contenido-redes" },
  { id: "email-marketing",    icon: "📨", name: "Email Marketing IA",       tagline: "Campañas que convierten",     desc: "Genera secuencias de emails, newsletters y campañas de nurturing con IA.", category: "Marketing", color: "#f472b6", features: ["Secuencias automatizadas", "Asunto A/B testing", "Segmentación por tipo", "Plantillas de campaña"], type: "content", href: "/dashboard/apps/email-marketing" },
  { id: "descripciones-producto", icon: "🛒", name: "Descripciones de Producto", tagline: "Copy que vende solo",   desc: "Genera descripciones persuasivas para productos, tiendas online y marketplaces.", category: "Marketing", color: "#fb923c", features: ["SEO optimizado", "Tono de marca adaptable", "Variantes A/B", "Formatos para web y marketplace"], type: "content", href: "/dashboard/apps/descripciones-producto" },

  // --- Ventas ---
  { id: "asistente-ventas",   icon: "🤝", name: "Asistente de Ventas",     tagline: "Propuestas con IA",           desc: "Genera propuestas comerciales, califica leads y redacta emails de seguimiento.", category: "Ventas", color: "#f85149", features: ["Propuestas comerciales", "Cualificación de leads", "Emails de seguimiento", "Rebate objeciones"], type: "content", href: "/dashboard/apps/asistente-ventas" },
  { id: "generador-presupuestos", icon: "💰", name: "Generador de Presupuestos", tagline: "Presupuestos profesionales", desc: "Genera presupuestos detallados y profesionales en segundos a partir de una descripción.", category: "Ventas", color: "#22d3ee", features: ["Formato profesional PDF-ready", "Partidas detalladas", "Condiciones personalizables", "Múltiples plantillas"], type: "content", href: "/dashboard/apps/generador-presupuestos" },

  // --- Operaciones ---
  { id: "analizador-reviews", icon: "⭐", name: "Analizador de Reseñas",   tagline: "Gestiona tu reputación",     desc: "Analiza reseñas de Google, detecta patrones y genera respuestas inteligentes.", category: "Operaciones", color: "#ffa657", features: ["Análisis de sentimiento", "Respuestas automáticas", "Detección de patrones", "Informes de reputación"], type: "analysis", href: "/dashboard/apps/analizador-reviews" },
  { id: "resumidor-reuniones", icon: "📝", name: "Resumidor de Reuniones",  tagline: "Actas en 30 segundos",       desc: "Pega la transcripción de tu reunión y obtén acta, tareas y decisiones al instante.", category: "Operaciones", color: "#34d399", features: ["Acta estructurada", "Lista de tareas y responsables", "Decisiones destacadas", "Próximos pasos"], type: "summary", href: "/dashboard/apps/resumidor-reuniones" },
  { id: "analisis-competencia", icon: "🔍", name: "Análisis de Competencia", tagline: "Conoce a tu competencia",  desc: "Analiza puntos fuertes y débiles de tu competencia y detecta oportunidades de mercado.", category: "Operaciones", color: "#818cf8", features: ["DAFO automático", "Oportunidades de mercado", "Diferenciadores clave", "Estrategia recomendada"], type: "analysis", href: "/dashboard/apps/analisis-competencia" },
  { id: "redactor-contratos",  icon: "📋", name: "Redactor de Contratos",   tagline: "Contratos listos en minutos", desc: "Genera contratos de servicios, NDAs y acuerdos comerciales adaptados a tu negocio.", category: "Operaciones", color: "#e879f9", features: ["Contratos de servicios", "NDAs personalizados", "Cláusulas legales básicas", "Formato Word-ready"], type: "content", href: "/dashboard/apps/redactor-contratos" },
];

const CATEGORIES = ["Todas", "Atención al Cliente", "Marketing", "Ventas", "Operaciones"];

export default function CatalogPage() {
  const router = useRouter();
  const [installing, setInstalling] = useState<string | null>(null);
  const [installed, setInstalled] = useState<string[]>([]);
  const [accessibleApps, setAccessibleApps] = useState<string[]>([]);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");

  // Cargar qué apps tiene acceso este usuario
  useEffect(() => {
    fetch("/api/user/apps")
      .then(r => r.json())
      .then(data => {
        setAccessibleApps(data.apps || []);
        setLoadingAccess(false);
      })
      .catch(() => setLoadingAccess(false));
  }, []);

  async function handleInstall(app: typeof APPS[0]) {
    if (!accessibleApps.includes(app.id)) return;
    setInstalling(app.id);
    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: app.name, description: app.desc, type: app.type, config: { app_id: app.id, color: app.color, icon: app.icon } }),
      });
      if (res.ok) setInstalled(prev => [...prev, app.id]);
    } finally { setInstalling(null); }
  }

  const filtered = APPS.filter(app =>
    (search === "" || app.name.toLowerCase().includes(search.toLowerCase()) || app.desc.toLowerCase().includes(search.toLowerCase())) &&
    (activeCategory === "Todas" || app.category === activeCategory)
  );

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1280px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "4px" }}>
          Catálogo de aplicaciones
        </h1>
        <p style={{ color: "#7d8590", fontSize: "0.875rem" }}>
          {APPS.length} apps disponibles · Las que tengas contratadas aparecen activas
        </p>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="🔍  Buscar app..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: "9px 14px", fontSize: "0.875rem", minWidth: "240px", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-1)", outline: "none" }}
        />
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: "7px 14px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: "1px solid",
              background: activeCategory === cat ? "#2f81f7" : "transparent",
              borderColor: activeCategory === cat ? "#2f81f7" : "#30363d",
              color: activeCategory === cat ? "#fff" : "#7d8590",
            }}>{cat}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "14px" }}>
        {filtered.map(app => {
          const hasAccess = accessibleApps.includes(app.id);
          const isInstalled = installed.includes(app.id);
          const isLoading = installing === app.id;

          return (
            <div key={app.id} style={{
              background: "var(--surface)", borderRadius: "12px", overflow: "hidden",
              border: `1px solid ${hasAccess ? app.color + "50" : "var(--border)"}`,
              opacity: loadingAccess ? 0.7 : 1,
              position: "relative",
              transition: "border-color 0.2s"
            }}>
              {/* Badge acceso */}
              {!loadingAccess && (
                <div style={{
                  position: "absolute", top: "12px", right: "12px",
                  background: hasAccess ? `${app.color}20` : "var(--bg-3)",
                  border: `1px solid ${hasAccess ? app.color + "40" : "var(--border)"}`,
                  borderRadius: "100px", padding: "2px 8px",
                  fontSize: "0.62rem", fontWeight: 700,
                  color: hasAccess ? app.color : "var(--text-3)"
                }}>
                  {hasAccess ? "✓ ACTIVA" : "🔒 SIN ACCESO"}
                </div>
              )}

              <div style={{ padding: "20px 20px 16px", background: `linear-gradient(135deg, ${app.color}10 0%, transparent 100%)`, borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "10px" }}>
                  <div style={{ width: "46px", height: "46px", borderRadius: "10px", flexShrink: 0, background: `${app.color}20`, border: `1px solid ${app.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                    {app.icon}
                  </div>
                  <div style={{ flex: 1, paddingRight: "60px" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: "2px", color: "var(--text-1)" }}>{app.name}</div>
                    <div style={{ fontSize: "0.73rem", color: app.color, fontWeight: 600 }}>{app.tagline}</div>
                  </div>
                </div>
                <p style={{ color: "#7d8590", fontSize: "0.8rem", lineHeight: 1.5, margin: 0 }}>{app.desc}</p>
              </div>

              <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                  {app.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: "5px", alignItems: "center", fontSize: "0.73rem" }}>
                      <span style={{ color: hasAccess ? app.color : "var(--text-3)", flexShrink: 0 }}>✓</span>
                      <span style={{ color: hasAccess ? "#c9d1d9" : "var(--text-3)" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "12px 20px", display: "flex", gap: "8px" }}>
                {hasAccess ? (
                  <>
                    <button
                      onClick={() => !isInstalled && handleInstall(app)}
                      disabled={isLoading || isInstalled}
                      style={{
                        flex: 1, padding: "8px", borderRadius: "7px", fontSize: "0.82rem", fontWeight: 700,
                        cursor: isInstalled ? "default" : "pointer", border: "none",
                        background: isInstalled ? "rgba(63,185,80,0.1)" : app.color,
                        color: isInstalled ? "#3fb950" : "#fff",
                        opacity: isLoading ? 0.6 : 1
                      }}
                    >
                      {isInstalled ? "✓ Añadida" : isLoading ? "Añadiendo..." : "⚡ Añadir a mis apps"}
                    </button>
                    <button
                      onClick={() => router.push(app.href)}
                      style={{ padding: "8px 14px", borderRadius: "7px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", background: "transparent", border: `1px solid ${app.color}`, color: app.color }}
                    >
                      Usar →
                    </button>
                  </>
                ) : (
                  <div style={{ flex: 1, padding: "8px", borderRadius: "7px", fontSize: "0.82rem", fontWeight: 600, textAlign: "center", background: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text-3)" }}>
                    Contacta con tu gestor para activar esta app
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
