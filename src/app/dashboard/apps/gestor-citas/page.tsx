"use client";
import { useState, useEffect, useCallback } from "react";

type Svc  = { id:string; name:string; duration_minutes:number; price?:number; description?:string };
type App  = { id:string; service_name:string; client_name:string; client_email?:string; client_phone?:string; date:string; time:string; status:string; notes?:string };
type Sch  = { slug?:string; business_name?:string; business_address?:string; business_phone?:string; business_description?:string; business_color?:string; working_days?:number[]; start_time?:string; end_time?:string; slot_duration?:number; break_start?:string; break_end?:string };
type Tab  = "agenda"|"servicios"|"configurar";

const ST: Record<string,{label:string;color:string;bg:string}> = {
  confirmed:{ label:"Confirmada", color:"#3b82f6", bg:"rgba(59,130,246,.1)" },
  completed:{ label:"Completada", color:"#22c55e", bg:"rgba(34,197,94,.1)"  },
  cancelled:{ label:"Cancelada",  color:"#ef4444", bg:"rgba(239,68,68,.1)"  },
  waitlist: { label:"En espera",  color:"#f59e0b", bg:"rgba(245,158,11,.1)" },
};

const WEEK = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

export default function GestorCitas() {
  const [tab,setTab]     = useState<Tab>("agenda");
  const [apps,setApps]   = useState<App[]>([]);
  const [svcs,setSvcs]   = useState<Svc[]>([]);
  const [sch,setSch]     = useState<Sch>({ start_time:"09:00",end_time:"19:00",slot_duration:30,working_days:[1,2,3,4,5],business_color:"#6366f1" });
  const [loading,setLoad]= useState(true);
  const [selDate,setSel]  = useState(new Date().toISOString().split("T")[0]);
  const [weekOff,setWOff]= useState(0);
  const [showA,setShowA] = useState(false);
  const [showS,setShowS] = useState(false);
  const [saving,setSave] = useState(false);
  const [toast,setToast] = useState("");

  const [af,setAf] = useState({ service_name:"",client_name:"",client_email:"",client_phone:"",date:"",time:"",notes:"",status:"confirmed" });
  const [sf,setSf] = useState({ name:"",duration_minutes:60,price:"",description:"" });

  function msg(t:string){ setToast(t); setTimeout(()=>setToast(""),3000); }

  const load = useCallback(async()=>{
    setLoad(true);
    const [ar,sr,scr] = await Promise.all([
      fetch("/api/appointments"),
      fetch("/api/appointments/services"),
      fetch("/api/appointments/schedule"),
    ]);
    const [a,s,sc] = await Promise.all([ar.json(),sr.json(),scr.json()]);
    setApps(Array.isArray(a)?a:[]);
    setSvcs(Array.isArray(s)?s:[]);
    if(sc) setSch(sc);
    setLoad(false);
  },[]);

  useEffect(()=>{ load(); },[load]);

  // Semana
  const week = Array.from({length:7},(_,i)=>{
    const d=new Date();
    const mon=new Date(d);
    mon.setDate(d.getDate()-(d.getDay()===0?6:d.getDay()-1)+weekOff*7+i);
    return mon.toISOString().split("T")[0];
  });

  function getHours(){
    const [sh,sm]=(sch.start_time||"09:00").split(":").map(Number);
    const [eh,em]=(sch.end_time||"19:00").split(":").map(Number);
    const h:string[]=[];
    for(let m=sh*60+sm;m<eh*60+em;m+=60)
      h.push(`${String(Math.floor(m/60)).padStart(2,"0")}:00`);
    return h;
  }

  const hours = getHours();
  const dayApps = apps.filter(a=>a.date===selDate).sort((a,b)=>a.time.localeCompare(b.time));

  // Stats
  const today = new Date().toISOString().split("T")[0];
  const todayCount = apps.filter(a=>a.date===today&&a.status==="confirmed").length;
  const weekCount  = apps.filter(a=>week.includes(a.date)&&a.status!=="cancelled").length;
  const pending    = apps.filter(a=>a.status==="waitlist").length;

  async function saveApp(){
    if(!af.client_name||!af.service_name||!af.date||!af.time) return;
    setSave(true);
    const res=await fetch("/api/appointments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(af)});
    if(res.ok){ await load(); setShowA(false); setAf({service_name:"",client_name:"",client_email:"",client_phone:"",date:"",time:"",notes:"",status:"confirmed"}); msg("✓ Cita guardada"); }
    setSave(false);
  }

  async function saveSvc(){
    if(!sf.name) return;
    setSave(true);
    const res=await fetch("/api/appointments/services",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...sf,price:sf.price?parseFloat(sf.price):null})});
    if(res.ok){ await load(); setShowS(false); setSf({name:"",duration_minutes:60,price:"",description:""}); msg("✓ Servicio añadido"); }
    setSave(false);
  }

  async function delSvc(id:string){
    await fetch("/api/appointments/services",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    await load(); msg("Servicio eliminado");
  }

  async function updateStatus(id:string,status:string){
    await fetch("/api/appointments",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});
    setApps(p=>p.map(a=>a.id===id?{...a,status}:a));
  }

  async function delApp(id:string){
    await fetch("/api/appointments",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    setApps(p=>p.filter(a=>a.id!==id)); msg("Cita eliminada");
  }

  async function saveSch(){
    setSave(true);
    await fetch("/api/appointments/schedule",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(sch)});
    msg("✓ Configuración guardada"); setSave(false);
  }

  const inp = {background:"var(--bg-2)",border:"1px solid var(--border)",borderRadius:"8px",padding:"9px 12px",color:"var(--text-1)",fontSize:"0.85rem",outline:"none",width:"100%",boxSizing:"border-box" as const};

  if(loading) return <div style={{padding:"40px",color:"var(--text-3)"}}>Cargando...</div>;

  return (
    <div style={{padding:"24px 32px",maxWidth:"1280px"}}>
      {toast&&<div style={{position:"fixed",top:"24px",right:"24px",zIndex:9999,background:"var(--accent)",color:"white",padding:"10px 20px",borderRadius:"10px",fontWeight:600,fontSize:"0.85rem",boxShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>{toast}</div>}

      {/* MODAL NUEVA CITA */}
      {showA&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"16px",padding:"28px",width:"480px",maxWidth:"95vw"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"20px"}}>
              <h2 style={{fontWeight:700,fontSize:"1rem"}}>Nueva cita</h2>
              <button onClick={()=>setShowA(false)} style={{background:"none",border:"none",color:"var(--text-3)",cursor:"pointer",fontSize:"1.2rem"}}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              <div><label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>Cliente *</label>
                <input value={af.client_name} onChange={e=>setAf(f=>({...f,client_name:e.target.value}))} placeholder="Nombre" style={inp}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                <div><label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>Email</label>
                  <input value={af.client_email} onChange={e=>setAf(f=>({...f,client_email:e.target.value}))} placeholder="email@..." style={inp}/></div>
                <div><label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>Teléfono</label>
                  <input value={af.client_phone} onChange={e=>setAf(f=>({...f,client_phone:e.target.value}))} placeholder="+34..." style={inp}/></div>
              </div>
              <div><label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>Servicio *</label>
                <select value={af.service_name} onChange={e=>setAf(f=>({...f,service_name:e.target.value}))} style={inp}>
                  <option value="">Selecciona</option>
                  {svcs.map(s=><option key={s.id} value={s.name}>{s.name} · {s.duration_minutes}min{s.price?` · ${s.price}€`:""}</option>)}
                </select></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                <div><label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>Fecha *</label>
                  <input type="date" value={af.date} onChange={e=>setAf(f=>({...f,date:e.target.value}))} style={inp}/></div>
                <div><label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>Hora *</label>
                  <select value={af.time} onChange={e=>setAf(f=>({...f,time:e.target.value}))} style={inp}>
                    <option value="">Selecciona</option>
                    {Array.from({length:((()=>{const[eh,em]=(sch.end_time||"19:00").split(":").map(Number);const[sh,sm]=(sch.start_time||"09:00").split(":").map(Number);return Math.ceil((eh*60+em-sh*60-sm)/(sch.slot_duration||30));})())},(_,i)=>{
                      const[sh,sm]=(sch.start_time||"09:00").split(":").map(Number);
                      const m=sh*60+sm+i*(sch.slot_duration||30);
                      return `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;
                    }).map(t=><option key={t} value={t}>{t}</option>)}
                  </select></div>
              </div>
              <div><label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>Estado</label>
                <select value={af.status} onChange={e=>setAf(f=>({...f,status:e.target.value}))} style={inp}>
                  <option value="confirmed">Confirmada</option>
                  <option value="waitlist">Lista de espera</option>
                </select></div>
              <textarea value={af.notes} onChange={e=>setAf(f=>({...f,notes:e.target.value}))} placeholder="Notas opcionales..." rows={2} style={{...inp,resize:"none"}}/>
            </div>
            <div style={{display:"flex",gap:"10px",marginTop:"18px"}}>
              <button onClick={()=>setShowA(false)} style={{flex:1,background:"var(--bg-2)",border:"1px solid var(--border)",color:"var(--text-2)",padding:"9px",borderRadius:"8px",cursor:"pointer"}}>Cancelar</button>
              <button onClick={saveApp} disabled={saving||!af.client_name||!af.service_name||!af.date||!af.time} style={{flex:2,background:"var(--accent)",border:"none",color:"white",padding:"9px",borderRadius:"8px",cursor:"pointer",fontWeight:700,opacity:!af.client_name||!af.service_name||!af.date||!af.time?0.5:1}}>
                {saving?"Guardando...":"✓ Guardar cita"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO SERVICIO */}
      {showS&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"16px",padding:"28px",width:"420px",maxWidth:"95vw"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"18px"}}>
              <h2 style={{fontWeight:700,fontSize:"1rem"}}>Nuevo servicio</h2>
              <button onClick={()=>setShowS(false)} style={{background:"none",border:"none",color:"var(--text-3)",cursor:"pointer",fontSize:"1.2rem"}}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              <div><label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>Nombre *</label>
                <input value={sf.name} onChange={e=>setSf(f=>({...f,name:e.target.value}))} placeholder="Ej: Corte de pelo" style={inp}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                <div><label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>Duración (min)</label>
                  <input type="number" value={sf.duration_minutes} onChange={e=>setSf(f=>({...f,duration_minutes:parseInt(e.target.value)||60}))} style={inp}/></div>
                <div><label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>Precio (€)</label>
                  <input type="number" value={sf.price} onChange={e=>setSf(f=>({...f,price:e.target.value}))} placeholder="0.00" style={inp}/></div>
              </div>
              <div><label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>Descripción</label>
                <input value={sf.description} onChange={e=>setSf(f=>({...f,description:e.target.value}))} placeholder="Descripción opcional" style={inp}/></div>
            </div>
            <div style={{display:"flex",gap:"10px",marginTop:"18px"}}>
              <button onClick={()=>setShowS(false)} style={{flex:1,background:"var(--bg-2)",border:"1px solid var(--border)",color:"var(--text-2)",padding:"9px",borderRadius:"8px",cursor:"pointer"}}>Cancelar</button>
              <button onClick={saveSvc} disabled={saving||!sf.name} style={{flex:2,background:"var(--accent)",border:"none",color:"white",padding:"9px",borderRadius:"8px",cursor:"pointer",fontWeight:700,opacity:!sf.name?0.5:1}}>
                {saving?"Guardando...":"✓ Añadir servicio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"20px"}}>
        <div>
          <h1 style={{fontSize:"1.4rem",fontWeight:700,marginBottom:"4px"}}>📅 Gestor de Citas</h1>
          <p style={{color:"var(--text-3)",fontSize:"0.875rem"}}>{todayCount} hoy · {weekCount} esta semana · {pending} en espera</p>
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          {sch.slug&&(
            <a href={`/book/${sch.slug}`} target="_blank" style={{background:"var(--bg-2)",border:"1px solid var(--border)",color:"var(--text-2)",padding:"8px 14px",borderRadius:"8px",textDecoration:"none",fontSize:"0.82rem",fontWeight:600}}>
              🔗 Ver web pública
            </a>
          )}
          <button onClick={()=>{setAf(f=>({...f,date:selDate}));setShowA(true);}} style={{background:"var(--accent)",border:"none",color:"white",padding:"8px 18px",borderRadius:"8px",cursor:"pointer",fontWeight:700,fontSize:"0.85rem"}}>
            + Nueva cita
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",gap:"4px",marginBottom:"20px",background:"var(--bg-2)",padding:"4px",borderRadius:"10px",width:"fit-content"}}>
        {(["agenda","servicios","configurar"] as Tab[]).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 18px",borderRadius:"7px",border:"none",cursor:"pointer",background:tab===t?"var(--surface)":"transparent",color:tab===t?"var(--text-1)":"var(--text-3)",fontWeight:tab===t?600:400,fontSize:"0.85rem",boxShadow:tab===t?"0 1px 4px rgba(0,0,0,0.3)":"none"}}>
            {t==="agenda"?"📅 Agenda":t==="servicios"?"✂️ Servicios":"⚙️ Configurar"}
          </button>
        ))}
      </div>

      {/* AGENDA */}
      {tab==="agenda"&&(
        <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:"16px"}}>
          {/* Mini calendario - semana */}
          <div>
            <div style={{background:"var(--surface)",borderRadius:"12px",border:"1px solid var(--border)",padding:"16px",marginBottom:"12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
                <button onClick={()=>setWOff(o=>o-1)} style={{background:"none",border:"none",color:"var(--text-3)",cursor:"pointer",fontSize:"1rem",padding:"2px 6px"}}>‹</button>
                <span style={{fontSize:"0.78rem",fontWeight:600,color:"var(--text-2)"}}>Semana {weekOff===0?"actual":weekOff>0?`+${weekOff}`:`${weekOff}`}</span>
                <button onClick={()=>setWOff(o=>o+1)} style={{background:"none",border:"none",color:"var(--text-3)",cursor:"pointer",fontSize:"1rem",padding:"2px 6px"}}>›</button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"3px"}}>
                {week.map((d,i)=>{
                  const count=apps.filter(a=>a.date===d&&a.status!=="cancelled").length;
                  const isSel=d===selDate;
                  const isTod=d===today;
                  const dt=new Date(d+"T12:00:00");
                  return(
                    <button key={d} onClick={()=>setSel(d)} style={{padding:"8px 10px",borderRadius:"8px",border:`1px solid ${isSel?"var(--accent)":"var(--border)"}`,background:isSel?"var(--accent-dim)":"transparent",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all 0.15s"}}>
                      <div>
                        <span style={{fontSize:"0.68rem",fontWeight:700,color:isSel?"var(--accent)":"var(--text-3)",marginRight:"6px"}}>{WEEK[i]}</span>
                        <span style={{fontSize:"0.85rem",fontWeight:isTod?700:400,color:isSel?"var(--accent)":"var(--text-1)"}}>{dt.getDate()}</span>
                      </div>
                      {count>0&&<span style={{background:isSel?"var(--accent)":"var(--bg-3)",color:isSel?"white":"var(--text-2)",borderRadius:"100px",padding:"1px 7px",fontSize:"0.68rem",fontWeight:700}}>{count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {[
                {label:"Hoy",val:todayCount,color:"var(--accent)"},
                {label:"Esta semana",val:weekCount,color:"var(--green)"},
                {label:"En espera",val:pending,color:"var(--amber)"},
              ].map(s=>(
                <div key={s.label} style={{background:"var(--surface)",padding:"12px 14px",borderRadius:"10px",border:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:"0.78rem",color:"var(--text-3)"}}>{s.label}</span>
                  <span style={{fontWeight:800,fontSize:"1.1rem",color:s.color}}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vista del día */}
          <div style={{background:"var(--surface)",borderRadius:"12px",border:"1px solid var(--border)",overflow:"hidden"}}>
            <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:700,color:"var(--text-1)"}}>
                {new Date(selDate+"T12:00:00").toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long"})}
              </span>
              <span style={{fontSize:"0.78rem",color:"var(--text-3)"}}>{dayApps.length} citas</span>
            </div>

            {dayApps.length===0?(
              <div style={{padding:"48px",textAlign:"center",color:"var(--text-3)"}}>
                <div style={{fontSize:"2.5rem",marginBottom:"10px"}}>📅</div>
                <div style={{fontWeight:600,marginBottom:"8px"}}>Sin citas</div>
                <button onClick={()=>{setAf(f=>({...f,date:selDate}));setShowA(true);}} style={{background:"var(--accent)",border:"none",color:"white",padding:"8px 18px",borderRadius:"8px",cursor:"pointer",fontWeight:600,fontSize:"0.85rem"}}>+ Añadir cita</button>
              </div>
            ):(
              <div>
                {/* Vista de línea de tiempo */}
                <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:"8px"}}>
                  {dayApps.map(a=>{
                    const st=ST[a.status]||ST.confirmed;
                    return(
                      <div key={a.id} style={{display:"flex",alignItems:"stretch",gap:"14px",padding:"14px 16px",borderRadius:"10px",background:"var(--bg-2)",border:`1px solid ${st.color}30`}}>
                        <div style={{width:"48px",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                          <div style={{fontSize:"0.95rem",fontWeight:800,color:st.color}}>{a.time}</div>
                        </div>
                        <div style={{width:"3px",borderRadius:"100px",background:st.color,flexShrink:0}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"4px"}}>
                            <div style={{fontWeight:700,color:"var(--text-1)",fontSize:"0.9rem"}}>{a.client_name}</div>
                            <span style={{padding:"2px 8px",borderRadius:"100px",fontSize:"0.65rem",fontWeight:700,background:st.bg,color:st.color,flexShrink:0,marginLeft:"8px"}}>{st.label}</span>
                          </div>
                          <div style={{fontSize:"0.8rem",color:"var(--text-3)",marginBottom:"6px"}}>
                            {a.service_name}
                            {a.client_phone&&` · ${a.client_phone}`}
                          </div>
                          <div style={{display:"flex",gap:"6px"}}>
                            <select onChange={e=>updateStatus(a.id,e.target.value)} value={a.status} style={{background:"var(--bg-3)",border:"1px solid var(--border)",color:"var(--text-2)",padding:"3px 7px",borderRadius:"6px",fontSize:"0.72rem",outline:"none",cursor:"pointer"}}>
                              <option value="confirmed">Confirmada</option>
                              <option value="completed">Completada</option>
                              <option value="cancelled">Cancelada</option>
                              <option value="waitlist">En espera</option>
                            </select>
                            <button onClick={()=>delApp(a.id)} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",padding:"3px 7px",borderRadius:"6px",cursor:"pointer",fontSize:"0.72rem"}}>🗑</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Lista de horas ocupadas/libres */}
                <div style={{borderTop:"1px solid var(--border)",padding:"12px 20px"}}>
                  <div style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",marginBottom:"8px"}}>Vista de horario</div>
                  <div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>
                    {hours.map(h=>{
                      const occupied=dayApps.some(a=>a.time.startsWith(h.slice(0,2)));
                      return(
                        <div key={h} style={{padding:"4px 8px",borderRadius:"6px",fontSize:"0.72rem",fontWeight:600,background:occupied?"var(--accent-dim)":"var(--bg-3)",color:occupied?"var(--accent)":"var(--text-3)",border:`1px solid ${occupied?"var(--accent)":"var(--border)"}`}}>
                          {h}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SERVICIOS */}
      {tab==="servicios"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
            <span style={{fontSize:"0.85rem",color:"var(--text-3)"}}>{svcs.length} servicios configurados</span>
            <button onClick={()=>setShowS(true)} style={{background:"var(--accent)",border:"none",color:"white",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:600,fontSize:"0.85rem"}}>+ Añadir servicio</button>
          </div>
          {svcs.length===0?(
            <div style={{background:"var(--surface)",borderRadius:"12px",border:"1px solid var(--border)",padding:"48px",textAlign:"center",color:"var(--text-3)"}}>
              <div style={{fontSize:"2rem",marginBottom:"10px"}}>✂️</div>
              <div style={{fontWeight:600,marginBottom:"8px"}}>Sin servicios</div>
              <button onClick={()=>setShowS(true)} style={{background:"var(--accent)",border:"none",color:"white",padding:"9px 20px",borderRadius:"8px",cursor:"pointer",fontWeight:600}}>+ Añadir primer servicio</button>
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"12px"}}>
              {svcs.map(s=>(
                <div key={s.id} style={{background:"var(--surface)",borderRadius:"12px",border:"1px solid var(--border)",padding:"20px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
                    <div style={{fontWeight:700,color:"var(--text-1)",fontSize:"0.95rem"}}>{s.name}</div>
                    <button onClick={()=>delSvc(s.id)} style={{background:"none",border:"none",color:"var(--text-3)",cursor:"pointer",fontSize:"0.8rem",padding:"2px"}}>🗑</button>
                  </div>
                  {s.description&&<div style={{fontSize:"0.8rem",color:"var(--text-3)",marginBottom:"10px"}}>{s.description}</div>}
                  <div style={{display:"flex",gap:"10px"}}>
                    <span style={{fontSize:"0.78rem",background:"var(--accent-dim)",color:"var(--accent)",padding:"3px 9px",borderRadius:"100px",fontWeight:600}}>⏱ {s.duration_minutes}min</span>
                    {s.price&&<span style={{fontSize:"0.78rem",background:"rgba(34,197,94,0.1)",color:"#22c55e",padding:"3px 9px",borderRadius:"100px",fontWeight:600}}>💶 {s.price}€</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONFIGURAR */}
      {tab==="configurar"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px"}}>

          {/* Columna izquierda */}
          <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>

            {/* Identidad */}
            <div style={{background:"var(--surface)",borderRadius:"12px",border:"1px solid var(--border)",padding:"22px"}}>
              <h3 style={{fontSize:"0.82rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"16px"}}>Identidad del negocio</h3>
              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                {/* Logo */}
                <div>
                  <label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"6px"}}>Logo (URL de imagen)</label>
                  <input value={(sch as any).logo_url||""} onChange={e=>setSch(s=>({...s,logo_url:e.target.value}))} placeholder="https://tudominio.com/logo.png" style={inp}/>
                  {(sch as any).logo_url&&(
                    <div style={{marginTop:"8px",display:"flex",alignItems:"center",gap:"10px"}}>
                      <img src={(sch as any).logo_url} alt="logo" style={{width:"48px",height:"48px",borderRadius:"8px",objectFit:"cover",border:"1px solid var(--border)"}} onError={(e:any)=>e.target.style.display="none"}/>
                      <span style={{fontSize:"0.72rem",color:"var(--text-3)"}}>Vista previa del logo</span>
                    </div>
                  )}
                </div>
                {[
                  {k:"business_name",l:"Nombre del negocio",p:"Ej: Barbería García"},
                  {k:"business_address",l:"Dirección completa",p:"Ej: Calle Mayor 1, Madrid"},
                  {k:"business_phone",l:"Teléfono",p:"+34 600 000 000"},
                  {k:"instagram",l:"Instagram (sin @)",p:"barberia_garcia"},
                ].map(f=>(
                  <div key={f.k}>
                    <label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>{f.l}</label>
                    <input value={(sch as any)[f.k]||""} onChange={e=>setSch(s=>({...s,[f.k]:e.target.value}))} placeholder={f.p} style={inp}/>
                  </div>
                ))}
                <div>
                  <label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>Descripción</label>
                  <textarea value={sch.business_description||""} onChange={e=>setSch(s=>({...s,business_description:e.target.value}))} placeholder="Describe tu negocio a los clientes..." rows={3} style={{...inp,resize:"none"}}/>
                </div>
                <div>
                  <label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>Link Google Maps</label>
                  <input value={(sch as any).google_maps_url||""} onChange={e=>setSch(s=>({...s,google_maps_url:e.target.value}))} placeholder="https://maps.google.com/?q=..." style={inp}/>
                  <div style={{fontSize:"0.68rem",color:"var(--text-3)",marginTop:"4px"}}>Busca tu negocio en Google Maps → Compartir → Copiar enlace</div>
                </div>
                <div>
                  <label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"6px"}}>Color del negocio</label>
                  <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
                    <input type="color" value={sch.business_color||"#2563eb"} onChange={e=>setSch(s=>({...s,business_color:e.target.value}))} style={{width:"40px",height:"36px",border:"1px solid var(--border)",borderRadius:"8px",cursor:"pointer",padding:"2px",background:"none"}}/>
                    {["#2563eb","#0891b2","#059669","#d97706","#dc2626","#7c3aed","#db2777","#111827"].map(c=>(
                      <button key={c} onClick={()=>setSch(s=>({...s,business_color:c}))} style={{width:"28px",height:"28px",borderRadius:"50%",background:c,border:sch.business_color===c?"3px solid white":"2px solid transparent",cursor:"pointer",boxShadow:sch.business_color===c?"0 0 0 2px "+c:"none"}}/>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>URL pública (slug)</label>
                  <input value={sch.slug||""} onChange={e=>setSch(s=>({...s,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"")}))} placeholder="mi-barberia" style={inp}/>
                  {sch.slug&&<a href={`/book/${sch.slug}`} target="_blank" style={{display:"block",marginTop:"5px",fontSize:"0.72rem",color:"var(--accent)",textDecoration:"none"}}>/book/{sch.slug} ↗</a>}
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>

            {/* Horarios por día */}
            <div style={{background:"var(--surface)",borderRadius:"12px",border:"1px solid var(--border)",padding:"22px"}}>
              <h3 style={{fontSize:"0.82rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"16px"}}>Horarios por día</h3>
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                {[{d:"Lunes",i:1},{d:"Martes",i:2},{d:"Miércoles",i:3},{d:"Jueves",i:4},{d:"Viernes",i:5},{d:"Sábado",i:6},{d:"Domingo",i:0}].map(({d,i})=>{
                  const wdays=sch.working_days||[1,2,3,4,5,6];
                  const active=wdays.includes(i);
                  const wh=(sch as any).working_hours||{};
                  const open=wh[i]?.open||sch.start_time||"09:00";
                  const close=wh[i]?.close||sch.end_time||"19:00";
                  return(
                    <div key={i} style={{display:"grid",gridTemplateColumns:"100px 1fr",alignItems:"center",gap:"10px",padding:"8px 10px",borderRadius:"8px",background:active?"var(--bg-2)":"transparent",border:`1px solid ${active?"var(--border)":"transparent"}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                        <button onClick={()=>{
                          const days=sch.working_days||[1,2,3,4,5,6];
                          setSch(s=>({...s,working_days:active?days.filter((x:number)=>x!==i):[...days,i]}));
                        }} style={{width:"18px",height:"18px",borderRadius:"4px",border:"1px solid",borderColor:active?"var(--accent)":"var(--border)",background:active?"var(--accent)":"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",color:"white"}}>
                          {active?"✓":""}
                        </button>
                        <span style={{fontSize:"0.8rem",fontWeight:600,color:active?"var(--text-1)":"var(--text-3)"}}>{d}</span>
                      </div>
                      {active?(
                        <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
                          <input type="time" value={open} onChange={e=>{const h={...((sch as any).working_hours||{})};h[i]={...h[i],open:e.target.value};setSch(s=>({...s,working_hours:h}));}} style={{...inp,padding:"5px 8px",fontSize:"0.78rem",width:"auto",flex:1}}/>
                          <span style={{color:"var(--text-3)",fontSize:"0.78rem"}}>—</span>
                          <input type="time" value={close} onChange={e=>{const h={...((sch as any).working_hours||{})};h[i]={...h[i],close:e.target.value};setSch(s=>({...s,working_hours:h}));}} style={{...inp,padding:"5px 8px",fontSize:"0.78rem",width:"auto",flex:1}}/>
                        </div>
                      ):(
                        <span style={{fontSize:"0.75rem",color:"var(--text-3)"}}>Cerrado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Descanso + intervalo */}
            <div style={{background:"var(--surface)",borderRadius:"12px",border:"1px solid var(--border)",padding:"22px"}}>
              <h3 style={{fontSize:"0.82rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"16px"}}>Descanso e intervalos</h3>
              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                  <div>
                    <label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>Descanso inicio</label>
                    <input type="time" value={sch.break_start||""} onChange={e=>setSch(s=>({...s,break_start:e.target.value}))} style={inp}/>
                  </div>
                  <div>
                    <label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>Descanso fin</label>
                    <input type="time" value={sch.break_end||""} onChange={e=>setSch(s=>({...s,break_end:e.target.value}))} style={inp}/>
                  </div>
                </div>
                <div>
                  <label style={{fontSize:"0.72rem",fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",display:"block",marginBottom:"4px"}}>Intervalo entre citas</label>
                  <select value={sch.slot_duration||30} onChange={e=>setSch(s=>({...s,slot_duration:parseInt(e.target.value)}))} style={inp}>
                    {[15,20,30,45,60].map(n=><option key={n} value={n}>{n} minutos</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button onClick={saveSch} disabled={saving} style={{padding:"12px",background:"var(--accent)",border:"none",color:"white",borderRadius:"10px",cursor:"pointer",fontWeight:700,fontSize:"0.9rem",opacity:saving?0.7:1,transition:"opacity 0.2s"}}>
              {saving?"Guardando...":"Guardar configuración"}
            </button>

            {sch.slug&&(
              <div style={{background:"var(--bg-2)",border:"1px solid var(--border)",borderRadius:"10px",padding:"16px"}}>
                <div style={{fontSize:"0.78rem",fontWeight:700,color:"var(--text-1)",marginBottom:"8px"}}>Web pública de reservas</div>
                <div style={{display:"flex",gap:"8px"}}>
                  <a href={`/book/${sch.slug}`} target="_blank" style={{flex:1,display:"block",background:"var(--accent)",color:"white",padding:"8px 14px",borderRadius:"8px",textDecoration:"none",fontSize:"0.82rem",fontWeight:600,textAlign:"center"}}>
                    Abrir web →
                  </a>
                  <button onClick={()=>navigator.clipboard.writeText(`${window.location.origin}/book/${sch.slug}`)} style={{background:"var(--bg-3)",border:"1px solid var(--border)",color:"var(--text-2)",padding:"8px 12px",borderRadius:"8px",cursor:"pointer",fontSize:"0.78rem"}}>
                    Copiar URL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
