export const ENGLISH_SUBJECTS = [
  {
    id: "i",
    label: "I",
    sentenceSubject: "I",
    bePresent: "am",
    bePast: "was",
    havePresent: "have",
    thirdPersonSingular: false,
  },
  {
    id: "you",
    label: "you",
    sentenceSubject: "you",
    bePresent: "are",
    bePast: "were",
    havePresent: "have",
    thirdPersonSingular: false,
  },
  {
    id: "he-she-it",
    label: "he / she / it",
    sentenceSubject: "he",
    bePresent: "is",
    bePast: "was",
    havePresent: "has",
    thirdPersonSingular: true,
  },
  {
    id: "we",
    label: "we",
    sentenceSubject: "we",
    bePresent: "are",
    bePast: "were",
    havePresent: "have",
    thirdPersonSingular: false,
  },
  {
    id: "they",
    label: "they",
    sentenceSubject: "they",
    bePresent: "are",
    bePast: "were",
    havePresent: "have",
    thirdPersonSingular: false,
  },
];

export const ENGLISH_TENSE_COLUMNS = [
  { id: "past", label: "Past" },
  { id: "present", label: "Present" },
  { id: "future", label: "Future" },
];

export const ENGLISH_TENSE_ROWS = [
  {
    id: "simple",
    label: "Simple",
    cells: {
      past: "past-simple",
      present: "present-simple",
      future: "future-simple",
    },
  },
  {
    id: "continuous",
    label: "Continuous",
    cells: {
      past: "past-continuous",
      present: "present-continuous",
      future: "future-continuous",
    },
  },
  {
    id: "perfect",
    label: "Perfect",
    cells: {
      past: "past-perfect",
      present: "present-perfect",
      future: "future-perfect",
    },
  },
  {
    id: "perfect-continuous",
    label: "Perfect Continuous",
    cells: {
      past: "past-perfect-continuous",
      present: "present-perfect-continuous",
      future: "future-perfect-continuous",
    },
  },
];

export const ENGLISH_TENSES = {
  "past-simple": {
    id: "past-simple",
    label: "Past Simple",
    formula: "subject + past simple",
    use: "Completed actions in the past.",
    example: "I went home yesterday.",
  },
  "present-simple": {
    id: "present-simple",
    label: "Present Simple",
    formula: "subject + base verb",
    use: "Habits, routines, general truths and repeated actions.",
    example: "I go to school every day.",
  },
  "future-simple": {
    id: "future-simple",
    label: "Future Simple",
    formula: "subject + will + base verb",
    use: "Future actions, predictions and decisions.",
    example: "I will go tomorrow.",
  },
  "past-continuous": {
    id: "past-continuous",
    label: "Past Continuous",
    formula: "subject + was/were + -ing",
    use: "Actions that were in progress at a moment in the past.",
    example: "I was going home when you called.",
  },
  "present-continuous": {
    id: "present-continuous",
    label: "Present Continuous",
    formula: "subject + am/is/are + -ing",
    use: "Actions happening now or around now.",
    example: "I am going home now.",
  },
  "future-continuous": {
    id: "future-continuous",
    label: "Future Continuous",
    formula: "subject + will be + -ing",
    use: "Actions that will be in progress at a future moment.",
    example: "I will be going home at six.",
  },
  "past-perfect": {
    id: "past-perfect",
    label: "Past Perfect",
    formula: "subject + had + past participle",
    use: "Actions completed before another past action.",
    example: "I had gone home before it started raining.",
  },
  "present-perfect": {
    id: "present-perfect",
    label: "Present Perfect",
    formula: "subject + have/has + past participle",
    use: "Past actions connected to the present.",
    example: "I have gone there before.",
  },
  "future-perfect": {
    id: "future-perfect",
    label: "Future Perfect",
    formula: "subject + will have + past participle",
    use: "Actions that will be completed before a future time.",
    example: "I will have gone home by eight.",
  },
  "past-perfect-continuous": {
    id: "past-perfect-continuous",
    label: "Past Perfect Continuous",
    formula: "subject + had been + -ing",
    use: "Actions that had been continuing before another past moment.",
    example: "I had been going there for years.",
  },
  "present-perfect-continuous": {
    id: "present-perfect-continuous",
    label: "Present Perfect Continuous",
    formula: "subject + have/has been + -ing",
    use: "Actions that started in the past and continue now, or recently stopped.",
    example: "I have been going there for years.",
  },
  "future-perfect-continuous": {
    id: "future-perfect-continuous",
    label: "Future Perfect Continuous",
    formula: "subject + will have been + -ing",
    use: "Actions that will have been continuing until a future moment.",
    example: "I will have been going there for years.",
  },
};

export function getEnglishSubject(subjectId = "i") {
  return (
    ENGLISH_SUBJECTS.find((subject) => subject.id === subjectId) ||
    ENGLISH_SUBJECTS[0]
  );
}

export function getEnglishTense(tenseId) {
  return ENGLISH_TENSES[tenseId] || null;
}

function firstForm(value) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

function makeThirdPersonSingular(base) {
  if (!base) return "";

  if (base === "be") return "is";
  if (base === "have") return "has";
  if (base === "do") return "does";

  if (/(s|x|z|ch|sh|o)$/i.test(base)) {
    return `${base}es`;
  }

  if (/[^aeiou]y$/i.test(base)) {
    return `${base.slice(0, -1)}ies`;
  }

  return `${base}s`;
}

function makePresentParticiple(base) {
  if (!base) return "";

  if (base === "be") return "being";
  if (base === "see") return "seeing";
  if (base === "die") return "dying";
  if (base === "lie") return "lying";
  if (base === "tie") return "tying";

  if (base.endsWith("ie")) {
    return `${base.slice(0, -2)}ying`;
  }

  if (base.endsWith("e") && !base.endsWith("ee")) {
    return `${base.slice(0, -1)}ing`;
  }

  if (/^[a-z]*[aeiou][bcdfghjklmnpqrstvwxyz]$/i.test(base)) {
    const last = base.slice(-1);

    if (!["w", "x", "y"].includes(last)) {
      return `${base}${last}ing`;
    }
  }

  return `${base}ing`;
}

function getBase(verb) {
  return verb?.base || verb?.id || "";
}

function getPastSimple(verb, subject) {
  const base = getBase(verb);

  if (base === "be") {
    return subject.bePast;
  }

  return firstForm(verb?.pastSimple);
}

function getPastParticiple(verb) {
  return firstForm(verb?.pastParticiple);
}

function getPresentSimple(verb, subject) {
  const base = getBase(verb);

  if (base === "be") {
    return subject.bePresent;
  }

  return subject.thirdPersonSingular ? makeThirdPersonSingular(base) : base;
}

function getPresentParticiple(verb) {
  return makePresentParticiple(getBase(verb));
}

export function buildEnglishTenseForm({
  verb,
  subjectId = "i",
  tenseId = "present-simple",
}) {
  const subject = getEnglishSubject(subjectId);
  const s = subject.sentenceSubject;
  const base = getBase(verb);
  const pastSimple = getPastSimple(verb, subject);
  const pastParticiple = getPastParticiple(verb);
  const presentParticiple = getPresentParticiple(verb);

  const forms = {
    "past-simple": `${s} ${pastSimple}`,
    "present-simple": `${s} ${getPresentSimple(verb, subject)}`,
    "future-simple": `${s} will ${base}`,

    "past-continuous": `${s} ${subject.bePast} ${presentParticiple}`,
    "present-continuous": `${s} ${subject.bePresent} ${presentParticiple}`,
    "future-continuous": `${s} will be ${presentParticiple}`,

    "past-perfect": `${s} had ${pastParticiple}`,
    "present-perfect": `${s} ${subject.havePresent} ${pastParticiple}`,
    "future-perfect": `${s} will have ${pastParticiple}`,

    "past-perfect-continuous": `${s} had been ${presentParticiple}`,
    "present-perfect-continuous": `${s} ${subject.havePresent} been ${presentParticiple}`,
    "future-perfect-continuous": `${s} will have been ${presentParticiple}`,
  };

  return forms[tenseId] || "";
}