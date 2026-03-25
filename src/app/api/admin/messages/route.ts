import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@tudominio.com";

async function getAdminSupabase(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const auth = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => cookieStore.getAll(), setAll: (s) => { try { s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } } });
  const { data: { user } } = await auth.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const admin = await getAdminSupabase(cookieStore);
  if (!admin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const { user_id, subject, body } = await req.json();

  // Guardar como mensaje
  await admin.from("admin_messages").insert([{ user_id, subject, body }]);
  // Crear notificación in-app para el usuario
  await admin.from("notifications").insert([{ user_id, title: subject, message: body, type: "info" }]);

  return NextResponse.json({ ok: true });
}
