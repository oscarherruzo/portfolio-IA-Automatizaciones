"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

type Svc = { id:string; name:string; duration_minutes:number; price?:number; description?:string };
type Sch = {
  business_name?:string; business_address?:string; business_phone?:string;
  business_description?:string; business_color?:string; slug:string;
  logo_url?:string; instagram?:string; google_maps_url?:string;
  working_days?:number[]; working_hours?:Record<string,{open:string;close:string}>;
  start_time?:string; end_time?:string;
};
type Step = "servicio"|"fecha"|"hora"|"datos"|"ok";

const MES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIA_SHORT = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];

export default function BookPage() {
  const { slug } = useParams() as { slug: string };
  const [sch,setSch]   = useState<Sch|null>(null);
  const [svcs,setSvcs] = useState<Svc[]>([]);
  const [step,setStep] = useState<Step>("servicio");
  const [svc,setSvc]   = useState<Svc|null>(null);
  const [date,setDate] = useState("");
  const [time,setTime] = useState("");
  const [slots,setSlots] = useState<string[]>([]);
  const [loadSlots,setLS] = useState(false);
  const [cal,setCal]   = useState(new Date());
  const [form,setForm] = useState({name:"",email:"",phone:"",notes:""});
  const [sending,setSend] = useState(false);
  const [err,setErr]   = useState("");
  const [notFound,setNF] = useState(false);

  const accent = sch?.business_color || "#1d4ed8";

  useEffect(() => {
    fetch("/api/book?slug=" + slug).then(r => r.json()).then(d => {
      if (d.error) { setNF(true); return; }
      setSch(d.schedule);
      setSvcs(d.services || []);
    });
  }, [slug]);

  async function pickDate(d: string) {
    setDate(d); setTime(""); setLS(true);
    const res = await fetch("/api/book?slug=" + slug + "&date=" + d + "&service_id=" + svc!.id);
    const data = await res.json();
    setSlots(data.slots || []);
    setLS(false);
    setStep("hora");
  }

  async function confirm() {
    if (!form.name.trim()) { setErr("El nombre es obligatorio"); return; }
    if (!form.phone.trim()) { setErr("El teléfono es obligatorio"); return; }
    setSend(true); setErr("");
    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug, service_id: svc!.id, service_name: svc!.name,
        duration_minutes: svc!.duration_minutes,
        client_name: form.name, client_email: form.email || null,
        client_phone: form.phone, date, time, notes: form.notes || null,
      }),
    });
    const data = await res.json();
    if (data.error) { setErr(data.error); setSend(false); return; }
    setStep("ok"); setSend(false);
  }

  function calDays() {
    const y = cal.getFullYear(), m = cal.getMonth();
    const fd = new Date(y, m, 1).getDay();
    const tot = new Date(y, m + 1, 0).getDate();
    const days: (number | null)[] = Array(fd).fill(null);
    for (let i = 1; i <= tot; i++) days.push(i);
    return days;
  }

  function isDayOpen(dow: number) {
    return (sch?.working_days || [1,2,3,4,5,6]).includes(dow);
  }

  function getDayHours(dow: number) {
    const wh = sch?.working_hours;
    if (wh && wh[String(dow)]) return wh[String(dow)];
    return { open: sch?.start_time || "09:00", close: sch?.end_time || "19:00" };
  }

  const today = new Date(); today.setHours(0,0,0,0);
  const stepN = { servicio:1, fecha:2, hora:3, datos:4, ok:5 }[step];

  function fmtDate(d: string) {
    return new Date(d + "T12:00:00").toLocaleDateString("es-ES", { weekday:"long", day:"numeric", month:"long" });
  }

  function buildSchedule() {
    return [
      {d:"Lunes",i:1},{d:"Martes",i:2},{d:"Miércoles",i:3},
      {d:"Jueves",i:4},{d:"Viernes",i:5},{d:"Sábado",i:6},{d:"Domingo",i:0}
    ].map(({d,i}) => ({ label:d, open:isDayOpen(i), hours:getDayHours(i) }));
  }

  if (notFound) return (
    <div style={{minHeight:"100vh",background:"#f9f9f9",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}}>
      <div style={{textAlign:"center",color:"#666"}}>
        <div style={{fontSize:"1.1rem",fontWeight:700,color:"#111",marginBottom:"6px"}}>Página no encontrada</div>
        <div style={{fontSize:"0.85rem"}}>Comprueba la URL e inténtalo de nuevo</div>
      </div>
    </div>
  );

  if (!sch) return (
    <div style={{minHeight:"100vh",background:"#f9f9f9",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:"28px",height:"28px",border:"2.5px solid #1d4ed8",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#f5f4f0",fontFamily:"'Georgia','Times New Roman',serif",color:"#111"}}>

      {/* HEADER */}
      <div style={{background:"#fff",borderBottom:"1px solid #e8e6e0"}}>
        <div style={{maxWidth:"1000px",margin:"0 auto",padding:"28px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"20px",flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:"18px"}}>
            {sch.logo_url ? (
              <img src={sch.logo_url} alt={sch.business_name} style={{width:"68px",height:"68px",borderRadius:"12px",objectFit:"cover",border:"1px solid #e8e6e0"}}/>
            ) : (
              <div style={{width:"68px",height:"68px",borderRadius:"12px",background:accent,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:900,fontSize:"1.7rem",fontFamily:"sans-serif",flexShrink:0}}>
                {(sch.business_name || "B")[0].toUpperCase()}
              </div>
            )}
            <div>
              <h1 style={{fontSize:"1.5rem",fontWeight:700,margin:"0 0 4px",letterSpacing:"-0.01em"}}>{sch.business_name || "Reservar cita"}</h1>
              <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}>
                {sch.business_address && <span style={{fontSize:"0.8rem",color:"#888",fontFamily:"sans-serif"}}>📍 {sch.business_address}</span>}
                {sch.business_phone   && <span style={{fontSize:"0.8rem",color:"#888",fontFamily:"sans-serif"}}>📞 {sch.business_phone}</span>}
                {sch.instagram        && <a href={"https://instagram.com/" + sch.instagram} target="_blank" style={{fontSize:"0.8rem",color:accent,textDecoration:"none",fontFamily:"sans-serif"}}>@{sch.instagram}</a>}
              </div>
            </div>
          </div>
          <a href="#reservar" style={{background:accent,color:"white",padding:"12px 26px",borderRadius:"8px",textDecoration:"none",fontWeight:700,fontSize:"0.93rem",fontFamily:"sans-serif",whiteSpace:"nowrap"}}>
            Reservar cita
          </a>
        </div>
      </div>

      {/* INFO + MAPA */}
      {(sch.business_description || sch.google_maps_url || sch.business_address) && (
        <div style={{background:"#fff",borderBottom:"1px solid #e8e6e0"}}>
          <div style={{maxWidth:"1000px",margin:"0 auto",padding:"40px 24px",display:"grid",gridTemplateColumns:(sch.google_maps_url || sch.business_address) ? "1fr 1fr" : "1fr",gap:"40px",alignItems:"start"}}>

            <div>
              {sch.business_description && (
                <div style={{marginBottom:"28px"}}>
                  <h2 style={{fontSize:"1.1rem",fontWeight:700,marginBottom:"12px"}}>Sobre nosotros</h2>
                  <p style={{fontSize:"0.9rem",color:"#555",lineHeight:1.8,margin:0,fontFamily:"sans-serif"}}>{sch.business_description}</p>
                </div>
              )}
              <h2 style={{fontSize:"1.1rem",fontWeight:700,marginBottom:"14px"}}>Horario</h2>
              <div style={{display:"flex",flexDirection:"column",gap:"0"}}>
                {buildSchedule().map(r => (
                  <div key={r.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f5f4f0"}}>
                    <span style={{fontSize:"0.85rem",fontFamily:"sans-serif",color:"#333",fontWeight:500}}>{r.label}</span>
                    {r.open ? (
                      <span style={{fontSize:"0.85rem",fontFamily:"sans-serif",color:"#555"}}>{r.hours.open} – {r.hours.close}</span>
                    ) : (
                      <span style={{fontSize:"0.82rem",fontFamily:"sans-serif",color:"#bbb",fontStyle:"italic"}}>Cerrado</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {(sch.google_maps_url || sch.business_address) && (
              <div>
                <h2 style={{fontSize:"1.1rem",fontWeight:700,marginBottom:"14px"}}>Cómo llegar</h2>
                <div style={{borderRadius:"12px",overflow:"hidden",border:"1px solid #e8e6e0",marginBottom:"12px"}}>
                  <iframe
                    src={sch.google_maps_url
                      ? "https://maps.google.com/maps?q=" + encodeURIComponent(sch.business_address || "") + "&output=embed"
                      : "https://maps.google.com/maps?q=" + encodeURIComponent(sch.business_address || "") + "&output=embed"
                    }
                    width="100%" height="240"
                    style={{border:0,display:"block"}}
                    allowFullScreen loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                {sch.business_address && (
                  <div style={{display:"flex",alignItems:"flex-start",gap:"8px"}}>
                    <span style={{fontSize:"0.85rem",color:"#888",fontFamily:"sans-serif"}}>📍</span>
                    <div>
                      <div style={{fontSize:"0.85rem",color:"#333",fontFamily:"sans-serif",lineHeight:1.5}}>{sch.business_address}</div>
                      {sch.google_maps_url && (
                        <a href={sch.google_maps_url} target="_blank" style={{fontSize:"0.78rem",color:accent,textDecoration:"none",fontFamily:"sans-serif"}}>Ver en Google Maps →</a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESERVAR */}
      <div id="reservar" style={{maxWidth:"560px",margin:"0 auto",padding:"48px 24px 80px"}}>
        <h2 style={{fontSize:"1.4rem",fontWeight:700,textAlign:"center",marginBottom:"6px"}}>Reservar cita</h2>
        <p style={{textAlign:"center",color:"#888",fontSize:"0.88rem",marginBottom:"36px",fontFamily:"sans-serif"}}>Elige el servicio, la fecha y la hora que mejor te venga</p>

        {/* STEPS */}
        {step !== "ok" && (
          <div style={{display:"flex",alignItems:"center",marginBottom:"32px"}}>
            {["Servicio","Fecha","Hora","Datos"].map((s,i) => {
              const n = i+1, done = stepN > n, active = stepN === n;
              return (
                <div key={s} style={{display:"flex",alignItems:"center",flex:1}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:"0 0 auto"}}>
                    <div style={{width:"30px",height:"30px",borderRadius:"50%",background:done||active?accent:"#e5e3dc",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",fontWeight:700,color:done||active?"white":"#999",fontFamily:"sans-serif"}}>
                      {done ? "✓" : n}
                    </div>
                    <span style={{fontSize:"0.62rem",color:active?accent:done?"#666":"#bbb",marginTop:"4px",fontWeight:active?700:400,fontFamily:"sans-serif"}}>{s}</span>
                  </div>
                  {i < 3 && <div style={{flex:1,height:"1px",background:done?accent:"#e5e3dc",margin:"0 4px 14px"}}/>}
                </div>
              );
            })}
          </div>
        )}

        {/* PASO 1: SERVICIO */}
        {step === "servicio" && (
          <div>
            <h3 style={{fontSize:"1rem",fontWeight:600,marginBottom:"16px",fontFamily:"sans-serif",color:"#333"}}>Qué servicio necesitas</h3>
            {svcs.length === 0 ? (
              <div style={{background:"#fff",borderRadius:"12px",border:"1px solid #e8e6e0",padding:"32px",textAlign:"center",color:"#888",fontFamily:"sans-serif"}}>No hay servicios disponibles</div>
            ) : svcs.map(s => (
              <button key={s.id} onClick={() => { setSvc(s); setStep("fecha"); }}
                style={{width:"100%",textAlign:"left",background:"#fff",border:"1px solid #e8e6e0",borderRadius:"12px",padding:"18px 20px",marginBottom:"10px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",outline:"none"}}
                onMouseEnter={e => { e.currentTarget.style.borderColor = accent; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e6e0"; }}
              >
                <div>
                  <div style={{fontWeight:700,color:"#111",fontSize:"0.95rem",marginBottom:"4px",fontFamily:"sans-serif"}}>{s.name}</div>
                  {s.description && <div style={{fontSize:"0.78rem",color:"#888",marginBottom:"6px",fontFamily:"sans-serif"}}>{s.description}</div>}
                  <span style={{fontSize:"0.72rem",color:"#666",background:"#f5f4f0",padding:"3px 10px",borderRadius:"100px",fontFamily:"sans-serif"}}>{s.duration_minutes} min</span>
                </div>
                {s.price && <div style={{fontSize:"1.3rem",fontWeight:800,color:accent,flexShrink:0,marginLeft:"16px",fontFamily:"sans-serif"}}>{s.price}€</div>}
              </button>
            ))}
          </div>
        )}

        {/* PASO 2: FECHA */}
        {step === "fecha" && (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"20px"}}>
              <button onClick={() => setStep("servicio")} style={{background:"#fff",border:"1px solid #e8e6e0",color:"#666",padding:"7px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"0.82rem",fontFamily:"sans-serif"}}>← Atrás</button>
              <h3 style={{fontSize:"1rem",fontWeight:600,margin:0,fontFamily:"sans-serif",color:"#333"}}>Elige la fecha</h3>
            </div>
            <div style={{background:"#fff",borderRadius:"14px",border:"1px solid #e8e6e0",padding:"24px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
                <button onClick={() => setCal(c => new Date(c.getFullYear(), c.getMonth()-1, 1))} style={{background:"#f5f4f0",border:"none",color:"#666",width:"34px",height:"34px",borderRadius:"8px",cursor:"pointer",fontSize:"1.1rem",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
                <span style={{fontWeight:700,fontSize:"1rem",color:"#111",fontFamily:"sans-serif"}}>{MES[cal.getMonth()]} {cal.getFullYear()}</span>
                <button onClick={() => setCal(c => new Date(c.getFullYear(), c.getMonth()+1, 1))} style={{background:"#f5f4f0",border:"none",color:"#666",width:"34px",height:"34px",borderRadius:"8px",cursor:"pointer",fontSize:"1.1rem",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"4px",marginBottom:"8px"}}>
                {DIA_SHORT.map(d => <div key={d} style={{textAlign:"center",fontSize:"0.7rem",color:"#aaa",fontWeight:600,padding:"4px 0",fontFamily:"sans-serif"}}>{d}</div>)}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"4px"}}>
                {calDays().map((day,i) => {
                  if (!day) return <div key={i}/>;
                  const d = new Date(cal.getFullYear(), cal.getMonth(), day);
                  const ds = d.toISOString().split("T")[0];
                  const past = d < today;
                  const closed = !isDayOpen(d.getDay());
                  const sel = ds === date;
                  const isTod = d.toDateString() === today.toDateString();
                  const disabled = past || closed;
                  return (
                    <button key={i} onClick={() => !disabled && pickDate(ds)} disabled={disabled}
                      style={{padding:"9px 4px",borderRadius:"9px",border:sel ? "2px solid " + accent : "2px solid transparent",background:sel ? accent : isTod ? "#f0f0ff" : "transparent",color:disabled?"#d0cec8":sel?"white":"#111",cursor:disabled?"not-allowed":"pointer",fontWeight:isTod||sel?700:400,fontSize:"0.88rem",textAlign:"center",outline:"none",fontFamily:"sans-serif"}}
                      onMouseEnter={e => { if (!disabled && !sel) e.currentTarget.style.background = "#f5f4f0"; }}
                      onMouseLeave={e => { if (!sel) e.currentTarget.style.background = isTod ? "#f0f0ff" : "transparent"; }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: HORA */}
        {step === "hora" && (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
              <button onClick={() => setStep("fecha")} style={{background:"#fff",border:"1px solid #e8e6e0",color:"#666",padding:"7px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"0.82rem",fontFamily:"sans-serif"}}>← Atrás</button>
              <h3 style={{fontSize:"1rem",fontWeight:600,margin:0,fontFamily:"sans-serif",color:"#333"}}>Elige la hora</h3>
            </div>
            <p style={{color:"#888",fontSize:"0.83rem",marginBottom:"20px",fontFamily:"sans-serif"}}>{fmtDate(date)} · {svc?.name}</p>
            {loadSlots ? (
              <div style={{textAlign:"center",padding:"40px",color:"#aaa",fontFamily:"sans-serif"}}>
                <div style={{width:"24px",height:"24px",border:"2px solid #1d4ed8",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 10px"}}/>
                Comprobando disponibilidad...
              </div>
            ) : slots.length === 0 ? (
              <div style={{background:"#fff",borderRadius:"14px",border:"1px solid #e8e6e0",padding:"36px",textAlign:"center"}}>
                <div style={{fontWeight:700,color:"#111",marginBottom:"6px",fontFamily:"sans-serif"}}>Sin disponibilidad este día</div>
                <div style={{fontSize:"0.82rem",color:"#888",marginBottom:"16px",fontFamily:"sans-serif"}}>Prueba con otra fecha</div>
                <button onClick={() => setStep("fecha")} style={{background:accent,border:"none",color:"white",padding:"10px 24px",borderRadius:"9px",cursor:"pointer",fontWeight:600,fontFamily:"sans-serif"}}>Cambiar fecha</button>
              </div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px"}}>
                {slots.map(s => (
                  <button key={s} onClick={() => { setTime(s); setStep("datos"); }}
                    style={{padding:"14px 8px",borderRadius:"10px",border:"1px solid #e8e6e0",background:"#fff",color:"#111",cursor:"pointer",fontWeight:700,fontSize:"0.92rem",textAlign:"center",outline:"none",fontFamily:"sans-serif"}}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e6e0"; e.currentTarget.style.color = "#111"; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PASO 4: DATOS */}
        {step === "datos" && (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
              <button onClick={() => setStep("hora")} style={{background:"#fff",border:"1px solid #e8e6e0",color:"#666",padding:"7px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"0.82rem",fontFamily:"sans-serif"}}>← Atrás</button>
              <h3 style={{fontSize:"1rem",fontWeight:600,margin:0,fontFamily:"sans-serif",color:"#333"}}>Tus datos</h3>
            </div>

            <div style={{background:"#fff",borderLeft:"4px solid " + accent,borderRadius:"0 10px 10px 0",border:"1px solid #e8e6e0",padding:"14px 16px",marginBottom:"24px"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                {[
                  {k:"Servicio", v:svc?.name},
                  {k:"Precio",   v:svc?.price ? svc.price + "€" : "Sin cargo"},
                  {k:"Fecha",    v:new Date(date+"T12:00:00").toLocaleDateString("es-ES",{weekday:"short",day:"numeric",month:"short"})},
                  {k:"Hora",     v:time},
                ].map(r => (
                  <div key={r.k}>
                    <div style={{fontSize:"0.65rem",color:"#aaa",fontWeight:700,textTransform:"uppercase",marginBottom:"2px",fontFamily:"sans-serif"}}>{r.k}</div>
                    <div style={{fontWeight:700,fontSize:"0.88rem",color:"#111",fontFamily:"sans-serif"}}>{r.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
              {[
                {k:"name",  l:"Nombre completo *", p:"Tu nombre y apellidos", t:"text"},
                {k:"phone", l:"Teléfono *",        p:"+34 600 000 000",       t:"tel"},
                {k:"email", l:"Email",             p:"tu@email.com",          t:"email"},
              ].map(f => (
                <div key={f.k}>
                  <label style={{fontSize:"0.75rem",fontWeight:700,color:"#444",display:"block",marginBottom:"6px",fontFamily:"sans-serif"}}>{f.l}</label>
                  <input type={f.t} value={(form as any)[f.k]} onChange={e => setForm(p => ({...p,[f.k]:e.target.value}))} placeholder={f.p}
                    style={{width:"100%",background:"#fff",border:"1px solid #ddd",borderRadius:"10px",padding:"13px 15px",color:"#111",fontSize:"0.93rem",outline:"none",boxSizing:"border-box",fontFamily:"sans-serif"}}
                    onFocus={e => e.target.style.borderColor = accent}
                    onBlur={e => e.target.style.borderColor = "#ddd"}
                  />
                </div>
              ))}
              <div>
                <label style={{fontSize:"0.75rem",fontWeight:700,color:"#444",display:"block",marginBottom:"6px",fontFamily:"sans-serif"}}>Notas (opcional)</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({...p,notes:e.target.value}))} placeholder="Indicaciones especiales..." rows={3}
                  style={{width:"100%",background:"#fff",border:"1px solid #ddd",borderRadius:"10px",padding:"13px 15px",color:"#111",fontSize:"0.93rem",outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"sans-serif"}}
                  onFocus={e => e.target.style.borderColor = accent}
                  onBlur={e => e.target.style.borderColor = "#ddd"}
                />
              </div>
              {err && <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"8px",padding:"10px 14px",color:"#dc2626",fontSize:"0.83rem",fontFamily:"sans-serif"}}>{err}</div>}
              <button onClick={confirm} disabled={sending || !form.name.trim() || !form.phone.trim()}
                style={{width:"100%",padding:"16px",background:accent,border:"none",borderRadius:"12px",color:"white",fontWeight:700,fontSize:"1rem",cursor:sending||!form.name.trim()||!form.phone.trim()?"not-allowed":"pointer",opacity:sending||!form.name.trim()||!form.phone.trim()?0.5:1,fontFamily:"sans-serif",marginTop:"4px"}}>
                {sending ? "Reservando..." : "Confirmar reserva"}
              </button>
            </div>
          </div>
        )}

        {/* CONFIRMADO */}
        {step === "ok" && (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{width:"80px",height:"80px",borderRadius:"50%",background:accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.2rem",color:"white",margin:"0 auto 20px"}}>
              ✓
            </div>
            <h2 style={{fontSize:"1.5rem",fontWeight:700,marginBottom:"10px"}}>Reserva confirmada</h2>
            <p style={{color:"#666",lineHeight:1.7,marginBottom:"28px",fontFamily:"sans-serif"}}>
              Te esperamos el <strong style={{color:"#111"}}>{fmtDate(date)}</strong> a las <strong style={{color:"#111"}}>{time}</strong>.
              {form.phone && (
                <span><br/><span style={{fontSize:"0.85rem"}}>Te contactaremos en el {form.phone} si hay algún cambio.</span></span>
              )}
            </p>
            <div style={{background:"#fff",border:"1px solid #e8e6e0",borderRadius:"14px",padding:"20px",marginBottom:"24px",textAlign:"left"}}>
              {[
                {l:"Servicio",  v:svc?.name},
                {l:"Duración",  v:(svc?.duration_minutes || 0) + " min"},
                {l:"Fecha",     v:fmtDate(date)},
                {l:"Hora",      v:time},
                {l:"Nombre",    v:form.name},
                {l:"Teléfono",  v:form.phone},
              ].map((r,i,arr) => (
                <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i < arr.length-1 ? "1px solid #f5f4f0" : "none"}}>
                  <span style={{color:"#888",fontSize:"0.85rem",fontFamily:"sans-serif"}}>{r.l}</span>
                  <span style={{fontWeight:600,fontSize:"0.85rem",color:"#111",fontFamily:"sans-serif"}}>{r.v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { setStep("servicio"); setSvc(null); setDate(""); setTime(""); setForm({name:"",email:"",phone:"",notes:""}); }}
              style={{background:"transparent",border:"1px solid " + accent,color:accent,padding:"12px 28px",borderRadius:"10px",cursor:"pointer",fontWeight:600,fontSize:"0.9rem",fontFamily:"sans-serif"}}>
              Reservar otra cita
            </button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{background:"#fff",borderTop:"1px solid #e8e6e0",padding:"20px 24px",textAlign:"center"}}>
        <div style={{fontSize:"0.78rem",color:"#aaa",fontFamily:"sans-serif"}}>
          {sch.business_name}{sch.business_address && " · " + sch.business_address}{sch.business_phone && " · " + sch.business_phone}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box} body{margin:0} input::placeholder,textarea::placeholder{color:#bbb;font-family:sans-serif}`}</style>
    </div>
  );
}
