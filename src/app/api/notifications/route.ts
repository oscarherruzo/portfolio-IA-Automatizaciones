import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([]);
  const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
  return NextResponse.json(data || []);
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await req.json();
  if (id === "all") {
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id);
  } else {
    await supabase.from("notifications").update({ read: true }).eq("id", id).eq("user_id", user.id);
  }
  return NextResponse.json({ ok: true });
}
