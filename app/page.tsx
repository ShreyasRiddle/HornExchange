"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { readSession, writeSession } from "@/lib/client-state";

export default function Home() {
  const [email, setEmail] = useState(() => readSession().email || "student@utexas.edu");
  const [verified, setVerified] = useState(() => readSession().verified);
  const [attempted, setAttempted] = useState(false);

  const verifyEmail = (event: FormEvent) => {
    event.preventDefault();
    const pass = email.trim().toLowerCase().endsWith("@utexas.edu");
    setAttempted(true);
    setVerified(pass);
    writeSession({ email, verified: pass });
  };

  return (
    <main className="page-shell mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 sm:px-6">
      <section className="ui-surface w-full max-w-4xl overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
        <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden border-b border-zinc-800 bg-gradient-to-br from-orange-700 via-orange-600 to-orange-500 p-8 text-white md:border-b-0 md:border-r md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-100">
              UT Austin Only
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              HornExchange
            </h1>
            <p className="mt-4 max-w-md text-sm text-orange-50 sm:text-base">
              A modern campus concierge for trusted student services. Find the right
              provider fast, swipe to shortlist, and book with confidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-2 text-xs">
              {["Trust-first matching", "Swipe recommendations", "AI-assisted messaging"].map(
                (pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-orange-200/30 bg-black/20 px-3 py-1"
                  >
                    {pill}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="bg-zinc-950 p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
              Step 1
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Verify your UT account
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Use your `@utexas.edu` email to enter the marketplace.
            </p>

            <form onSubmit={verifyEmail}>
              <label className="mt-7 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                UT Email
              </label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-zinc-100 outline-none transition focus:border-orange-500"
                placeholder="you@utexas.edu"
              />
              <button
                type="submit"
                className="mt-3 w-full rounded-xl border border-orange-500/50 bg-zinc-900 px-4 py-2 text-sm font-semibold text-orange-200 hover:bg-zinc-800"
              >
                Verify account
              </button>
            </form>
            {attempted && (
              <p className={`mt-2 text-sm ${verified ? "text-emerald-400" : "text-orange-300"}`}>
                {verified
                  ? "Verification passed. Continue to concierge query."
                  : "Only @utexas.edu accounts can continue."}
              </p>
            )}

            <Link
              href={verified ? "/discover" : "#"}
              onClick={() => writeSession({ email, verified })}
              className={`mt-7 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                verified
                  ? "bg-orange-500 text-black hover:bg-orange-400"
                  : "cursor-not-allowed bg-zinc-800 text-zinc-500"
              }`}
            >
              Continue to discovery
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
