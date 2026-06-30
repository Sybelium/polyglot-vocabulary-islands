"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ROMANCE_LANGS,
  ROMANCE_LANG_LABELS,
  buildPolyglotRows,
  getPolyglotSourceBadges,
  resolvePolyglotConjugation,
} from "./polyglotConjugationUtils";
import {
  getSpeechLangForTargetLang,
  playConjugationAudio,
} from "../conjugationAudio";

function splitPronounAndVerb(text) {
  if (!text) return { pronoun: "", form: "" };

  const value = String(text).trim();

  if (!value.includes(" ")) {
    return { pronoun: "", form: value };
  }

  const parts = value.split(/\s+/);
  const pronoun = parts.shift();
  const form = parts.join(" ");

  return { pronoun, form };
}

function SourceBadge({ source }) {
  if (!source) return null;

  const label = source === "irregular" ? "irregular" : "regular";

  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-slate-500">
      {label}
    </span>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-center shadow-sm">
      <p className="text-base font-black text-slate-800">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  );
}

function SpeakButton({
  text,
  lang,
  sourceType,
  tenseId,
  verbId,
  personId = "",
}) {
  if (!text) return null;

  return (
    <button
      type="button"
      onClick={() =>
        playConjugationAudio({
          languageId: lang,
          sourceType,
          tenseId,
          verbId,
          personId,
          fallbackText: text,
          speechLang: getSpeechLangForTargetLang(lang),
        })
      }
      className="inline-grid h-7 w-7 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-[10px] shadow-sm transition hover:bg-slate-50"
      aria-label={`Listen to ${text}`}
      title="Listen"
    >
      🔊
    </button>
  );
}

function FormCell({
  text,
  lang,
  isInfinitive,
  compact = false,
  sourceType,
  tenseId,
  verbId,
  personId = "",
}) {
  if (!text) {
    return <span className="text-slate-300">—</span>;
  }

  if (isInfinitive) {
    return (
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span
          className={`min-w-0 break-words font-black text-indigo-700 ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          {text}
        </span>

        <SpeakButton
  text={text}
  lang={lang}
  sourceType={sourceType}
  tenseId={tenseId}
  verbId={verbId}
  personId={personId}
/>
      </div>
    );
  }

  const { pronoun, form } = splitPronounAndVerb(text);

  return (
    <div className="flex min-w-0 items-center justify-between gap-2">
      <span className="min-w-0 break-words">
        {pronoun && (
          <span
            className={`mr-1 font-bold text-slate-400 ${
              compact ? "text-[11px]" : "text-xs"
            }`}
          >
            {pronoun}
          </span>
        )}

        <span
          className={`font-black text-slate-900 ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          {form}
        </span>
      </span>

      <SpeakButton
  text={text}
  lang={lang}
  sourceType={sourceType}
  tenseId={tenseId}
  verbId={verbId}
  personId={personId}
/>
    </div>
  );
}

function MobileLanguageCard({ lang, rows, source, resolution, tenseId }) {
  const languageName = ROMANCE_LANG_LABELS[lang] || lang;
  const languageData = resolution?.languages?.[lang];
  const verbId = languageData?.verb?.id || "";
  const infinitiveRow = rows.find((row) => row.id === "infinitive");
  const formRows = rows.filter((row) => row.id !== "infinitive");

  return (
    <article className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-indigo-500">
            {lang.toUpperCase()}
          </p>

          <h4 className="text-base font-black text-slate-900">
            {languageName}
          </h4>
        </div>

        <SourceBadge source={source} />
      </header>

      <div className="divide-y divide-slate-100">
        {infinitiveRow && (
          <div className="grid grid-cols-[5.5rem_1fr] items-center gap-2 bg-indigo-50/50 px-3 py-2">
            <span className="text-xs font-black text-slate-500">
              Infinitive
            </span>

            <FormCell
  text={infinitiveRow.cells?.[lang]}
  lang={lang}
  isInfinitive
  compact
  sourceType={source}
  tenseId={tenseId}
  verbId={verbId}
/>
          </div>
        )}

        {formRows.map((row) => (
          <div
            key={`${lang}-${row.id}`}
            className="grid grid-cols-[5.5rem_1fr] items-center gap-2 px-3 py-2"
          >
            <span className="text-xs font-black text-slate-500">
              {row.label}
            </span>

            <FormCell
  text={row.cells?.[lang]}
  lang={lang}
  isInfinitive={false}
  compact
  sourceType={source}
  tenseId={tenseId}
  verbId={verbId}
/>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function PolyglotConjugationTable({ polyglotId, tenseId }) {
  const [resolution, setResolution] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!polyglotId || !tenseId) {
        setResolution(null);
        setStatus("idle");
        setError("");
        return;
      }

      try {
        setStatus("loading");
        setError("");

        const result = await resolvePolyglotConjugation(polyglotId, tenseId);

        if (!cancelled) {
          setResolution(result);
          setStatus("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setResolution(null);
          setStatus("error");
          setError(err?.message || "Could not load polyglot comparison.");
        }
      }
    }

    load();

    return () => {
      cancelled = true;

      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [polyglotId, tenseId]);

  const rows = useMemo(() => buildPolyglotRows(resolution), [resolution]);

  const sourceBadges = useMemo(
    () => getPolyglotSourceBadges(resolution),
    [resolution]
  );

  if (!polyglotId) {
    return (
      <EmptyState
        title="Polyglot comparison not available yet"
        message="This verb does not have a polyglotId yet."
      />
    );
  }

  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-500">
          Loading polyglot comparison…
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        title="Polyglot comparison could not load"
        message={error || "Please check the polyglot data files."}
      />
    );
  }

  if (!resolution?.ok || rows.length === 0) {
    return (
      <EmptyState
        title="Polyglot comparison not available"
        message="No matching forms were found for this verb and tense."
      />
    );
  }

  const title =
    resolution.entry?.meaning?.en ||
    resolution.entry?.id?.replaceAll("_", " ") ||
    "Polyglot comparison";

  return (
    <section className="rounded-2xl border border-indigo-100 bg-white p-3 shadow-sm md:rounded-3xl md:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wide text-indigo-500 md:text-sm">
            Polyglot
          </p>

          <h3 className="truncate text-2xl font-black leading-tight text-slate-900 md:text-3xl">
            {title}
          </h3>

          <p className="mt-1 text-xs font-semibold text-slate-500 md:text-sm">
            Compare French, Spanish, Italian, and Portuguese.
          </p>
        </div>

        <div className="hidden shrink-0 rounded-2xl bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700 sm:block">
          {resolution.availableCount}/4
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {ROMANCE_LANGS.map((lang) => (
          <MobileLanguageCard
  key={lang}
  lang={lang}
  rows={rows}
  source={sourceBadges[lang]}
  resolution={resolution}
  tenseId={tenseId}
/>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 md:block">
        <table className="w-full min-w-[760px] border-collapse bg-white text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-32 border-b border-slate-200 px-3 py-3 text-xs font-black uppercase tracking-wide text-slate-500">
                Form
              </th>

              {ROMANCE_LANGS.map((lang) => (
                <th
                  key={lang}
                  className="border-b border-slate-200 px-3 py-3 text-sm font-black text-slate-800"
                >
                  <div className="flex flex-col items-start gap-1">
                    <span>{ROMANCE_LANG_LABELS[lang] || lang}</span>
                    <SourceBadge source={sourceBadges[lang]} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const isInfinitive = row.id === "infinitive";

              return (
                <tr
                  key={row.id}
                  className={isInfinitive ? "bg-indigo-50/50" : "bg-white"}
                >
                  <th className="border-b border-slate-100 px-3 py-3 text-sm font-black text-slate-700">
                    {row.label}
                  </th>

                  {ROMANCE_LANGS.map((lang) => (
                    <td
                      key={`${row.id}-${lang}`}
                      className="border-b border-slate-100 px-3 py-3 text-sm font-semibold text-slate-800"
                    >
                      <FormCell
  text={row.cells?.[lang]}
  lang={lang}
  isInfinitive={isInfinitive}
  sourceType={sourceBadges[lang]}
  tenseId={tenseId}
  verbId={resolution.languages?.[lang]?.verb?.id || ""}
/>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {resolution.missingCount > 0 && (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 md:text-sm">
          <p className="font-black">
            Some language columns are not available for this tense.
          </p>

          <p className="mt-1 font-semibold">
            Some equivalent tenses are not included in the current trainer data
            yet.
          </p>
        </div>
      )}
    </section>
  );
}