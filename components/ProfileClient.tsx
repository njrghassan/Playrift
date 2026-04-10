"use client";

import { createClient } from "@/lib/supabase/client";
import {
  DISPLAY_NAME_MAX_LENGTH,
  isValidDisplayName,
  normalizeDisplayNameInput
} from "@/lib/displayName";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SteamConnectForm } from "@/components/SteamConnectForm";
import { SteamConnectedCard } from "@/components/SteamConnectedCard";

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function avatarObjectPath(userId: string) {
  return `${userId}/avatar`;
}

export default function ProfileClient({
  initialDisplayName,
  initialEmail,
  initialAvatarUrl,
  userId,
  steamConnected
}: {
  initialDisplayName: string;
  initialEmail: string;
  initialAvatarUrl?: string;
  userId: string;
  steamConnected: boolean;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [steamOn, setSteamOn] = useState(steamConnected);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDisplayName(initialDisplayName);
  }, [initialDisplayName]);

  useEffect(() => {
    setAvatarUrl(initialAvatarUrl ?? "");
  }, [initialAvatarUrl]);

  useEffect(() => {
    setSteamOn(steamConnected);
  }, [steamConnected]);

  async function saveName() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const supabase = createClient();
      const trimmed = normalizeDisplayNameInput(displayName);
      if (!isValidDisplayName(trimmed)) {
        setErr(`Username must be 1–${DISPLAY_NAME_MAX_LENGTH} characters.`);
        return;
      }
      const { error: authErr } = await supabase.auth.updateUser({
        data: { display_name: trimmed }
      });
      if (authErr) throw authErr;
      const { error: dbErr } = await supabase
        .from("users")
        .update({ display_name: trimmed })
        .eq("id", userId);
      if (dbErr) throw dbErr;
      setMsg("Username saved.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function onAvatarSelected(file: File | null) {
    if (!file) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
        setErr("Use JPEG, PNG, WebP, or GIF.");
        return;
      }
      if (file.size > AVATAR_MAX_BYTES) {
        setErr("Image must be 2 MB or smaller.");
        return;
      }
      const supabase = createClient();
      const path = avatarObjectPath(userId);
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true,
        contentType: file.type
      });
      if (upErr) throw upErr;

      const {
        data: { publicUrl }
      } = supabase.storage.from("avatars").getPublicUrl(path);
      const busted = `${publicUrl}?v=${Date.now()}`;
      const { error: metaErr } = await supabase.auth.updateUser({
        data: { avatar_url: busted }
      });
      if (metaErr) throw metaErr;
      setAvatarUrl(busted);
      setMsg("Profile photo updated.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not upload photo.");
    } finally {
      setBusy(false);
    }
  }

  async function removeAvatar() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const supabase = createClient();
      const path = avatarObjectPath(userId);
      await supabase.storage.from("avatars").remove([path]);
      const { error: metaErr } = await supabase.auth.updateUser({
        data: { avatar_url: "" }
      });
      if (metaErr) throw metaErr;
      setAvatarUrl("");
      setMsg("Profile photo removed.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not remove photo.");
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

  const showAvatar = Boolean(avatarUrl);

  return (
    <main className="mx-auto max-w-[1100px] px-8 py-12">
      <h1 className="text-4xl font-black tracking-tight">Profile</h1>
      <p className="mt-2 text-on-surface-variant">Account settings and Steam linking.</p>
      {initialEmail ? (
        <p className="mt-2 text-sm text-on-surface-variant/90">
          Signed in as <span className="text-on-surface">{initialEmail}</span>
        </p>
      ) : null}

      {msg ? <p className="mt-4 text-sm text-tertiary">{msg}</p> : null}
      {err ? <p className="mt-4 text-sm text-error">{err}</p> : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-6">
          <section className="rounded-xl bg-surface-container-low p-6">
            <h2 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">
              Profile photo
            </h2>
            <p className="mt-2 text-xs text-on-surface-variant">
              JPG, PNG, WebP, or GIF · max 2 MB · stored in your Supabase{" "}
              <code className="text-on-surface/90">avatars</code> bucket.
            </p>
            <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-full bg-surface-container-highest ring-2 ring-outline-variant/20">
                {showAvatar ? (
                  <Image src={avatarUrl} alt="" fill className="object-cover" sizes="96px" unoptimized />
                ) : (
                  <div className="flex size-full items-center justify-center text-2xl font-black text-on-surface-variant">
                    {(displayName.trim().slice(0, 1) || initialEmail.slice(0, 1) || "?").toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer rounded-lg bg-primary px-4 py-2 font-label text-xs font-bold uppercase tracking-widest text-on-primary disabled:opacity-50">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={busy}
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      e.target.value = "";
                      void onAvatarSelected(f);
                    }}
                  />
                  Upload
                </label>
                {showAvatar ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void removeAvatar()}
                    className="rounded-lg bg-surface-container-high px-4 py-2 font-label text-xs font-bold uppercase tracking-widest text-on-surface disabled:opacity-50"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-surface-container-low p-6">
            <h2 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">Username</h2>
            <p className="mt-2 text-xs text-on-surface-variant">Synced with your account and database row.</p>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={DISPLAY_NAME_MAX_LENGTH}
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
