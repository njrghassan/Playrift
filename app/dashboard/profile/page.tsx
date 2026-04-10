import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";
import { DashboardFooter } from "@/components/DashboardFooter";
import ProfileClient from "@/components/ProfileClient";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const email = user.email ?? "";
  await supabase.from("users").upsert({ id: user.id, email }, { onConflict: "id" });

  const meta = user.user_metadata as { display_name?: string } | undefined;
  const displayName =
    typeof meta?.display_name === "string" && meta.display_name.trim()
      ? meta.display_name.trim()
      : email.split("@")[0] || "Player";

  const { data: profile } = await supabase
    .from("users")
    .select("steam_id")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <DashboardNav />
      <ProfileClient
        initialDisplayName={displayName}
        initialEmail={email}
        steamConnected={Boolean(profile?.steam_id)}
      />
      <DashboardFooter />
    </div>
  );
}
