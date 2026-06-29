"use client";

import Link from "next/link";

export const LATIN_CONJUGATION_LANGUAGES = [
  { id: "fr", label: "French", short: "FR" },
  { id: "es", label: "Spanish", short: "ES" },
  { id: "it", label: "Italian", short: "IT" },
  { id: "pt", label: "Portuguese", short: "PT" },
];

export default function ConjugationAppControls({
  selectedLang,
  onLanguageChange,
  activeType = "regular",
}) {
  const typeTabs = [
    {
      id: "regular",
      label: "Regular",
      href: "/conjugation/regular",
    },
    {
      id: "irregular",
      label: "Irregular",
      href: "/conjugation/irregular",
    },
  ];

  return (
    <section className="mb-3 rounded-2xl border border-sky-100 bg-white/95 p-2 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 px-1">
          <p className="text-[10px] font-black uppercase tracking-wide text-sky-700">
            Latin Conjugation
          </p>

          <h1 className="truncate text-lg font-black leading-tight text-slate-950">
            {activeType === "regular" ? "Regular verbs" : "Irregular verbs"}
          </h1>
        </div>

        <div className="grid min-w-[170px] grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
          {typeTabs.map((tab) => {
            const isActive = activeType === tab.id;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`rounded-xl px-2 py-2 text-center text-xs font-black transition ${
                  isActive
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-sky-50"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1">
        {LATIN_CONJUGATION_LANGUAGES.map((language) => {
          const isActive = selectedLang === language.id;

          return (
            <button
              key={language.id}
              type="button"
              onClick={() => onLanguageChange(language.id)}
              className={`rounded-xl px-2 py-2 text-center text-xs font-black transition ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
              }`}
            >
              <span>{language.short}</span>
<span className="sr-only">{language.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}