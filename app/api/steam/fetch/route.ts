import { displayNameFromUserMetadataOrEmail } from "@/lib/displayName";
import { parseSteamProfileInput } from "@/lib/steam";
import { createClient } from "@/lib/supabase/server";
import { fetchOwnedGames, resolveVanityToSteam64 } from "@/services/steamService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const steamInput = body?.steamInput as string | undefined;
    if (!steamInput) return NextResponse.json({ error: "Steam input is required." }, { status: 400 });

    const parsed = parseSteamProfileInput(steamInput);
    if (!parsed) return NextResponse.json({ error: "Invalid Steam URL or ID." }, { status: 400 });

    const steamId =
      parsed.kind === "steam64" ? parsed.steamId : await resolveVanityToSteam64(parsed.vanity);

    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    await fetchOwnedGames(steamId);

    const meta = user.user_metadata as { display_name?: string } | undefined;
    const displayName = displayNameFromUserMetadataOrEmail(meta, user.email);

    const { error } = await supabase.from("users").upsert(
      {
        id: user.id,
        email: user.email ?? "",
        display_name: displayName,
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
