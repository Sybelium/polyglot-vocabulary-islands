"use client";

export function startsWithVowelOrH(word) {
  if (!word) return false;

  return /^[aeiouyhàâäéèêëîïôöùûüÿ]/i.test(word);
}

export function joinPronounAndForm(pronoun, form) {
  const trimmedPronoun = String(pronoun || "").trim();
  const trimmedForm = String(form || "").trim();

  if (!trimmedPronoun) return trimmedForm;
  if (!trimmedForm) return trimmedPronoun;

  if (trimmedPronoun.endsWith("j’") || trimmedPronoun.endsWith("j'")) {
    return `${trimmedPronoun}${trimmedForm}`;
  }

  return `${trimmedPronoun} ${trimmedForm}`;
}

export function getIrregularDisplayPronoun(
  person,
  verb,
  tense = null,
  nextWord = ""
) {
  if (!person || !verb) return "";

  const wordToCheck = nextWord || verb.infinitive;

  const basePronoun =
    person.id === "je" && startsWithVowelOrH(wordToCheck)
      ? "j’"
      : person.label;

  if (tense?.pronounPrefix === "que") {
    if (basePronoun === "j’") return "que j’";

    if (person.id === "il" || person.id === "ils") {
      return `qu’${basePronoun}`;
    }

    return `que ${basePronoun}`;
  }

  return basePronoun;
}

export function getIrregularSpokenPronoun(
  person,
  verb,
  tense = null,
  nextWord = ""
) {
  if (!person || !verb) return "";

  const wordToCheck = nextWord || verb.infinitive;

  const basePronoun =
    person.id === "je" && startsWithVowelOrH(wordToCheck)
      ? "j’"
      : person.spoken || person.label;

  if (tense?.pronounPrefix === "que") {
    if (basePronoun === "j’") return "que j’";

    if (person.id === "il" || person.id === "ils") {
      return `qu’${basePronoun}`;
    }

    return `que ${basePronoun}`;
  }

  return basePronoun;
}

export function buildIrregularRows(verb, tense, persons = []) {
  if (!verb || !tense || !persons.length) return [];

  if (tense.patternType === "compound") {
    const auxiliaryKey = verb.compound?.auxiliary || "avoir";
    const auxiliaryForms = tense.auxiliaries?.[auxiliaryKey] || [];
    const participle = verb.compound?.pastParticiple || "";

    return persons.map((person, index) => {
      const auxiliaryForm = auxiliaryForms[index] || "";
      const form = `${auxiliaryForm} ${participle}`.trim();

      const pronoun = getIrregularDisplayPronoun(
        person,
        verb,
        tense,
        auxiliaryForm
      );

      const spokenPronoun = getIrregularSpokenPronoun(
        person,
        verb,
        tense,
        auxiliaryForm
      );

      return {
        personId: person.id,
        pronoun,
        spokenPronoun,
        auxiliary: auxiliaryForm,
        participle,
        form,
        fullForm: joinPronounAndForm(pronoun, form),
        spokenForm: joinPronounAndForm(spokenPronoun, form),
      };
    });
  }

  const forms = verb.forms?.[tense.id] || [];

  return persons.map((person, index) => {
    const form = forms[index] || "";

    const pronoun = getIrregularDisplayPronoun(person, verb, tense, form);
    const spokenPronoun = getIrregularSpokenPronoun(person, verb, tense, form);

    return {
      personId: person.id,
      pronoun,
      spokenPronoun,
      form,
      fullForm: joinPronounAndForm(pronoun, form),
      spokenForm: joinPronounAndForm(spokenPronoun, form),
    };
  });
}

export function normalizeAnswer(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/\s+/g, " ");
}

export function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export function splitIrregularForm(form, infinitive) {
  if (!form) {
    return { root: "", ending: "" };
  }

  if (!infinitive) {
    return {
      root: form.slice(0, -1),
      ending: form.slice(-1),
    };
  }

  const infinitiveStem = infinitive.replace(/(are|ere|ire)$/, "");

  let i = 0;
  while (
    i < form.length &&
    i < infinitiveStem.length &&
    form[i] === infinitiveStem[i]
  ) {
    i++;
  }

  // If shared prefix is too short, fall back to a simple visual split
  if (i < 2) {
    return {
      root: form.slice(0, -1),
      ending: form.slice(-1),
    };
  }

  return {
    root: form.slice(0, i),
    ending: form.slice(i),
  };
}