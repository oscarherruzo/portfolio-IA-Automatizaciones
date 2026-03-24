import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@tudominio.com";

async function getAdminClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => { try { s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    }
  );
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return null;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
}

// PATCH — actualizar tokens o plan de un usuario
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const admin = await getAdminClient(cookieStore);
  if (!admin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const body = await req.json();
  const { error } = await admin.from("profiles").update(body).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE — eliminar usuario
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const admin = await getAdminClient(cookieStore);
  if (!admin) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const { error } = await admin.auth.admin.deleteUser(params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
