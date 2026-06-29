// components/conjugation/polyglot/polyglotConjugationUtils.js

export const ROMANCE_LANGS = ["fr", "es", "it", "pt"];

export const ROMANCE_LANG_LABELS = {
  fr: "French",
  es: "Spanish",
  it: "Italian",
  pt: "Portuguese",
};

export const POLYGLOT_ROW_LABELS = [
  { id: "infinitive", label: "Infinitive" },
  { id: "1s", label: "I" },
  { id: "2s", label: "you" },
  { id: "3s", label: "he / she" },
  { id: "1p", label: "we" },
  { id: "2p", label: "you plural" },
  { id: "3p", label: "they" },
];

const POLYGLOT_PRONOUN_LABELS = {
  fr: ["je", "tu", "elle", "nous", "vous", "elles"],
  es: ["yo", "tú", "ella", "nosotras", "vosotras", "ellas"],
  it: ["io", "tu", "lei", "noi", "voi", "loro"],
  pt: ["eu", "tu", "ela", "nós", "vós", "elas"],
};

const jsonCache = new Map();

async function loadJson(path) {
  if (jsonCache.has(path)) return jsonCache.get(path);

  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Could not load ${path}`);
  }

  const data = await response.json();
  jsonCache.set(path, data);
  return data;
}

async function loadFirstJson(paths) {
  const errors = [];

  for (const path of paths) {
    try {
      return await loadJson(path);
    } catch (error) {
      errors.push(error.message);
    }
  }

  throw new Error(errors.join(" | "));
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function asArray(data, key) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data[key])) return data[key];
  return [];
}

function findVerb(verbs, verbId) {
  const exact = verbs.find((verb) => verb.id === verbId || verb.infinitive === verbId);
  if (exact) return exact;

  const normalizedId = normalizeText(verbId);
  return verbs.find(
    (verb) =>
      normalizeText(verb.id) === normalizedId ||
      normalizeText(verb.infinitive) === normalizedId
  );
}

function getPersonLabels(personsData) {
  return asArray(personsData, "persons").map((person) => person.label || person.id);
}

function getPolyglotPersonLabels(lang, personsData) {
  const fixedLabels = POLYGLOT_PRONOUN_LABELS[lang];

  if (Array.isArray(fixedLabels) && fixedLabels.length === 6) {
    return fixedLabels;
  }

  return getPersonLabels(personsData);
}

function getStem(infinitive, stemRule) {
  if (!stemRule || !stemRule.startsWith("remove-")) return infinitive;

  const ending = stemRule.replace("remove-", "");

  if (infinitive.endsWith(ending)) {
    return infinitive.slice(0, -ending.length);
  }

  return infinitive;
}

function joinForm(pronoun, form) {
  if (!pronoun) return form || "";
  if (!form) return pronoun || "";
  return `${pronoun} ${form}`;
}

function normalizeSource(source) {
  return source === "irregular" ? "irregular" : "regular";
}

function getRegularPaths(lang) {
  return {
    persons: [`/data/conjugation/${lang}/persons.json`],
    verbs: [`/data/conjugation/${lang}/regular-verbs.json`],
    patterns: [`/data/conjugation/${lang}/regular-patterns.json`],
  };
}

function getIrregularPaths(lang) {
  return {
    persons: [`/data/conjugation/${lang}/irregular/persons.json`],
    verbs: [`/data/conjugation/${lang}/irregular/verbs.json`],
    tenses: [`/data/conjugation/${lang}/irregular/tenses.json`],
  };
}

export async function loadPolyglotMap() {
  return loadJson("/data/polyglot/conjugation/romance-verbs.json");
}

export async function findPolyglotEntry(polyglotId) {
  const map = await loadPolyglotMap();
  return map.find((entry) => entry.id === polyglotId) || null;
}


const TENSE_ALIASES_BY_LANG = {
  fr: {
    "conditional-simple": ["conditional-present"],
    "present-subjunctive": ["subjunctive-present"],
    "imperfect-subjunctive-ra": ["subjunctive-imperfect"],
    "imperfect-subjunctive-se": ["subjunctive-imperfect"],
    "present-perfect": ["passe-compose"],
    "passato-prossimo": ["passe-compose"],
    "compound-perfect": ["passe-compose"],
    "pluperfect": ["plus-que-parfait"],
    "trapassato-prossimo": ["plus-que-parfait"],
    "pluperfect-compound": ["plus-que-parfait"],
    "future-perfect": ["futur-anterieur"],
    "conditional-perfect": ["conditional-past"],
    "present-perfect-subjunctive": ["subjunctive-past"],
    "pluperfect-subjunctive-ra": ["subjunctive-pluperfect"],
    "pluperfect-subjunctive-se": ["subjunctive-pluperfect"],
  },
  es: {
    "conditional-present": ["conditional-simple"],
    "subjunctive-present": ["present-subjunctive"],
    "subjunctive-imperfect": ["imperfect-subjunctive-ra"],
    "passe-compose": ["present-perfect"],
    "passato-prossimo": ["present-perfect"],
    "compound-perfect": ["present-perfect"],
    "plus-que-parfait": ["pluperfect"],
    "futur-anterieur": ["future-perfect"],
    "trapassato-prossimo": ["pluperfect"],
    "pluperfect-compound": ["pluperfect"],
    "conditional-past": ["conditional-perfect"],
    "subjunctive-past": ["present-perfect-subjunctive"],
    "subjunctive-pluperfect": ["pluperfect-subjunctive-ra"],
  },
  it: {
    "conditional-simple": ["conditional-present"],
    "present-subjunctive": ["subjunctive-present"],
    "imperfect-subjunctive-ra": ["subjunctive-imperfect"],
    "imperfect-subjunctive-se": ["subjunctive-imperfect"],
    "passe-compose": ["passato-prossimo"],
    "present-perfect": ["passato-prossimo"],
    "compound-perfect": ["passato-prossimo"],
    "plus-que-parfait": ["trapassato-prossimo"],
    "pluperfect": ["trapassato-prossimo"],
    "pluperfect-compound": ["trapassato-prossimo"],
    "futur-anterieur": ["future-perfect"],
    "conditional-perfect": ["conditional-past"],
    "present-perfect-subjunctive": ["subjunctive-past"],
    "pluperfect-subjunctive-ra": ["subjunctive-pluperfect"],
    "pluperfect-subjunctive-se": ["subjunctive-pluperfect"],
  },
  pt: {
    "conditional-simple": ["conditional-present"],
    "present-subjunctive": ["subjunctive-present"],
    "imperfect-subjunctive-ra": ["subjunctive-imperfect"],
    "imperfect-subjunctive-se": ["subjunctive-imperfect"],
    "passe-compose": ["compound-perfect"],
    "present-perfect": ["compound-perfect"],
    "passato-prossimo": ["compound-perfect"],
    "plus-que-parfait": ["pluperfect-compound"],
    "pluperfect": ["pluperfect-compound"],
    "trapassato-prossimo": ["pluperfect-compound"],
    "futur-anterieur": ["future-perfect"],
    "conditional-past": ["conditional-perfect"],
    "present-perfect-subjunctive": ["subjunctive-past"],
    "subjunctive-pluperfect": ["subjunctive-past"],
    "pluperfect-subjunctive-ra": ["subjunctive-past"],
    "pluperfect-subjunctive-se": ["subjunctive-past"],
  },
};

function getCandidateTenseIds(lang, tenseId) {
  const aliases = TENSE_ALIASES_BY_LANG[lang]?.[tenseId] || [];
  return [tenseId, ...aliases];
}

function findRegularTense(patternsData, lang, tenseId) {
  const candidates = getCandidateTenseIds(lang, tenseId);

  for (const candidate of candidates) {
    const tense = patternsData?.tenses?.[candidate];

    if (tense) {
      return { tense, resolvedTenseId: candidate };
    }
  }

  return { tense: null, resolvedTenseId: tenseId };
}

function findIrregularTense(tenses, lang, tenseId) {
  const candidates = getCandidateTenseIds(lang, tenseId);

  for (const candidate of candidates) {
    const tense = tenses.find((item) => item.id === candidate);

    if (tense) {
      return { tense, resolvedTenseId: candidate };
    }
  }

  return { tense: null, resolvedTenseId: tenseId };
}


export async function buildRegularForms(lang, verbId, tenseId) {
  const paths = getRegularPaths(lang);

  const [personsData, verbsData, patternsData] = await Promise.all([
    loadFirstJson(paths.persons),
    loadFirstJson(paths.verbs),
    loadFirstJson(paths.patterns),
  ]);

  const verbs = asArray(verbsData, "verbs");
  const verb = findVerb(verbs, verbId);

  if (!verb) {
    return {
      ok: false,
      lang,
      source: "regular",
      reason: `Regular verb not found: ${verbId}`,
    };
  }

  const { tense, resolvedTenseId } = findRegularTense(patternsData, lang, tenseId);

  if (!tense?.groups) {
    return {
      ok: false,
      lang,
      source: "regular",
      verb,
      reason: `Regular tense not available: ${tenseId}`,
    };
  }

  const groupPattern = tense.groups[verb.group];

  if (!groupPattern?.endings || !Array.isArray(groupPattern.endings)) {
    return {
      ok: false,
      lang,
      source: "regular",
      verb,
      reason: `Regular group pattern not available: ${verb.group}`,
    };
  }

  const stem = getStem(verb.infinitive, groupPattern.stemRule);
  const rawForms = groupPattern.endings.map((ending) => `${stem}${ending}`);
  const pronouns = getPolyglotPersonLabels(lang, personsData);

  return {
    ok: true,
    lang,
    source: "regular",
    verb,
    infinitive: verb.infinitive,
    pronouns,
    rawForms,
    displayForms: rawForms.map((form, index) => joinForm(pronouns[index], form)),
    tenseLabel: tense.label || { en: resolvedTenseId },
    requestedTenseId: tenseId,
    resolvedTenseId,
  };
}

export async function buildIrregularForms(lang, verbId, tenseId) {
  const paths = getIrregularPaths(lang);

  const [personsData, verbsData, tensesData] = await Promise.all([
    loadFirstJson(paths.persons),
    loadFirstJson(paths.verbs),
    loadFirstJson(paths.tenses),
  ]);

  const verbs = asArray(verbsData, "verbs");
  const tenses = asArray(tensesData, "tenses");
  const verb = findVerb(verbs, verbId);
  const { tense, resolvedTenseId } = findIrregularTense(tenses, lang, tenseId);

  if (!verb) {
    return {
      ok: false,
      lang,
      source: "irregular",
      reason: `Irregular verb not found: ${verbId}`,
    };
  }

  if (!tense) {
    return {
      ok: false,
      lang,
      source: "irregular",
      verb,
      reason: `Irregular tense not available: ${tenseId}`,
    };
  }

  let rawForms = null;

  if (tense.patternType === "compound") {
    const auxiliaryKey = verb.compound?.auxiliary;
    const participle = verb.compound?.pastParticiple;
    const auxiliaryForms = tense.auxiliaries?.[auxiliaryKey];

    if (!Array.isArray(auxiliaryForms) || auxiliaryForms.length !== 6 || !participle) {
      return {
        ok: false,
        lang,
        source: "irregular",
        verb,
        reason: `Compound forms not available for ${verbId} / ${tenseId}`,
      };
    }

    rawForms = auxiliaryForms.map((auxiliary) => `${auxiliary} ${participle}`);
  } else {
    rawForms = verb.forms?.[resolvedTenseId];
  }

  if (!Array.isArray(rawForms) || rawForms.length !== 6) {
    return {
      ok: false,
      lang,
      source: "irregular",
      verb,
      reason: `Irregular forms not available for ${verbId} / ${tenseId} resolved as ${resolvedTenseId}`,
    };
  }

  const pronouns = getPolyglotPersonLabels(lang, personsData);

  return {
    ok: true,
    lang,
    source: "irregular",
    verb,
    infinitive: verb.infinitive,
    pronouns,
    rawForms,
    displayForms: rawForms.map((form, index) => joinForm(pronouns[index], form)),
    tenseLabel: tense.label || { en: resolvedTenseId },
    requestedTenseId: tenseId,
    resolvedTenseId,
  };
}

export async function resolveVerbForLanguage(lang, spec, tenseId) {
  const verbId = typeof spec === "string" ? spec : spec?.id;
  const preferredSource = normalizeSource(spec?.source);
  const fallbackSource = preferredSource === "regular" ? "irregular" : "regular";

  if (!verbId) {
    return {
      ok: false,
      lang,
      reason: "Missing verb id",
    };
  }

  const builders = {
    regular: buildRegularForms,
    irregular: buildIrregularForms,
  };

  const first = await builders[preferredSource](lang, verbId, tenseId);
  if (first.ok) return first;

  const second = await builders[fallbackSource](lang, verbId, tenseId);
  if (second.ok) return second;

  return {
    ok: false,
    lang,
    source: preferredSource,
    verbId,
    reason: `${first.reason}; fallback: ${second.reason}`,
  };
}

export async function resolvePolyglotConjugation(polyglotId, tenseId) {
  const entry = await findPolyglotEntry(polyglotId);

  if (!entry) {
    return {
      ok: false,
      reason: `Polyglot entry not found: ${polyglotId}`,
      entry: null,
      languages: {},
    };
  }

  const resolvedPairs = await Promise.all(
    ROMANCE_LANGS.map(async (lang) => {
      const spec = entry.verbs?.[lang];
      const result = await resolveVerbForLanguage(lang, spec, tenseId);
      return [lang, result];
    })
  );

  const languages = Object.fromEntries(resolvedPairs);
  const available = Object.values(languages).filter((item) => item.ok);

  return {
    ok: available.length > 0,
    entry,
    tenseId,
    languages,
    availableCount: available.length,
    missingCount: ROMANCE_LANGS.length - available.length,
  };
}

export function buildPolyglotRows(resolution) {
  if (!resolution?.entry || !resolution?.languages) return [];

  const rows = [
    {
      id: "infinitive",
      label: "Infinitive",
      cells: Object.fromEntries(
        ROMANCE_LANGS.map((lang) => [
          lang,
          resolution.languages[lang]?.ok ? resolution.languages[lang].infinitive : null,
        ])
      ),
    },
  ];

  for (let index = 0; index < 6; index += 1) {
    const rowLabel = POLYGLOT_ROW_LABELS[index + 1];

    rows.push({
      id: rowLabel.id,
      label: rowLabel.label,
      cells: Object.fromEntries(
        ROMANCE_LANGS.map((lang) => [
          lang,
          resolution.languages[lang]?.ok
            ? resolution.languages[lang].displayForms[index]
            : null,
        ])
      ),
    });
  }

  return rows;
}

export function getPolyglotSourceBadges(resolution) {
  if (!resolution?.languages) return {};

  return Object.fromEntries(
    ROMANCE_LANGS.map((lang) => [
      lang,
      resolution.languages[lang]?.ok ? resolution.languages[lang].source : null,
    ])
  );
}
