import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function getUserOrFail() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null };
  return { supabase, user };
}

export async function POST(request: Request) {
  const { supabase, user } = await getUserOrFail();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { gameName } = await request.json();
  if (!gameName) return NextResponse.json({ error: "gameName is required." }, { status: 400 });

  const { error } = await supabase.from("blacklist").insert({
    user_id: user.id,
    game_name: String(gameName).trim()
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: items } = await supabase
    .from("blacklist")
    .select("id, game_name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ items });
}

export async function DELETE(request: Request) {
  const { supabase, user } = await getUserOrFail();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const { error } = await supabase.from("blacklist").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: items } = await supabase
    .from("blacklist")
    .select("id, game_name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ items });
}
