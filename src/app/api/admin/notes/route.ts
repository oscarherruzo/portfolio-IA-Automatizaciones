import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

async function getAdmin(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const auth = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => cookieStore.getAll(), setAll: (s) => { try { s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } } });
  const { data: { user } } = await auth.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } });
}

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const admin = await getAdmin(cookieStore);
  if (!admin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");
  const { data } = await admin.from("admin_notes").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const admin = await getAdmin(cookieStore);
  if (!admin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  const { user_id, note } = await req.json();
  const { data } = await admin.from("admin_notes").insert([{ user_id, note, created_by: ADMIN_EMAIL }]).select().single();
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const cookieStore = await cookies();
  const admin = await getAdmin(cookieStore);
  if (!admin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  const { id } = await req.json();
  await admin.from("admin_notes").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
