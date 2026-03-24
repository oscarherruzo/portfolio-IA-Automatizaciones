import Groq from "groq-sdk";

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const GROQ_MODEL = "llama-3.3-70b-versatile";

export const AUTOMATION_PROMPTS: Record<string, string> = {
  email: `Eres un asistente experto en redacción de emails profesionales para empresas. 
Redacta respuestas claras, concisas y profesionales. Adapta el tono al contexto.
Responde SIEMPRE en español.`,

  content: `Eres un experto en marketing de contenidos y copywriting para empresas.
Crea contenido atractivo, persuasivo y optimizado. Adapta el formato al canal solicitado.
Responde SIEMPRE en español.`,

  summary: `Eres un experto en síntesis y análisis de información empresarial.
Extrae los puntos clave, decisiones importantes y próximos pasos de cualquier documento.
Responde SIEMPRE en español con formato estructurado.`,

  analysis: `Eres un analista de negocio experto en interpretación de datos y métricas empresariales.
Identifica patrones, anomalías y oportunidades de mejora. Proporciona recomendaciones accionables.
Responde SIEMPRE en español.`,

  chatbot: `Eres un asistente virtual inteligente para empresas. Respondes preguntas de clientes
de forma amable, precisa y útil. Cuando no sabes algo, lo indicas claramente.
Responde SIEMPRE en español.`,

  notification: `Eres un experto en comunicación empresarial. Redacta notificaciones claras,
urgentes cuando sea necesario y orientadas a la acción.
Responde SIEMPRE en español.`,
};

export async function runAutomation(
  type: string,
  userInput: string,
  customPrompt?: string
): Promise<{ text: string; tokens: number; duration: number }> {
  const start = Date.now();
  const systemPrompt = customPrompt || AUTOMATION_PROMPTS[type] || AUTOMATION_PROMPTS.content;

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userInput },
    ],
    max_tokens: 1500,
    temperature: 0.7,
  });

  const text = response.choices[0]?.message?.content || "";
  const tokens = response.usage?.total_tokens || 0;
  const duration = Date.now() - start;

  return { text, tokens, duration };
}
