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

function addPronounPrefix(basePronoun, person, prefix = "") {
  if (!prefix) return basePronoun;

  if (prefix === "que") {
    if (basePronoun === "j’") return "que j’";

    if (person.id === "il" || person.id === "ils") {
      return `qu’${basePronoun}`;
    }

    return `que ${basePronoun}`;
  }

  if (prefix === "che") {
    return `che ${basePronoun}`;
  }

  return `${prefix} ${basePronoun}`;
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

  return addPronounPrefix(basePronoun, person, tense?.pronounPrefix);
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

  return addPronounPrefix(basePronoun, person, tense?.pronounPrefix);
}

function isItalianEssereAuxiliary(auxiliaryKey) {
  return auxiliaryKey === "essere";
}

function isItalianPluralPerson(person) {
  return ["noi", "voi", "loro"].includes(person?.id);
}

function replaceFinalO(value, replacement) {
  const text = String(value || "").trim();
  if (!text.endsWith("o")) return "";
  return `${text.slice(0, -1)}${replacement}`;
}

export function getItalianParticipleAgreementForms(participle) {
  const masculineSingular = String(participle || "").trim();

  if (!masculineSingular || !masculineSingular.endsWith("o")) {
    return {
      masculineSingular,
      feminineSingular: "",
      masculinePlural: "",
      femininePlural: "",
    };
  }

  return {
    masculineSingular,
    feminineSingular: replaceFinalO(masculineSingular, "a"),
    masculinePlural: replaceFinalO(masculineSingular, "i"),
    femininePlural: replaceFinalO(masculineSingular, "e"),
  };
}

function getVisibleCompoundParticiple(participle, auxiliaryKey, person) {
  if (!isItalianEssereAuxiliary(auxiliaryKey)) return participle;

  const agreementForms = getItalianParticipleAgreementForms(participle);

  if (isItalianPluralPerson(person) && agreementForms.masculinePlural) {
    return agreementForms.masculinePlural;
  }

  return agreementForms.masculineSingular || participle;
}

function getAcceptedCompoundParticiples(participle, auxiliaryKey, person) {
  if (!isItalianEssereAuxiliary(auxiliaryKey)) return [participle].filter(Boolean);

  const agreementForms = getItalianParticipleAgreementForms(participle);

  if (isItalianPluralPerson(person)) {
    return [
      agreementForms.masculinePlural,
      agreementForms.femininePlural,
    ].filter(Boolean);
  }

  return [
    agreementForms.masculineSingular,
    agreementForms.feminineSingular,
  ].filter(Boolean);
}

export function buildIrregularRows(verb, tense, persons = []) {
  if (!verb || !tense || !persons.length) return [];

  if (tense.patternType === "compound") {
    const auxiliaryKey = verb.compound?.auxiliary || "avoir";
    const auxiliaryForms = tense.auxiliaries?.[auxiliaryKey] || [];
    const baseParticiple = verb.compound?.pastParticiple || "";

    return persons.map((person, index) => {
      const auxiliaryForm = auxiliaryForms[index] || "";
      const participle = getVisibleCompoundParticiple(
        baseParticiple,
        auxiliaryKey,
        person
      );
      const form = `${auxiliaryForm} ${participle}`.trim();

      const acceptedParticiples = getAcceptedCompoundParticiples(
        baseParticiple,
        auxiliaryKey,
        person
      );
      const acceptedForms = acceptedParticiples.map((acceptedParticiple) =>
        `${auxiliaryForm} ${acceptedParticiple}`.trim()
      );

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
        baseParticiple,
        form,
        fullForm: joinPronounAndForm(pronoun, form),
        spokenForm: joinPronounAndForm(spokenPronoun, form),
        acceptedForms,
        acceptedFullForms: acceptedForms.map((acceptedForm) =>
          joinPronounAndForm(pronoun, acceptedForm)
        ),
        acceptedSpokenForms: acceptedForms.map((acceptedForm) =>
          joinPronounAndForm(spokenPronoun, acceptedForm)
        ),
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
      acceptedForms: [form].filter(Boolean),
      acceptedFullForms: [joinPronounAndForm(pronoun, form)].filter(Boolean),
      acceptedSpokenForms: [joinPronounAndForm(spokenPronoun, form)].filter(Boolean),
    };
  });
}

function getLocalizedText(value, preferredLang = "en") {
  if (!value) return "";
  if (typeof value === "string") return value;

  return value[preferredLang] || value.en || value.it || value.fr || "";
}

function addUniqueNote(notes, note) {
  const text = String(note || "").trim();
  if (!text || notes.includes(text)) return;
  notes.push(text);
}

function getRegularPastParticipleGuess(infinitive) {
  const text = String(infinitive || "").trim();

  if (text.endsWith("are")) return `${text.slice(0, -3)}ato`;
  if (text.endsWith("ere")) return `${text.slice(0, -3)}uto`;
  if (text.endsWith("ire")) return `${text.slice(0, -3)}ito`;

  return "";
}

function getAgreementFootnote(participle) {
  const forms = getItalianParticipleAgreementForms(participle);

  if (
    forms.masculineSingular &&
    forms.feminineSingular &&
    forms.masculinePlural &&
    forms.femininePlural
  ) {
    return `Shown in masculine forms. With essere, the participle agrees with the subject: ${forms.masculineSingular} / ${forms.feminineSingular} / ${forms.masculinePlural} / ${forms.femininePlural}.`;
  }

  return "With essere, the participle agrees with the subject in gender and number.";
}

export function buildIrregularFootnotes(verb, tense = null) {
  if (!verb) return [];

  const notes = [];
  const auxiliaryKey = verb.compound?.auxiliary || "";
  const pastParticiple = verb.compound?.pastParticiple || "";
  const regularParticipleGuess = getRegularPastParticipleGuess(verb.infinitive);
  const isOtherFormsView = !tense || tense.patternType === "otherForms";
  const isCompoundView = tense?.patternType === "compound";
  const shouldExplainCompoundDetails = isOtherFormsView || isCompoundView;

  if (isOtherFormsView) {
    addUniqueNote(notes, getLocalizedText(verb.note));
  }

  if (shouldExplainCompoundDetails) {
    addUniqueNote(notes, getLocalizedText(verb.compound?.note));
  }

  if (verb.family === "piacere-family") {
    addUniqueNote(
      notes,
      "Piacere works like “to be pleasing”: mi piace = I like it; mi piacciono = I like them."
    );
  }

  if (
    shouldExplainCompoundDetails &&
    isItalianEssereAuxiliary(auxiliaryKey) &&
    pastParticiple
  ) {
    addUniqueNote(notes, getAgreementFootnote(pastParticiple));
  }

  if (
    shouldExplainCompoundDetails &&
    pastParticiple &&
    regularParticipleGuess &&
    pastParticiple !== regularParticipleGuess
  ) {
    addUniqueNote(notes, `Irregular past participle: ${pastParticiple}.`);
  }

  return notes;
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
