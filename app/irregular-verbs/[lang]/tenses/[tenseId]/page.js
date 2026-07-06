import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ENGLISH_SUBJECTS,
  buildEnglishTenseForm,
  getEnglishTense,
} from "@/lib/irregular-verbs/englishTwelveTenses";

export const metadata = {
  title: "Germanic Tense Lesson | Language Playground",
};

const SAFE_FILE_RE = /^[a-z0-9-]+\.json$/i;
const SUPPORTED_LANGS = ["en", "de", "nl"];
const TENSE_ORDER_BY_LANG = {
  en: [
    "past-simple",
    "present-simple",
    "future-simple",
    "past-continuous",
    "present-continuous",
    "future-continuous",
    "past-perfect",
    "present-perfect",
    "future-perfect",
    "past-perfect-continuous",
    "present-perfect-continuous",
    "future-perfect-continuous",
  ],
  de: ["present", "preterite", "perfect", "future"],
  nl: ["present", "past", "perfect", "future"],
};

const TENSE_LABELS_BY_LANG = {
  de: {
    present: "Präsens",
    preterite: "Präteritum",
    perfect: "Perfekt",
    future: "Futur I",
  },
  nl: {
    present: "Tegenwoordige tijd",
    past: "Verleden tijd",
    perfect: "Voltooid tegenwoordige tijd",
    future: "Toekomende tijd",
  },
};

function getTenseLabel(lang, tenseId) {
  if (lang === "en") {
    return getEnglishTense(tenseId)?.label || tenseId;
  }

  return TENSE_LABELS_BY_LANG[lang]?.[tenseId] || tenseId;
}

function makeTenseHref({ lang, tenseId, verb, subjectId, listFile }) {
  const params = new URLSearchParams({
    verb: verb.id,
    list: listFile,
  });

  if (lang === "en") {
    params.set("subject", subjectId || "i");
  }

  return `/irregular-verbs/${lang}/tenses/${tenseId}?${params.toString()}`;
}

function getTenseNavigation(lang, tenseId) {
  const order = TENSE_ORDER_BY_LANG[lang] || [];
  const index = order.indexOf(tenseId);

  if (index < 0) {
    return {
      previousTenseId: null,
      nextTenseId: null,
      currentIndex: 0,
      total: order.length,
    };
  }

  return {
    previousTenseId: order[index - 1] || null,
    nextTenseId: order[index + 1] || null,
    currentIndex: index + 1,
    total: order.length,
  };
}

function TenseNavigation({ lang, tenseId, verb, subjectId, listFile }) {
  const { previousTenseId, nextTenseId, currentIndex, total } =
    getTenseNavigation(lang, tenseId);

  if (!previousTenseId && !nextTenseId) return null;

  return (
    <nav className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 text-center text-xs font-black uppercase tracking-wide text-slate-500">
        Tense {currentIndex} / {total}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {previousTenseId ? (
          <Link
            href={makeTenseHref({
              lang,
              tenseId: previousTenseId,
              verb,
              subjectId,
              listFile,
            })}
            className="rounded-2xl bg-white px-4 py-3 text-left text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50"
          >
            <span className="block text-xs uppercase text-slate-400">
              Previous
            </span>
            ← {getTenseLabel(lang, previousTenseId)}
          </Link>
        ) : (
          <span className="rounded-2xl bg-white/60 px-4 py-3 text-left text-sm font-black text-slate-300">
            <span className="block text-xs uppercase">Previous</span>
            —
          </span>
        )}

        {nextTenseId ? (
          <Link
            href={makeTenseHref({
              lang,
              tenseId: nextTenseId,
              verb,
              subjectId,
              listFile,
            })}
            className="rounded-2xl bg-white px-4 py-3 text-right text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50"
          >
            <span className="block text-xs uppercase text-slate-400">
              Next
            </span>
            {getTenseLabel(lang, nextTenseId)} →
          </Link>
        ) : (
          <span className="rounded-2xl bg-white/60 px-4 py-3 text-right text-sm font-black text-slate-300">
            <span className="block text-xs uppercase">Next</span>
            —
          </span>
        )}
      </div>
    </nav>
  );
}

function getDisplayChunk(values) {
  if (Array.isArray(values)) {
    return values.join(" / ");
  }

  return values || "";
}

function firstValue(values) {
  if (Array.isArray(values)) return values[0] || "";
  return values || "";
}

async function loadVerbFromList(lang, listFile, verbId) {
  const safeListFile = SAFE_FILE_RE.test(listFile || "")
    ? listFile
    : "irregular-verbs-50.json";

  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    "irregular-verbs",
    lang,
    safeListFile
  );

  const file = await fs.readFile(filePath, "utf8");
  const data = JSON.parse(file);
  const verbs = Array.isArray(data) ? data : data.verbs || [];

  return verbs.find((verb) => verb.id === verbId || verb.base === verbId) || null;
}

const GERMAN_ICH_PRESENT = {
  sein: "bin",
  haben: "habe",
  werden: "werde",
  wissen: "weiß",
  koennen: "kann",
  "können": "kann",
  muessen: "muss",
  "müssen": "muss",
  wollen: "will",
  sollen: "soll",
  duerfen: "darf",
  "dürfen": "darf",
  moegen: "mag",
  "mögen": "mag",
  tun: "tue",
};

function makeGermanIchPresent(verb) {
  const key = verb.id || verb.base;
  const base = verb.base || key;

  const irregular = GERMAN_ICH_PRESENT[key] || GERMAN_ICH_PRESENT[base];

  if (irregular) return `ich ${irregular}`;

  if (base.endsWith("en")) return `ich ${base.slice(0, -2)}e`;
  if (base.endsWith("n")) return `ich ${base.slice(0, -1)}e`;

  return `ich ${base}`;
}

const DUTCH_IK_PRESENT = {
  zijn: "ben",
  hebben: "heb",
  worden: "word",
  gaan: "ga",
  komen: "kom",
  zien: "zie",
  doen: "doe",
  geven: "geef",
  nemen: "neem",
  weten: "weet",
  zeggen: "zeg",
  denken: "denk",
  vinden: "vind",
  krijgen: "krijg",
  blijven: "blijf",
  laten: "laat",
  houden: "houd",
  staan: "sta",
  zitten: "zit",
  liggen: "lig",
  lopen: "loop",
  rijden: "rijd",
  vallen: "val",
  vliegen: "vlieg",
  trekken: "trek",
  dragen: "draag",
  slaan: "sla",
  schieten: "schiet",
  zingen: "zing",
  zwemmen: "zwem",
  eten: "eet",
  drinken: "drink",
  slapen: "slaap",
  lezen: "lees",
  schrijven: "schrijf",
  spreken: "spreek",
  begrijpen: "begrijp",
  vergeten: "vergeet",
  helpen: "help",
  roepen: "roep",
  beginnen: "begin",
  winnen: "win",
  verliezen: "verlies",
  kiezen: "kies",
  kijken: "kijk",
  vragen: "vraag",
  kopen: "koop",
  zoeken: "zoek",
  brengen: "breng",
  snijden: "snijd",
};

function makeDutchIkPresent(verb) {
  const key = verb.id || verb.base;
  const base = verb.base || key;
  const present = DUTCH_IK_PRESENT[key] || DUTCH_IK_PRESENT[base];

  if (present) return `ik ${present}`;

  return `ik ${base}`;
}

function getGermanLesson(tenseId, verb) {
  const lessons = {
    present: {
      label: "Präsens",
      lessonLabel: "German tense lesson",
      example: makeGermanIchPresent(verb),
      formula: "subject + present stem + personal ending",
      use: "The Präsens is used for actions happening now, habits, general truths, and often future meaning when the context is clear.",
      note: "Some strong verbs change their vowel in du/er/sie/es forms. Full personal tables will come later when we enrich the data.",
    },
    preterite: {
      label: "Präteritum",
      lessonLabel: "German tense lesson",
      example: `ich ${firstValue(verb.pastSimple)}`,
      formula: "subject + Präteritum form",
      use: "The Präteritum is the simple past. It is common in written German, stories, reports, and with very frequent verbs such as sein, haben, werden and modal verbs.",
      note: "For irregular verbs, the Präteritum form must often be memorized.",
    },
    perfect: {
      label: "Perfekt",
      lessonLabel: "German tense lesson",
      example: `ich habe/bin ${firstValue(verb.pastParticiple)}`,
      formula: "haben/sein + Partizip II",
      use: "The Perfekt is very common in spoken German to talk about the past.",
      note: "The auxiliary can be haben or sein. Movement and change-of-state verbs often use sein, but we will refine this verb by verb later.",
    },
    future: {
      label: "Futur I",
      lessonLabel: "German tense lesson",
      example: `ich werde ${verb.base}`,
      formula: "werden + infinitive",
      use: "Futur I is used for future actions, predictions, promises, and assumptions.",
      note: "German often uses the Präsens with a future time expression instead of Futur I.",
    },
  };

  return lessons[tenseId] || null;
}

function getDutchPastExample(verb) {
  const pastForms = Array.isArray(verb.pastSimple)
    ? verb.pastSimple
    : [verb.pastSimple].filter(Boolean);

  if (pastForms.length >= 2) {
    return `ik ${pastForms[0]} / wij ${pastForms[1]}`;
  }

  return `ik ${pastForms[0] || ""}`;
}

function getDutchLesson(tenseId, verb) {
  const lessons = {
    present: {
      label: "Tegenwoordige tijd",
      lessonLabel: "Dutch tense lesson",
      example: makeDutchIkPresent(verb),
      formula: "subject + present stem + ending",
      use: "The Dutch present tense is used for actions now, habits, general truths, and sometimes future meaning with a time expression.",
      note: "The ik-form is usually the stem. Other subjects add endings. Full personal tables will come later.",
    },
    past: {
      label: "Verleden tijd",
      lessonLabel: "Dutch tense lesson",
      example: getDutchPastExample(verb),
      formula: "subject + past form",
      use: "The Dutch past tense is used for completed past actions, stories, descriptions, and past situations.",
      note: "Many Dutch irregular verb lists show singular and plural past forms, for example ik ging / wij gingen.",
    },
    perfect: {
      label: "Voltooid tegenwoordige tijd",
      lessonLabel: "Dutch tense lesson",
      example: `ik heb/ben ${firstValue(verb.pastParticiple)}`,
      formula: "hebben/zijn + past participle",
      use: "The Dutch perfect tense is very common for talking about completed actions connected to the present or simply past events.",
      note: "The auxiliary can be hebben or zijn. We will refine auxiliary choice verb by verb later.",
    },
    future: {
      label: "Toekomende tijd",
      lessonLabel: "Dutch tense lesson",
      example: `ik zal ${verb.base}`,
      formula: "zullen + infinitive",
      use: "The Dutch future tense can use zullen + infinitive. Like German, Dutch can also use the present tense with future context.",
      note: "In everyday Dutch, gaan + infinitive is also very common for near-future plans.",
    },
  };

  return lessons[tenseId] || null;
}

function getGermanicLesson(lang, tenseId, verb) {
  if (lang === "de") return getGermanLesson(tenseId, verb);
  if (lang === "nl") return getDutchLesson(tenseId, verb);
  return null;
}

function getBackLabel(lang) {
  if (lang === "de") return "← Back to German irregular verbs";
  if (lang === "nl") return "← Back to Dutch irregular verbs";
  return "← Back to English irregular verbs";
}

function PrincipalForms({ lang, verb }) {
  const labels =
    lang === "de"
      ? {
          form1: "Infinitive",
          form2: "Präteritum",
          form3: "Partizip II",
        }
      : {
          form1: "Infinitive",
          form2: "Past",
          form3: "Past participle",
        };

  return (
    <section className="mt-6 grid gap-3 md:grid-cols-3">
      <div className="rounded-3xl bg-slate-50 p-4">
        <p className="text-xs font-black uppercase text-slate-400">
          {labels.form1}
        </p>
        <p className="mt-1 text-2xl font-black text-slate-950">
          {verb.base}
        </p>
      </div>

      <div className="rounded-3xl bg-amber-50 p-4">
        <p className="text-xs font-black uppercase text-amber-500">
          {labels.form2}
        </p>
        <p className="mt-1 text-2xl font-black text-amber-700">
          {getDisplayChunk(verb.pastSimple)}
        </p>
      </div>

      <div className="rounded-3xl bg-sky-50 p-4">
        <p className="text-xs font-black uppercase text-sky-500">
          {labels.form3}
        </p>
        <p className="mt-1 text-2xl font-black text-sky-700">
          {getDisplayChunk(verb.pastParticiple)}
        </p>
      </div>
    </section>
  );
}

function GermanicLessonPage({ lang, tense, tenseId, verb, listFile }) {
  const languageName = lang === "de" ? "German" : "Dutch";

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 px-4 py-8">
      <section className="mx-auto max-w-4xl">
        <Link
          href={`/irregular-verbs/${lang}`}
          className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          {getBackLabel(lang)}
        </Link>

        <article className="mt-5 rounded-[2rem] border border-white/80 bg-white p-5 text-slate-950 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-600">
            {tense.lessonLabel}
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
            {tense.label}
          </h1>

          <div className="mt-5 rounded-3xl bg-indigo-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-indigo-600">
              With “{verb.base}”
            </p>

            <p className="mt-2 text-3xl font-black text-indigo-950">
              {tense.example}
            </p>

            <p className="mt-2 text-sm font-bold text-indigo-700">
              {verb.display}
            </p>
          </div>

          <PrincipalForms lang={lang} verb={verb} />

          <section className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-lg font-black">Form</h2>

              <p className="mt-2 rounded-2xl bg-white px-4 py-3 text-lg font-black text-slate-900 shadow-sm">
                {tense.formula}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-lg font-black">Use</h2>

              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-700">
                {tense.use}
              </p>
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-lg font-black">Important note</h2>

            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-700">
              {tense.note}
            </p>
          </section>

          <section className="mt-6 rounded-3xl border border-indigo-100 bg-indigo-50 p-4">
            <h2 className="text-lg font-black text-indigo-950">
              Next improvement
            </h2>

            <p className="mt-2 text-sm font-semibold leading-relaxed text-indigo-800">
              This {languageName} page uses the reliable irregular forms we
              already have. Later we can add full personal conjugation tables
              when the verb data includes the present forms, auxiliaries and
              tense-specific forms.
            </p>
          </section>
          <TenseNavigation
  lang={lang}
  tenseId={tenseId}
  verb={verb}
  listFile={listFile}
/>
        </article>
      </section>
    </main>
  );
}

function EnglishLessonPage({ tense, verb, subjectId, tenseId, listFile }) {
  const selectedExample = buildEnglishTenseForm({
    verb,
    subjectId,
    tenseId,
  });

  const subjectExamples = ENGLISH_SUBJECTS.map((subject) => ({
    subject,
    form: buildEnglishTenseForm({
      verb,
      subjectId: subject.id,
      tenseId,
    }),
  }));

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 px-4 py-8">
      <section className="mx-auto max-w-4xl">
        <Link
          href="/irregular-verbs/en"
          className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          ← Back to English irregular verbs
        </Link>

        <article className="mt-5 rounded-[2rem] border border-white/80 bg-white p-5 text-slate-950 shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-600">
            English tense lesson
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
            {tense.label}
          </h1>

          <div className="mt-5 rounded-3xl bg-indigo-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-indigo-600">
              With “{verb.base}”
            </p>

            <p className="mt-2 text-3xl font-black text-indigo-950">
              {selectedExample}
            </p>

            <p className="mt-2 text-sm font-bold text-indigo-700">
              {verb.display}
            </p>
          </div>

          <section className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-lg font-black">Form</h2>

              <p className="mt-2 rounded-2xl bg-white px-4 py-3 text-lg font-black text-slate-900 shadow-sm">
                {tense.formula}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-lg font-black">Use</h2>

              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-700">
                {tense.use}
              </p>
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-lg font-black">Example</h2>

            <p className="mt-2 text-xl font-black text-slate-950">
              {tense.example}
            </p>
          </section>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-black">Subject table</h2>

            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-500">
                      Subject
                    </th>
                    <th className="px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-500">
                      Form
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {subjectExamples.map(({ subject, form }) => (
                    <tr key={subject.id} className="border-t border-slate-200">
                      <td className="px-3 py-3 text-sm font-black text-slate-600">
                        {subject.label}
                      </td>

                      <td className="px-3 py-3 text-base font-black text-slate-950">
                        {form}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <TenseNavigation
  lang="en"
  tenseId={tenseId}
  verb={verb}
  subjectId={subjectId}
  listFile={listFile}
/>
            </div>
          </section>
        </article>
      </section>
    </main>
  );
}

export default async function GermanicTenseLessonPage({
  params,
  searchParams,
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const lang = resolvedParams.lang;
  const tenseId = resolvedParams.tenseId;

  if (!SUPPORTED_LANGS.includes(lang)) {
    notFound();
  }

  const verbId =
    resolvedSearchParams?.verb ||
    (lang === "en" ? "go" : lang === "de" ? "gehen" : "gaan");

  const subjectId = resolvedSearchParams?.subject || "i";
  const listFile = resolvedSearchParams?.list || "irregular-verbs-50.json";

  const verb = await loadVerbFromList(lang, listFile, verbId);

  if (!verb) {
    notFound();
  }

  if (lang === "en") {
    const tense = getEnglishTense(tenseId);

    if (!tense) {
      notFound();
    }

    return (
  <EnglishLessonPage
    tense={tense}
    verb={verb}
    subjectId={subjectId}
    tenseId={tenseId}
    listFile={listFile}
  />
);
  }

  const tense = getGermanicLesson(lang, tenseId, verb);

  if (!tense) {
    notFound();
  }

  return (
  <GermanicLessonPage
    lang={lang}
    tense={tense}
    tenseId={tenseId}
    verb={verb}
    listFile={listFile}
  />
);
}