"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ENGLISH_SUBJECTS,
  ENGLISH_TENSE_COLUMNS,
  ENGLISH_TENSE_ROWS,
  ENGLISH_TENSES,
  buildEnglishTenseForm,
} from "@/lib/irregular-verbs/englishTwelveTenses";

export default function EnglishTwelveTensesPanel({
  verb,
  listFile = "irregular-verbs-50.json",
  onClose,
}) {
  const [subjectId, setSubjectId] = useState("i");
  const [mobileColumn, setMobileColumn] = useState("present");

  if (!verb) return null;

  function tenseHref(tenseId) {
    const params = new URLSearchParams({
      verb: verb.id,
      subject: subjectId,
      list: listFile,
    });

    return `/irregular-verbs/en/tenses/${tenseId}?${params.toString()}`;
  }

  return (
    <section className="mt-6 rounded-[2rem] border border-indigo-100 bg-white p-4 shadow-md md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-indigo-600">
            English 12 tenses
          </p>

          <h2 className="mt-1 text-3xl font-black text-slate-950">
            {verb.base}
          </h2>

          <p className="mt-1 text-sm font-bold text-slate-500">
            {verb.translations?.fr || "Irregular verb"} · {verb.display}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="self-start rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-600 transition hover:bg-slate-200"
        >
          Close
        </button>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
          Subject
        </p>

        <div className="flex flex-wrap gap-1">
          {ENGLISH_SUBJECTS.map((subject) => {
            const active = subject.id === subjectId;

            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => setSubjectId(subject.id)}
                className={`rounded-full px-3 py-2 text-xs font-black transition ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {subject.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
        <table className="w-full table-fixed border-collapse text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="w-44 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500">
                Aspect
              </th>

              {ENGLISH_TENSE_COLUMNS.map((column) => (
                <th
                  key={column.id}
                  className="px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {ENGLISH_TENSE_ROWS.map((row) => (
              <tr key={row.id} className="border-t border-slate-200">
                <th className="bg-slate-50 px-4 py-4 text-sm font-black text-slate-700">
                  {row.label}
                </th>

                {ENGLISH_TENSE_COLUMNS.map((column) => {
                  const tenseId = row.cells[column.id];
                  const tense = ENGLISH_TENSES[tenseId];
                  const form = buildEnglishTenseForm({
                    verb,
                    subjectId,
                    tenseId,
                  });

                  return (
                    <td key={tenseId} className="px-3 py-3">
                      <Link
                        href={tenseHref(tenseId)}
                        className="block rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md"
                      >
                        <p className="text-xs font-black uppercase tracking-wide text-indigo-600">
                          {tense.label}
                        </p>

                        <p className="mt-2 text-lg font-black leading-tight text-slate-950">
                          {form}
                        </p>
                      </Link>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden">
        <div className="mb-3 grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1">
          {ENGLISH_TENSE_COLUMNS.map((column) => {
            const active = mobileColumn === column.id;

            return (
              <button
                key={column.id}
                type="button"
                onClick={() => setMobileColumn(column.id)}
                className={`rounded-xl px-2 py-2 text-xs font-black ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-700"
                }`}
              >
                {column.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-2">
          {ENGLISH_TENSE_ROWS.map((row) => {
            const tenseId = row.cells[mobileColumn];
            const tense = ENGLISH_TENSES[tenseId];
            const form = buildEnglishTenseForm({
              verb,
              subjectId,
              tenseId,
            });

            return (
              <Link
                key={tenseId}
                href={tenseHref(tenseId)}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm"
              >
                <p className="text-xs font-black uppercase tracking-wide text-indigo-600">
                  {tense.label}
                </p>

                <p className="mt-2 text-xl font-black text-slate-950">
                  {form}
                </p>

                <p className="mt-1 text-xs font-bold text-slate-500">
                  Tap to open the lesson.
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}