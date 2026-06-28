"use client";

import { buildRegularOtherForms } from "./conjugationUtils";
import { speakConjugation } from "./conjugationAudio";

function getText(value, fallback = "") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.en || value.fr || value.es || value.it || fallback;
}

function normalizeOtherForms(forms) {
  if (!forms) return [];

  if (Array.isArray(forms.sections)) {
    return forms.sections;
  }

  return [
    {
      title: { en: "Infinitive" },
      items: [
        { label: { en: "Present infinitive" }, form: forms.infinitivePresent },
        { label: { en: "Past infinitive" }, form: forms.infinitivePast },
      ].filter((item) => item.form),
    },
    {
      title: { en: "Participle" },
      items: [
        { label: { en: "Present participle" }, form: forms.participlePresent },
        { label: { en: "Past participle" }, form: forms.participlePast },
      ].filter((item) => item.form),
    },
    {
      title: { en: "Gerund" },
      items: [
        { label: { en: "Present gerund" }, form: forms.gerundPresent },
        { label: { en: "Past gerund" }, form: forms.gerundPast },
      ].filter((item) => item.form),
    },
    {
      title: { en: "Imperative present" },
      rows: forms.imperativePresent || [],
    },
    {
      title: { en: "Imperative past" },
      rows: forms.imperativePast || [],
    },
    {
      title: { en: "Conditional past — second form" },
      note: {
        en: "This literary form is identical in structure to the pluperfect subjunctive.",
      },
      rows: forms.conditionalPastSecondForm || [],
    },
  ].filter(
    (section) =>
      section.items?.length || section.rows?.length
  );
}

function FormCard({ title, note, children }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-black uppercase tracking-wide text-sky-600">
        {title}
      </h3>

      {note && <p className="mt-2 text-sm text-slate-600">{note}</p>}

      <div className="mt-4">{children}</div>
    </div>
  );
}

function SpeakButton({ text, speechLang = "fr-FR" }) {
  return (
    <button
      type="button"
      onClick={() => speakConjugation(text, speechLang)}
      className="rounded-full bg-slate-100 px-3 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-200"
      aria-label={`Listen to ${text}`}
    >
      ▶️
    </button>
  );
}

function SingleForm({ label, form, speechLang }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-xl font-black text-emerald-700">{form}</p>
      </div>

      <SpeakButton text={form} speechLang={speechLang} />
    </div>
  );
}

function MiniTable({ rows, speechLang }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100">
      <table className="w-full border-collapse text-left">
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.person}-${row.form}`} className="border-t border-slate-100">
              <td className="px-4 py-3 text-lg font-bold text-slate-700">
                {row.person}
              </td>
              <td className="px-4 py-3 text-lg font-black text-emerald-700">
                {row.form}
              </td>
              <td className="px-4 py-3 text-right">
                <SpeakButton text={row.spoken || row.form} speechLang={speechLang} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ConjugationOtherForms({
  verb,
  pattern,
  targetLang = "fr",
}) {
  const forms = verb?.otherForms || buildRegularOtherForms(verb);
  const sections = normalizeOtherForms(forms);
  const speechLangByTargetLang = {
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-PT",
};

const speechLang = speechLangByTargetLang[targetLang] || "fr-FR";

  if (!verb || !sections.length) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-wide text-sky-600">
          Other forms
        </p>

        <h2 className="mt-1 text-2xl font-black text-slate-900">
          {verb.infinitive}
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          These forms do not all use the normal six-person conjugation table.
          They are grouped here as a compact reference.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {sections.map((section) => (
          <FormCard
            key={getText(section.title)}
            title={getText(section.title)}
            note={getText(section.note)}
          >
            {section.items?.length ? (
              <div className="grid gap-3">
                {section.items.map((item) => (
                  <SingleForm
                    key={`${getText(item.label)}-${item.form}`}
                    label={getText(item.label)}
                    form={item.form}
                    speechLang={speechLang}
                  />
                ))}
              </div>
            ) : null}

            {section.rows?.length ? (
              <MiniTable rows={section.rows} speechLang={speechLang} />
            ) : null}
          </FormCard>
        ))}
      </div>
    </section>
  );
}
