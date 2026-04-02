import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6">
      <div className="w-full max-w-md">
        <Suspense fallback={<p className="text-center text-on-surface-variant">Loading…</p>}>
          <AuthForm mode="login" />
        </Suspense>
        <p className="mt-4 text-center text-sm text-on-surface-variant">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-primary">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
