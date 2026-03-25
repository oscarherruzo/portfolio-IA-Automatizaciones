import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@tudominio.com";

export async function GET() {
  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

  const { data: runs } = await admin.from("automation_runs").select("id, status, tokens_used, created_at, user_id, automations(name, type)").order("created_at", { ascending: false }).limit(50);
  const { data: tokensByDay } = await admin.from("automation_runs").select("created_at, tokens_used").gte("created_at", new Date(Date.now() - 14 * 86400000).toISOString());

  const dailyMap: Record<string, number> = {};
  (tokensByDay || []).forEach(r => {
    const day = new Date(r.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
    dailyMap[day] = (dailyMap[day] || 0) + (r.tokens_used || 0);
  });

  return NextResponse.json({ runs: runs || [], dailyTokens: dailyMap });
}
