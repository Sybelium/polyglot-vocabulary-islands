export function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export function getDisplayChunk(values) {
  if (Array.isArray(values)) {
    return values.join(" / ");
  }

  return values;
}

export function normalizeAnswer(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,!?;:]/g, "");
}

export function makeSpokenText(verb, config) {
  if (verb.spokenText) return verb.spokenText;

  const joinWord = config?.joinWord || "or";
  const form2 = verb.pastSimple?.join(` ${joinWord} `);
  const form3 = verb.pastParticiple?.join(` ${joinWord} `);

  return `${verb.base}, ${form2}, ${form3}`;
}

export function getAcceptedAnswers(verb, slot) {
  const values = verb[slot];

  if (Array.isArray(values)) {
    return values.map(normalizeAnswer);
  }

  return [normalizeAnswer(values)];
}

export function isAcceptedAnswer(verb, slot, userAnswer) {
  const acceptedAnswers = getAcceptedAnswers(verb, slot);
  return acceptedAnswers.includes(normalizeAnswer(userAnswer));
}

export function getEnglishFallbackVoice(voices) {
  return (
    voices.find((voice) => voice.lang === "en-US") ||
    voices.find((voice) => voice.lang?.startsWith("en-")) ||
    null
  );
}

export function getVoiceForLang(speechLang) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();

  return (
    voices.find((voice) => voice.lang === speechLang) ||
    voices.find((voice) => voice.lang?.startsWith(speechLang.split("-")[0])) ||
    null
  );
}

export function speakText(text, config, onEnd) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const speechLang = config?.speechLang || "en-US";
  const voice = getVoiceForLang(speechLang);

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = speechLang;
  }

  utterance.rate = 0.82;
  utterance.pitch = 1;

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function useBrowserVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.getVoices();
}