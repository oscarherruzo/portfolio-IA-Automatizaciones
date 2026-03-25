import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function timeAgo(d: string | Date): string {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return "ahora mismo";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)}d`;
}

// Generate 52 weeks of activity data for the graph
export function generateActivityData(runs: { created_at: string }[]): number[][] {
  const weeks: number[][] = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 364);

  // Create a map of date -> count
  const countMap: Record<string, number> = {};
  runs.forEach((r) => {
    const d = new Date(r.created_at).toISOString().split("T")[0];
    countMap[d] = (countMap[d] || 0) + 1;
  });

  let current = new Date(start);
  // Align to Sunday
  current.setDate(current.getDate() - current.getDay());

  for (let w = 0; w < 52; w++) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      const key = current.toISOString().split("T")[0];
      week.push(countMap[key] || 0);
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function getActivityLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

export const AUTOMATION_TYPES = [
  { id: "email", label: "Responder Emails", icon: "✉️", color: "#2f81f7", desc: "Redacta respuestas profesionales a emails" },
  { id: "content", label: "Generar Contenido", icon: "✍️", color: "#a371f7", desc: "Posts, copys y textos para marketing" },
  { id: "summary", label: "Resumir Documentos", icon: "📄", color: "#3fb950", desc: "Extrae puntos clave de cualquier texto" },
  { id: "analysis", label: "Analizar Datos", icon: "📊", color: "#f0883e", desc: "Interpreta métricas y genera insights" },
  { id: "chatbot", label: "Chatbot Web", icon: "💬", color: "#58a6ff", desc: "Responde preguntas de clientes" },
  { id: "notification", label: "Notificaciones", icon: "🔔", color: "#ffa657", desc: "Redacta alertas y comunicados" },
];
