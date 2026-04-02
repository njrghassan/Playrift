import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6">
      <div className="w-full max-w-md">
        <Suspense fallback={<p className="text-center text-on-surface-variant">Loading…</p>}>
          <AuthForm mode="signup" />
        </Suspense>
        <p className="mt-4 text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
