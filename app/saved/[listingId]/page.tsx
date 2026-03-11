"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  readBookings,
  readSaved,
  readSession,
  writeActiveListing,
  writeBookings,
} from "@/lib/client-state";
import { RankedRecommendation } from "@/lib/types";

const defaultMapQuery = "Austin, TX";

export default function SavedDetailPage() {
  const params = useParams<{ listingId: string }>();
  const router = useRouter();
  const listingId = params.listingId;
  const [saved] = useState<RankedRecommendation[]>(() => readSaved());
  const [bookings, setBookings] = useState(() => readBookings());

  const listing = useMemo(
    () => saved.find((entry) => entry.id === listingId) ?? null,
    [listingId, saved],
  );

  useEffect(() => {
    const session = readSession();
    if (!session.verified) router.replace("/");
    writeActiveListing(listingId);
  }, [listingId, router]);

  useEffect(() => {
    writeBookings(bookings);
  }, [bookings]);

  if (!listing) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-center text-zinc-300">
          <p>Saved profile not found.</p>
          <Link href="/saved" className="mt-3 inline-flex rounded-full border border-zinc-700 px-4 py-2 text-sm">
            Back to saved
          </Link>
        </div>
      </main>
    );
  }

  const selectSlot = (slot: string) => {
    setBookings((current) => ({ ...current, [listing.id]: slot }));
  };

  return (
    <main className="page-shell mx-auto min-h-screen w-full max-w-5xl px-4 py-6 sm:px-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Step 5</p>
          <h1 className="mt-1 text-3xl font-semibold text-zinc-100">{listing.providerName}</h1>
          <p className="text-sm text-zinc-400">{listing.serviceTitle}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/chats?listingId=${listing.id}`}
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-black"
          >
            Message provider
          </Link>
          <Link href="/saved" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-orange-500">
            Back
          </Link>
        </div>
      </header>

      <section>
        <article className="ui-surface rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="grid gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-300 sm:grid-cols-4">
            <p>${listing.price}</p>
            <p>Trust {listing.trustScore}</p>
            <p>{listing.rating} stars</p>
            <Link
              href={`/chats?listingId=${listing.id}`}
              className="justify-self-start rounded-full border border-orange-500 px-3 py-1 text-center text-xs font-semibold text-orange-300 sm:justify-self-end"
            >
              Open chat
            </Link>
          </div>
          <p className="mt-3 text-sm text-zinc-300">{listing.description}</p>
          <p className="mt-2 text-sm text-zinc-500">{listing.bio}</p>
          <div className="mt-4">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(defaultMapQuery)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-orange-500 px-3 py-1 text-xs font-semibold text-orange-300"
            >
              Open in Google Maps
            </a>
            <iframe
              title="Map preview"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(defaultMapQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              className="mt-3 h-52 w-full rounded-2xl border border-zinc-800"
            />
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.15em] text-zinc-500">Popular reviews</p>
          <div className="mt-2 space-y-2">
            {listing.reviews.map((review) => (
              <blockquote key={review.author} className="rounded-xl border border-zinc-700 p-2 text-sm text-zinc-300">
                <div className="flex items-center gap-2">
                  <img
                    src={review.avatarUrl ?? ""}
                    alt={review.author}
                    className="h-7 w-7 rounded-full border border-zinc-700"
                  />
                  <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                    {review.author} · {review.rating} stars
                  </p>
                </div>
                <p className="mt-1">&quot;{review.quote}&quot;</p>
              </blockquote>
            ))}
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.15em] text-zinc-500">Schedule appointment</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {listing.schedule.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => selectSlot(slot)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  bookings[listing.id] === slot
                    ? "border-orange-500 bg-orange-500 text-black"
                    : "border-zinc-700 bg-zinc-900 text-zinc-300"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
