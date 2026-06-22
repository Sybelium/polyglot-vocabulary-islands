"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "polyglotJourneyProgress";

function readProgress(lang) {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const progress = raw ? JSON.parse(raw) : {};
    return progress?.[lang] || {};
  } catch {
    return {};
  }
}

export default function A0JourneyProgress({ lang, islands }) {
  const [progressMap, setProgressMap] = useState({});

  useEffect(() => {
    setProgressMap(readProgress(lang));
  }, [lang]);

  const summary = useMemo(() => {
    const completedCount = islands.filter(
      (island) => progressMap?.[island.id]?.completed
    ).length;

    const nextIsland =
      islands.find((island) => !progressMap?.[island.id]?.completed) ||
      islands[0];

    return {
      completedCount,
      totalCount: islands.length,
      nextIsland,
    };
  }, [islands, progressMap]);

  const percent =
    summary.totalCount > 0
      ? Math.round((summary.completedCount / summary.totalCount) * 100)
      : 0;

  return (
    <section className="mt-6 rounded-[2rem] bg-white/90 p-5 shadow-xl backdrop-blur md:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-blue-600">
            Your journey
          </p>

          <h2 className="mt-1 text-2xl font-black text-blue-950 md:text-3xl">
            {summary.completedCount} / {summary.totalCount} islands completed
          </h2>

          <p className="mt-2 text-sm font-semibold text-slate-600">
            Keep going island by island. Complete the Song Challenge to mark an
            island as finished.
          </p>
        </div>

        {summary.nextIsland ? (
          <Link
            href={`/${lang}/journey/a0/${summary.nextIsland.id}`}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white shadow transition hover:bg-blue-700 active:scale-[0.98]"
          >
            Continue: {summary.nextIsland.title} →
          </Link>
        ) : null}
      </div>

      <div className="mt-5">
        <div className="h-4 overflow-hidden rounded-full bg-sky-100">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>{percent}% complete</span>
          <span>{summary.totalCount - summary.completedCount} left</span>
        </div>
      </div>
    </section>
  );
}