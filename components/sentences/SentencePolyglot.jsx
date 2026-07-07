"use client";

import { useMemo, useState } from "react";
import { SENTENCE_LANGUAGES, getSentenceText } from "./sentenceUtils";
import useSentenceAudio from "./useSentenceAudio";

export default function SentencePolyglot({ subjectId, sentences }) {
  const [activeLanguageIds, setActiveLanguageIds] = useState(() =>
    SENTENCE_LANGUAGES.map((language) => language.id)
  );

  const enAudio = useSentenceAudio({ lang: "en", subjectId });
  const frAudio = useSentenceAudio({ lang: "fr", subjectId });
  const esAudio = useSentenceAudio({ lang: "es", subjectId });
  const itAudio = useSentenceAudio({ lang: "it", subjectId });
  const ptAudio = useSentenceAudio({ lang: "pt", subjectId });
  const deAudio = useSentenceAudio({ lang: "de", subjectId });
  const nlAudio = useSentenceAudio({ lang: "nl", subjectId });

  const audioByLanguage = {
    en: enAudio,
    fr: frAudio,
    es: esAudio,
    it: itAudio,
    pt: ptAudio,
    de: deAudio,
    nl: nlAudio,
  };

  const activeLanguages = useMemo(() => {
    return SENTENCE_LANGUAGES.filter((language) =>
      activeLanguageIds.includes(language.id)
    );
  }, [activeLanguageIds]);

  function toggleLanguage(languageId) {
    setActiveLanguageIds((currentIds) => {
      if (currentIds.includes(languageId)) {
        return currentIds.filter((id) => id !== languageId);
      }

      return [...currentIds, languageId];
    });
  }

  function showAllLanguages() {
    setActiveLanguageIds(SENTENCE_LANGUAGES.map((language) => language.id));
  }

  function stopAllAudio() {
    Object.values(audioByLanguage).forEach((audioPlayer) => {
      audioPlayer.stopAudio();
    });
  }

  function playSentenceBox(sentence, languageId) {
    const audioPlayer = audioByLanguage[languageId];
    const text = getSentenceText(sentence, languageId);

    if (!audioPlayer || !text) return;

    stopAllAudio();

    audioPlayer.playSentence(sentence, {
      text,
    });
  }

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/95 p-4 shadow-xl md:p-6">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-sky-600">
            Polyglot
          </p>

          <h2 className="text-2xl font-black leading-tight text-slate-950 md:text-3xl">
            Compare languages
          </h2>

          <p className="mt-1 text-sm font-bold text-slate-500 md:text-base">
            Choose languages, then click any sentence to hear it.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          {SENTENCE_LANGUAGES.map((language) => {
            const active = activeLanguageIds.includes(language.id);

            return (
              <button
                key={language.id}
                type="button"
                onClick={() => toggleLanguage(language.id)}
                title={language.label}
                className={[
                  "rounded-2xl px-3 py-2 text-sm font-black uppercase shadow-sm transition md:px-4 md:py-3 md:text-base",
                  active
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200",
                ].join(" ")}
              >
                {language.short}
              </button>
            );
          })}

          {activeLanguages.length === 0 && (
            <button
              type="button"
              onClick={showAllLanguages}
              className="rounded-2xl bg-emerald-100 px-3 py-2 text-sm font-black text-emerald-700 shadow-sm transition hover:bg-emerald-200 md:px-4 md:py-3 md:text-base"
            >
              Show all
            </button>
          )}
        </div>
      </div>

      {activeLanguages.length === 0 ? (
        <div className="rounded-3xl bg-slate-50 p-6 text-center">
          <p className="text-lg font-black text-slate-700">
            No language selected.
          </p>

          <button
            type="button"
            onClick={showAllLanguages}
            className="mt-4 rounded-full bg-sky-600 px-5 py-3 text-sm font-black text-white shadow hover:bg-sky-700"
          >
            Show all languages
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sentences.map((sentence, index) => (
            <article
              key={sentence.id}
              className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
            >
              <header className="bg-slate-50 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Sentence {index + 1}
                </p>
              </header>

              <div
                className="grid gap-2 p-3"
                style={{
                  gridTemplateColumns:
                    activeLanguages.length === 1
                      ? "1fr"
                      : "repeat(auto-fit, minmax(220px, 1fr))",
                }}
              >
                {activeLanguages.map((language) => (
                  <button
                    key={language.id}
                    type="button"
                    onClick={() => playSentenceBox(sentence, language.id)}
                    className="rounded-2xl bg-slate-50 px-4 py-3 text-left transition hover:bg-sky-50 hover:ring-2 hover:ring-sky-200 active:scale-[0.99]"
                  >
                    <p className="text-xs font-black uppercase text-slate-400">
                      {language.short}
                    </p>

                    <p className="mt-1 text-base font-black leading-snug text-slate-950 md:text-lg">
                      {getSentenceText(sentence, language.id)}
                    </p>
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}