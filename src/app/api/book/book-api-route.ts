import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const date = searchParams.get("date");
  const serviceId = searchParams.get("service_id");
  if (!slug) return NextResponse.json({ error: "Falta slug" }, { status: 400 });

  const { data: schedule } = await admin.from("schedule_config").select("*").eq("slug", slug).eq("active", true).single();
  if (!schedule) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { data: services } = await admin.from("appointment_services").select("*").eq("user_id", schedule.user_id).eq("active", true).order("name");

  if (date && serviceId) {
    const service = (services || []).find((s: any) => s.id === serviceId);
    if (!service) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });

    const { data: booked } = await admin.from("appointments").select("time, duration_minutes").eq("user_id", schedule.user_id).eq("date", date).neq("status", "cancelled");
    const slots = buildSlots(schedule, service.duration_minutes, date, booked || []);
    return NextResponse.json({ schedule, services, slots });
  }
  return NextResponse.json({ schedule, services });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { slug, service_id, service_name, duration_minutes, client_name, client_email, client_phone, date, time, notes } = body;
  if (!slug || !client_name || !service_name || !date || !time) return NextResponse.json({ error: "Faltan campos" }, { status: 400 });

  const { data: schedule } = await admin.from("schedule_config").select("user_id").eq("slug", slug).single();
  if (!schedule) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const { data: conflict } = await admin.from("appointments").select("id").eq("user_id", schedule.user_id).eq("date", date).eq("time", time).neq("status", "cancelled");
  if (conflict && conflict.length > 0) return NextResponse.json({ error: "Ese horario ya está reservado" }, { status: 409 });

  const { data, error } = await admin.from("appointments").insert([{
    user_id: schedule.user_id, service_id: service_id || null,
    service_name, duration_minutes: duration_minutes || 60,
    client_name, client_email: client_email || null,
    client_phone: client_phone || null,
    date, time, status: "confirmed", notes: notes || null
  }]).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, appointment: data });
}

function buildSlots(schedule: any, serviceDuration: number, date: string, booked: any[]) {
  const dow = new Date(date + "T12:00:00").getDay(); // 0=Dom,1=Lun...6=Sáb
  const workDays = schedule.working_days || [1,2,3,4,5,6];
  if (!workDays.includes(dow)) return [];

  const now = new Date();
  const isToday = date === now.toISOString().split("T")[0];

  // Obtener horario del día específico si existe working_hours
  let startTime = schedule.start_time || "09:00";
  let endTime   = schedule.end_time   || "19:00";
  if (schedule.working_hours && schedule.working_hours[String(dow)]) {
    startTime = schedule.working_hours[String(dow)].open  || startTime;
    endTime   = schedule.working_hours[String(dow)].close || endTime;
  }

  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const slotDur  = schedule.slot_duration || 30;
  const slots: string[] = [];

  for (let m = sh*60+sm; m+serviceDuration <= eh*60+em; m += slotDur) {
    const ts = `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;

    if (isToday && new Date(`${date}T${ts}:00`) <= now) continue;

    if (schedule.break_start && schedule.break_end) {
      const [bsh,bsm] = schedule.break_start.split(":").map(Number);
      const [beh,bem] = schedule.break_end.split(":").map(Number);
      if (m >= bsh*60+bsm && m < beh*60+bem) continue;
    }

    const busy = booked.some(b => {
      const [bh,bmin] = b.time.split(":").map(Number);
      const bs = bh*60+bmin, be = bs+(b.duration_minutes||60);
      return m < be && m+serviceDuration > bs;
    });
    if (!busy) slots.push(ts);
  }
  return slots;
}
