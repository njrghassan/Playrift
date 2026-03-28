import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  let user: { id: string; email?: string } | null = null;
  let profile: { steam_id?: string | null } | null = null;
  let blacklist: { id: number; game_name: string }[] = [];

  try {
    const supabase = await createClient();
    const {
      data: { user: currentUser }
    } = await supabase.auth.getUser();

    if (!currentUser) redirect("/login");

    user = currentUser;

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
      <main className="min-h-screen bg-surface px-6 py-16">
        <section className="mx-auto w-full max-w-2xl rounded-2xl bg-surface-container-low p-8 ring-1 ring-outline-variant/20">
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
    <main className="min-h-screen bg-surface text-on-surface">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-8">
        <div>
          <h1 className="text-3xl font-black text-primary">Playrift Dashboard</h1>
          <p className="text-on-surface-variant">{user?.email}</p>
        </div>
        <SignOutButton />
      </header>
      <DashboardClient
        steamConnected={Boolean(profile?.steam_id)}
        blacklist={blacklist}
      />
    </main>
  );
}
