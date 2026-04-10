import Link from "next/link";

export default function GameNotFound() {
  return (
    <main className="mx-auto max-w-lg px-8 py-20 text-center">
      <h1 className="text-2xl font-black text-primary">Game not found</h1>
      <p className="mt-3 text-on-surface-variant">That RAWG slug does not exist or was removed.</p>
      <Link href="/dashboard" className="mt-8 inline-block text-primary underline-offset-2 hover:underline">
        Back to dashboard
      </Link>
    </main>
  );
}
