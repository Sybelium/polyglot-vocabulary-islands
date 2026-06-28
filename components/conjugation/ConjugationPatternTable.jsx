"use client";

import { useState } from "react";
import { buildConjugationRows, displayEnding } from "./conjugationUtils";
import { speakConjugation } from "./conjugationAudio";

export default function ConjugationPatternTable({
  verb,
  pattern,
  persons,
  tense,
  targetLang = "fr",
}) {
  const [playingId, setPlayingId] = useState(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);

  const speechLangByTargetLang = {
    fr: "fr-FR",
    es: "es-ES",
    it: "it-IT",
    pt: "pt-PT",
  };

  const speechLang = speechLangByTargetLang[targetLang] || "fr-FR";

  function playRow(row) {
    setPlayingId(row.personId);

    speakConjugation(row.spokenForm || row.fullForm, speechLang, () => {
      setPlayingId(null);
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
      }, 350);
    });
  }
  
    const rows = buildConjugationRows(verb, pattern, persons, tense);

  if (!verb || !pattern) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
  <div>
    <p className="text-sm font-black uppercase tracking-wide text-sky-600">
      Pattern
    </p>

    <h2 className="mt-1 text-2xl font-black text-slate-900">
      {verb.infinitive}
    </h2>

    <p className="mt-2 text-sm text-slate-600">
      {tense?.patternType === "compound"
        ? "Auxiliary in blue, participle in orange."
        : "Root in blue, ending in orange."}
    </p>
  </div>

  <button
    type="button"
    onClick={() => playAllRows(0)}
    disabled={isPlayingAll}
    className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {isPlayingAll ? "Playing..." : "▶️ Play all"}
  </button>
</div>

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Pronoun</th>
<th className="px-4 py-3">
  {tense?.patternType === "compound" ? "Auxiliary" : "Root"}
</th>
<th className="px-4 py-3">
  {tense?.patternType === "compound" ? "Participle" : "Ending"}
</th>
<th className="px-4 py-3">Full form</th>
            </tr>
          </thead>

          <tbody>
  {rows.map((row) => (
    <tr
      key={row.personId}
      className="border-t border-slate-100 text-slate-800"
    >
      <td className="px-4 py-4 text-lg font-bold text-slate-700">
        {row.pronoun}
      </td>

      <td className="px-4 py-4 text-lg font-black text-blue-700">
        {row.stem}
      </td>

      <td className="px-4 py-4 text-lg font-black text-amber-600">
        {displayEnding(row.ending)}
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black text-emerald-700">
            {row.fullForm}
          </span>

          <button
            type="button"
            onClick={() => playRow(row)}
            className={`rounded-full px-3 py-2 text-sm font-black shadow-sm transition hover:-translate-y-0.5 ${
              playingId === row.personId
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            aria-label={`Listen to ${row.spokenForm || row.fullForm}`}
          >
            {playingId === row.personId ? "🔊" : "▶️"}
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