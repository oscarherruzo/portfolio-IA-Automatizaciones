"use client";
import { useState } from "react";
const SERVICIOS = ["Corte de pelo","Tinte","Peinado","Tratamiento","Manicura","Depilación"];
const HORAS = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30"];
const DIAS = ["Lun","Mar","Mié","Jue","Vie","Sáb"];
type Cita = { dia: string; hora: string; servicio: string; nombre: string; tel: string };
export default function GestorCitasPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [form, setForm] = useState({ dia: "", hora: "", servicio: "", nombre: "", tel: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");
  const dias = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return { label: DIAS[d.getDay() === 0 ? 6 : d.getDay() - 1], date: d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) }; });
  async function handleReservar() {
    if (!form.nombre || !form.servicio || !form.dia || !form.hora) return;
    setLoading(true);
    setConfirmMsg("");
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: `Confirma esta cita: Nombre: ${form.nombre}, Tel: ${form.tel}, Servicio: ${form.servicio}, Día: ${form.dia}, Hora: ${form.hora}. Genera un mensaje de confirmación amable y profesional.` }] }) });
      const data = await res.json();
      setCitas(prev => [...prev, { ...form }]);
      setConfirmMsg(data.message || "¡Cita confirmada!");
      setShowForm(false);
      setForm({ dia: "", hora: "", servicio: "", nombre: "", tel: "" });
    } finally { setLoading(false); }
  }
  return (
    <div style={{ padding: "24px 32px", maxWidth: "1100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "4px" }}>📅 Gestor de Citas</h1>
          <p style={{ color: "#7d8590", fontSize: "0.875rem" }}>Calendario inteligente · {citas.length} citas esta semana</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nueva cita</button>
      </div>
      {confirmMsg && <div style={{ background: "rgba(63,185,80,0.1)", border: "1px solid rgba(63,185,80,0.3)", borderRadius: "8px", padding: "14px 16px", marginBottom: "20px", fontSize: "0.875rem", color: "#3fb950", lineHeight: 1.5 }}>{confirmMsg}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "10px", marginBottom: "24px" }}>
        {dias.map((d) => {
          const dayCitas = citas.filter(c => c.dia === d.date);
          return (
            <div key={d.date} className="card" style={{ padding: "14px", textAlign: "center", cursor: "pointer" }} onClick={() => { setForm(f => ({ ...f, dia: d.date })); setShowForm(true); }}>
              <div style={{ fontSize: "0.72rem", color: "#7d8590", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>{d.label}</div>
              <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "8px" }}>{d.date}</div>
              {dayCitas.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {dayCitas.map((c, i) => <div key={i} style={{ background: "rgba(47,129,247,0.15)", border: "1px solid rgba(47,129,247,0.3)", borderRadius: "4px", padding: "3px 6px", fontSize: "0.68rem", color: "#58a6ff" }}>{c.hora} · {c.servicio}</div>)}
                </div>
              ) : (
                <div style={{ fontSize: "0.72rem", color: "#484f58" }}>Sin citas</div>
              )}
            </div>
          );
        })}
      </div>
      {citas.length > 0 && (
        <div className="card" style={{ padding: "0" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #30363d", fontWeight: 600, fontSize: "0.875rem" }}>Citas confirmadas</div>
          {citas.map((c, i) => (
            <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", gap: "12px", fontSize: "0.83rem" }}>
              <span className="status-dot success" />
              <span style={{ fontWeight: 600 }}>{c.nombre}</span>
              <span style={{ color: "#7d8590" }}>·</span>
              <span style={{ color: "#58a6ff" }}>{c.servicio}</span>
              <span style={{ color: "#7d8590" }}>·</span>
              <span>{c.dia} a las {c.hora}</span>
              {c.tel && <span style={{ color: "#7d8590", marginLeft: "auto", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem" }}>{c.tel}</span>}
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(1,4,9,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "24px" }}>
          <div className="card" style={{ width: "100%", maxWidth: "440px", padding: "0" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #30363d", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700 }}>Nueva cita</span>
              <button style={{ background: "none", border: "none", color: "#7d8590", cursor: "pointer", fontSize: "1.1rem" }} onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div><label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>Nombre *</label><input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Nombre del cliente" style={{ width: "100%", padding: "8px 12px" }} /></div>
              <div><label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>Teléfono</label><input value={form.tel} onChange={e => setForm(f => ({ ...f, tel: e.target.value }))} placeholder="+34 600 000 000" style={{ width: "100%", padding: "8px 12px" }} /></div>
              <div><label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>Servicio *</label><select value={form.servicio} onChange={e => setForm(f => ({ ...f, servicio: e.target.value }))} style={{ width: "100%", padding: "8px 12px" }}><option value="">Selecciona un servicio</option>{SERVICIOS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div><label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>Día *</label><select value={form.dia} onChange={e => setForm(f => ({ ...f, dia: e.target.value }))} style={{ width: "100%", padding: "8px 12px" }}><option value="">Selecciona día</option>{dias.map(d => <option key={d.date} value={d.date}>{d.label} {d.date}</option>)}</select></div>
                <div><label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>Hora *</label><select value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))} style={{ width: "100%", padding: "8px 12px" }}><option value="">Selecciona hora</option>{HORAS.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button className="btn-primary" onClick={handleReservar} disabled={loading || !form.nombre || !form.servicio || !form.dia || !form.hora}>{loading ? "Confirmando con IA..." : "✓ Confirmar cita"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
