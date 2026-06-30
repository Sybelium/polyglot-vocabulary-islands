"use client";

import { useState } from "react";
import { buildConjugationRows, displayEnding } from "./conjugationUtils";
import {
  getSpeechLangForTargetLang,
  playConjugationAudio,
} from "./conjugationAudio";

export default function ConjugationPatternTable({
  verb,
  pattern,
  persons,
  tense,
  tenseId = "",
  targetLang = "fr",
}) {
  const [playingId, setPlayingId] = useState(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);

  const speechLang = getSpeechLangForTargetLang(targetLang);
  const rows = buildConjugationRows(verb, pattern, persons, tense);

  function playRow(row) {
    setPlayingId(row.personId);

    playConjugationAudio({
  languageId: targetLang,
  sourceType: "regular",
  tenseId,
  verbId: verb.id,
  personId: row.personId,
  fallbackText: row.spokenForm || row.fullForm,
  speechLang,
  onEnd: () => {
    setTimeout(() => {
      playAllRows(index + 1);
    }, 250);
  },
});
  }

  function playAllRows(index = 0) {
    if (!rows[index]) {
      setPlayingId(null);
      setIsPlayingAll(false);
      return;
    }

    const row = rows[index];

    setIsPlayingAll(true);
    setPlayingId(row.personId);

    speakConjugation(row.spokenForm || row.fullForm, speechLang, () => {
      setTimeout(() => {
        playAllRows(index + 1);
      }, 300);
    });
  }

  if (!verb || !pattern) {
    return null;
  }

  const isCompound = tense?.patternType === "compound";

  return (
    <section className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm md:rounded-3xl md:p-6">
      <div className="mb-3 flex items-center justify-between gap-3 md:mb-5">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wide text-sky-600 md:text-sm">
            Pattern
          </p>

          <h2 className="mt-0.5 truncate text-2xl font-black leading-tight text-slate-900 md:text-3xl">
            {verb.infinitive}
          </h2>

          <p className="mt-1 hidden text-sm text-slate-600 sm:block">
            {isCompound
              ? "Auxiliary in blue, participle in orange."
              : "Root in blue, ending in orange."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => playAllRows(0)}
          disabled={isPlayingAll}
          className="shrink-0 rounded-xl bg-sky-600 px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 md:rounded-2xl md:px-5 md:py-3 md:text-sm"
        >
          {isPlayingAll ? "Playing..." : "▶ Play all"}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <table className="w-full table-fixed border-collapse text-left">
          <colgroup>
            <col className="w-[25%]" />
            <col className="w-[17%]" />
            <col className="w-[17%]" />
            <col className="w-[41%]" />
          </colgroup>

          <thead className="bg-slate-50 text-[9px] uppercase tracking-wide text-slate-500 md:text-xs">
            <tr>
              <th className="px-2 py-2 md:px-4 md:py-3">Pronoun</th>

              <th className="px-1 py-2 md:px-4 md:py-3">
                {isCompound ? "Aux." : "Root"}
              </th>

              <th className="px-1 py-2 md:px-4 md:py-3">
                {isCompound ? "Part." : "Ending"}
              </th>

              <th className="px-1 py-2 md:px-4 md:py-3">
                <span className="sm:hidden">Form</span>
                <span className="hidden sm:inline">Full form</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={row.personId}
                className="border-t border-slate-100 text-slate-800"
              >
                <td className="break-words px-2 py-3 align-middle text-sm font-black leading-tight text-slate-700 md:px-4 md:py-4 md:text-lg">
                  {row.pronoun}
                </td>

                <td className="break-words px-1 py-3 align-middle text-sm font-black leading-tight text-blue-700 md:px-4 md:py-4 md:text-lg">
                  {row.stem}
                </td>

                <td className="break-words px-1 py-3 align-middle text-sm font-black leading-tight text-amber-600 md:px-4 md:py-4 md:text-lg">
                  {displayEnding(row.ending)}
                </td>

                <td className="px-1 py-3 align-middle md:px-4 md:py-4">
                  <div className="flex min-w-0 items-center gap-1 md:gap-3">
                    <span className="min-w-0 flex-1 break-words text-sm font-black leading-tight text-emerald-700 md:text-lg">
                      {row.fullForm}
                    </span>

                    <button
                      type="button"
                      onClick={() => playRow(row)}
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black shadow-sm transition hover:-translate-y-0.5 md:h-10 md:w-10 md:text-sm ${
                        playingId === row.personId
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                      aria-label={`Listen to ${row.spokenForm || row.fullForm}`}
                    >
                      {playingId === row.personId ? "🔊" : "▶"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}