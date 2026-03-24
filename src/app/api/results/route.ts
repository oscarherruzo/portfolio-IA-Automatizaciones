import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { data } = await supabase.from("saved_results").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  const { data, error } = await supabase.from("saved_results").insert([{ ...body, user_id: user.id }]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await req.json();
  await supabase.from("saved_results").delete().eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
