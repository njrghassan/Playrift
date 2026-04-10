import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";
import { DashboardFooter } from "@/components/DashboardFooter";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  let user: { id: string; email?: string } | null = null;
  let userDisplayName: string | undefined;
  let profile: { steam_id?: string | null } | null = null;
  let blacklist: { id: number; game_name: string }[] = [];

  try {
    const supabase = await createClient();
    const {
      data: { user: currentUser }
    } = await supabase.auth.getUser();

    if (!currentUser) redirect("/login");

    user = currentUser;
    const meta = currentUser.user_metadata as { display_name?: string } | undefined;
    if (typeof meta?.display_name === "string" && meta.display_name.trim()) {
      userDisplayName = meta.display_name.trim();
    }

    const { data: profileData } = await supabase
      .from("users")
      .select("steam_id")
      .eq("id", currentUser.id)
      .single();

    profile = profileData;

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
      <div className="min-h-screen bg-surface text-on-surface">
        <DashboardNav />
        <main className="px-8 py-16">
          <section className="mx-auto w-full max-w-2xl rounded-xl bg-surface-container-low p-8">
            <h1 className="text-2xl font-black text-primary">Playrift is not configured</h1>
            <p className="mt-3 text-on-surface-variant">{message}</p>
            <p className="mt-4 text-sm text-on-surface-variant/90">
              Create a `.env.local` using `.env.example`, then restart the dev server.
            </p>
          </section>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <DashboardNav />
      <DashboardClient
        userEmail={user?.email}
        userDisplayName={userDisplayName}
        steamConnected={Boolean(profile?.steam_id)}
        blacklist={blacklist}
      />
      <DashboardFooter />
    </div>
  );
}
