"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SECTORES = ["Hostelería", "Comercio / Retail", "Salud / Bienestar", "Servicios profesionales", "Inmobiliaria", "Educación", "Tecnología", "Marketing / Publicidad", "Construcción", "Otro"];

const PASOS = ["Tu perfil", "Tu negocio", "Tu primera app"];

export default function OnboardingPage() {
  const router  = useRouter();
  const [paso, setPaso]     = useState(0);
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [sector, setSector] = useState("");
  const [saving, setSaving] = useState(false);

  async function guardar() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        full_name: nombre || undefined,
        company_name: empresa || undefined,
        sector: sector || undefined,
        onboarding_done: true,
      }).eq("id", user.id);
    }
    router.push("/dashboard/catalog");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Logo */}
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <div style={{ width: "48px", height: "48px", background: "#2f81f7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", margin: "0 auto 12px" }}>⚡</div>
        <p style={{ color: "#7d8590", fontSize: "0.875rem" }}>Bienvenido a IA para Negocios</p>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", gap: "0", marginBottom: "40px", background: "#161b22", borderRadius: "100px", padding: "4px", border: "1px solid #30363d" }}>
        {PASOS.map((p, i) => (
          <div key={p} style={{
            padding: "6px 20px", borderRadius: "100px", fontSize: "0.78rem", fontWeight: 600,
            background: paso === i ? "#2f81f7" : "transparent",
            color: paso === i ? "#fff" : paso > i ? "#3fb950" : "#7d8590",
          }}>
            {paso > i ? "✓ " : ""}{p}
          </div>
        ))}
      </div>

      <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "16px", padding: "40px", width: "100%", maxWidth: "480px" }}>

        {/* PASO 0 */}
        {paso === 0 && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "8px" }}>¿Cómo te llamas?</h2>
            <p style={{ color: "#7d8590", fontSize: "0.875rem", marginBottom: "24px" }}>Así te llamaré dentro de la plataforma.</p>
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Tu nombre completo"
              style={{ width: "100%", background: "#0d1117", border: "1px solid #30363d", borderRadius: "10px", padding: "13px 16px", color: "#e6edf3", fontSize: "1rem", outline: "none", boxSizing: "border-box", marginBottom: "24px" }}
            />
            <button
              onClick={() => setPaso(1)}
              disabled={!nombre.trim()}
              style={{ width: "100%", padding: "13px", background: nombre.trim() ? "#2f81f7" : "#21262d", border: "none", borderRadius: "10px", color: nombre.trim() ? "#fff" : "#7d8590", fontWeight: 700, fontSize: "0.95rem", cursor: nombre.trim() ? "pointer" : "not-allowed" }}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* PASO 1 */}
        {paso === 1 && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "8px" }}>Cuéntame tu negocio</h2>
            <p style={{ color: "#7d8590", fontSize: "0.875rem", marginBottom: "24px" }}>Esto me ayuda a configurar las mejores apps para ti.</p>

            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7d8590", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Nombre de tu empresa</label>
            <input
              value={empresa}
              onChange={e => setEmpresa(e.target.value)}
              placeholder="Ej: Clínica Dental García"
              style={{ width: "100%", background: "#0d1117", border: "1px solid #30363d", borderRadius: "10px", padding: "12px 16px", color: "#e6edf3", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", marginBottom: "16px" }}
            />

            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7d8590", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Sector</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "24px" }}>
              {SECTORES.map(s => (
                <button key={s} onClick={() => setSector(s)} style={{
                  padding: "9px 12px", borderRadius: "8px", border: "1px solid",
                  borderColor: sector === s ? "#2f81f7" : "#30363d",
                  background: sector === s ? "rgba(47,129,247,0.1)" : "transparent",
                  color: sector === s ? "#2f81f7" : "#8b949e",
                  cursor: "pointer", fontSize: "0.8rem", fontWeight: sector === s ? 600 : 400, textAlign: "left"
                }}>{s}</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setPaso(0)} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid #30363d", borderRadius: "10px", color: "#8b949e", cursor: "pointer", fontWeight: 600 }}>
                ← Atrás
              </button>
              <button onClick={() => setPaso(2)} style={{ flex: 2, padding: "12px", background: "#2f81f7", border: "none", borderRadius: "10px", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* PASO 2 */}
        {paso === 2 && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "8px" }}>¡Todo listo, {nombre}! 🎉</h2>
            <p style={{ color: "#7d8590", fontSize: "0.875rem", marginBottom: "28px" }}>Tu plataforma está configurada. Ahora elige tu primera app para empezar.</p>

            <div style={{ background: "rgba(47,129,247,0.08)", border: "1px solid rgba(47,129,247,0.2)", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
              <div style={{ fontWeight: 700, marginBottom: "10px", color: "#e6edf3" }}>Lo que te espera:</div>
              {[
                "12 apps de IA listas para usar",
                "Resultados guardados automáticamente",
                "Widget embebible para tu web",
                "Chat IA incluido",
              ].map(item => (
                <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "6px", fontSize: "0.85rem", color: "#8b949e" }}>
                  <span style={{ color: "#3fb950" }}>✓</span> {item}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setPaso(1)} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid #30363d", borderRadius: "10px", color: "#8b949e", cursor: "pointer", fontWeight: 600 }}>
                ← Atrás
              </button>
              <button onClick={guardar} disabled={saving} style={{ flex: 2, padding: "12px", background: "#3fb950", border: "none", borderRadius: "10px", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Guardando..." : "Ir al catálogo de apps →"}
              </button>
            </div>
          </div>
        )}
      </div>

      <p style={{ marginTop: "20px", color: "#7d8590", fontSize: "0.78rem" }}>
        ¿Ya tienes cuenta?{" "}
        <a href="/login" style={{ color: "#2f81f7", textDecoration: "none" }}>Inicia sesión</a>
      </p>
    </div>
  );
}
