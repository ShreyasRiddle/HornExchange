"use client";

import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import { ListingAssistResponse } from "@/lib/types";

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

export default function SellerPage() {
  const [input, setInput] = useState("I cut hair in West Campus for $20 and can do evenings.");
  const [draft, setDraft] = useState<ListingAssistResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const generate = (event: FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        setError(null);
        const result = await postJSON<ListingAssistResponse>("/api/ai/generate-listing", {
          input,
        });
        setDraft(result);
      } catch (draftError) {
        setError(draftError instanceof Error ? draftError.message : "Unable to generate draft.");
      }
    });
  };

  return (
    <main className="page-shell mx-auto min-h-screen w-full max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Seller Copilot</p>
          <h1 className="mt-1 text-3xl font-semibold text-zinc-100">Turn rough notes into a polished listing</h1>
        </div>
        <Link href="/saved" className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-orange-500">
          Back
        </Link>
      </header>

      <section className="ui-surface rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
        <form onSubmit={generate} className="space-y-3">
          <textarea
            rows={4}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 p-4 text-zinc-100 outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-black disabled:opacity-70"
          >
            {isPending ? "Generating draft..." : "Generate listing draft"}
          </button>
        </form>

        {draft && (
          <div className="mt-4 space-y-2 rounded-2xl border border-zinc-700 bg-zinc-900 p-4 text-sm text-zinc-200">
            <p><span className="text-zinc-500">Title:</span> {draft.title}</p>
            <p><span className="text-zinc-500">Category:</span> {draft.category}</p>
            <p><span className="text-zinc-500">Description:</span> {draft.description}</p>
            <p><span className="text-zinc-500">Tags:</span> {draft.tags.join(", ")}</p>
            <p className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-2 text-orange-200">
              {draft.availabilityHint}
            </p>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-orange-300">{error}</p>}
      </section>
    </main>
  );
}
