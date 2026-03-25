import { createClient } from "@/lib/supabase/server";
import { groq, GROQ_MODEL } from "@/lib/groq";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { messages } = await request.json();

    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: `Eres un asistente de IA experto en negocios, automatizaciones y productividad empresarial.
Ayudas a empresas a optimizar procesos, implementar IA y tomar decisiones estratégicas.
Responde SIEMPRE en español. Sé conciso, práctico y orientado a resultados.
Usa listas cuando sea útil para organizar la información.`,
        },
        ...messages,
      ],
      max_tokens: 1200,
      temperature: 0.7,
    });

    const assistantMessage = response.choices[0]?.message?.content || "";
    const tokens = response.usage?.total_tokens || 0;

    // Save to DB
    await supabase.from("chat_messages").insert([
      { user_id: user.id, role: "user", content: messages[messages.length - 1].content },
      { user_id: user.id, role: "assistant", content: assistantMessage, tokens_used: tokens },
    ]);

    return NextResponse.json({ message: assistantMessage, tokens });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}
