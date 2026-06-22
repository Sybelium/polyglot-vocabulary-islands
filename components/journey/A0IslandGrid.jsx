"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "polyglotJourneyProgress";

function readCompletedIslands(lang) {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const progress = raw ? JSON.parse(raw) : {};
    return progress?.[lang] || {};
  } catch {
    return {};
  }
}

export default function A0IslandGrid({ lang, islands }) {
  const [completedMap, setCompletedMap] = useState({});

  useEffect(() => {
    setCompletedMap(readCompletedIslands(lang));
  }, [lang]);

  return (
    <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {islands.map((island, index) => {
        const isCompleted = Boolean(completedMap?.[island.id]?.completed);

        return (
          <Link
            key={island.id}
            href={`/${lang}/journey/a0/${island.id}`}
            className="group overflow-hidden rounded-[2rem] bg-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="relative h-36 bg-sky-300 sm:h-44">
              <img
                src={island.cover}
                alt={island.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-blue-950/15" />

              

              {isCompleted ? (
                <div className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-2xl bg-green-500 text-3xl font-black text-white shadow">
                  ✓
                </div>
              ) : (
                <div className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/90 text-3xl shadow">
                  {island.icon}
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-black text-blue-950">
                {island.title}
              </h3>

              <p className="mt-2 text-sm font-semibold text-slate-600">
                {(island.wordIds || []).length} words · 1 song · 1 challenge
              </p>

              <div
                className={[
                  "mt-5 inline-flex rounded-full px-4 py-2 text-sm font-black text-white transition",
                  isCompleted
                    ? "bg-green-500 group-hover:bg-green-600"
                    : "bg-blue-600 group-hover:bg-blue-700",
                ].join(" ")}
              >
                {isCompleted ? "Completed ✓" : "Enter island →"}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}