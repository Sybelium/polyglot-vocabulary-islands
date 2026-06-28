"use client";

import { speakConjugation } from "../conjugationAudio";

export default function IrregularOtherForms({
  verb,
  targetLang = "fr",
}) {
  if (!verb?.otherForms?.sections?.length) return null;

  const speechLangByTargetLang = {
    fr: "fr-FR",
    es: "es-ES",
    it: "it-IT",
    pt: "pt-PT",
  };

  const speechLang = speechLangByTargetLang[targetLang] || "fr-FR";

  function play(text) {
    if (!text) return;
    speakConjugation(text, speechLang);
  }

  return (
    <section className="mt-8 rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-wide text-violet-600">
          Other forms
        </p>

        <h2 className="mt-1 text-3xl font-black text-slate-900">
          {verb.infinitive}
        </h2>

        <p className="mt-2 text-slate-600">
          Infinitive, participles, gerund and imperative forms.
        </p>

        {verb.compound?.note?.en && (
          <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
            {verb.compound.note.en}
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {verb.otherForms.sections.map((section) => (
          <div
            key={section.title?.en || section.title?.fr}
            className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
          >
            <h3 className="text-xl font-black text-slate-900">
              {section.title?.en || section.title?.fr}
            </h3>

            {section.note?.en && (
              <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-600">
                {section.note.en}
              </p>
            )}

            <div className="mt-4 space-y-3">
              {section.forms?.map((item) => {
                const values = item.forms || [item.form];

                return (
                  <div
                    key={item.label?.en || item.label?.fr}
                    className="rounded-2xl bg-white p-4 shadow-sm"
                  >
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      {item.label?.en || item.label?.fr}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {values.filter(Boolean).map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => play(value)}
                          className="rounded-full bg-violet-50 px-4 py-2 text-sm font-black text-violet-700 transition hover:bg-violet-100"
                        >
                          ▶️ {value}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
