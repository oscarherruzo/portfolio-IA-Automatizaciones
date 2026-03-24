"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STEPS = [
  { n: 1, title: "Tu perfil",          icon: "👤" },
  { n: 2, title: "Tu negocio",         icon: "🏢" },
  { n: 3, title: "Listo para empezar", icon: "🚀" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]       = useState(1);
  const [name, setName]       = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone]     = useState("");
  const [sector, setSector]   = useState("");
  const [saving, setSaving]   = useState(false);

  const SECTORES = ["Restauración / Hostelería", "Retail / Comercio", "Servicios profesionales", "Salud / Bienestar", "Tecnología", "Inmobiliaria", "Educación", "Otro"];

  async function finish() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ full_name: name, company, phone, onboarding_done: true }).eq("id", user.id);
    }
    router.push("/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
      <div style={{ width: "100%", maxWidth: "520px" }}>
        {/* Steps indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0", marginBottom: "40px" }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: "0.85rem",
                background: step >= s.n ? "var(--accent)" : "var(--bg-2)",
                color: step >= s.n ? "white" : "var(--text-3)",
                border: `2px solid ${step >= s.n ? "var(--accent)" : "var(--border)"}`,
                transition: "all 0.2s"
              }}>{step > s.n ? "✓" : s.n}</div>
              {i < STEPS.length - 1 && (
                <div style={{ width: "60px", height: "2px", background: step > s.n ? "var(--accent)" : "var(--border)", transition: "background 0.3s" }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ background: "var(--surface)", borderRadius: "16px", border: "1px solid var(--border)", padding: "36px" }}>
          {step === 1 && (
            <>
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>👤</div>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-1)", marginBottom: "6px" }}>¿Cómo te llamamos?</h1>
                <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>Personaliza tu experiencia en la plataforma</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Nombre completo *</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "11px 14px", color: "var(--text-1)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Teléfono (opcional)</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+34 600 000 000" style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "11px 14px", color: "var(--text-1)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <button
                onClick={() => name.trim() && setStep(2)}
                disabled={!name.trim()}
                style={{ width: "100%", marginTop: "24px", padding: "13px", borderRadius: "10px", border: "none", background: name.trim() ? "var(--accent)" : "var(--bg-3)", color: name.trim() ? "white" : "var(--text-3)", fontWeight: 700, fontSize: "0.95rem", cursor: name.trim() ? "pointer" : "not-allowed" }}
              >Continuar →</button>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🏢</div>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-1)", marginBottom: "6px" }}>Cuéntame tu negocio</h1>
                <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>Así puedo personalizar mejor las apps para ti</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Nombre de la empresa</label>
                  <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Mi Empresa SL" style={{ width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "8px", padding: "11px 14px", color: "var(--text-1)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Sector</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    {SECTORES.map(s => (
                      <button key={s} onClick={() => setSector(s)} style={{
                        padding: "8px 10px", borderRadius: "8px", border: "1px solid",
                        borderColor: sector === s ? "var(--accent)" : "var(--border)",
                        background: sector === s ? "var(--accent-dim)" : "var(--bg-2)",
                        color: sector === s ? "var(--accent)" : "var(--text-2)",
                        cursor: "pointer", fontSize: "0.78rem", fontWeight: sector === s ? 600 : 400, textAlign: "left"
                      }}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: "13px", borderRadius: "10px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", fontWeight: 600, cursor: "pointer" }}>← Atrás</button>
                <button onClick={() => setStep(3)} style={{ flex: 2, padding: "13px", borderRadius: "10px", border: "none", background: "var(--accent)", color: "white", fontWeight: 700, cursor: "pointer" }}>Continuar →</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🚀</div>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-1)", marginBottom: "6px" }}>¡Todo listo, {name.split(" ")[0]}!</h1>
                <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>Tu cuenta está configurada. Estas son las apps disponibles para ti:</p>
              </div>
              <div style={{ background: "var(--bg-2)", borderRadius: "10px", border: "1px solid var(--border)", padding: "16px", marginBottom: "24px" }}>
                {[
                  "Accede al catálogo de 12 apps",
                  "Los resultados se guardan automáticamente",
                  "Puedes usar el widget en tu web",
                  "Consulta con Oscar cualquier duda",
                ].map(t => (
                  <div key={t} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px", fontSize: "0.85rem" }}>
                    <span style={{ color: "var(--green)", fontWeight: 700 }}>✓</span>
                    <span style={{ color: "var(--text-2)" }}>{t}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={finish}
                disabled={saving}
                style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "none", background: saving ? "var(--bg-3)" : "var(--accent)", color: saving ? "var(--text-3)" : "white", fontWeight: 700, fontSize: "0.95rem", cursor: saving ? "not-allowed" : "pointer" }}
              >
                {saving ? "Guardando..." : "Entrar al dashboard →"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
