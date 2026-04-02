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
      type="button"
      onClick={handleSignOut}
      className="font-label rounded border border-outline-variant/20 bg-surface-container px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:border-primary/30 hover:bg-surface-container-high hover:text-primary"
    >
      Sign out
    </button>
  );
}
