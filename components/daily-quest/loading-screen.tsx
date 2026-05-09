"use client";

import { ListChecks } from "lucide-react";

export function LoadingScreen() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#f7f8f5] px-4">
      <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-soft">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="text-sm font-medium text-zinc-700">Memuat Daily Quest</span>
      </div>
    </main>
  );
}
