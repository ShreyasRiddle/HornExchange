"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffectEvent } from "react";
import { FormEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  appendPromptHistory,
  readQuery,
  readSession,
  writeDeckIndex,
  writeQuery,
  writeSearchResult,
} from "@/lib/client-state";
import { SearchResult } from "@/lib/types";

const baseExampleQueries = [
  "Resume review from consulting interns near McCombs",
  "Photographer for a club photoshoot this weekend",
  "Dance venue rentals near campus for a mixer",
  "Cheap haircut near West Campus tonight under 25",
  "Moving help for a West Campus lease turnover this Saturday",
  "Last-minute formal braids near North Campus tomorrow",
  "Mock interview prep for product roles this week",
  "Gym accountability coach near Guadalupe after 6pm",
  "Portfolio photoshoot around UT Tower golden hour",
  "Organic chemistry tutor who can meet tonight",
  "LinkedIn headshots with fast edits before career fair",
  "Affordable manicure appointment before formal weekend",
  "MCAT study planner in Austin for spring break prep",
  "Dorm move-out truck help under $35 per hour",
  "Grad photo mini-session near Littlefield Fountain",
  "Speech coach for class presentations this week",
];

const exampleQueries = baseExampleQueries.map((example) =>
  example.trim().endsWith(".") ? example.trim() : `${example.trim()}.`,
);

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

export default function DiscoverPage() {
  const router = useRouter();
  const [query, setQuery] = useState(() => readQuery() || "");
  const [focused, setFocused] = useState(false);
  const [loopIndex, setLoopIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "holding" | "fading">("typing");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exampleCursorPosition, setExampleCursorPosition] = useState({ x: 0, y: 0 });
  const [isPending, startTransition] = useTransition();

  const activeExample = useMemo(
    () => exampleQueries[loopIndex % exampleQueries.length],
    [loopIndex],
  );

  useEffect(() => {
    const session = readSession();
    if (!session.verified) {
      router.replace("/");
    }
  }, [router]);

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
        setLoopIndex((current) => (current + 1) % exampleQueries.length);
      }, 2600);
      return () => window.clearInterval(reducedTimer);
    }

    if (phase === "typing") {
      const typingTimer = window.setTimeout(() => {
        if (charIndex >= activeExample.length) {
          setPhase("holding");
          return;
        }
        setCharIndex((current) => current + 1);
      }, 42);
      return () => window.clearTimeout(typingTimer);
    }

    if (phase === "holding") {
      const holdTimer = window.setTimeout(() => setPhase("fading"), 920);
      return () => window.clearTimeout(holdTimer);
    }

    const fadeTimer = window.setTimeout(() => {
      setLoopIndex((current) => (current + 1) % exampleQueries.length);
      setCharIndex(0);
      setPhase("typing");
    }, 480);
    return () => window.clearTimeout(fadeTimer);
  }, [activeExample, charIndex, focused, phase, query, reduceMotion]);

  const runSearch = (event: FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        setError(null);
        const result = await postJSON<SearchResult>("/api/ai/search", { query });
        writeQuery(query);
        writeSearchResult(result);
        writeDeckIndex(0);
        appendPromptHistory(query);
        router.push("/swipe");
      } catch (searchError) {
        setError(searchError instanceof Error ? searchError.message : "Unable to run query.");
      }
    });
  };

  const showExample = query.trim().length === 0 && !focused;
  const typedExample = useMemo(
    () => activeExample.slice(0, reduceMotion ? activeExample.length : charIndex),
    [activeExample, charIndex, reduceMotion],
  );
  const promptTypographyStyle = useMemo(
    () =>
      ({
        fontSize: "clamp(2.4rem, 4.8vw, 4.25rem)",
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        fontWeight: 500,
      }) as const,
    [],
  );
  const measurementRootRef = useRef<HTMLSpanElement | null>(null);
  const measurementCursorRef = useRef<HTMLSpanElement | null>(null);

  const measureExampleCursor = useEffectEvent(() => {
    if (!measurementRootRef.current || !measurementCursorRef.current || !showExample) {
      setExampleCursorPosition({ x: 0, y: 0 });
      return;
    }
    const rootRect = measurementRootRef.current.getBoundingClientRect();
    const cursorRect = measurementCursorRef.current.getBoundingClientRect();
    setExampleCursorPosition({
      x: Math.max(0, cursorRect.left - rootRect.left),
      y: Math.max(0, cursorRect.top - rootRect.top),
    });
  });

  useEffect(() => {
    measureExampleCursor();
  }, [typedExample, showExample, phase, promptTypographyStyle]);

  useEffect(() => {
    if (!showExample) return;
    const onResize = () => measureExampleCursor();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [showExample]);

  return (
    <main className="page-shell mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6">
      <header className="mb-7 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">HornExchange</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-100">
            Discover with <span className="text-orange-400">one</span> prompt<span className="text-orange-400">.</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/chats"
            className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-orange-500"
          >
            Previous chats
          </Link>
          <Link
            href="/saved"
            className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-orange-500"
          >
            Saved
          </Link>
          <Link
            href="/seller"
            className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-orange-500"
          >
            Seller
          </Link>
        </div>
      </header>

      <section className="flex w-full max-w-6xl flex-1 items-start pt-8 sm:pt-12">
        <form onSubmit={runSearch} className="w-full">
          <div className="relative pb-4">
            <div className="relative min-h-16">
              {showExample && (
                <span
                  aria-hidden
                  className={`pointer-events-none absolute left-0 top-0 w-[2px] rounded-full bg-orange-500 transition-opacity duration-500 ${
                    phase === "typing" ? "" : phase === "holding" ? "discover-caret" : ""
                  }`}
                  style={{
                    ...promptTypographyStyle,
                    height: "1.15em",
                    opacity: phase === "fading" ? 0 : 1,
                    transform: `translate(${exampleCursorPosition.x}px, ${exampleCursorPosition.y}px)`,
                  }}
                />
              )}
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={focused ? "Describe what you need." : ""}
                className="m-0 w-full bg-transparent p-0 text-zinc-100 caret-orange-500 outline-none transition-[color,opacity] duration-300 placeholder:text-zinc-600 placeholder:opacity-0 focus:placeholder:opacity-100"
                style={promptTypographyStyle}
                autoComplete="off"
                spellCheck={false}
                aria-label="Describe the service you need"
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
              {showExample && (
                <span
                  aria-hidden
                  ref={measurementRootRef}
                  className="pointer-events-none absolute left-0 top-0 block w-full break-words opacity-0"
                  style={promptTypographyStyle}
                >
                  {typedExample}
                  <span ref={measurementCursorRef} className="inline-block h-[1em] w-0 align-top" />
                </span>
              )}
            </div>
            <button type="submit" className="sr-only">
              Submit
            </button>
          </div>
          {isPending && <p className="mt-4 text-sm text-zinc-400">Generating recommendations...</p>}
          {error && <p className="mt-4 text-sm text-orange-300">{error}</p>}
        </form>
      </section>
    </main>
  );
}
