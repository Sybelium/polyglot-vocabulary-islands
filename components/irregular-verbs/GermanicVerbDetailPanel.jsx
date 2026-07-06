"use client";

import Link from "next/link";
import { getDisplayChunk } from "@/components/irregular-verbs/irregularVerbUtils";

function firstValue(value) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
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

  if (irregular) {
    return `ich ${irregular}`;
  }

  if (base.endsWith("en")) {
    return `ich ${base.slice(0, -2)}e`;
  }

  if (base.endsWith("n")) {
    return `ich ${base.slice(0, -1)}e`;
  }

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

  if (present) {
    return `ik ${present}`;
  }

  return `ik ${base}`;
}

const DETAIL_CONFIG = {
  de: {
    title: "German verb details",
    subtitle: "Principal forms and tense lessons",
    form1: "Infinitive",
    form2: "Präteritum",
    form3: "Partizip II",
    tenses: [
      {
        id: "present",
        label: "Präsens",
        exampleLabel: "Example pattern",
        getExample: (verb) => makeGermanIchPresent(verb),
        note: "Present tense. Full personal forms will come later.",
      },
      {
        id: "preterite",
        label: "Präteritum",
        exampleLabel: "Known form",
        getExample: (verb) => `ich ${getDisplayChunk(verb.pastSimple)}`,
        note: "Simple past, often used in written German.",
      },
      {
        id: "perfect",
        label: "Perfekt",
        exampleLabel: "Known participle",
        getExample: (verb) =>
          `ich habe/bin ${getDisplayChunk(verb.pastParticiple)}`,
        note: "Spoken past. Auxiliary choice will be refined later.",
      },
      {
        id: "future",
        label: "Futur I",
        exampleLabel: "Pattern",
        getExample: (verb) => `ich werde ${verb.base}`,
        note: "Future with werden + infinitive.",
      },
    ],
  },

  nl: {
    title: "Dutch verb details",
    subtitle: "Principal forms and tense lessons",
    form1: "Infinitive",
    form2: "Past",
    form3: "Past participle",
    tenses: [
      {
        id: "present",
        label: "Tegenwoordige tijd",
        exampleLabel: "Example pattern",
        getExample: (verb) => makeDutchIkPresent(verb),
        note: "Present tense. Full personal forms will come later.",
      },
      {
        id: "past",
        label: "Verleden tijd",
        exampleLabel: "Known forms",
        getExample: (verb) => `ik/wij ${getDisplayChunk(verb.pastSimple)}`,
        note: "Past tense. Many Dutch lists show singular/plural forms.",
      },
      {
        id: "perfect",
        label: "Voltooid tegenwoordige tijd",
        exampleLabel: "Known participle",
        getExample: (verb) =>
          `ik heb/ben ${getDisplayChunk(verb.pastParticiple)}`,
        note: "Perfect tense. Auxiliary choice will be refined later.",
      },
      {
        id: "future",
        label: "Toekomende tijd",
        exampleLabel: "Pattern",
        getExample: (verb) => `ik zal ${verb.base}`,
        note: "Future with zullen + infinitive.",
      },
    ],
  },
};

export default function GermanicVerbDetailPanel({
  verb,
  targetLang = "de",
  supportLang = "fr",
  listFile = "irregular-verbs-50.json",
  onClose,
}) {
  if (!verb) return null;

  const config = DETAIL_CONFIG[targetLang] || DETAIL_CONFIG.de;
  const meaning = verb.translations?.[supportLang] || verb.translations?.en || "—";

  function tenseHref(tenseId) {
    const params = new URLSearchParams({
      verb: verb.id,
      list: listFile,
    });

    return `/irregular-verbs/${targetLang}/tenses/${tenseId}?${params.toString()}`;
  }

  return (
    <section className="mt-6 rounded-[2rem] border border-indigo-100 bg-white p-4 shadow-md md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-indigo-600">
            {config.title}
          </p>

          <h2 className="mt-1 text-3xl font-black text-slate-950">
            {verb.base}
          </h2>

          <p className="mt-1 text-sm font-bold text-slate-500">
            {meaning} · {verb.display}
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

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs font-black uppercase text-slate-400">
            {config.form1}
          </p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {verb.base}
          </p>
        </div>

        <div className="rounded-3xl bg-amber-50 p-4">
          <p className="text-xs font-black uppercase text-amber-500">
            {config.form2}
          </p>
          <p className="mt-1 text-2xl font-black text-amber-700">
            {getDisplayChunk(verb.pastSimple)}
          </p>
        </div>

        <div className="rounded-3xl bg-sky-50 p-4">
          <p className="text-xs font-black uppercase text-sky-500">
            {config.form3}
          </p>
          <p className="mt-1 text-2xl font-black text-sky-700">
            {getDisplayChunk(verb.pastParticiple)}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
          Tense lessons
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-600">
          These lessons use the known irregular forms now. Full conjugation
          tables can be added later when we enrich the data.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {config.tenses.map((tense) => (
            <Link
              key={tense.id}
              href={tenseHref(tense.id)}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md"
            >
              <p className="text-xs font-black uppercase tracking-wide text-indigo-600">
                {tense.label}
              </p>

              <p className="mt-2 text-xs font-black uppercase text-slate-400">
                {tense.exampleLabel}
              </p>

              <p className="mt-1 text-xl font-black text-slate-950">
                {tense.getExample(verb)}
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-500">
                {tense.note}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}