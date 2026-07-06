export const SENTENCE_LANGUAGES = [
  { id: "en", label: "English", short: "EN", speechLang: "en-US" },
  { id: "fr", label: "French", short: "FR", speechLang: "fr-FR" },
  { id: "es", label: "Spanish", short: "ES", speechLang: "es-ES" },
  { id: "it", label: "Italian", short: "IT", speechLang: "it-IT" },
  { id: "pt", label: "Portuguese", short: "PT", speechLang: "pt-PT" },
  { id: "de", label: "German", short: "DE", speechLang: "de-DE" },
  { id: "nl", label: "Dutch", short: "NL", speechLang: "nl-NL" },
];

export const SENTENCE_STEPS = [
  { id: "learn", label: "Learn", shortLabel: "Learn", icon: "👂" },
  { id: "order", label: "Put words in order", shortLabel: "Order", icon: "🧩" },
  { id: "matching", label: "Matching sentences", shortLabel: "Match", icon: "🔗" },
  { id: "fill", label: "Fill in the words", shortLabel: "Fill", icon: "✍️" },
  { id: "polyglot", label: "Polyglot", shortLabel: "Polyglot", icon: "🌐" },
];

export function getSentenceLanguage(lang = "en") {
  return (
    SENTENCE_LANGUAGES.find((language) => language.id === lang) ||
    SENTENCE_LANGUAGES[0]
  );
}

export function getSupportLang(targetLang = "en") {
  return targetLang === "en" ? "fr" : "en";
}

export function getSentenceText(sentence, lang) {
  return sentence?.text?.[lang] || sentence?.text?.en || "";
}

export function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export function normalizeAnswer(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[¿¡?!.;,]/g, "")
    .replace(/\s+/g, " ");
}

export function splitSentenceWords(sentenceText) {
  return String(sentenceText || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => ({
      id: `${index}-${word}`,
      text: word,
      order: index,
    }));
}

export function chooseBlankWord(sentenceText) {
  const words = splitSentenceWords(sentenceText);

  const candidate =
    [...words]
      .reverse()
      .find((word) => normalizeAnswer(word.text).length >= 4) ||
    words[Math.max(0, words.length - 1)];

  if (!candidate) {
    return {
      displayText: sentenceText,
      answer: "",
    };
  }

  const escaped = candidate.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const displayText = String(sentenceText).replace(
    new RegExp(escaped),
    "______"
  );

  return {
    displayText,
    answer: candidate.text.replace(/[¿¡?!.;,]/g, ""),
  };
}

export function getSentenceAudioPaths({ lang, subjectId }) {
  const fileBase = `${subjectId}_${String(lang).toUpperCase()}`;

  return {
    audioSrc: `/data/audio/sentences/${lang}/${fileBase}.mp3`,
    mapSrc: `/data/sentences/audio-maps/${lang}/${fileBase}.json`,
  };
}

export function speakSentence(text, lang = "en", onEnd) {
  if (typeof window === "undefined" || !window.speechSynthesis || !text) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  const language = getSentenceLanguage(lang);
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = language.speechLang;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
}

export function stopSentenceSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}