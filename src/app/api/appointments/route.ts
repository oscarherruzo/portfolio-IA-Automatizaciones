import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([]);
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  let query = supabase.from("appointments").select("*").eq("user_id", user.id).order("date").order("time");
  if (date) query = (query as any).eq("date", date);
  const { data } = await query;
  return NextResponse.json(data || []);
}
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  const { data, error } = await supabase.from("appointments").insert([{ ...body, user_id: user.id }]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id, ...updates } = await req.json();
  const { data, error } = await supabase.from("appointments").update(updates).eq("id", id).eq("user_id", user.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await req.json();
  await supabase.from("appointments").delete().eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
