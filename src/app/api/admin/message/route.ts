import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const auth = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => cookieStore.getAll(), setAll: (s) => { try { s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } } });
  const { data: { user } } = await auth.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const admin = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } });
  const { user_id, title, body, type = "info", link } = await req.json();

  await admin.from("notifications").insert([{ user_id, title, body, type, link }]);
  return NextResponse.json({ ok: true });
}
