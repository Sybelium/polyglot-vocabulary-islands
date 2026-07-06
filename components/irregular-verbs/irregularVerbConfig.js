export const IRREGULAR_VERB_CONFIG = {
  en: {
    trainerLabel: "English trainer",
    title: "Verb Forge",
    subtitle: "English Irregular Verbs",
    description:
      "See the forms. Hear the rhythm. Repeat the groups until the verbs feel familiar.",
    totalLabel: "irregular verbs",
    groupIntro: "Listen to the 10 verb chains in this group.",
    form1: "Base",
    form2: "Past",
    form3: "Participle",
    form2Short: "Past",
    form3Short: "Participle",
    speechLang: "en-US",
    joinWord: "or",
    lists: [
    {
      id: "top-50",
      label: "50 most common",
      file: "irregular-verbs-50.json"
    },
    {
      id: "all-001-050",
      label: "All verbs 1–50",
      file: "irregular-verbs-all-001-050.json"
    },
    {
      id: "all-051-100",
      label: "All verbs 51–100",
      file: "irregular-verbs-all-051-100.json"
    },
    {
      id: "all-101-150",
      label: "All verbs 101–150",
      file: "irregular-verbs-all-101-150.json"
    },
    {
      id: "all-151-200",
      label: "All verbs 151–200",
      file: "irregular-verbs-all-151-200.json"
    },
    {
  id: "advanced-201-250",
  label: "Advanced verbs 201–250",
  file: "irregular-verbs-advanced-201-250.json"
},
{
  id: "advanced-251-300",
  label: "Advanced verbs 251–300",
  file: "irregular-verbs-advanced-251-300.json"
}
  ]
  },

  de: {
    trainerLabel: "German trainer",
    title: "Verb Forge",
    subtitle: "German Irregular Verbs",
    description:
      "See the forms. Hear the rhythm. Repeat the groups until the verbs feel familiar.",
    totalLabel: "irregular verbs",
    groupIntro: "Listen to the 10 verb chains in this group.",
    form1: "Infinitive",
    form2: "Präteritum",
    form3: "Partizip II",
    form2Short: "Präteritum",
    form3Short: "Partizip II",
    speechLang: "de-DE",
    joinWord: "oder",
    lists: [
    {
      id: "top-50",
      label: "50 most common",
      file: "irregular-verbs-50.json"
    },
    {
      id: "all-001-050",
      label: "All verbs 1–50",
      file: "irregular-verbs-all-001-050.json"
    },
    {
      id: "all-051-100",
      label: "All verbs 51–100",
      file: "irregular-verbs-all-051-100.json"
    },
    {
      id: "all-101-150",
      label: "All verbs 101–150",
      file: "irregular-verbs-all-101-150.json"
    },
    {
      id: "all-151-200",
      label: "All verbs 151–200",
      file: "irregular-verbs-all-151-200.json"
    },
    {
  id: "advanced-201-250",
  label: "Advanced verbs 201–250",
  file: "irregular-verbs-advanced-201-250.json"
},
{
  id: "advanced-251-300",
  label: "Advanced verbs 251–300",
  file: "irregular-verbs-advanced-251-300.json"
}
  ]
  },

  nl: {
    trainerLabel: "Dutch trainer",
    title: "Verb Forge",
    subtitle: "Dutch Irregular Verbs",
    description:
      "See the forms. Hear the rhythm. Repeat the groups until the verbs feel familiar.",
    totalLabel: "irregular verbs",
    groupIntro: "Listen to the 10 verb chains in this group.",
    form1: "Infinitive",
    form2: "Past",
    form3: "Past participle",
    form2Short: "Past",
    form3Short: "Participle",
    speechLang: "nl-NL",
    joinWord: "of",
    lists: [
    {
      id: "top-50",
      label: "50 most common",
      file: "irregular-verbs-50.json"
    },
    {
      id: "all-001-050",
      label: "All verbs 1–50",
      file: "irregular-verbs-all-001-050.json"
    },
    {
      id: "all-051-100",
      label: "All verbs 51–100",
      file: "irregular-verbs-all-051-100.json"
    },
    {
      id: "all-101-150",
      label: "All verbs 101–150",
      file: "irregular-verbs-all-101-150.json"
    },
    {
      id: "all-151-200",
      label: "All verbs 151–200",
      file: "irregular-verbs-all-151-200.json"
    },
    {
  id: "advanced-201-250",
  label: "Advanced verbs 201–250",
  file: "irregular-verbs-advanced-201-250.json"
},
{
  id: "advanced-251-300",
  label: "Advanced verbs 251–300",
  file: "irregular-verbs-advanced-251-300.json"
}
  ]
  },
};

export function getIrregularVerbConfig(targetLang = "en") {
  return IRREGULAR_VERB_CONFIG[targetLang] || IRREGULAR_VERB_CONFIG.en;
}