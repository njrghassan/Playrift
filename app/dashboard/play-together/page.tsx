import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";
import { DashboardFooter } from "@/components/DashboardFooter";
import PlayTogetherClient from "@/components/PlayTogetherClient";

export default async function PlayTogetherPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("steam_id")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <DashboardNav />
      <PlayTogetherClient steamConnected={Boolean(profile?.steam_id)} />
      <DashboardFooter />
    </div>
  );
}
