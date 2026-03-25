import { createClient } from "@/lib/supabase/server";
import { runAutomation } from "@/lib/groq";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { automation_id, input_text } = await request.json();
    if (!input_text?.trim()) return NextResponse.json({ error: "Texto de entrada requerido" }, { status: 400 });

    // Get automation config
    const { data: automation } = await supabase
      .from("automations")
      .select("*")
      .eq("id", automation_id)
      .eq("user_id", user.id)
      .single();

    if (!automation) return NextResponse.json({ error: "Automatización no encontrada" }, { status: 404 });

    // Run via Groq
    const { text, tokens, duration } = await runAutomation(
      automation.type,
      input_text,
      automation.prompt_template || undefined
    );

    // Save run
    await supabase.from("automation_runs").insert([{
      automation_id,
      user_id: user.id,
      status: "success",
      input_text,
      output_text: text,
      tokens_used: tokens,
      duration_ms: duration,
    }]);

    // Update counters
    await supabase
      .from("automations")
      .update({ runs_count: automation.runs_count + 1, updated_at: new Date().toISOString() })
      .eq("id", automation_id);

    await supabase.rpc("increment_tokens", { user_id_param: user.id, amount: tokens }).maybeSingle();

    return NextResponse.json({ output: text, tokens, duration });
  } catch (err: unknown) {
    console.error(err);
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
