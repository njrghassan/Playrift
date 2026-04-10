"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SteamConnectForm } from "@/components/SteamConnectForm";
import { SteamConnectedCard } from "@/components/SteamConnectedCard";

export default function ProfileClient({
  initialDisplayName,
  initialEmail,
  steamConnected
}: {
  initialDisplayName: string;
  initialEmail: string;
  steamConnected: boolean;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [steamOn, setSteamOn] = useState(steamConnected);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function saveName() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const supabase = createClient();
      const trimmed = displayName.trim();
      if (!trimmed) {
        setErr("Username cannot be empty.");
        return;
      }
      const { error } = await supabase.auth.updateUser({
        data: { display_name: trimmed }
      });
      if (error) throw error;
      setMsg("Username saved.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function saveEmail() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ email: email.trim() });
      if (error) throw error;
      setMsg("Email update requested. Confirm from your inbox if your project requires it.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not update email.");
    } finally {
      setBusy(false);
    }
  }

  async function savePassword() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      if (password.length < 6) {
        setErr("Password must be at least 6 characters.");
        return;
      }
      if (password !== password2) {
        setErr("Passwords do not match.");
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setPassword2("");
      setMsg("Password updated.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not update password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-[1100px] px-8 py-12">
      <h1 className="text-4xl font-black tracking-tight">Profile</h1>
      <p className="mt-2 text-on-surface-variant">Account settings and Steam linking.</p>

      {msg ? <p className="mt-4 text-sm text-tertiary">{msg}</p> : null}
      {err ? <p className="mt-4 text-sm text-error">{err}</p> : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-6">
          <section className="rounded-xl bg-surface-container-low p-6">
            <h2 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">Username</h2>
            <p className="mt-2 text-xs text-on-surface-variant">Shown in the app header when set.</p>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-4 w-full rounded-lg bg-surface-container px-4 py-3 text-sm outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => void saveName()}
              disabled={busy}
              className="mt-4 rounded-lg bg-primary px-5 py-2.5 font-label text-xs font-bold uppercase tracking-widest text-on-primary disabled:opacity-50"
            >
              Save name
            </button>
          </section>

          <section className="rounded-xl bg-surface-container-low p-6">
            <h2 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">Email</h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-4 w-full rounded-lg bg-surface-container px-4 py-3 text-sm outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => void saveEmail()}
              disabled={busy}
              className="mt-4 rounded-lg bg-surface-container-high px-5 py-2.5 font-label text-xs font-bold uppercase tracking-widest text-on-surface disabled:opacity-50"
            >
              Update email
            </button>
          </section>

          <section className="rounded-xl bg-surface-container-low p-6">
            <h2 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">Password</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="mt-4 w-full rounded-lg bg-surface-container px-4 py-3 text-sm outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
            />
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Confirm"
              className="mt-3 w-full rounded-lg bg-surface-container px-4 py-3 text-sm outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => void savePassword()}
              disabled={busy}
              className="mt-4 rounded-lg bg-surface-container-high px-5 py-2.5 font-label text-xs font-bold uppercase tracking-widest text-on-surface disabled:opacity-50"
            >
              Update password
            </button>
          </section>
        </div>

        <div className="lg:col-span-6">
          <div id="steam" className="lg:sticky lg:top-28">
            <section className="rounded-xl bg-surface-container-low p-6">
              <h2 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">Steam</h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                Link your library for recommendations and comparisons.
              </p>
              <div className="mt-6">
                {!steamOn ? (
                  <SteamConnectForm
                    onConnected={() => {
                      setSteamOn(true);
                      router.refresh();
                    }}
                  />
                ) : (
                  <SteamConnectedCard
                    onDisconnected={() => {
                      setSteamOn(false);
                      router.refresh();
                    }}
                  />
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
