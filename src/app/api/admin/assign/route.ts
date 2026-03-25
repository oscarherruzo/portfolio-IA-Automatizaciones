import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@tudominio.com";

async function getAdminSupabase(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const auth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (s) => { try { s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } } }
  );
  const { data: { user } } = await auth.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
}

// GET — obtener apps asignadas a un usuario
export async function GET(req: Request) {
  const cookieStore = await cookies();
  const admin = await getAdminSupabase(cookieStore);
  if (!admin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");
  if (!userId) return NextResponse.json({ error: "Falta user_id" }, { status: 400 });

  const { data } = await admin.from("user_app_access").select("app_id").eq("user_id", userId);
  return NextResponse.json({ apps: (data || []).map(r => r.app_id) });
}

// POST — asignar o revocar apps a un usuario
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const admin = await getAdminSupabase(cookieStore);
  if (!admin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const { user_id, app_id, action } = await req.json(); // action: "grant" | "revoke"

  if (action === "grant") {
    await admin.from("user_app_access").upsert({ user_id, app_id, granted_by: ADMIN_EMAIL }, { onConflict: "user_id,app_id" });
  } else {
    await admin.from("user_app_access").delete().eq("user_id", user_id).eq("app_id", app_id);
  }

  return NextResponse.json({ ok: true });
}

// PUT — reemplazar todas las apps de un usuario de una vez
export async function PUT(req: Request) {
  const cookieStore = await cookies();
  const admin = await getAdminSupabase(cookieStore);
  if (!admin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const { user_id, app_ids } = await req.json(); // app_ids: string[]

  // Borrar todas las actuales y reinsertar las seleccionadas
  await admin.from("user_app_access").delete().eq("user_id", user_id);
  if (app_ids.length > 0) {
    await admin.from("user_app_access").insert(
      app_ids.map((app_id: string) => ({ user_id, app_id, granted_by: ADMIN_EMAIL }))
    );
  }

  return NextResponse.json({ ok: true });
}
