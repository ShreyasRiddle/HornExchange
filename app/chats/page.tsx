"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { readSaved, readSession, readThreads, writeThreads } from "@/lib/client-state";
import { serviceListings, starterThreads } from "@/lib/seed-data";
import { Message, MessageAssistResponse, RankedRecommendation } from "@/lib/types";

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

export default function ChatsPage() {
  const router = useRouter();
  const [saved] = useState<RankedRecommendation[]>(() => readSaved());
  const [threads, setThreads] = useState(() => ({ ...starterThreads, ...readThreads() }));
  const [manualSelectedListingId, setManualSelectedListingId] = useState<string | null>(null);
  const [messageAssist, setMessageAssist] = useState<MessageAssistResponse | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const session = readSession();
    if (!session.verified) {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    writeThreads(threads);
  }, [threads]);

  const listingMap = useMemo(() => {
    const map = new Map<string, RankedRecommendation>();
    for (const item of saved) map.set(item.id, item);
    for (const item of serviceListings) {
      if (!map.has(item.id)) {
        map.set(item.id, { ...item, matchScore: 0, reason: "Saved conversation" });
      }
    }
    return map;
  }, [saved]);

  const threadIds = useMemo(() => {
    const ordered = new Set<string>();
    for (const item of saved) ordered.add(item.id);
    for (const id of Object.keys(threads)) ordered.add(id);
    return Array.from(ordered);
  }, [saved, threads]);

  const search = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      window.addEventListener("popstate", onStoreChange);
      return () => window.removeEventListener("popstate", onStoreChange);
    },
    () => (typeof window === "undefined" ? "" : window.location.search),
    () => "",
  );

  const requestedListingId = useMemo(
    () => new URLSearchParams(search).get("listingId"),
    [search],
  );

  const selectedListingId = useMemo(() => {
    if (requestedListingId && threadIds.includes(requestedListingId)) return requestedListingId;
    if (manualSelectedListingId && threadIds.includes(manualSelectedListingId)) {
      return manualSelectedListingId;
    }
    return threadIds[0] ?? null;
  }, [manualSelectedListingId, requestedListingId, threadIds]);

  const selectedListing = selectedListingId ? listingMap.get(selectedListingId) ?? null : null;
  const messages = selectedListingId ? threads[selectedListingId] ?? [] : [];

  const loadAssist = () => {
    if (!selectedListingId) return;
    startTransition(async () => {
      try {
        setError(null);
        const result = await postJSON<MessageAssistResponse>("/api/ai/message-assist", {
          listingId: selectedListingId,
        });
        setMessageAssist(result);
      } catch (assistError) {
        setError(assistError instanceof Error ? assistError.message : "Assist failed.");
      }
    });
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedListingId || !draft.trim()) return;
    const nextMessage: Message = {
      id: `${selectedListingId}-${Date.now()}`,
      listingId: selectedListingId,
      sender: "buyer",
      body: draft.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    };
    setThreads((current) => ({
      ...current,
      [selectedListingId]: [...(current[selectedListingId] ?? []), nextMessage],
    }));
    setDraft("");
  };

  return (
    <main className="page-shell mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">HornExchange</p>
          <h1 className="mt-1 text-3xl font-semibold text-zinc-100">Messages</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/discover" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-orange-500">
            Discover
          </Link>
          <Link href="/saved" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-orange-500">
            Saved
          </Link>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[330px_1fr]">
        <aside className="ui-surface rounded-3xl border border-zinc-800 bg-zinc-950 p-3">
          <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Previous chats</p>
          <div className="warm-scrollbar max-h-[65vh] space-y-2 overflow-y-auto pr-1">
            {threadIds.length === 0 && (
              <div className="rounded-2xl border border-zinc-800 p-3 text-sm text-zinc-400">
                No chats yet. Save a provider from swipe to start.
              </div>
            )}
            {threadIds.map((listingId) => {
              const listing = listingMap.get(listingId);
              const preview = (threads[listingId] ?? []).at(-1)?.body ?? "No messages yet";
              return (
                <button
                  key={listingId}
                  type="button"
                  onClick={() => setManualSelectedListingId(listingId)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    selectedListingId === listingId
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                  }`}
                >
                  <p className="text-sm font-semibold text-zinc-100">{listing?.providerName ?? "UT Provider"}</p>
                  <p className="text-xs text-zinc-400">{listing?.serviceTitle ?? "Service listing"}</p>
                  <p className="mt-1 truncate text-xs text-zinc-500">{preview}</p>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="ui-surface rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          {!selectedListingId && (
            <div className="flex h-full min-h-[55vh] items-center justify-center text-zinc-400">
              Select a chat to continue.
            </div>
          )}
          {selectedListingId && (
            <div className="flex h-full min-h-[55vh] flex-col">
              <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <p className="text-lg font-semibold text-zinc-100">{selectedListing?.providerName ?? "UT Provider"}</p>
                  <p className="text-xs text-zinc-400">{selectedListing?.serviceTitle ?? "Service listing"}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={loadAssist}
                    className="rounded-full border border-orange-500 px-3 py-1 text-xs font-semibold text-orange-300"
                  >
                    {isPending ? "Loading..." : "AI draft"}
                  </button>
                  {selectedListing && (
                    <Link
                      href={`/saved/${selectedListing.id}`}
                      className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:border-orange-500"
                    >
                      View profile
                    </Link>
                  )}
                </div>
              </div>

              <div className="warm-scrollbar flex-1 space-y-2 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3">
                {messages.length === 0 && (
                  <p className="text-sm text-zinc-500">No messages yet. Start the conversation below.</p>
                )}
                {messages.map((message) => (
                  <p
                    key={message.id}
                    className={`max-w-[88%] rounded-xl px-3 py-2 text-sm ${
                      message.sender === "buyer"
                        ? "ml-auto bg-orange-500 text-black"
                        : "bg-zinc-800 text-zinc-200"
                    }`}
                  >
                    {message.body}
                    <span className="mt-1 block text-[10px] opacity-70">{message.timestamp}</span>
                  </p>
                ))}
              </div>

              {messageAssist && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {messageAssist.buyerOpeners.map((opener) => {
                    const compactPreview =
                      opener.length > 42 ? `${opener.slice(0, 42).trimEnd()}...` : opener;
                    return (
                      <button
                        key={opener}
                        type="button"
                        onClick={() => setDraft(opener)}
                        className="max-w-full truncate rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300"
                        title={opener}
                      >
                        {compactPreview}
                      </button>
                    );
                  })}
                </div>
              )}

              <form onSubmit={sendMessage} className="mt-3 space-y-2">
                <textarea
                  rows={3}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Message this provider..."
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-100 outline-none focus:border-orange-500"
                />
                <button type="submit" className="w-full rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-black">
                  Send message
                </button>
              </form>
              {error && <p className="mt-2 text-sm text-orange-300">{error}</p>}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
