"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { starterThreads } from "@/lib/seed-data";
import {
  ListingAssistResponse,
  Message,
  MessageAssistResponse,
  RankedRecommendation,
  SearchPreference,
  SearchResult,
} from "@/lib/types";

const starterPrompt = "cheap haircut near West Campus tonight under 25";

const refinementChips: SearchPreference[] = [
  "Cheaper",
  "Closer",
  "More Trusted",
  "Available Sooner",
  "Not This Vibe",
];

type BookingMap = Record<string, string>;
type ThreadMap = Record<string, Message[]>;

async function postJSON<T>(url: string, payload: object): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const maybeError = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(maybeError?.error ?? "Request failed.");
  }

  return (await response.json()) as T;
}

export function HornExchangeApp() {
  const [utEmail, setUtEmail] = useState("shreyas@utexas.edu");
  const [searchQuery, setSearchQuery] = useState(starterPrompt);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [deckIndex, setDeckIndex] = useState(0);
  const [saved, setSaved] = useState<RankedRecommendation[]>([]);
  const [bookings, setBookings] = useState<BookingMap>({});
  const [threads, setThreads] = useState<ThreadMap>(starterThreads);
  const [activeListingId, setActiveListingId] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [messageAssist, setMessageAssist] = useState<MessageAssistResponse | null>(
    null,
  );
  const [sellerInput, setSellerInput] = useState(
    "I cut hair west campus $20 evenings and weekends",
  );
  const [listingDraft, setListingDraft] = useState<ListingAssistResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const verified = utEmail.trim().toLowerCase().endsWith("@utexas.edu");
  const deck = searchResult?.recommendations ?? [];
  const activeCard = deck[deckIndex] ?? null;
  const selectedSaved = saved.find((item) => item.id === activeListingId) ?? null;
  const messages = selectedSaved ? threads[selectedSaved.id] ?? [] : [];

  const stats = useMemo(() => {
    const savedCount = saved.length;
    const averageTrust = savedCount
      ? Math.round(
          saved.reduce((acc, current) => acc + current.trustScore, 0) / savedCount,
        )
      : 0;
    return { savedCount, averageTrust };
  }, [saved]);

  const runSearch = (query: string) => {
    startTransition(async () => {
      try {
        setError(null);
        const result = await postJSON<SearchResult>("/api/ai/search", { query });
        setSearchResult(result);
        setDeckIndex(0);
      } catch (searchError) {
        setError(searchError instanceof Error ? searchError.message : "Search failed.");
      }
    });
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch(searchQuery);
  };

  const handleRefine = (preference: SearchPreference) => {
    startTransition(async () => {
      try {
        setError(null);
        const refined = await postJSON<SearchResult>("/api/ai/refine", {
          query: searchQuery,
          preference,
        });
        setSearchResult(refined);
        setDeckIndex(0);
      } catch (refineError) {
        setError(refineError instanceof Error ? refineError.message : "Refinement failed.");
      }
    });
  };

  const skipRecommendation = () => {
    if (!activeCard) return;
    setDeckIndex((current) => Math.min(current + 1, deck.length - 1));
  };

  const saveRecommendation = () => {
    if (!activeCard) return;
    setSaved((current) => {
      if (current.some((entry) => entry.id === activeCard.id)) return current;
      return [...current, activeCard];
    });
    setActiveListingId(activeCard.id);
    setDeckIndex((current) => Math.min(current + 1, deck.length - 1));
  };

  const selectBookingSlot = (listingId: string, slot: string) => {
    setBookings((current) => ({ ...current, [listingId]: slot }));
  };

  const loadMessageAssist = (listingId: string) => {
    startTransition(async () => {
      try {
        setError(null);
        const assist = await postJSON<MessageAssistResponse>("/api/ai/message-assist", {
          listingId,
        });
        setMessageAssist(assist);
      } catch (assistError) {
        setError(assistError instanceof Error ? assistError.message : "Message assist failed.");
      }
    });
  };

  const sendMessage = () => {
    if (!selectedSaved || !messageDraft.trim()) return;
    const nextMessage: Message = {
      id: `${selectedSaved.id}-${Date.now()}`,
      listingId: selectedSaved.id,
      sender: "buyer",
      body: messageDraft.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
    setThreads((current) => ({
      ...current,
      [selectedSaved.id]: [...(current[selectedSaved.id] ?? []), nextMessage],
    }));
    setMessageDraft("");
  };

  const generateListing = () => {
    startTransition(async () => {
      try {
        setError(null);
        const draft = await postJSON<ListingAssistResponse>(
          "/api/ai/generate-listing",
          { input: sellerInput },
        );
        setListingDraft(draft);
      } catch (draftError) {
        setError(
          draftError instanceof Error ? draftError.message : "Listing assistant failed.",
        );
      }
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10">
      <section className="glass-card animate-float-in rounded-3xl border border-line p-5 sm:p-7">
        <p className="section-label">UT-Exclusive Access</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <h1 className="display-title text-3xl font-semibold sm:text-4xl">
              HornExchange AI Concierge
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Student-only service matching for UT Austin. Describe your need like a text,
              swipe through curated recommendations, save the right provider, and message
              instantly.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-card px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Verification
            </p>
            <input
              value={utEmail}
              onChange={(event) => setUtEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <p
              className={`mt-2 text-sm font-medium ${
                verified ? "text-success" : "text-accent-strong"
              }`}
            >
              {verified ? "Verified UT Student" : "Access gated to utexas.edu emails"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="glass-card rounded-3xl border border-line p-5 sm:p-6">
          <p className="section-label">1. Prompt-First Search</p>
          <form className="mt-3 flex flex-col gap-3" onSubmit={handleSearchSubmit}>
            <textarea
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              rows={3}
              className="warm-scrollbar rounded-2xl border border-line bg-white p-3 text-sm outline-none focus:border-accent sm:text-base"
              placeholder="Need a cheap haircut near West Campus tonight..."
            />
            <button
              type="submit"
              disabled={!verified || isPending}
              className="animate-pulse-glow inline-flex w-fit items-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isPending ? "Interpreting..." : "Find Campus Matches"}
            </button>
          </form>

          {searchResult && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchResult.intent.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-accent-soft bg-card px-3 py-1 text-xs font-semibold text-accent-strong"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}

          {searchResult && (
            <div className="mt-4 flex flex-wrap gap-2">
              {refinementChips.map((chip) => (
                <button
                  type="button"
                  key={chip}
                  onClick={() => handleRefine(chip)}
                  className="rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-muted transition hover:border-accent hover:text-accent-strong"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          <p className="mt-5 section-label">2. Swipe Recommendation Deck</p>
          <div className="mt-3 rounded-3xl border border-line bg-card p-4 sm:p-5">
            {!searchResult && (
              <p className="text-sm text-muted">
                Run a search to enter the recommendation deck and start swiping.
              </p>
            )}

            {searchResult && !activeCard && (
              <p className="text-sm text-muted">
                You reached the end of this recommendation run. Refine the query or
                revisit saved providers.
              </p>
            )}

            {activeCard && (
              <article className="animate-float-in flex flex-col gap-4">
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-strong">
                      {activeCard.category}
                    </p>
                    <h2 className="display-title mt-1 text-2xl font-semibold">
                      {activeCard.serviceTitle}
                    </h2>
                    <p className="text-sm text-muted">
                      {activeCard.providerName} · {activeCard.neighborhood}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-line bg-white px-3 py-2 text-right">
                    <p className="text-xs font-medium text-muted">Match Score</p>
                    <p className="text-xl font-semibold text-accent-strong">
                      {activeCard.matchScore}
                    </p>
                  </div>
                </header>

                <div className="grid gap-2 rounded-2xl border border-line bg-white p-3 text-sm sm:grid-cols-3">
                  <p>
                    <span className="font-semibold">Price:</span> ${activeCard.price}
                  </p>
                  <p>
                    <span className="font-semibold">Trust:</span> {activeCard.trustScore}
                  </p>
                  <p>
                    <span className="font-semibold">Rating:</span> {activeCard.rating} (
                    {activeCard.reviewCount})
                  </p>
                </div>

                <p className="rounded-2xl border border-accent-soft bg-card-strong p-3 text-sm text-accent-strong">
                  Why this match: {activeCard.reason}
                </p>

                <div className="warm-scrollbar max-h-64 space-y-3 overflow-y-auto rounded-2xl border border-line bg-white p-3 text-sm">
                  <p>{activeCard.description}</p>
                  <p className="text-muted">{activeCard.bio}</p>
                  <p className="font-semibold text-accent-strong">Popular reviews</p>
                  {activeCard.reviews.map((review) => (
                    <blockquote key={review.author} className="rounded-xl border border-line p-2">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted">
                        {review.author} · {review.rating} stars
                      </p>
                      <p className="mt-1">&quot;{review.quote}&quot;</p>
                    </blockquote>
                  ))}
                  <p className="font-semibold text-accent-strong">Open slots</p>
                  <div className="flex flex-wrap gap-2">
                    {activeCard.schedule.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => selectBookingSlot(activeCard.id, slot)}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          bookings[activeCard.id] === slot
                            ? "border-accent bg-accent text-white"
                            : "border-line bg-card text-muted"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <footer className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={skipRecommendation}
                    className="rounded-2xl border border-line bg-white px-4 py-2 text-sm font-semibold text-muted transition hover:border-accent"
                  >
                    Swipe Left · Skip
                  </button>
                  <button
                    type="button"
                    onClick={saveRecommendation}
                    className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
                  >
                    Swipe Right · Save
                  </button>
                </footer>
              </article>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <section className="glass-card rounded-3xl border border-line p-5 sm:p-6">
            <p className="section-label">3. Saved Shortlist</p>
            <p className="mt-2 text-sm text-muted">
              Saved providers: {stats.savedCount} · Avg trust:{" "}
              {stats.savedCount ? stats.averageTrust : "N/A"}
            </p>
            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
              {saved.length === 0 && (
                <p className="rounded-xl border border-line bg-white p-3 text-sm text-muted">
                  Swipe right on recommendations to build your shortlist.
                </p>
              )}
              {saved.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveListingId(item.id);
                    loadMessageAssist(item.id);
                  }}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                    item.id === activeListingId
                      ? "border-accent bg-card-strong"
                      : "border-line bg-white"
                  }`}
                >
                  <p className="font-semibold">{item.providerName}</p>
                  <p className="text-muted">
                    {item.serviceTitle} · ${item.price}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-3xl border border-line p-5 sm:p-6">
            <p className="section-label">4. AI-Assisted Messaging</p>
            {!selectedSaved && (
              <p className="mt-2 text-sm text-muted">
                Choose a saved provider to open the messaging lane.
              </p>
            )}
            {selectedSaved && (
              <>
                <p className="mt-2 text-sm text-muted">
                  Booking target:{" "}
                  {bookings[selectedSaved.id]
                    ? bookings[selectedSaved.id]
                    : selectedSaved.schedule[0]}
                </p>
                <div className="mt-3 warm-scrollbar max-h-44 space-y-2 overflow-y-auto rounded-2xl border border-line bg-white p-3">
                  {messages.map((message) => (
                    <p
                      key={message.id}
                      className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                        message.sender === "buyer"
                          ? "ml-auto bg-accent text-white"
                          : "bg-card-strong text-foreground"
                      }`}
                    >
                      {message.body}
                      <span className="mt-1 block text-[10px] opacity-75">
                        {message.timestamp}
                      </span>
                    </p>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {messageAssist?.buyerOpeners.map((opener) => (
                    <button
                      type="button"
                      key={opener}
                      onClick={() => setMessageDraft(opener)}
                      className="rounded-full border border-line bg-white px-3 py-1 text-xs text-muted hover:border-accent"
                    >
                      Use opener
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => loadMessageAssist(selectedSaved.id)}
                    className="rounded-full border border-accent-soft bg-card px-3 py-1 text-xs font-semibold text-accent-strong"
                  >
                    Refresh AI suggestions
                  </button>
                </div>

                <textarea
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                  rows={3}
                  className="mt-3 w-full rounded-2xl border border-line bg-white p-3 text-sm outline-none focus:border-accent"
                  placeholder="Write a quick message..."
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  className="mt-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
                >
                  Send Message
                </button>
              </>
            )}
          </section>

          <section className="glass-card rounded-3xl border border-line p-5 sm:p-6">
            <p className="section-label">5. Seller Listing Copilot</p>
            <textarea
              value={sellerInput}
              onChange={(event) => setSellerInput(event.target.value)}
              rows={3}
              className="mt-3 w-full rounded-2xl border border-line bg-white p-3 text-sm outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={generateListing}
              className="mt-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-accent-strong hover:border-accent"
            >
              Generate polished listing
            </button>
            {listingDraft && (
              <div className="mt-3 space-y-2 rounded-2xl border border-line bg-white p-3 text-sm">
                <p>
                  <span className="font-semibold">Title:</span> {listingDraft.title}
                </p>
                <p>
                  <span className="font-semibold">Category:</span> {listingDraft.category}
                </p>
                <p>
                  <span className="font-semibold">Description:</span>{" "}
                  {listingDraft.description}
                </p>
                <p>
                  <span className="font-semibold">Tags:</span>{" "}
                  {listingDraft.tags.join(", ")}
                </p>
                <p className="rounded-xl border border-accent-soft bg-card p-2 text-accent-strong">
                  {listingDraft.availabilityHint}
                </p>
              </div>
            )}
          </section>
        </div>
      </section>

      {error && (
        <p className="rounded-2xl border border-accent-soft bg-card p-3 text-sm text-accent-strong">
          {error}
        </p>
      )}
    </main>
  );
}
