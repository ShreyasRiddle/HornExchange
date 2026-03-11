"use client";

import { useEffect } from "react";

export function CursorAura() {
  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
      const target = event.target as HTMLElement | null;
      const overUi = Boolean(target?.closest(".ui-surface"));
      document.documentElement.style.setProperty("--cursor-aura-opacity", overUi ? "0" : "1");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return null;
}
