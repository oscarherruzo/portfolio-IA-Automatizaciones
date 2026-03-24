"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const INTEGRATIONS = [
  {
    id: "gmail", name: "Gmail", icon: "📧", color: "#ea4335",
    desc: "Conecta tu Gmail para automatizar respuestas y clasificación de emails con IA.",
    fields: [{ key: "email", label: "Email de Gmail", placeholder: "tu@gmail.com", type: "email" }],
    webhookInfo: "Una vez conectado, los nuevos emails activarán tus automatizaciones de tipo Email.",
  },
  {
    id: "slack", name: "Slack", icon: "💬", color: "#4a154b",
    desc: "Recibe notificaciones y resultados de tus automatizaciones directamente en Slack.",
    fields: [
      { key: "webhook_url", label: "Webhook URL de Slack", placeholder: "https://hooks.slack.com/services/...", type: "url" },
      { key: "channel", label: "Canal (opcional)", placeholder: "#automatizaciones", type: "text" },
    ],
    webhookInfo: "Crea un Incoming Webhook en api.slack.com/messaging/webhooks y pega la URL aquí.",
  },
  {
    id: "notion", name: "Notion", icon: "📝", color: "#ffffff",
    desc: "Guarda los resultados de tus automatizaciones en bases de datos de Notion.",
    fields: [
      { key: "api_key", label: "Integration Token", placeholder: "secret_...", type: "password" },
      { key: "database_id", label: "Database ID", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", type: "text" },
    ],
    webhookInfo: "Ve a notion.so/my-integrations, crea una integración y comparte la base de datos con ella.",
  },
  {
    id: "hubspot", name: "HubSpot", icon: "🧲", color: "#ff7a59",
    desc: "Sincroniza leads y contactos entre tus formularios y tu CRM de HubSpot.",
    fields: [{ key: "api_key", label: "API Key de HubSpot", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", type: "password" }],
    webhookInfo: "En HubSpot ve a Configuración → Integraciones → API Key y genera una nueva clave.",
  },
  {
    id: "airtable", name: "Airtable", icon: "📊", color: "#18bfff",
    desc: "Graba los resultados de análisis y resúmenes directamente en tus bases de Airtable.",
    fields: [
      { key: "api_key", label: "API Key de Airtable", placeholder: "keyXXXXXXXXXXXXXX", type: "password" },
      { key: "base_id", label: "Base ID", placeholder: "appXXXXXXXXXXXXXX", type: "text" },
    ],
    webhookInfo: "En Airtable ve a account.airtable.com/api para generar tu API key.",
  },
  {
    id: "make", name: "Make (Integromat)", icon: "🔄", color: "#6d00cc",
    desc: "Activa escenarios de Make desde tus automatizaciones para conectar con +1000 apps.",
    fields: [{ key: "webhook_url", label: "Webhook URL de Make", placeholder: "https://hook.eu1.make.com/...", type: "url" }],
    webhookInfo: "En Make crea un escenario con el trigger Webhooks → Custom Webhook y copia la URL.",
  },
  {
    id: "whatsapp", name: "WhatsApp Business", icon: "📱", color: "#25d366",
    desc: "Envía notificaciones y resultados por WhatsApp a tu equipo o clientes.",
    fields: [
      { key: "phone_id", label: "Phone Number ID", placeholder: "123456789012345", type: "text" },
      { key: "token", label: "Access Token", placeholder: "EAAxxxxxxx...", type: "password" },
    ],
    webhookInfo: "Necesitas una cuenta de Meta for Developers con la API de WhatsApp Business habilitada.",
  },
  {
    id: "n8n", name: "n8n", icon: "⚙️", color: "#ea4b71",
    desc: "Dispara workflows de n8n self-hosted o cloud desde tus automatizaciones.",
    fields: [
      { key: "webhook_url", label: "Webhook URL de n8n", placeholder: "https://tu-n8n.com/webhook/...", type: "url" },
      { key: "api_key", label: "API Key (opcional)", placeholder: "n8n_api_...", type: "password" },
    ],
    webhookInfo: "En n8n crea un workflow con el nodo Webhook, actívalo y copia la Production URL.",
  },
];

type Config = Record<string, Record<string, string>>;
type Connected = Record<string, boolean>;

export default function IntegrationsPage() {
  const [configs, setConfigs]       = useState<Config>({});
  const [connected, setConnected]   = useState<Connected>({});
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [saving, setSaving]         = useState<string | null>(null);
  const [saved, setSaved]           = useState<string | null>(null);
  const [testing, setTesting]       = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, string>>({});
  
  // Novedad: Guardar el plan del usuario
  const [plan, setPlan]             = useState<string>("free");
  const MAX_FREE_INTEGRATIONS       = 2; // Número máximo de integraciones gratis

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("profiles").select("integrations, plan").eq("id", user.id).single().then(({ data }) => {
        if (data) {
          if (data.plan) setPlan(data.plan);
          if (data.integrations) {
            const saved = data.integrations as Config;
            setConfigs(saved);
            const conn: Connected = {};
            Object.keys(saved).forEach((k) => { conn[k] = Object.values(saved[k]).some((v) => v.trim() !== ""); });
            setConnected(conn);
          }
        }
      });
    });
  }, []);

  function updateField(integId: string, key: string, value: string) {
    setConfigs((prev) => ({ ...prev, [integId]: { ...(prev[integId] || {}), [key]: value } }));
  }

  async function handleSave(integId: string) {
    setSaving(integId);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: current } = await supabase.from("profiles").select("integrations").eq("id", user.id).single();
    const newIntegrations = { ...(current?.integrations as Config || {}), [integId]: configs[integId] || {} };
    await supabase.from("profiles").update({ integrations: newIntegrations }).eq("id", user.id);
    const hasValues = Object.values(configs[integId] || {}).some((v) => v.trim() !== "");
    setConnected((prev) => ({ ...prev, [integId]: hasValues }));
    setSaving(null); setSaved(integId);
    setTimeout(() => setSaved(null), 2500);
  }

  async function handleTest(integId: string) {
    setTesting(integId);
    const integ = INTEGRATIONS.find((i) => i.id === integId);
    const cfg   = configs[integId] || {};
    const hasWebhook = cfg.webhook_url?.startsWith("http");

    if (integId === "slack" || integId === "make" || integId === "n8n") {
      if (!hasWebhook) {
        setTestResult((p) => ({ ...p, [integId]: "❌ Añade la Webhook URL primero" }));
        setTesting(null); return;
      }
      try {
        const body = integId === "slack"
          ? JSON.stringify({ text: `✅ Test desde Oscar Herruzo IA — ${integ?.name} conectado correctamente` })
          : JSON.stringify({ source: "oscar_herruzo_ia", test: true, timestamp: new Date().toISOString() });
        const res = await fetch(cfg.webhook_url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
        setTestResult((p) => ({ ...p, [integId]: res.ok ? "✅ Webhook recibido correctamente" : `❌ Error HTTP ${res.status}` }));
      } catch {
        setTestResult((p) => ({ ...p, [integId]: "❌ No se pudo alcanzar la URL" }));
      }
    } else {
      setTestResult((p) => ({ ...p, [integId]: "✅ Configuración guardada. El test real se realizará en la próxima ejecución." }));
    }
    setTesting(null);
    setTimeout(() => setTestResult((p) => { const n = {...p}; delete n[integId]; return n; }), 4000);
  }

  return (
    <div style={{ padding: "32px", maxWidth: "1100px", animation: "fadeIn 0.4s ease both" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--text-1)", marginBottom: "6px" }}>
          Integraciones
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>
          Conecta tus herramientas para que las automatizaciones funcionen de forma completamente automática
        </p>
      </div>

      {/* How it works */}
      <div style={{
        background: "var(--accent-dim)", border: "1px solid rgba(59,127,255,0.2)",
        borderRadius: "var(--radius)", padding: "16px 20px", marginBottom: "28px",
        display: "flex", gap: "12px", alignItems: "flex-start",
      }}>
        <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>ℹ️</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-1)", marginBottom: "4px" }}>¿Cómo funcionan las integraciones?</div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-2)", lineHeight: 1.6, margin: 0 }}>
            Conecta aquí tus herramientas y tus automatizaciones de IA empezarán a trabajar de forma autónoma.
            Por ejemplo: cuando llegue un email a Gmail, la IA lo procesará y enviará la respuesta sola.
            Cada integración activa el flujo correspondiente sin que necesites hacer clic en nada.
          </p>
        </div>
      </div>

      {/* Connected count */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center" }}>
        <span style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>
          <span style={{ color: "var(--green)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{Object.values(connected).filter(Boolean).length}</span> de {INTEGRATIONS.length} conectadas
        </span>
        <div style={{ flex: 1, height: "3px", borderRadius: "2px", background: "var(--border)" }}>
          <div style={{ height: "100%", borderRadius: "2px", background: "var(--green)", width: `${(Object.values(connected).filter(Boolean).length / INTEGRATIONS.length) * 100}%`, transition: "width 0.4s" }} />
        </div>
      </div>

      {/* Integrations grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
        {INTEGRATIONS.map((integ) => {
          const isExpanded  = expanded === integ.id;
          const isConnected = connected[integ.id];
          const isSaving    = saving === integ.id;
          const isSaved     = saved === integ.id;
          const isTesting   = testing === integ.id;
          const result      = testResult[integ.id];

          // Novedad: Lógica de bloqueo
          const connectedCount = Object.values(connected).filter(Boolean).length;
          const isLimitReached = plan !== "pro" && connectedCount >= MAX_FREE_INTEGRATIONS;
          const isLocked = isLimitReached && !isConnected;

          return (
            <div key={integ.id} style={{
              background: "var(--surface)", borderRadius: "var(--radius)",
              border: `1px solid ${isConnected ? integ.color + "40" : "var(--border)"}`,
              overflow: "hidden", transition: "border-color 0.2s",
            }}>
              {/* Header */}
              <div
                style={{ padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}
                onClick={() => setExpanded(isExpanded ? null : integ.id)}
              >
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
                  background: `${integ.color}18`, border: `1px solid ${integ.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem",
                }}>
                  {integ.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-1)" }}>{integ.name}</span>
                    {isConnected && (
                      <span style={{
                        fontSize: "0.62rem", fontWeight: 700, padding: "1px 7px", borderRadius: "100px",
                        background: "var(--green-dim)", color: "var(--green)", border: "1px solid rgba(34,197,94,0.2)",
                        fontFamily: "var(--font-mono)",
                      }}>
                        ✓ Conectado
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{integ.desc}</div>
                </div>
                <span style={{ color: "var(--text-3)", fontSize: "0.8rem", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
              </div>

              {/* Expanded form */}
              {isExpanded && (
                <div style={{ padding: "0 18px 18px", borderTop: "1px solid var(--border)" }}>
                  <div style={{ paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Webhook info */}
                    <div style={{
                      background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
                      borderRadius: "8px", padding: "10px 12px",
                      fontSize: "0.75rem", color: "var(--text-3)", lineHeight: 1.6,
                    }}>
                      💡 {integ.webhookInfo}
                    </div>

                    {/* Fields */}
                    {integ.fields.map((field) => (
                      <div key={field.key} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-2)", letterSpacing: "0.02em" }}>{field.label}</label>
                        <input
                          type={field.type}
                          value={configs[integ.id]?.[field.key] || ""}
                          onChange={(e) => updateField(integ.id, field.key, e.target.value)}
                          placeholder={field.placeholder}
                          disabled={isLocked}
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-bright)", borderRadius: "8px", padding: "9px 12px", color: "var(--text-1)", fontFamily: "var(--font-mono)", fontSize: "0.78rem", outline: "none", width: "100%", opacity: isLocked ? 0.5 : 1 }}
                          onFocus={(e) => { if(!isLocked){e.target.style.borderColor = "rgba(59,127,255,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(59,127,255,0.1)";} }}
                          onBlur={(e)  => { if(!isLocked){e.target.style.borderColor = "var(--border-bright)"; e.target.style.boxShadow = "none";} }}
                        />
                      </div>
                    ))}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <button
                        onClick={() => handleSave(integ.id)}
                        disabled={isSaving || isLocked}
                        style={{
                          flex: 1, padding: "9px", borderRadius: "8px", border: "none",
                          background: isLocked ? "var(--bg-3)" : (isSaved ? "var(--green)" : "var(--accent)"), 
                          color: isLocked ? "var(--text-3)" : "#fff",
                          fontFamily: "var(--font-body)", fontSize: "0.83rem", fontWeight: 600, 
                          cursor: isLocked ? "not-allowed" : "pointer",
                          transition: "background 0.2s",
                        }}
                      >
                        {isLocked 
                          ? "🔒 Límite Free" 
                          : (isSaved ? "✓ Guardado" : isSaving ? "Guardando..." : "Guardar")}
                      </button>
                      {(integ.id === "slack" || integ.id === "make" || integ.id === "n8n" || isConnected) && (
                        <button
                          onClick={() => handleTest(integ.id)}
                          disabled={isTesting || isLocked}
                          style={{
                            padding: "9px 16px", borderRadius: "8px",
                            background: "var(--bg-3)", border: "1px solid var(--border-bright)",
                            color: isLocked ? "var(--text-3)" : "var(--text-2)", fontFamily: "var(--font-body)", fontSize: "0.83rem", cursor: isLocked ? "not-allowed" : "pointer",
                            fontWeight: 500, transition: "border-color 0.15s",
                          }}
                        >
                          {isTesting ? "⏳" : "Test"}
                        </button>
                      )}
                    </div>

                    {/* Test result */}
                    {result && (
                      <div style={{
                        padding: "9px 12px", borderRadius: "8px", fontSize: "0.78rem",
                        fontFamily: "var(--font-mono)",
                        background: result.startsWith("✅") ? "var(--green-dim)" : "var(--rose-dim)",
                        color: result.startsWith("✅") ? "var(--green)" : "var(--rose)",
                        border: `1px solid ${result.startsWith("✅") ? "rgba(34,197,94,0.2)" : "rgba(251,113,133,0.2)"}`,
                      }}>
                        {result}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Webhook endpoint info */}
      <div style={{
        marginTop: "24px",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: "20px",
      }}>
        <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-1)", marginBottom: "10px" }}>
          🔌 Tu endpoint de webhook
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-3)", marginBottom: "12px", lineHeight: 1.6 }}>
          Cualquier sistema externo puede activar tus automatizaciones enviando una petición POST a esta URL.
          Ideal para conectar desde Zapier, Make, n8n o cualquier app con webhooks.
        </p>
        <div style={{
          background: "var(--bg)", border: "1px solid var(--border-bright)",
          borderRadius: "8px", padding: "10px 14px",
          fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--accent)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>POST {typeof window !== "undefined" ? window.location.origin : "https://tu-dominio.com"}/api/automations/run</span>
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/automations/run`)}
            style={{ background: "var(--accent-dim)", border: "1px solid rgba(59,127,255,0.2)", color: "var(--accent)", borderRadius: "6px", padding: "4px 10px", fontSize: "0.72rem", cursor: "pointer", fontFamily: "var(--font-mono)" }}
          >
            Copiar
          </button>
        </div>
        <div style={{ marginTop: "10px", fontSize: "0.75rem", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
          Body: {'{ "automation_id": "uuid", "input_text": "texto a procesar" }'}
        </div>
      </div>
    </div>
  );
}