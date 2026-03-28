import { extractSteamId } from "@/lib/steam";
import { createClient } from "@/lib/supabase/server";
import { fetchOwnedGames } from "@/services/steamService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const steamInput = body?.steamInput as string | undefined;
    if (!steamInput) return NextResponse.json({ error: "Steam input is required." }, { status: 400 });

    const steamId = extractSteamId(steamInput);
    if (!steamId) return NextResponse.json({ error: "Invalid Steam URL or ID." }, { status: 400 });

    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    await fetchOwnedGames(steamId);

    const { error } = await supabase.from("users").upsert(
      {
        id: user.id,
        email: user.email,
        steam_id: steamId
      },
      { onConflict: "id" }
    );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ steamId });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not connect Steam profile. It may be private.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
