import { createClient } from "@/lib/supabase/server";
import { displayNameFromUserMetadataOrEmail } from "@/lib/displayName";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/ProfileClient";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const email = user.email ?? "";
  const meta = user.user_metadata as {
    display_name?: string;
    avatar_url?: string;
  };

  const { data: existingRow } = await supabase
    .from("users")
    .select("steam_id, display_name")
    .eq("id", user.id)
    .maybeSingle();

  const resolvedDisplayName =
    existingRow?.display_name?.trim() ||
    displayNameFromUserMetadataOrEmail(meta, user.email);

  await supabase.from("users").upsert(
    {
      id: user.id,
      email,
      display_name: resolvedDisplayName,
      steam_id: existingRow?.steam_id ?? null
    },
    { onConflict: "id" }
  );

  const { data: profile } = await supabase
    .from("users")
    .select("steam_id, display_name")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name?.trim() || resolvedDisplayName;

  const avatarUrl =
    typeof meta.avatar_url === "string" && meta.avatar_url.startsWith("http")
      ? meta.avatar_url
      : undefined;

  return (
    <ProfileClient
      initialDisplayName={displayName}
      initialEmail={email}
      initialAvatarUrl={avatarUrl}
      userId={user.id}
      steamConnected={Boolean(profile?.steam_id)}
    />
  );
}
