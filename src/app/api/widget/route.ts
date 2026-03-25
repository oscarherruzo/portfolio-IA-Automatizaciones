import { createClient } from "@/lib/supabase/server";
import { runAutomation } from "@/lib/groq";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
  try {
    const { automationId, userId, inputText } = await request.json();
    if (!automationId || !userId || !inputText?.trim()) return NextResponse.json({ error: "Parámetros incorrectos" }, { status: 400 });
    const supabase = await createClient();
    const { data: automation } = await supabase.from("automations").select("*").eq("id", automationId).eq("user_id", userId).eq("is_active", true).single();
    if (!automation) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    const { text, tokens, duration } = await runAutomation(automation.type, inputText, automation.prompt_template || undefined);
    await supabase.from("automation_runs").insert([{ automation_id: automationId, user_id: userId, status: "success", input_text: inputText, output_text: text, tokens_used: tokens, duration_ms: duration }]);
    return NextResponse.json({ output: text }, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Error interno" }, { status: 500 }); }
}
export async function OPTIONS() {
  return new NextResponse(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
