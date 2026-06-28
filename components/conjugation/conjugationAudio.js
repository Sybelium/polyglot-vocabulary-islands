export function getVoiceForLang(speechLang) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();

  const preferredNames = [
    "Google français",
    "Microsoft Denise",
    "Microsoft Henri",
    "Audrey",
    "Thomas",
    "Amélie",
  ];

  return (
    voices.find(
      (voice) =>
        voice.lang === speechLang &&
        preferredNames.some((name) => voice.name.includes(name))
    ) ||
    voices.find((voice) => voice.lang === speechLang) ||
    voices.find((voice) => voice.lang?.startsWith(speechLang.split("-")[0])) ||
    null
  );
}

export function speakConjugation(text, speechLang = "fr-FR", onEnd) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getVoiceForLang(speechLang);

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = speechLang;
  }

  utterance.rate = 0.9;
utterance.pitch = 0.95;
utterance.volume = 1;

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}