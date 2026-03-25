import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@tudominio.com";

async function getAdmin(cookieStore: any) {
  const auth = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } });
  const { data: { user } } = await auth.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const admin = await getAdmin(cookieStore);
  if (!admin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");
  const { data } = await admin.from("user_app_access").select("app_id").eq("user_id", userId);
  return NextResponse.json({ apps: (data || []).map((r: any) => r.app_id) });
}

export async function PUT(req: Request) {
  const cookieStore = await cookies();
  const admin = await getAdmin(cookieStore);
  if (!admin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  const { user_id, app_ids } = await req.json();
  await admin.from("user_app_access").delete().eq("user_id", user_id);
  if (app_ids.length > 0) await admin.from("user_app_access").insert(app_ids.map((app_id: string) => ({ user_id, app_id, granted_by: ADMIN_EMAIL })));
  return NextResponse.json({ ok: true });
}
