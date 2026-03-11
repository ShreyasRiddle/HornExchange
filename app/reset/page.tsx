"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearClientState } from "@/lib/client-state";

export default function ResetPage() {
  const router = useRouter();

  useEffect(() => {
    clearClientState();
    router.replace("/");
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-8">
      <p className="text-sm text-zinc-400">Clearing local demo state...</p>
    </main>
  );
}
