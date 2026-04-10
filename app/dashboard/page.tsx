import { createClient } from "@/lib/supabase/server";
import { displayNameFromUserMetadataOrEmail } from "@/lib/displayName";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  let user: { id: string; email?: string } | null = null;
  let userDisplayName: string | undefined;
  let userAvatarUrl: string | undefined;
  let profile: { steam_id?: string | null } | null = null;
  let blacklist: { id: number; game_name: string }[] = [];

  try {
    const supabase = await createClient();
    const {
      data: { user: currentUser }
    } = await supabase.auth.getUser();

    if (!currentUser) redirect("/login");

    user = currentUser;
    const meta = currentUser.user_metadata as {
      display_name?: string;
      avatar_url?: string;
    };
    const displayFallback = displayNameFromUserMetadataOrEmail(meta, currentUser.email);

    const { data: existingRow } = await supabase
      .from("users")
      .select("steam_id, display_name")
      .eq("id", currentUser.id)
      .maybeSingle();

    const resolvedDisplayName = existingRow?.display_name?.trim() || displayFallback;
    await supabase.from("users").upsert(
      {
        id: currentUser.id,
        email: currentUser.email ?? "",
        display_name: resolvedDisplayName,
        steam_id: existingRow?.steam_id ?? null
      },
      { onConflict: "id" }
    );

    const { data: profileData } = await supabase
      .from("users")
      .select("steam_id, display_name")
      .eq("id", currentUser.id)
      .single();

    profile = profileData;
    userDisplayName = profileData?.display_name?.trim() || resolvedDisplayName;

    if (typeof meta?.avatar_url === "string" && meta.avatar_url.startsWith("http")) {
      userAvatarUrl = meta.avatar_url;
    }

    const { data: blacklistData } = await supabase
      .from("blacklist")
      .select("id, game_name")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    blacklist = blacklistData ?? [];
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Dashboard failed to load due to missing configuration.";

    return (
      <main className="px-8 py-16">
        <section className="mx-auto w-full max-w-2xl rounded-xl bg-surface-container-low p-8">
          <h1 className="text-2xl font-black text-primary">Playrift is not configured</h1>
          <p className="mt-3 text-on-surface-variant">{message}</p>
          <p className="mt-4 text-sm text-on-surface-variant/90">
            Create a `.env.local` using `.env.example`, then restart the dev server.
          </p>
        </section>
      </main>
    );
  }

  return (
    <DashboardClient
      userEmail={user?.email}
      userDisplayName={userDisplayName}
      userAvatarUrl={userAvatarUrl}
      steamConnected={Boolean(profile?.steam_id)}
      blacklist={blacklist}
    />
  );
}
