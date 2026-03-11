"use client";

import Link from "next/link";
import {
  CSSProperties,
  FormEvent,
  PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
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
const savedStorageKey = "hx-saved";
const bookingStorageKey = "hx-bookings";
const threadStorageKey = "hx-threads";
const listingStorageKey = "hx-active-listing";

const refinementChips: SearchPreference[] = [
  "Cheaper",
  "Closer",
  "More Trusted",
  "Available Sooner",
  "Not This Vibe",
];

type BookingMap = Record<string, string>;
type ThreadMap = Record<string, Message[]>;
type AppView = "search" | "chats";

type HornExchangeAppProps = {
  initialView?: AppView;
};

type DragState = {
  x: number;
  y: number;
  isDragging: boolean;
};

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

export function HornExchangeApp({ initialView = "search" }: HornExchangeAppProps) {
  const [view, setView] = useState<AppView>(initialView);
  const [utEmail, setUtEmail] = useState("shreyas@utexas.edu");
  const [searchQuery, setSearchQuery] = useState(starterPrompt);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [deckIndex, setDeckIndex] = useState(0);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
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
  const [listingDraft, setListingDraft] = useState<ListingAssistResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState>({ x: 0, y: 0, isDragging: false });
  const [isPending, startTransition] = useTransition();
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const verified = utEmail.trim().toLowerCase().endsWith("@utexas.edu");
  const deck = searchResult?.recommendations ?? [];
  const activeCard = deck[deckIndex] ?? null;
  const nextCard = deck[deckIndex + 1] ?? null;
  const selectedSaved = saved.find((item) => item.id === activeListingId) ?? null;
  const messages = selectedSaved ? threads[selectedSaved.id] ?? [] : [];
  const detailsExpanded = activeCard ? expandedCardId === activeCard.id : false;

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedRaw = window.localStorage.getItem(savedStorageKey);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw) as RankedRecommendation[];
        if (Array.isArray(parsed)) {
          setSaved(parsed);
        }
      }

      const bookingsRaw = window.localStorage.getItem(bookingStorageKey);
      if (bookingsRaw) {
        const parsed = JSON.parse(bookingsRaw) as BookingMap;
        if (parsed && typeof parsed === "object") {
          setBookings(parsed);
        }
      }

      const threadsRaw = window.localStorage.getItem(threadStorageKey);
      if (threadsRaw) {
        const parsed = JSON.parse(threadsRaw) as ThreadMap;
        if (parsed && typeof parsed === "object") {
          setThreads(parsed);
        }
      }

      const listingRaw = window.localStorage.getItem(listingStorageKey);
      if (listingRaw) {
        setActiveListingId(listingRaw);
      }
    } catch {
      // Ignore malformed local demo data and continue with defaults.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(savedStorageKey, JSON.stringify(saved));
  }, [saved]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(bookingStorageKey, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(threadStorageKey, JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeListingId) {
      window.localStorage.setItem(listingStorageKey, activeListingId);
      return;
    }
    window.localStorage.removeItem(listingStorageKey);
  }, [activeListingId]);

  useEffect(() => {
    if (!activeCard) return;
    setExpandedCardId(null);
  }, [deckIndex, activeCard]);

  useEffect(() => {
    if (!activeListingId && saved.length > 0) {
      setActiveListingId(saved[0].id);
    }
  }, [activeListingId, saved]);

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
    setDeckIndex((current) => current + 1);
  };

  const saveRecommendation = () => {
    if (!activeCard) return;
    setSaved((current) => {
      if (current.some((entry) => entry.id === activeCard.id)) return current;
      return [...current, activeCard];
    });
    setActiveListingId(activeCard.id);
    setDeckIndex((current) => current + 1);
  };

  const expandRecommendation = () => {
    if (!activeCard) return;
    setExpandedCardId(activeCard.id);
  };

  const runSwipeAction = (deltaX: number, deltaY: number) => {
    if (deltaY <= -90) {
      expandRecommendation();
      return;
    }
    if (deltaX >= 90) {
      saveRecommendation();
      return;
    }
    if (deltaX <= -90) {
      skipRecommendation();
      return;
    }
  };

  const startDrag = (event: PointerEvent<HTMLElement>) => {
    dragStart.current = { x: event.clientX, y: event.clientY };
    setDrag({ x: 0, y: 0, isDragging: true });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: PointerEvent<HTMLElement>) => {
    if (!dragStart.current) return;
    setDrag({
      x: event.clientX - dragStart.current.x,
      y: event.clientY - dragStart.current.y,
      isDragging: true,
    });
  };

  const endDrag = () => {
    runSwipeAction(drag.x, drag.y);
    dragStart.current = null;
    setDrag({ x: 0, y: 0, isDragging: false });
  };

  const cancelDrag = () => {
    dragStart.current = null;
    setDrag({ x: 0, y: 0, isDragging: false });
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
        const draft = await postJSON<ListingAssistResponse>("/api/ai/generate-listing", {
          input: sellerInput,
        });
        setListingDraft(draft);
      } catch (draftError) {
        setError(
          draftError instanceof Error ? draftError.message : "Listing assistant failed.",
        );
      }
    });
  };

  const dragStyle: CSSProperties = drag.isDragging
    ? {
        transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 18}deg)`,
        transition: "none",
      }
    : {};

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-4 py-5 sm:px-6">
      <section className="glass-card rounded-3xl border border-line p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-label">UT Concierge</p>
            <h1 className="display-title mt-2 text-3xl font-semibold sm:text-4xl">
              HornExchange AI
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Prompt-first campus search, swipe through ranked providers, then chat with
              your saved shortlist.
            </p>
          </div>
          <div className="w-full rounded-2xl border border-line bg-card px-4 py-3 sm:w-72">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              UT Verification
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

        <nav className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-line bg-white p-1">
          <Link
            href="/"
            onClick={() => setView("search")}
            className={`rounded-xl px-3 py-2 text-center text-sm font-semibold ${
              view === "search"
                ? "bg-accent text-white"
                : "text-muted transition hover:text-accent-strong"
            }`}
          >
            Search
          </Link>
          <Link
            href="/chats"
            onClick={() => setView("chats")}
            className={`rounded-xl px-3 py-2 text-center text-sm font-semibold ${
              view === "chats"
                ? "bg-accent text-white"
                : "text-muted transition hover:text-accent-strong"
            }`}
          >
            Chats
          </Link>
        </nav>
      </section>

      {view === "search" && (
        <section className="grid gap-4">
          <section className="glass-card rounded-3xl border border-line p-5 sm:p-7">
            <p className="section-label">1. Prompt-First Search</p>
            <form className="mt-3 flex flex-col gap-3" onSubmit={handleSearchSubmit}>
              <textarea
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                rows={4}
                className="warm-scrollbar rounded-3xl border border-line bg-white p-4 text-base outline-none focus:border-accent"
                placeholder="Describe exactly what you need. Example: haircut under $25 in West Campus tonight with strong reviews."
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={!verified || isPending}
                  className="animate-pulse-glow rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isPending ? "Interpreting..." : "Search Providers"}
                </button>
                <button
                  type="button"
                  onClick={() => setSearchQuery(starterPrompt)}
                  className="rounded-full border border-line bg-white px-5 py-2 text-sm font-semibold text-muted"
                >
                  Demo prompt
                </button>
              </div>
            </form>

            {searchResult && (
              <>
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
                <div className="mt-3 flex flex-wrap gap-2">
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
              </>
            )}
          </section>

          <section className="glass-card rounded-3xl border border-line p-5 sm:p-6">
            <p className="section-label">2. Tinder-Style Swipe Deck</p>
            {!searchResult && (
              <p className="mt-3 text-sm text-muted">
                Run a search first, then swipe left to skip, right to save, or up to
                reveal details.
              </p>
            )}

            {searchResult && !activeCard && (
              <div className="mt-3 rounded-2xl border border-line bg-white p-4 text-sm text-muted">
                End of deck. Refine your query or switch to Chats to message saved
                providers.
              </div>
            )}

            {activeCard && (
              <div className="mt-3 space-y-3">
                {nextCard && (
                  <article className="rounded-3xl border border-line bg-card p-4 opacity-55">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      Up next
                    </p>
                    <p className="mt-1 font-semibold">
                      {nextCard.providerName} - {nextCard.serviceTitle}
                    </p>
                  </article>
                )}

                <article
                  className="animate-float-in rounded-3xl border border-line bg-white p-4 sm:p-5"
                  style={dragStyle}
                  onPointerDown={startDrag}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={cancelDrag}
                >
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-strong">
                        {activeCard.category}
                      </p>
                      <h2 className="display-title mt-1 text-2xl font-semibold">
                        {activeCard.serviceTitle}
                      </h2>
                      <p className="text-sm text-muted">
                        {activeCard.providerName} - {activeCard.neighborhood}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-line bg-card px-3 py-2 text-right">
                      <p className="text-xs font-medium text-muted">Match</p>
                      <p className="text-xl font-semibold text-accent-strong">
                        {activeCard.matchScore}
                      </p>
                    </div>
                  </header>

                  <div className="mt-3 grid gap-2 rounded-2xl border border-line bg-card p-3 text-sm sm:grid-cols-2">
                    <p>
                      <span className="font-semibold">Price:</span> ${activeCard.price}
                    </p>
                    <p>
                      <span className="font-semibold">Location:</span>{" "}
                      {activeCard.neighborhood}
                    </p>
                  </div>

                  {!detailsExpanded && (
                    <p className="mt-3 rounded-2xl border border-accent-soft bg-card-strong p-3 text-sm text-accent-strong">
                      Swipe up for ratings, reviews, schedule, trust, bio, and why-match
                      details.
                    </p>
                  )}

                  {detailsExpanded && (
                    <div className="mt-3 warm-scrollbar max-h-72 space-y-3 overflow-y-auto rounded-2xl border border-line bg-card p-3 text-sm">
                      <p className="rounded-xl border border-accent-soft bg-white p-2 text-accent-strong">
                        Why this match: {activeCard.reason}
                      </p>
                      <p>
                        <span className="font-semibold">Trust:</span> {activeCard.trustScore}
                        {"  "}
                        <span className="font-semibold">Rating:</span> {activeCard.rating} (
                        {activeCard.reviewCount})
                      </p>
                      <p>{activeCard.description}</p>
                      <p className="text-muted">{activeCard.bio}</p>
                      <p className="font-semibold text-accent-strong">Reviews</p>
                      {activeCard.reviews.map((review) => (
                        <blockquote key={review.author} className="rounded-xl border border-line p-2">
                          <p className="text-xs uppercase tracking-[0.14em] text-muted">
                            {review.author} - {review.rating} stars
                          </p>
                          <p className="mt-1">&quot;{review.quote}&quot;</p>
                        </blockquote>
                      ))}
                      <p className="font-semibold text-accent-strong">Schedule</p>
                      <div className="flex flex-wrap gap-2">
                        {activeCard.schedule.map((slot) => (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => selectBookingSlot(activeCard.id, slot)}
                            className={`rounded-full border px-3 py-1 text-xs ${
                              bookings[activeCard.id] === slot
                                ? "border-accent bg-accent text-white"
                                : "border-line bg-white text-muted"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <footer className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={skipRecommendation}
                      className="rounded-2xl border border-line bg-white px-3 py-2 text-xs font-semibold text-muted sm:text-sm"
                    >
                      Swipe Left
                    </button>
                    <button
                      type="button"
                      onClick={expandRecommendation}
                      className="rounded-2xl border border-line bg-card px-3 py-2 text-xs font-semibold text-accent-strong sm:text-sm"
                    >
                      Swipe Up
                    </button>
                    <button
                      type="button"
                      onClick={saveRecommendation}
                      className="rounded-2xl bg-accent px-3 py-2 text-xs font-semibold text-white sm:text-sm"
                    >
                      Swipe Right
                    </button>
                  </footer>
                </article>
              </div>
            )}
          </section>

          <section className="glass-card rounded-3xl border border-line p-5 sm:p-6">
            <p className="section-label">Seller Listing Copilot</p>
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
        </section>
      )}

      {view === "chats" && (
        <section className="grid gap-4">
          <section className="glass-card rounded-3xl border border-line p-5 sm:p-6">
            <p className="section-label">3. Chats</p>
            <p className="mt-2 text-sm text-muted">
              Saved providers: {stats.savedCount} - Avg trust:{" "}
              {stats.savedCount ? stats.averageTrust : "N/A"}
            </p>

            <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.35fr]">
              <aside className="space-y-2">
                {saved.length === 0 && (
                  <p className="rounded-xl border border-line bg-white p-3 text-sm text-muted">
                    No saved profiles yet. Go to Search and swipe right to build your chat
                    lane.
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
                      {item.serviceTitle} - ${item.price}
                    </p>
                  </button>
                ))}
              </aside>

              <div className="rounded-2xl border border-line bg-white p-3 sm:p-4">
                {!selectedSaved && (
                  <p className="text-sm text-muted">
                    Select a saved provider to open DMs and AI-assisted openers.
                  </p>
                )}
                {selectedSaved && (
                  <>
                    <p className="text-sm text-muted">
                      Booking target:{" "}
                      {bookings[selectedSaved.id]
                        ? bookings[selectedSaved.id]
                        : selectedSaved.schedule[0]}
                    </p>
                    <div className="mt-3 warm-scrollbar max-h-56 space-y-2 overflow-y-auto rounded-2xl border border-line bg-card p-3">
                      {messages.map((message) => (
                        <p
                          key={message.id}
                          className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                            message.sender === "buyer"
                              ? "ml-auto bg-accent text-white"
                              : "bg-white text-foreground"
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
                          className="rounded-full border border-line bg-card px-3 py-1 text-xs text-muted hover:border-accent"
                        >
                          {opener.slice(0, 42)}
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
                      className="mt-3 w-full rounded-2xl border border-line bg-card p-3 text-sm outline-none focus:border-accent"
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
              </div>
            </div>
          </section>
        </section>
      )}

      {error && (
        <p className="rounded-2xl border border-accent-soft bg-card p-3 text-sm text-accent-strong">
          {error}
        </p>
      )}
    </main>
  );
}
