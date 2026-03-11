"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffectEvent } from "react";
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
import {
  readDeckIndex,
  readQuery,
  readSaved,
  readSearchResult,
  readSession,
  writeDeckIndex,
  writeQuery,
  writeSaved,
  writeSearchResult,
} from "@/lib/client-state";
import { RankedRecommendation, SearchResult, ServiceCategory } from "@/lib/types";

type DragState = { x: number; y: number; active: boolean };
type ExitState = "left" | "right" | null;
const previewCardCount = 3;
const swipeExitMs = 460;
const stackFrames = [
  { y: 0, x: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 },
  { y: 28, x: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 },
  { y: 56, x: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 },
  { y: 84, x: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 },
  { y: 112, x: 0, rotate: 0, scale: 1, opacity: 0, blur: 0 },
] as const;

const baseSwipeExamples = [
  "Cheap haircut near West Campus tonight",
  "Resume review from consulting interns",
  "Photographer for org photos this weekend",
  "Move-out help with truck under 35 per hour",
  "Braids before formal near North Campus",
];

const swipeExamples = baseSwipeExamples.map((example) =>
  example.endsWith(".") ? example : `${example}.`,
);
const defaultMapQuery = "Austin, TX";

type ScheduleSuggestion = {
  label: string;
  start: Date;
  end: Date;
};

function formatCalendarDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function buildScheduleSuggestion(category: ServiceCategory): ScheduleSuggestion {
  const now = new Date();
  const start = new Date(now);
  let durationMinutes = 60;

  if (category === "Haircuts") {
    start.setHours(19, 0, 0, 0);
    durationMinutes = 45;
  } else if (category === "Photography") {
    start.setDate(start.getDate() + 1);
    start.setHours(9, 0, 0, 0);
    durationMinutes = 90;
  } else {
    start.setDate(start.getDate() + 1);
    start.setHours(13, 0, 0, 0);
  }

  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const label = start.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return { label, start, end };
}

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

function cleanServiceTitle(title: string) {
  return title.replace(/\s*·\s*\d+\s*$/, "").trim();
}

export default function SwipePage() {
  const router = useRouter();
  const [query, setQuery] = useState(() => readQuery() || "");
  const [focused, setFocused] = useState(false);
  const [loopIndex, setLoopIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "holding" | "fading">("typing");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [promptCursorPosition, setPromptCursorPosition] = useState({ x: 0, y: 0 });
  const [result, setResult] = useState<SearchResult | null>(() => readSearchResult());
  const [saved, setSaved] = useState<RankedRecommendation[]>(() => readSaved());
  const [deckIndex, setDeckIndex] = useState(() => readDeckIndex());
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState>({ x: 0, y: 0, active: false });
  const [exit, setExit] = useState<ExitState>(null);
  const [isPending, startTransition] = useTransition();
  const activeCardRef = useRef<RankedRecommendation | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const measureRootRef = useRef<HTMLSpanElement | null>(null);
  const measureCursorRef = useRef<HTMLSpanElement | null>(null);

  const deck = useMemo(() => result?.recommendations ?? [], [result]);
  const normalizedDeckIndex = deck.length > 0 ? deckIndex % deck.length : 0;
  const activeCard = deck[normalizedDeckIndex] ?? null;
  const upcomingCards = useMemo(() => {
    if (!activeCard || deck.length <= 1) return [];
    const previews: RankedRecommendation[] = [];
    let offset = 1;
    while (previews.length < previewCardCount + 1 && offset <= deck.length + previewCardCount + 1) {
      const index = (normalizedDeckIndex + offset) % deck.length;
      const candidate = deck[index];
      if (candidate && candidate.id !== activeCard.id && !previews.some((entry) => entry.id === candidate.id)) {
        previews.push(candidate);
      }
      offset += 1;
    }
    return previews;
  }, [activeCard, deck, normalizedDeckIndex]);
  const stackedCards = upcomingCards.slice(0, previewCardCount);
  const trailingStackCard = upcomingCards[previewCardCount] ?? null;
  const activeExample = useMemo(
    () => swipeExamples[loopIndex % swipeExamples.length],
    [loopIndex],
  );
  const showExample = query.trim().length === 0 && !focused;
  const showQueryCursor = query.trim().length > 0 && !focused;
  const showDecorativeCursor = showExample || showQueryCursor;
  const typedExample = useMemo(
    () => activeExample.slice(0, reduceMotion ? activeExample.length : charIndex),
    [activeExample, charIndex, reduceMotion],
  );
  const measureText = showExample ? typedExample : query;
  const promptTypographyStyle = useMemo(
    () =>
      ({
        fontSize: "clamp(1.5rem, 3.4vw, 2.35rem)",
        lineHeight: 1.18,
        letterSpacing: "-0.02em",
        fontWeight: 500,
      }) as const,
    [],
  );

  useEffect(() => {
    activeCardRef.current = activeCard;
  }, [activeCard]);

  useEffect(() => {
    const session = readSession();
    if (!session.verified) router.replace("/");
    if (!result) router.replace("/discover");
  }, [result, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mediaQuery.matches);
    apply();
    mediaQuery.addEventListener("change", apply);
    return () => mediaQuery.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (query.trim().length > 0 || focused) return;
    if (reduceMotion) {
      const reducedTimer = window.setInterval(() => {
        setLoopIndex((current) => (current + 1) % swipeExamples.length);
      }, 2300);
      return () => window.clearInterval(reducedTimer);
    }

    if (phase === "typing") {
      const typingTimer = window.setTimeout(() => {
        if (charIndex >= activeExample.length) {
          setPhase("holding");
          return;
        }
        setCharIndex((current) => current + 1);
      }, 32);
      return () => window.clearTimeout(typingTimer);
    }

    if (phase === "holding") {
      const holdTimer = window.setTimeout(() => setPhase("fading"), 760);
      return () => window.clearTimeout(holdTimer);
    }

    const fadeTimer = window.setTimeout(() => {
      setLoopIndex((current) => (current + 1) % swipeExamples.length);
      setCharIndex(0);
      setPhase("typing");
    }, 420);
    return () => window.clearTimeout(fadeTimer);
  }, [activeExample, charIndex, focused, phase, query, reduceMotion]);

  useEffect(() => {
    writeSaved(saved);
  }, [saved]);

  useEffect(() => {
    writeDeckIndex(normalizedDeckIndex);
  }, [normalizedDeckIndex]);

  const measurePromptCursor = useEffectEvent(() => {
    if (!measureRootRef.current || !measureCursorRef.current || !showDecorativeCursor) {
      setPromptCursorPosition({ x: 0, y: 0 });
      return;
    }
    const rootRect = measureRootRef.current.getBoundingClientRect();
    const cursorRect = measureCursorRef.current.getBoundingClientRect();
    setPromptCursorPosition({
      x: Math.max(0, cursorRect.left - rootRect.left),
      y: Math.max(0, cursorRect.top - rootRect.top),
    });
  });

  useEffect(() => {
    measurePromptCursor();
  }, [measureText, showDecorativeCursor, phase, promptTypographyStyle]);

  useEffect(() => {
    if (!showDecorativeCursor) return;
    const onResize = () => measurePromptCursor();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [showDecorativeCursor]);

  const animateAdvance = (direction: ExitState, save: boolean) => {
    const currentCard = activeCardRef.current;
    if (!currentCard) return;
    setExit(direction);
    if (save) {
      setSaved((current) =>
        current.some((entry) => entry.id === currentCard.id)
          ? current
          : [...current, currentCard],
      );
    }
    window.setTimeout(() => {
      setDeckIndex((current) => current + 1);
      setExit(null);
      setExpanded(false);
    }, swipeExitMs);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!activeCard) return;
      if (expanded && event.key === "Escape") {
        event.preventDefault();
        setExpanded(false);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        animateAdvance("left", false);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        animateAdvance("right", true);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeCard, expanded]);

  const startDrag = (event: PointerEvent<HTMLElement>) => {
    dragStart.current = { x: event.clientX, y: event.clientY };
    setDrag({ x: 0, y: 0, active: true });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: PointerEvent<HTMLElement>) => {
    if (!dragStart.current) return;
    setDrag({
      x: event.clientX - dragStart.current.x,
      y: event.clientY - dragStart.current.y,
      active: true,
    });
  };

  const endDrag = () => {
    const deltaX = drag.x;
    dragStart.current = null;
    setDrag({ x: 0, y: 0, active: false });
    if (deltaX >= 92) animateAdvance("right", true);
    if (deltaX <= -92) animateAdvance("left", false);
  };

  const runPromptRefine = (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    const nextQuery = query.trim();
    startTransition(async () => {
      try {
        setError(null);
        const refined = await postJSON<SearchResult>("/api/ai/search", { query: nextQuery });
        setQuery(nextQuery);
        setResult(refined);
        setDeckIndex(0);
        writeQuery(nextQuery);
        writeSearchResult(refined);
      } catch (refineError) {
        setError(refineError instanceof Error ? refineError.message : "Refine failed.");
      }
    });
  };

  const cardStyle: CSSProperties = drag.active
    ? {
        transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 95}deg)`,
        transition: "none",
      }
    : exit === "left"
      ? {
          transform: "translateX(-132%) rotate(-6deg)",
          opacity: 1,
          transition: `transform ${swipeExitMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }
      : exit === "right"
        ? {
            transform: "translateX(132%) rotate(6deg)",
            opacity: 1,
            transition: `transform ${swipeExitMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }
        : {
            transform: "translate3d(0, 0, 0) rotate(0deg)",
            transition: "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
          };

  const savedCount = useMemo(() => saved.length, [saved.length]);
  const scheduleSuggestion = useMemo(
    () => (activeCard ? buildScheduleSuggestion(activeCard.category) : null),
    [activeCard],
  );
  const calendarLink = useMemo(() => {
    if (!activeCard || !scheduleSuggestion) return "#";
    const title = `HornExchange: ${cleanServiceTitle(activeCard.serviceTitle)}`;
    const details = `Book ${activeCard.providerName} for ${activeCard.category.toLowerCase()}.`;
    const dates = `${formatCalendarDate(scheduleSuggestion.start)}/${formatCalendarDate(scheduleSuggestion.end)}`;
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      dates,
      details,
      location: defaultMapQuery,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }, [activeCard, scheduleSuggestion]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className={expanded ? "pointer-events-none select-none blur-md saturate-[0.85]" : ""}>
      <header className="mb-8">
        <div className="mb-5 flex flex-wrap items-center justify-end gap-2">
          <Link
            href="/discover"
            className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-orange-500"
          >
            Back
          </Link>
          <Link
            href="/saved"
            className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-orange-500"
          >
            Saved ({savedCount})
          </Link>
        </div>

        <form onSubmit={runPromptRefine} className="w-full max-w-5xl">
          <div className="relative pb-3">
            <div className="relative min-h-12">
              {showDecorativeCursor && (
                <span
                  aria-hidden
                  className={`pointer-events-none absolute left-0 top-0 w-[2px] rounded-full bg-orange-500 transition-opacity duration-500 ${
                    showQueryCursor || phase === "holding" ? "discover-caret" : ""
                  }`}
                  style={{
                    ...promptTypographyStyle,
                    height: "1.18em",
                    opacity: showExample && phase === "fading" ? 0 : 1,
                    transform: `translate(${promptCursorPosition.x}px, ${promptCursorPosition.y}px)`,
                  }}
                />
              )}
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={focused ? "Describe what you need." : ""}
                className="m-0 w-full bg-transparent p-0 text-zinc-100 caret-orange-500 outline-none transition-[opacity] duration-300 placeholder:text-zinc-600 placeholder:opacity-0 focus:placeholder:opacity-100"
                style={promptTypographyStyle}
                autoComplete="off"
                spellCheck={false}
                aria-label="Refine what you need"
              />
              {showExample && (
                <span
                  key={activeExample}
                  aria-hidden
                  className={`pointer-events-none absolute left-0 top-0 block w-full break-words text-zinc-500 transition-all duration-500 ${
                    phase === "fading" ? "mist-fade-exit" : "mist-fade-enter"
                  }`}
                  style={promptTypographyStyle}
                >
                  {typedExample}
                </span>
              )}
              {showDecorativeCursor && (
                <span
                  aria-hidden
                  ref={measureRootRef}
                  className="pointer-events-none absolute left-0 top-0 block w-full break-words opacity-0"
                  style={promptTypographyStyle}
                >
                  {measureText}
                  <span ref={measureCursorRef} className="inline-block h-[1em] w-0 align-top" />
                </span>
              )}
            </div>
            <button type="submit" className="sr-only">
              Submit
            </button>
          </div>
          {isPending && <p className="mt-2 text-sm text-zinc-400">Refreshing recommendations...</p>}
          {error && <p className="mt-2 text-sm text-orange-300">{error}</p>}
        </form>
      </header>

      <section className="mx-auto w-full max-w-3xl">
        {!activeCard && (
          <div className="ui-surface rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-center text-zinc-400">
            No recommendations yet. Try a refine prompt or go back to discover.
          </div>
        )}

        {activeCard && (
          <div className="relative">
            <article
              className="relative z-30 min-h-[16.5rem] rounded-[2rem] border border-zinc-700 bg-gradient-to-b from-zinc-900 to-black p-5 text-zinc-100 shadow-[0_35px_90px_rgba(0,0,0,0.55)] transition-all duration-200 sm:min-h-[17rem] sm:p-6"
              style={cardStyle}
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onClick={() => setExpanded(true)}
            >
              <header className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-300">
                    {activeCard.category}
                  </p>
                  <h2 className="mt-1 text-3xl font-semibold">{cleanServiceTitle(activeCard.serviceTitle)}</h2>
                  <p className="text-sm text-zinc-400">
                    {activeCard.providerName} · {activeCard.neighborhood}
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-right">
                  <p className="text-2xl font-semibold text-orange-300">${activeCard.price}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">{activeCard.priceUnit}</p>
                </div>
              </header>

              <p className="mt-4 rounded-2xl border border-orange-500/40 bg-orange-500/10 p-3 text-sm text-orange-200">
                {activeCard.reason}
              </p>

              <p className="mt-4 text-sm text-zinc-300">
                Left arrow to skip. Right to save.
              </p>
            </article>

            {stackedCards.map((stackCard, index) => {
              const layer = index + 1;
              const targetLayer = exit ? Math.max(1, layer - 1) : layer;
              const frame = stackFrames[Math.max(0, Math.min(targetLayer, stackFrames.length - 1))];
              return (
                <article
                  key={`${stackCard.id}-stack-${layer}`}
                  className="pointer-events-none absolute inset-0 min-h-[16.5rem] rounded-[2rem] border border-zinc-800 bg-gradient-to-b from-zinc-900/95 to-black/90 p-5 text-zinc-100 shadow-[0_24px_55px_rgba(0,0,0,0.4)] sm:min-h-[17rem] sm:p-6"
                  style={{
                    transform: `translate(${frame.x}px, ${frame.y}px) rotate(${frame.rotate}deg) scale(${frame.scale})`,
                    opacity: frame.opacity,
                    filter: `blur(${frame.blur}px)`,
                    zIndex: 18 - targetLayer,
                    transition:
                      `transform ${swipeExitMs}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${swipeExitMs}ms ease, filter ${swipeExitMs}ms ease`,
                  }}
                >
                  <header className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-300/85">
                        {stackCard.category}
                      </p>
                      <h3 className="mt-1 text-2xl font-semibold text-zinc-100/92">
                        {cleanServiceTitle(stackCard.serviceTitle)}
                      </h3>
                      <p className="text-sm text-zinc-400/90">
                        {stackCard.providerName} · {stackCard.neighborhood}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-zinc-700 bg-zinc-900/90 px-3 py-2 text-right">
                      <p className="text-xl font-semibold text-orange-300/90">${stackCard.price}</p>
                      <p className="text-[11px] text-zinc-400/85">{stackCard.priceUnit}</p>
                    </div>
                  </header>
                </article>
              );
            })}
            {trailingStackCard && (
              <article
                key={`${trailingStackCard.id}-stack-trailing`}
                className="pointer-events-none absolute inset-0 min-h-[16.5rem] rounded-[2rem] border border-zinc-800 bg-gradient-to-b from-zinc-900/95 to-black/90 p-5 text-zinc-100 shadow-[0_24px_55px_rgba(0,0,0,0.4)] sm:min-h-[17rem] sm:p-6"
                style={{
                  transform: `translate(${(exit ? stackFrames[3] : stackFrames[4]).x}px, ${(exit ? stackFrames[3] : stackFrames[4]).y}px) rotate(${(exit ? stackFrames[3] : stackFrames[4]).rotate}deg) scale(${(exit ? stackFrames[3] : stackFrames[4]).scale})`,
                  opacity: (exit ? stackFrames[3] : stackFrames[4]).opacity,
                  filter: `blur(${(exit ? stackFrames[3] : stackFrames[4]).blur}px)`,
                  zIndex: 14,
                  transition:
                    `transform ${swipeExitMs}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${swipeExitMs}ms ease, filter ${swipeExitMs}ms ease`,
                }}
              />
            )}
          </div>
        )}
      </section>
      </div>

      {expanded && activeCard && (
        <div
          className="ui-surface fixed inset-0 z-50 overflow-hidden p-2 sm:p-3"
          onClick={() => setExpanded(false)}
        >
          <div className="flex h-full items-start justify-center pt-1 sm:pt-2">
            <div
              className="glass-card h-auto max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-zinc-600/55 bg-[linear-gradient(180deg,rgba(17,18,20,0.5),rgba(10,11,13,0.38))] p-5 shadow-[0_26px_70px_rgba(0,0,0,0.45)] animate-float-in"
              style={{ maxHeight: "calc(100vh - 12px)" }}
              onClick={(event) => event.stopPropagation()}
            >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-orange-300">{activeCard.category}</p>
                <h3 className="mt-1 text-3xl font-semibold text-zinc-100">{cleanServiceTitle(activeCard.serviceTitle)}</h3>
                <p className="text-sm text-zinc-400">{activeCard.providerName} · {activeCard.neighborhood}</p>
              </div>
              <p className="rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-300">
                ${activeCard.price} {activeCard.priceUnit}
              </p>
            </div>

            <p className="mt-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-200">
              Why this match: {activeCard.reason}. Based on category fit, location match, price fit, availability, and trust score.
            </p>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
              <div className="space-y-3 text-sm text-zinc-300">
                <p>{activeCard.description}</p>
                <iframe
                  title="Map preview"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(defaultMapQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  className="h-72 w-full rounded-2xl border border-zinc-700/80"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Reviewer feedback</p>
                <div className="mt-2 space-y-2">
                  {activeCard.reviews.map((review) => (
                    <div key={review.author} className="rounded-xl border border-zinc-700/80 bg-zinc-900/45 p-3 text-sm text-zinc-300 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <img src={review.avatarUrl ?? ""} alt={review.author} className="h-8 w-8 rounded-full border border-zinc-700" />
                        <p className="text-xs text-zinc-500">{review.author} · {review.rating.toFixed(1)}/5 stars</p>
                      </div>
                      <p className="mt-1">&quot;{review.quote}&quot;</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {scheduleSuggestion && (
              <div className="mt-5 rounded-2xl border border-zinc-700/80 bg-zinc-900/45 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Suggested schedule</p>
                <p className="mt-2 text-sm font-semibold text-orange-300">{scheduleSuggestion.label}</p>
                <a
                  href={calendarLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex rounded-full border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-300 hover:bg-orange-500/10"
                >
                  Schedule appointment
                </a>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={`/chats?listingId=${activeCard.id}`}
                className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-black"
              >
                Message provider
              </Link>
              <button
                type="button"
                onClick={() =>
                  setSaved((current) =>
                    current.some((entry) => entry.id === activeCard.id) ? current : [...current, activeCard],
                  )
                }
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-orange-500"
              >
                Save for later
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
