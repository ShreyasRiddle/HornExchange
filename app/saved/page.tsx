"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { readSaved, readSession } from "@/lib/client-state";
import { RankedRecommendation } from "@/lib/types";

export default function SavedPage() {
  const router = useRouter();
  const [saved] = useState<RankedRecommendation[]>(() => readSaved());

  useEffect(() => {
    const session = readSession();
    if (!session.verified) router.replace("/");
  }, [router]);

  const stats = useMemo(() => {
    if (saved.length === 0) return { avg: 0 };
    return {
      avg: Math.round(saved.reduce((acc, current) => acc + current.trustScore, 0) / saved.length),
    };
  }, [saved]);

  return (
    <main className="page-shell mx-auto min-h-screen w-full max-w-5xl px-4 py-6 sm:px-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Step 4</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Saved services</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {saved.length} saved · Avg trust {saved.length ? stats.avg : "N/A"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/swipe" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-orange-500">
            Back to swipe
          </Link>
          <Link href="/seller" className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-black">
            Seller mode
          </Link>
        </div>
      </header>

      <section className="space-y-3">
        {saved.length === 0 && (
          <div className="ui-surface rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
            No saved services yet. Swipe right on `/swipe` to build your shortlist.
          </div>
        )}
        {saved.map((item) => (
          <article
            key={item.id}
            className="ui-surface rounded-3xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-orange-500 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{item.category}</p>
                <h2 className="mt-1 text-xl font-semibold text-zinc-100">{item.serviceTitle}</h2>
                <p className="text-sm text-zinc-400">{item.providerName} · {item.neighborhood}</p>
              </div>
              <div className="rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-right text-sm text-zinc-300">
                <p>${item.price}</p>
                <p>Trust {item.trustScore}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-zinc-300">{item.reason}</p>
            <div className="mt-4 flex gap-2">
              <Link
                href={`/saved/${item.id}`}
                className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-orange-500"
              >
                View profile
              </Link>
              <Link
                href={`/chats?listingId=${item.id}`}
                className="rounded-full border border-orange-500 px-3 py-1.5 text-xs font-semibold text-orange-300"
              >
                Message
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
