"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { AUTOMATION_TYPES } from "@/lib/utils";

type Automation = {
  id: string;
  name: string;
  description: string;
  type: string;
  prompt_template: string;
  is_active: boolean;
  runs_count: number;
  created_at: string;
};

export default function AutomationsPage() {
  const searchParams = useSearchParams();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Automation | null>(null);
  const [running, setRunning] = useState<string | null>(null);
  const [runInput, setRunInput] = useState("");
  const [runOutput, setRunOutput] = useState("");
  const [runLoading, setRunLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({ name: "", description: "", type: "email", prompt_template: "" });

  const fetchAutomations = useCallback(async () => {
    const res = await fetch("/api/automations");
    const data = await res.json();
    setAutomations(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAutomations(); }, [fetchAutomations]);

  useEffect(() => {
    const newType = searchParams.get("new");
    if (newType && newType !== "1") {
      setForm((f) => ({ ...f, type: newType }));
      setShowModal(true);
    } else if (newType === "1") {
      setShowModal(true);
    }
  }, [searchParams]);

  async function handleSave() {
    if (!form.name.trim()) return;
    const res = await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ name: "", description: "", type: "email", prompt_template: "" });
      fetchAutomations();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta automatización?")) return;
    await fetch("/api/automations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchAutomations();
  }

  async function handleToggle(automation: Automation) {
    await fetch("/api/automations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: automation.id, is_active: !automation.is_active }),
    });
    fetchAutomations();
  }

  async function handleRun() {
    if (!selected || !runInput.trim()) return;
    setRunLoading(true);
    setRunOutput("");
    const res = await fetch("/api/automations/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ automation_id: selected.id, input_text: runInput }),
    });
    const data = await res.json();
    if (data.output) {
      setRunOutput(data.output);
      fetchAutomations();
    } else {
      setRunOutput(`Error: ${data.error || "Fallo al ejecutar"}`);
    }
    setRunLoading(false);
  }

  const typeInfo = (type: string) => AUTOMATION_TYPES.find((t) => t.id === type);

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1100px", animation: "fadeIn 0.4s ease both" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "4px" }}>
            Automatizaciones
          </h1>
          <p style={{ color: "#7d8590", fontSize: "0.875rem" }}>
            Crea y gestiona tus flujos de trabajo con IA
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setShowModal(true); setForm({ name: "", description: "", type: "email", prompt_template: "" }); }}>
          + Nueva automatización
        </button>
      </div>

      {/* Two-column layout when running */}
      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 420px" : "1fr", gap: "20px" }}>
        {/* List */}
        <div>
          {loading ? (
            <div style={{ color: "#7d8590", padding: "40px", textAlign: "center" }}>Cargando...</div>
          ) : automations.length === 0 ? (
            <div className="card" style={{ padding: "60px 32px", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⚡</div>
              <div style={{ fontWeight: 600, marginBottom: "6px" }}>Sin automatizaciones</div>
              <div style={{ color: "#7d8590", fontSize: "0.83rem", marginBottom: "20px" }}>
                Crea tu primera automatización de negocio con IA
              </div>
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                Crear automatización
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {automations.map((a) => {
                const t = typeInfo(a.type);
                const isSelected = selected?.id === a.id;
                return (
                  <div
                    key={a.id}
                    className="card"
                    style={{
                      padding: "16px",
                      cursor: "pointer",
                      borderColor: isSelected ? "#2f81f7" : "#30363d",
                      transition: "border-color 0.15s",
                      opacity: a.is_active ? 1 : 0.5,
                    }}
                    onClick={() => {
                      setSelected(isSelected ? null : a);
                      setRunOutput("");
                      setRunInput("");
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "38px", height: "38px", borderRadius: "8px",
                        background: `${t?.color}18`, border: `1px solid ${t?.color}33`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.1rem", flexShrink: 0,
                      }}>
                        {t?.icon || "⚡"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                          <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{a.name}</span>
                          <span className="badge" style={{
                            background: `${t?.color}15`, color: t?.color || "#7d8590",
                            border: `1px solid ${t?.color}30`,
                          }}>
                            {t?.label || a.type}
                          </span>
                          {!a.is_active && (
                            <span className="badge" style={{ background: "rgba(125,133,144,0.15)", color: "#7d8590", border: "1px solid #30363d" }}>
                              Pausada
                            </span>
                          )}
                        </div>
                        <div style={{ color: "#7d8590", fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {a.description || "Sin descripción"} · {a.runs_count} ejecuciones
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-secondary"
                          style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                          onClick={() => handleToggle(a)}
                        >
                          {a.is_active ? "Pausar" : "Activar"}
                        </button>
                        <button
                          style={{
                            background: "none", border: "1px solid #30363d", borderRadius: "6px",
                            color: "#7d8590", padding: "4px 8px", cursor: "pointer", fontSize: "0.75rem",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                          onClick={() => handleDelete(a.id)}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#f85149"; e.currentTarget.style.borderColor = "rgba(248,81,73,0.5)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "#7d8590"; e.currentTarget.style.borderColor = "#30363d"; }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Run Panel */}
        {selected && (
          <div className="card" style={{ padding: "0", height: "fit-content", position: "sticky", top: "24px" }}>
            <div style={{
              padding: "14px 16px", borderBottom: "1px solid #30363d",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <span style={{ fontSize: "1rem" }}>{typeInfo(selected.type)?.icon}</span>
              <span style={{ fontWeight: 600, fontSize: "0.875rem", flex: 1 }}>{selected.name}</span>
              <button
                style={{ background: "none", border: "none", color: "#7d8590", cursor: "pointer", fontSize: "1rem" }}
                onClick={() => { setSelected(null); setRunOutput(""); }}
              >✕</button>
            </div>
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#7d8590", display: "block", marginBottom: "6px" }}>
                  ENTRADA
                </label>
                <textarea
                  value={runInput}
                  onChange={(e) => setRunInput(e.target.value)}
                  placeholder={`Escribe aquí el texto para "${selected.name}"...`}
                  rows={5}
                  style={{ width: "100%", padding: "10px", resize: "vertical", lineHeight: 1.5 }}
                />
              </div>
              <button
                className="btn-primary"
                onClick={handleRun}
                disabled={runLoading || !runInput.trim()}
                style={{ width: "100%" }}
              >
                {runLoading ? "⏳ Ejecutando..." : "▶ Ejecutar"}
              </button>

              {runOutput && (
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#7d8590", display: "block", marginBottom: "6px" }}>
                    RESULTADO
                  </label>
                  <div style={{
                    background: "#0d1117", border: "1px solid #30363d", borderRadius: "6px",
                    padding: "12px", fontSize: "0.83rem", lineHeight: 1.6,
                    maxHeight: "300px", overflowY: "auto", whiteSpace: "pre-wrap",
                    color: runOutput.startsWith("Error:") ? "#f85149" : "#e6edf3",
                    animation: "fadeIn 0.3s ease both",
                  }}>
                    {runOutput}
                  </div>
                  <button
                    className="btn-secondary"
                    style={{ width: "100%", marginTop: "8px", fontSize: "0.78rem" }}
                    onClick={() => navigator.clipboard.writeText(runOutput)}
                  >
                    Copiar resultado
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(1,4,9,0.8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "24px",
          animation: "fadeIn 0.2s ease both",
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "480px", padding: "0" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #30363d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700 }}>Nueva automatización</span>
              <button style={{ background: "none", border: "none", color: "#7d8590", cursor: "pointer", fontSize: "1.1rem" }}
                onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>Nombre *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Responder emails de soporte"
                  style={{ width: "100%", padding: "8px 12px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>Tipo</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  {AUTOMATION_TYPES.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setForm((f) => ({ ...f, type: t.id }))}
                      style={{
                        padding: "8px 10px", borderRadius: "6px", cursor: "pointer",
                        border: `1px solid ${form.type === t.id ? t.color : "#30363d"}`,
                        background: form.type === t.id ? `${t.color}10` : "#1c2128",
                        display: "flex", alignItems: "center", gap: "6px",
                        fontSize: "0.78rem", fontWeight: form.type === t.id ? 600 : 400,
                        color: form.type === t.id ? t.color : "#7d8590",
                        transition: "all 0.15s",
                      }}
                    >
                      <span>{t.icon}</span> {t.label}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                  Descripción
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Para qué sirve esta automatización"
                  style={{ width: "100%", padding: "8px 12px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                  Instrucciones de IA <span style={{ color: "#7d8590", fontWeight: 400 }}>(opcional)</span>
                </label>
                <textarea
                  value={form.prompt_template}
                  onChange={(e) => setForm((f) => ({ ...f, prompt_template: e.target.value }))}
                  placeholder="Ej: Eres un asistente de atención al cliente de [empresa]. Responde de forma amable y profesional..."
                  rows={3}
                  style={{ width: "100%", padding: "8px 12px", resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn-primary" onClick={handleSave} disabled={!form.name.trim()}>
                  Crear automatización
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
