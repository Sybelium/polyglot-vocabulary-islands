export function getStem(infinitive, pattern) {
  if (!infinitive || !pattern) return "";

  if (pattern.stemRule === "remove-ar") {
    return infinitive.endsWith("ar") ? infinitive.slice(0, -2) : infinitive;
  }

  if (pattern.stemRule === "remove-er") {
    return infinitive.endsWith("er") ? infinitive.slice(0, -2) : infinitive;
  }

  if (pattern.stemRule === "remove-ir") {
    return infinitive.endsWith("ir") ? infinitive.slice(0, -2) : infinitive;
  }

  if (pattern.stemRule === "remove-re") {
    return infinitive.endsWith("re") ? infinitive.slice(0, -2) : infinitive;
  }

  if (pattern.stemRule === "remove-are") {
    return infinitive.endsWith("are") ? infinitive.slice(0, -3) : infinitive;
  }

  if (pattern.stemRule === "remove-ere") {
    return infinitive.endsWith("ere") ? infinitive.slice(0, -3) : infinitive;
  }

  if (pattern.stemRule === "remove-ire") {
    return infinitive.endsWith("ire") ? infinitive.slice(0, -3) : infinitive;
  }

  if (pattern.stemRule === "future-are-to-er") {
    return infinitive.endsWith("are")
      ? `${infinitive.slice(0, -3)}er`
      : infinitive;
  }

  if (pattern.stemRule === "future-full-infinitive") {
    return infinitive;
  }

  if (pattern.stemRule === "future-remove-final-e") {
    return infinitive.endsWith("e") ? infinitive.slice(0, -1) : infinitive;
  }

  if (pattern.stemRule === "imperfect-regular-ir") {
    return infinitive.endsWith("ir")
      ? `${infinitive.slice(0, -2)}iss`
      : infinitive;
  }

  if (pattern.stemRule === "subjunctive-regular-ir") {
    return infinitive.endsWith("ir")
      ? `${infinitive.slice(0, -2)}iss`
      : infinitive;
  }

  return infinitive;
}

export function getPastParticiple(infinitive, pattern) {
  if (!infinitive || !pattern) return "";

  if (pattern.participleRule === "remove-er-add-é") {
    return infinitive.endsWith("er")
      ? `${infinitive.slice(0, -2)}é`
      : infinitive;
  }

  if (pattern.participleRule === "remove-ir-add-i") {
    return infinitive.endsWith("ir")
      ? `${infinitive.slice(0, -2)}i`
      : infinitive;
  }

  if (pattern.participleRule === "remove-re-add-u") {
    return infinitive.endsWith("re")
      ? `${infinitive.slice(0, -2)}u`
      : infinitive;
  }

  if (pattern.participleRule === "remove-ar-add-ado") {
  return infinitive.endsWith("ar")
    ? `${infinitive.slice(0, -2)}ado`
    : infinitive;
}

if (pattern.participleRule === "remove-er-add-ido") {
  return infinitive.endsWith("er")
    ? `${infinitive.slice(0, -2)}ido`
    : infinitive;
}

if (pattern.participleRule === "remove-ir-add-ido") {
  return infinitive.endsWith("ir")
    ? `${infinitive.slice(0, -2)}ido`
    : infinitive;
}

if (pattern.participleRule === "remove-are-add-ato") {
  return infinitive.endsWith("are")
    ? `${infinitive.slice(0, -3)}ato`
    : infinitive;
}

if (pattern.participleRule === "remove-ere-add-uto") {
  return infinitive.endsWith("ere")
    ? `${infinitive.slice(0, -3)}uto`
    : infinitive;
}

if (pattern.participleRule === "remove-ire-add-ito") {
  return infinitive.endsWith("ire")
    ? `${infinitive.slice(0, -3)}ito`
    : infinitive;
}

  return infinitive;
}

export function displayEnding(ending) {
  return ending === "" ? "∅" : ending;
}

export function startsWithVowelOrH(word) {
  if (!word) return false;

  return /^[aeiouyhàâäéèêëîïôöùûüÿ]/i.test(word);
}

export function getRegularGroupType(verb) {
  if (!verb?.group) return null;

  if (verb.group === "regular-ar") return "ar";
  if (verb.group === "regular-er") return "er";
  if (verb.group === "regular-ir") return "ir";
  if (verb.group === "regular-re") return "re";

  if (verb.group === "regular-are") return "are";
  if (verb.group === "regular-ere") return "ere";
  if (verb.group === "regular-ire") return "ire";
  if (verb.group === "regular-ire-isc") return "ire";

  return null;
}

export function getRegularStem(infinitive, groupType) {
  if (!infinitive || !groupType) return "";

  if (groupType === "ar" && infinitive.endsWith("ar")) {
    return infinitive.slice(0, -2);
  }

  if (groupType === "er" && infinitive.endsWith("er")) {
    return infinitive.slice(0, -2);
  }

  if (groupType === "ir" && infinitive.endsWith("ir")) {
    return infinitive.slice(0, -2);
  }

  if (groupType === "re" && infinitive.endsWith("re")) {
    return infinitive.slice(0, -2);
  }

  if (groupType === "are" && infinitive.endsWith("are")) {
    return infinitive.slice(0, -3);
  }

  if (groupType === "ere" && infinitive.endsWith("ere")) {
    return infinitive.slice(0, -3);
  }

  if (groupType === "ire" && infinitive.endsWith("ire")) {
    return infinitive.slice(0, -3);
  }

  return infinitive;
}

export function buildRegularOtherForms(verb) {
  if (!verb?.infinitive) return null;

  const groupType = getRegularGroupType(verb);
  const stem = getRegularStem(verb.infinitive, groupType);

  if (!groupType || !stem) return null;

  const pastParticiple =
    groupType === "er"
      ? `${stem}é`
      : groupType === "ir"
      ? `${stem}i`
      : `${stem}u`;

  const presentParticiple =
    groupType === "ir" ? `${stem}issant` : `${stem}ant`;

  const imperativePresent =
    groupType === "er"
      ? [
          { person: "tu", form: `${stem}e` },
          { person: "nous", form: `${stem}ons` },
          { person: "vous", form: `${stem}ez` },
        ]
      : groupType === "ir"
      ? [
          { person: "tu", form: `${stem}is` },
          { person: "nous", form: `${stem}issons` },
          { person: "vous", form: `${stem}issez` },
        ]
      : [
          { person: "tu", form: `${stem}s` },
          { person: "nous", form: `${stem}ons` },
          { person: "vous", form: `${stem}ez` },
        ];

  return {
    infinitivePresent: verb.infinitive,
    infinitivePast: `avoir ${pastParticiple}`,

    participlePresent: presentParticiple,
    participlePast: pastParticiple,

    gerundPresent: `en ${presentParticiple}`,
    gerundPast: `en ayant ${pastParticiple}`,

    imperativePresent,
    imperativePast: [
      { person: "tu", form: `aie ${pastParticiple}` },
      { person: "nous", form: `ayons ${pastParticiple}` },
      { person: "vous", form: `ayez ${pastParticiple}` },
    ],

    conditionalPastSecondForm: [
      { person: "je", form: `j’eusse ${pastParticiple}` },
      { person: "tu", form: `tu eusses ${pastParticiple}` },
      { person: "il / elle", form: `il / elle eût ${pastParticiple}` },
      { person: "nous", form: `nous eussions ${pastParticiple}` },
      { person: "vous", form: `vous eussiez ${pastParticiple}` },
      { person: "ils / elles", form: `ils / elles eussent ${pastParticiple}` },
    ],
  };
}

export function getDisplayPronoun(person, verb, tense = null, nextWord = "") {
  if (!person || !verb) return "";

  const basePronoun =
    person.id === "je" && startsWithVowelOrH(nextWord || verb.infinitive)
      ? "j’"
      : person.label;

  if (tense?.pronounPrefix === "que") {
    if (basePronoun === "j’") return "que j’";
    if (person.id === "il" || person.id === "ils") return `qu’${basePronoun}`;
    return `que ${basePronoun}`;
  }

  if (tense?.pronounPrefix) {
  return `${tense.pronounPrefix} ${basePronoun}`;
}

  return basePronoun;
}

export function getSpokenPronoun(person, verb, tense = null, nextWord = "") {
  if (!person || !verb) return "";

  const wordToCheck = nextWord || verb.infinitive;

  const basePronoun =
    person.id === "je" && startsWithVowelOrH(wordToCheck)
      ? "j’"
      : person.spoken || person.label;

  if (tense?.pronounPrefix === "que") {
    if (basePronoun === "j’") {
      return "que j’";
    }

    if (person.id === "il" || person.id === "ils") {
      return `qu’${basePronoun}`;
    }

    return `que ${basePronoun}`;
  }

  return basePronoun;
}

export function joinPronounAndForm(pronoun, form) {
  const trimmedPronoun = pronoun.trim();

  if (
    trimmedPronoun.endsWith("j’") ||
    trimmedPronoun.endsWith("j'")
  ) {
    return `${trimmedPronoun}${form}`;
  }

  return `${trimmedPronoun} ${form}`;
}

export function getFullDisplayForm(
  person,
  verb,
  form,
  tense = null,
  nextWord = ""
) {
  const pronoun = getDisplayPronoun(person, verb, tense, nextWord);
  return joinPronounAndForm(pronoun, form);
}

export function getSpokenFullForm(
  person,
  verb,
  form,
  tense = null,
  nextWord = ""
) {
  const pronoun = getSpokenPronoun(person, verb, tense, nextWord);
  return joinPronounAndForm(pronoun, form);
}

export function buildConjugationRows(verb, pattern, persons = [], tense = null) {
  if (!verb || !pattern || !persons.length) return [];

  if (tense?.patternType === "compound") {
    const participle = getPastParticiple(verb.infinitive, pattern);
    const auxiliaryForms = tense.auxiliaryForms || [];

    return persons.map((person, index) => {
      const auxiliaryForm = auxiliaryForms[index] || "";
      const form = `${auxiliaryForm} ${participle}`;

      return {
        personId: person.id,
        pronoun: getDisplayPronoun(person, verb, tense, auxiliaryForm),
        stem: auxiliaryForm,
        ending: participle,
        form,
        fullForm: getFullDisplayForm(
          person,
          verb,
          form,
          tense,
          auxiliaryForm
        ),
        spokenForm: getSpokenFullForm(
          person,
          verb,
          form,
          tense,
          auxiliaryForm
        ),
      };
    });
  }

  if (!pattern.endings) return [];

  const stem = getStem(verb.infinitive, pattern);

  return persons.map((person, index) => {
    const ending = pattern.endings[index] ?? "";
    const form = `${stem}${ending}`;

    return {
      personId: person.id,
      pronoun: getDisplayPronoun(person, verb, tense, form),
      stem,
      ending,
      form,
      fullForm: getFullDisplayForm(person, verb, form, tense, form),
      spokenForm: getSpokenFullForm(person, verb, form, tense, form),
    };
  });
}