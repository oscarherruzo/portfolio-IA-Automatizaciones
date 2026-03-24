import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { runAutomation } from "@/lib/groq";

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  // Verificar token
  const { data: tokenRow } = await supabase.from("api_tokens").select("user_id").eq("token", params.token).single();
  if (!tokenRow) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

  const { app_id, input } = await req.json();
  if (!app_id || !input) return NextResponse.json({ error: "Faltan parámetros: app_id, input" }, { status: 400 });

  // Verificar que el usuario tiene acceso a esta app
  const { data: access } = await supabase.from("user_app_access").select("id").eq("user_id", tokenRow.user_id).eq("app_id", app_id).single();
  if (!access) return NextResponse.json({ error: "Sin acceso a esta app" }, { status: 403 });

  // Ejecutar
  const result = await runAutomation(app_id, input);

  // Registrar uso
  await supabase.from("api_tokens").update({ last_used_at: new Date().toISOString() }).eq("token", params.token);
  await supabase.from("profiles").update({ tokens_used: supabase.rpc("increment_tokens", { user_id: tokenRow.user_id, amount: result.tokens }) });

  return NextResponse.json({ output: result.text, tokens_used: result.tokens, duration_ms: result.duration });
}
