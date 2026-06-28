"use client";

const speechLangs = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-PT",
  de: "de-DE",
  nl: "nl-NL",
};

export default function SpeakButton({
  text,
  lang = "en",
  onSpeak,
  hideLabel = false,
}) {
  function speak() {
    if (onSpeak) {
      onSpeak();
      return;
    }

    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLangs[lang] || "en-US";
    utterance.rate = 0.9;

    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      type="button"
      onClick={speak}
      className="mt-4 rounded-full bg-blue-600 px-4 py-2 text-sm font-black text-white shadow hover:bg-blue-700"
    >
      {hideLabel ? "🔊" : "🔊"}
    </button>
  );
}