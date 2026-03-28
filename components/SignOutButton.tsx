"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-lg bg-primary-container/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary-container/20"
    >
      Sign out
    </button>
  );
}
