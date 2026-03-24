import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Email del super admin (cámbialo por el tuyo)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@tudominio.com";

export async function GET() {
  const cookieStore = await cookies();

  // 1. Cliente normal (anon key) → verificar quién está logueado
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // 2. Verificar que es el admin
  if (user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  // 3. Cliente admin (service_role key) → bypasea RLS y ve TODO
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  // 4. Obtener todos los perfiles
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name, plan, tokens_used, created_at")
    .order("created_at", { ascending: false });

  if (profilesError) {
    return NextResponse.json(
      { error: profilesError.message },
      { status: 500 }
    );
  }

  // 5. Para cada usuario, contar sus automatizaciones
  const usersWithStats = await Promise.all(
    (profiles || []).map(async (profile) => {
      const { count: automationsCount } = await supabaseAdmin
        .from("automations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id);

      const { count: runsCount } = await supabaseAdmin
        .from("automation_runs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id);

      return {
        ...profile,
        automations_count: automationsCount ?? 0,
        runs_count: runsCount ?? 0,
      };
    })
  );

  return NextResponse.json({ users: usersWithStats });
}
