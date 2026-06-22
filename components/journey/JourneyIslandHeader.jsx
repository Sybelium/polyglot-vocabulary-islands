"use client";

import { useState } from "react";

export default function JourneyIslandHeader({ island, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 overflow-hidden rounded-[1.5rem] bg-white shadow-xl md:mb-6 md:rounded-[2rem]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 bg-white px-4 py-3 text-left hover:bg-sky-50 md:px-6 md:py-4"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-2xl md:text-3xl">{island.icon}</span>

          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wide text-blue-600 md:text-xs">
              A0 Journey Island
            </p>

            <h2 className="truncate text-lg font-black text-blue-950 md:text-2xl">
              {island.title}
            </h2>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-blue-50 px-3 py-2 text-xs font-black text-blue-900 md:px-4 md:text-sm">
          {open ? "Hide ▲" : "Show ▼"}
        </span>
      </button>

      {open && (
        <div className="border-t border-sky-100">
          <div className="relative h-36 sm:h-44 md:h-64">
            <img
              src={island.cover}
              alt={island.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-blue-950/10" />
          </div>

          <div className="p-4 md:p-6">
            <p className="text-xs font-black uppercase tracking-wide text-blue-600">
              {island.title}
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-600 md:text-base">
              Complete the tabs below to master this island.
            </p>

            <div className="mt-4 rounded-2xl bg-sky-50 p-3 text-sm font-bold text-slate-700">
              {(island.wordIds || []).length} words · 1 song · 1 challenge
            </div>
          </div>
        </div>
      )}
    </div>
  );
}