"use client";

import { useRouter } from "next/navigation";
import { SENTENCE_LANGUAGES } from "./sentenceUtils";

export default function SentenceTopControls({ lang, subjectId, step, themes }) {
  const router = useRouter();

  function goTo(nextLang, nextSubjectId) {
    router.push(`/sentences/${nextLang}/${nextSubjectId}/${step}`);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]">
      <label className="block">
        <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
          Target language
        </span>

        <select
          value={lang}
          onChange={(event) => goTo(event.target.value, subjectId)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-black text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        >
          {SENTENCE_LANGUAGES.map((language) => (
            <option key={language.id} value={language.id}>
              {language.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
          Subject
        </span>

        <select
          value={subjectId}
          onChange={(event) => goTo(lang, event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-black text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
        >
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.icon} {theme.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}