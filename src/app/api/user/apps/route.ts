import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@tudominio.com";

const ALL_APP_IDS = [
  "gestor-citas", "chatbot-cliente", "faq-inteligente",
  "contenido-redes", "email-marketing", "descripciones-producto",
  "asistente-ventas", "generador-presupuestos", "analizador-reviews",
  "resumidor-reuniones", "analisis-competencia", "redactor-contratos"
];

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ apps: [] });

  // Admin siempre tiene todas las apps
  if (user.email === ADMIN_EMAIL) {
    return NextResponse.json({ apps: ALL_APP_IDS });
  }

  const { data } = await supabase
    .from("user_app_access")
    .select("app_id")
    .eq("user_id", user.id);

  return NextResponse.json({ apps: (data || []).map((r: any) => r.app_id) });
}
