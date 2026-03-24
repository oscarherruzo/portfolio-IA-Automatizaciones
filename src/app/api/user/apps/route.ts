import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ apps: [] });

  const { data } = await supabase
    .from("user_app_access")
    .select("app_id")
    .eq("user_id", user.id);

  return NextResponse.json({ apps: (data || []).map(r => r.app_id) });
}
