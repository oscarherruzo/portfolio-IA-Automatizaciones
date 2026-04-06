import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const CATALOG: Record<string, { icon: string; name: string; desc: string; color: string; accentVar: string; href: string; category: string }> = {
  "gestor-citas":           { icon:"◉", name:"Gestor de Citas",         desc:"Sistema de reservas 24/7 con panel completo, servicios configurables y página de booking pública.",            color:"#2f81f7", accentVar:"var(--accent)",  href:"/dashboard/apps/gestor-citas",         category:"Operaciones" },
  "chatbot-cliente":        { icon:"⬡", name:"Chatbot de Atención",     desc:"Asistente virtual entrenado con la información de tu negocio. Responde clientes automáticamente.",           color:"#22c55e", accentVar:"var(--green)",   href:"/dashboard/apps/chatbot-cliente",      category:"Atención al cliente" },
  "faq-inteligente":        { icon:"◈", name:"FAQ Inteligente",         desc:"Base de conocimiento con IA. Aprende de tus FAQs y responde preguntas de clientes al instante.",             color:"#58a6ff", accentVar:"var(--accent)",  href:"/dashboard/apps/faq-inteligente",      category:"Atención al cliente" },
  "contenido-redes":        { icon:"▣", name:"Generador de Contenido",  desc:"Posts optimizados para LinkedIn, Instagram, X y Facebook con el tono y estilo de tu marca.",                 color:"#a78bfa", accentVar:"var(--purple)",  href:"/dashboard/apps/contenido-redes",      category:"Marketing" },
  "email-marketing":        { icon:"◊", name:"Email Marketing",         desc:"Crea campañas de email personalizadas y secuencias de seguimiento que generan conversiones.",               color:"#f472b6", accentVar:"var(--rose)",    href:"/dashboard/apps/email-marketing",      category:"Marketing" },
  "descripciones-producto": { icon:"▤", name:"Descripciones de Producto", desc:"Copy persuasivo para fichas de producto, ecommerce y catálogos que incrementa las ventas.",               color:"#fb923c", accentVar:"var(--amber)",  href:"/dashboard/apps/descripciones-producto", category:"Marketing" },
  "asistente-ventas":       { icon:"◎", name:"Asistente de Ventas",     desc:"CRM con IA para generar propuestas comerciales, rebatir objeciones y gestionar el pipeline de leads.",      color:"#f87171", accentVar:"var(--rose)",   href:"/dashboard/apps/asistente-ventas",     category:"Ventas" },
  "generador-presupuestos": { icon:"▦", name:"Generador de Presupuestos", desc:"Presupuestos profesionales con partidas, IVA y condiciones. Historial y seguimiento de estado.",         color:"#22d3ee", accentVar:"var(--teal)",   href:"/dashboard/apps/generador-presupuestos", category:"Ventas" },
  "analizador-reviews":     { icon:"◆", name:"Analizador de Reseñas",   desc:"Analiza el sentimiento de reseñas de Google y genera respuestas profesionales personalizadas.",            color:"#ffa657", accentVar:"var(--amber)",  href:"/dashboard/apps/analizador-reviews",   category:"Reputación" },
  "resumidor-reuniones":    { icon:"▧", name:"Resumen de Reuniones",    desc:"Extrae decisiones, tareas asignadas y próximos pasos de cualquier transcripción de reunión.",              color:"#34d399", accentVar:"var(--green)",   href:"/dashboard/apps/resumidor-reuniones",  category:"Productividad" },
  "analisis-competencia":   { icon:"◐", name:"Análisis de Competencia", desc:"Genera informes DAFO detallados y análisis estratégicos comparativos con inteligencia artificial.",         color:"#818cf8", accentVar:"var(--purple)",  href:"/dashboard/apps/analisis-competencia", category:"Estrategia" },
  "redactor-contratos":     { icon:"▨", name:"Redactor de Contratos",   desc:"Genera contratos, NDAs, cláusulas y documentos legales básicos adaptados a tu caso concreto.",             color:"#e879f9", accentVar:"var(--purple)",  href:"/dashboard/apps/redactor-contratos",   category:"Legal" },
};

export default async function CatalogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: access } = await supabase.from("user_app_access").select("app_id").eq("user_id", user.id);
  const owned = new Set((access || []).map(a => a.app_id));

  const categories = [...new Set(Object.values(CATALOG).map(a => a.category))];

  return (
    <div style={{ padding: "32px 40px", maxWidth: "1100px" }}>
      <div style={{ marginBottom: "32px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: "4px" }}>Catálogo de aplicaciones</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>
          {owned.size} de {Object.keys(CATALOG).length} apps activas en tu cuenta
        </p>
      </div>

      {categories.map(cat => {
        const apps = Object.entries(CATALOG).filter(([,a]) => a.category === cat);
        return (
          <div key={cat} style={{ marginBottom: "36px" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>{cat}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {apps.map(([id, app]) => {
                const active = owned.has(id);
                return (
                  <div key={id} style={{
                    background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px",
                    opacity: active ? 1 : 0.6, transition: "all 0.2s", position: "relative",
                  }}>
                    {active && (
                      <div style={{ position: "absolute", top: "12px", right: "12px", width: "8px", height: "8px", borderRadius: "50%", background: "var(--green)" }} />
                    )}
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${app.color}20`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px", fontSize: "1.2rem", color: app.color }}>
                      {app.icon}
                    </div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-1)", marginBottom: "6px" }}>{app.name}</div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-3)", lineHeight: 1.6, marginBottom: "16px" }}>{app.desc}</p>
                    {active ? (
                      <Link href={app.href} style={{ display: "inline-flex", padding: "7px 16px", background: "var(--accent-dim)", border: "1px solid rgba(59,127,255,0.3)", color: "var(--accent)", borderRadius: "7px", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600 }}>
                        Abrir app →
                      </Link>
                    ) : (
                      <a href="mailto:oscarherruzom@gmail.com?subject=Solicitar acceso a app" style={{ display: "inline-flex", padding: "7px 16px", background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-3)", borderRadius: "7px", textDecoration: "none", fontSize: "0.8rem" }}>
                        Solicitar acceso
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
