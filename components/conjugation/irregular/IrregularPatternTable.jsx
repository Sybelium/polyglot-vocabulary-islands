"use client";

import { useMemo, useState } from "react";
import {
  getSpeechLangForTargetLang,
  playConjugationAudio,
} from "../conjugationAudio";
import { buildIrregularRows } from "./irregularConjugationUtils";
import { splitIrregularForm } from "./irregularConjugationUtils";

export default function IrregularPatternTable({
  verb,
  tense,
  persons,
  tenseId = "",
  targetLang = "fr",
}) {
  const [playingId, setPlayingId] = useState(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);

  const speechLang = getSpeechLangForTargetLang(targetLang);

  const rows = useMemo(() => buildIrregularRows(verb, tense, persons), [verb, tense, persons]);
  const isCompound = tense?.patternType === "compound";

  function playRow(row) {
  setPlayingId(row.personId);

  playConjugationAudio({
    languageId: targetLang,
    sourceType: "irregular",
    tenseId,
    verbId: verb.id,
    personId: row.personId,
    fallbackText: row.spokenForm || row.fullForm,
    speechLang,
    onEnd: () => {
      setPlayingId(null);
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

    playConjugationAudio({
  languageId: targetLang,
  sourceType: "irregular",
  tenseId,
  verbId: verb.id,
  personId: row.personId,
  fallbackText: row.spokenForm || row.fullForm,
  speechLang,
  onEnd: () => {
    setTimeout(() => playAllRows(index + 1), 250);
  },
});
  }

  if (!rows.length) return null;

  return (
    <section className="mt-8 rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-sky-600">Pattern</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">{verb.infinitive}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {isCompound ? "Auxiliary in blue, participle in orange." : "Irregular form in green."}
          </p>

          {isCompound && verb.compound?.note?.en && (
            <p className="mt-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              {verb.compound.note.en}
            </p>
          )}
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

      <div className="overflow-hidden rounded-3xl border border-slate-100">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Pronoun</th>
              {isCompound ? (
                <>
                  <th className="px-4 py-3">Auxiliary</th>
                  <th className="px-4 py-3">Participle</th>
                </>
              ) : (
                <th className="px-4 py-3">Form</th>
              )}
              <th className="px-4 py-3">Full form</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.personId} className="border-t border-slate-100">
                <td className="px-4 py-4 text-lg font-black text-slate-700">{row.pronoun}</td>
                {isCompound ? (
                  <>
                    <td className="px-4 py-4 text-lg font-black text-blue-700">{row.auxiliary}</td>
                    <td className="px-4 py-4 text-lg font-black text-orange-600">{row.participle}</td>
                  </>
                ) : (
                  <td className="px-4 py-4 text-lg font-black text-emerald-700">{row.form}</td>
                )}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-emerald-700">{row.fullForm}</span>
                    <button
                      type="button"
                      onClick={() => playRow(row)}
                      className="rounded-full bg-slate-100 px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                    >
                      {playingId === row.personId ? "…" : "▶️"}
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
