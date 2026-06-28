"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ROMANCE_LANGS,
  ROMANCE_LANG_LABELS,
  buildPolyglotRows,
  getPolyglotSourceBadges,
  resolvePolyglotConjugation,
} from "./polyglotConjugationUtils";

const SPEECH_LANGS = {
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-PT",
};

function speak(text, lang) {
  if (typeof window === "undefined") return;
  if (!window.speechSynthesis || !text) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = SPEECH_LANGS[lang] || "en-US";
  utterance.rate = 0.9;

  window.speechSynthesis.speak(utterance);
}

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
    <span className="mt-1 inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-500">
      {label}
    </span>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
      <p className="text-lg font-black text-slate-800">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  );
}

function SpeakButton({ text, lang }) {
  if (!text) return null;

  return (
    <button
      type="button"
      onClick={() => speak(text, lang)}
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] shadow-sm transition hover:bg-slate-50"
      aria-label={`Listen to ${text}`}
      title="Listen"
    >
      🔊
    </button>
  );
}

function FormCell({ text, lang, isInfinitive }) {
  if (!text) {
    return <span className="text-slate-300">—</span>;
  }

  if (isInfinitive) {
    return (
      <div className="flex items-center justify-between gap-2">
        <span className="text-base font-black text-indigo-700">{text}</span>
        <SpeakButton text={text} lang={lang} />
      </div>
    );
  }

  const { pronoun, form } = splitPronounAndVerb(text);

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="min-w-0">
        {pronoun && (
          <span className="mr-2 text-xs font-bold text-slate-400">
            {pronoun}
          </span>
        )}
        <span className="text-base font-black text-slate-900">{form}</span>
      </span>

      <SpeakButton text={text} lang={lang} />
    </div>
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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
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
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-500">
          Polyglot
        </p>
        <h3 className="mt-1 text-2xl font-black text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">
          Compare the infinitive and full forms across French, Spanish, Italian,
          and Portuguese.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-[820px] w-full border-collapse bg-white text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-36 border-b border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500">
                Form
              </th>

              {ROMANCE_LANGS.map((lang) => (
                <th
                  key={lang}
                  className="border-b border-slate-200 px-4 py-3 text-sm font-black text-slate-800"
                >
                  <div className="flex flex-col items-start">
                    <span>{ROMANCE_LANG_LABELS[lang] || lang}</span>
                    <SourceBadge source={sourceBadges[lang]} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => {
              const isInfinitive = row.id === "infinitive";

              return (
                <tr
                  key={row.id}
                  className={isInfinitive ? "bg-indigo-50/50" : "bg-white"}
                >
                  <th className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-700">
                    {row.label}
                  </th>

                  {ROMANCE_LANGS.map((lang) => (
                    <td
                      key={`${row.id}-${lang}`}
                      className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800"
                    >
                      <FormCell
                        text={row.cells?.[lang]}
                        lang={lang}
                        isInfinitive={isInfinitive}
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
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-black">
            Some language columns are not available for this tense.
          </p>

          <p className="mt-1 font-semibold">
            This does not necessarily mean there is an error. Some languages do
            not use the same tense in exactly the same way, and some equivalent
            tenses are not included in the current trainer data yet.
          </p>
        </div>
      )}
    </section>
  );
}
