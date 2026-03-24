import Link from "next/link";

const FAQS = [
  { q: "¿Cómo instalo una app?", a: "Ve al Catálogo, localiza la app que quieres y pulsa 'Añadir a mis apps'. Si ves el mensaje 'Sin acceso', contacta con Oscar para que te la active." },
  { q: "¿Qué son los tokens?", a: "Cada vez que ejecutas una app, se consumen tokens. Es la unidad de medida del uso de IA. Puedes ver tu consumo en el Dashboard principal con una barra de progreso." },
  { q: "¿Cómo añado el widget a mi web?", a: "Ve a 'Widget para web' en el menú lateral. Copia el snippet de código y pégalo antes del </body> de tu página. Funciona en cualquier web: WordPress, Shopify, HTML puro..." },
  { q: "¿Puedo guardar los resultados?", a: "Sí. En cada app verás un botón '💾 Guardar resultado'. Los resultados guardados aparecen en el Dashboard y en la sección 'Resultados'." },
  { q: "¿Cómo funciona la API?", a: "En Configuración puedes generar tu API key. Con ella puedes llamar a cualquier app desde tu propio código. Ver documentación abajo." },
  { q: "¿Puedo invitar a mi equipo?", a: "En Configuración tienes la sección 'Invitar colaborador'. Introduce el email y les llegará un enlace de acceso." },
  { q: "Se me acaban los tokens, ¿qué hago?", a: "Contacta directamente con Oscar en oscarherruzom@gmail.com o usa el chat de soporte. Normalmente se amplía en menos de una hora." },
  { q: "¿Los datos son privados?", a: "Sí. Cada usuario solo ve sus propios datos. Usamos Supabase con Row Level Security activado en todas las tablas." },
];

const APPS_GUIDE = [
  { id: "gestor-citas",           icon: "📅", name: "Gestor de Citas",          uso: "Introduce el nombre del cliente, servicio y fecha. La IA genera el mensaje de confirmación automáticamente." },
  { id: "chatbot-cliente",        icon: "💬", name: "Chatbot de Atención",      uso: "Escribe la pregunta como si fuera un cliente. La IA responde desde la perspectiva de tu negocio." },
  { id: "contenido-redes",        icon: "✍️", name: "Generador de Contenido",   uso: "Selecciona la red social, el tono y describe el tema. Obtén el post listo para publicar con hashtags." },
  { id: "email-marketing",        icon: "📨", name: "Email Marketing IA",       uso: "Elige el tipo de email, describe tu negocio y lo que quieres comunicar. La IA escribe el email completo con asunto y CTA." },
  { id: "asistente-ventas",       icon: "🤝", name: "Asistente de Ventas",      uso: "Usa las 4 herramientas: propuesta comercial, email de seguimiento, cualificación de lead o rebatir objeciones." },
  { id: "generador-presupuestos", icon: "💰", name: "Generador de Presupuestos", uso: "Selecciona el tipo de trabajo, describe el alcance y obtén un presupuesto con partidas, IVA y condiciones." },
  { id: "analizador-reviews",     icon: "⭐", name: "Analizador de Reseñas",    uso: "Pega la reseña y obtén análisis de sentimiento + respuesta profesional lista para publicar en Google." },
  { id: "resumidor-reuniones",    icon: "📝", name: "Resumidor de Reuniones",   uso: "Pega la transcripción o notas. Obtienes acta, tareas con responsables, decisiones y próximos pasos en JSON estructurado." },
];

export default function HelpPage() {
  return (
    <div style={{ padding: "24px 32px", maxWidth: "900px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-1)", marginBottom: "6px" }}>Centro de ayuda 📚</h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>Guías, preguntas frecuentes y documentación de la API</p>
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "40px" }}>
        {[
          { icon: "🚀", title: "Primeros pasos",   desc: "Cómo usar la plataforma",        href: "#faq" },
          { icon: "🔌", title: "Widget para web",  desc: "Instala el chatbot en tu web",   href: "/dashboard/widget" },
          { icon: "⚡", title: "Documentación API",desc: "Integra las apps en tu código",   href: "#api" },
        ].map(l => (
          <Link key={l.title} href={l.href} style={{
            display: "block", textDecoration: "none", background: "var(--surface)",
            border: "1px solid var(--border)", borderRadius: "12px", padding: "20px"
          }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>{l.icon}</div>
            <div style={{ fontWeight: 700, color: "var(--text-1)", marginBottom: "4px" }}>{l.title}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>{l.desc}</div>
          </Link>
        ))}
      </div>

      {/* Guía de apps */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-1)", marginBottom: "16px" }}>📖 Guía de uso de cada app</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {APPS_GUIDE.map(app => (
            <div key={app.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px", display: "flex", gap: "14px" }}>
              <span style={{ fontSize: "1.6rem", flexShrink: 0 }}>{app.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: "var(--text-1)", marginBottom: "4px", fontSize: "0.9rem" }}>{app.name}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-3)", lineHeight: 1.5 }}>{app.uso}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div id="faq" style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-1)", marginBottom: "16px" }}>❓ Preguntas frecuentes</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid var(--border)", padding: "16px 0" }}>
              <div style={{ fontWeight: 600, color: "var(--text-1)", marginBottom: "6px", fontSize: "0.9rem" }}>{faq.q}</div>
              <div style={{ fontSize: "0.83rem", color: "var(--text-3)", lineHeight: 1.6 }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* API docs */}
      <div id="api" style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "24px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-1)", marginBottom: "6px" }}>⚡ Documentación API</h2>
        <p style={{ color: "var(--text-3)", fontSize: "0.82rem", marginBottom: "20px" }}>Llama a cualquier app desde tu código. Genera tu API token en Configuración.</p>
        <div style={{ background: "var(--bg-2)", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", marginBottom: "8px" }}>POST /api/public/{"{tu_token}"}</div>
          <pre style={{ fontSize: "0.8rem", color: "var(--text-2)", margin: 0, fontFamily: "var(--font-mono)" }}>{`{
  "app_id": "generador-presupuestos",
  "input": "Descripción del trabajo a presupuestar..."
}`}</pre>
        </div>
        <div style={{ background: "var(--bg-2)", borderRadius: "8px", padding: "16px" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--green)", textTransform: "uppercase", marginBottom: "8px" }}>Respuesta</div>
          <pre style={{ fontSize: "0.8rem", color: "var(--text-2)", margin: 0, fontFamily: "var(--font-mono)" }}>{`{
  "output": "Presupuesto generado...",
  "tokens_used": 245,
  "duration_ms": 1230
}`}</pre>
        </div>
        <div style={{ marginTop: "16px", padding: "12px 16px", background: "rgba(59,127,255,0.08)", borderRadius: "8px", border: "1px solid rgba(59,127,255,0.2)" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-2)", margin: 0 }}>
            IDs de apps disponibles: <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>gestor-citas, chatbot-cliente, faq-inteligente, contenido-redes, email-marketing, descripciones-producto, asistente-ventas, generador-presupuestos, analizador-reviews, resumidor-reuniones, analisis-competencia, redactor-contratos</code>
          </p>
        </div>
      </div>

      {/* Soporte */}
      <div style={{ marginTop: "32px", textAlign: "center", padding: "32px", background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)" }}>
        <div style={{ fontSize: "2rem", marginBottom: "10px" }}>💬</div>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "6px" }}>¿No encuentras lo que buscas?</h3>
        <p style={{ color: "var(--text-3)", fontSize: "0.85rem", marginBottom: "16px" }}>Oscar responde en menos de 24 horas</p>
        <a href="mailto:oscarherruzom@gmail.com" style={{ display: "inline-block", background: "var(--accent)", color: "white", textDecoration: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem" }}>
          Escribir a Oscar
        </a>
      </div>
    </div>
  );
}
