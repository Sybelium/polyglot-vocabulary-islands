"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SpeakButton from "@/components/journey/SpeakButton";

const speechLangs = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-PT",
  de: "de-DE",
  nl: "nl-NL",
};

function getWordText(word, lang) {
  return word[lang] || word.en || "";
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim();
}

function getAcceptedAnswers(word) {
  const values = [
    word.en,
    word.fr,
    word.es,
    word.it,
    word.pt,
    word.de,
    word.nl,
    String(word.id),
  ];

  return values.filter(Boolean).map(normalizeText);
}

export default function JourneyPronouncePractice({ lang, island, words }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState("");
  const [listening, setListening] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [finished, setFinished] = useState(false);

  const currentWord = words[currentIndex];
  const currentText = getWordText(currentWord, lang);

  const [recognitionSupported, setRecognitionSupported] = useState(false);

  const [debug, setDebug] = useState({
  supported: recognitionSupported,
  recognitionLang: speechLangs[lang] || "en-US",
  expected: "",
  heard: "",
  normalizedExpected: "",
  normalizedHeard: "",
  error: "",
});

useEffect(() => {
  const supported =
    "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

  setRecognitionSupported(supported);

  setDebug((prev) => ({
    ...prev,
    supported,
  }));
}, []);

  function markCorrect() {
    if (!completed.includes(currentWord.id)) {
      setCompleted((prev) => [...prev, currentWord.id]);
    }
  }

  function nextWord() {
    setResult("");

    if (currentIndex + 1 >= words.length) {
      setFinished(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  }

  function startListening() {
    if (!recognitionSupported) {
      setResult("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = speechLangs[lang] || "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setListening(true);
    setResult("");

    recognition.onresult = (event) => {
  const heard = event.results[0][0].transcript;
  const expected = normalizeText(currentText);
  const received = normalizeText(heard);
  const acceptedAnswers = getAcceptedAnswers(currentWord);

  setDebug({
    supported: true,
    recognitionLang: speechLangs[lang] || "en-US",
    expected: currentText,
    heard,
    normalizedExpected: expected,
    normalizedHeard: received,
    error: "",
  });

  if (acceptedAnswers.includes(received)) {
    markCorrect();
    setResult(`✅ Great! I heard: “${heard}”`);
  } else {
    setResult(`🔁 I heard: “${heard}”. Try again, or continue.`);
  }
};

    recognition.onerror = (event) => {
  setDebug((prev) => ({
    ...prev,
    supported: true,
    recognitionLang: speechLangs[lang] || "en-US",
    expected: currentText,
    normalizedExpected: normalizeText(currentText),
    error: event.error || "Unknown recognition error",
  }));

  setResult(`Speech recognition problem: ${event.error || "unknown"}`);
};

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  }

  if (!currentWord) {
    return <p>No words found for this journey.</p>;
  }

  if (finished) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center shadow-2xl">
        <div className="text-6xl">🎙️</div>
        <h2 className="mt-4 text-4xl font-black text-blue-950">
          Pronunciation practice complete!
        </h2>
        <p className="mt-4 text-xl font-bold text-slate-700">
          Practiced: {completed.length} / {words.length}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/vocabulary/${lang}/journey/a0/${island.id}/write`}
            className="rounded-full bg-blue-600 px-5 py-3 font-black text-white shadow hover:bg-blue-700"
          >
            Next: Write →
          </Link>

          <Link
            href={`/vocabulary/${lang}/journey/a0`}
            className="rounded-full bg-white px-5 py-3 font-black text-blue-900 shadow hover:bg-blue-50"
          >
            Back to island
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-2xl md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-blue-600">
            Step 3 · Pronounce
          </p>
          <h1 className="text-3xl font-black text-blue-950 md:text-5xl">
            Say the word
          </h1>
        </div>

        <div className="rounded-full bg-sky-100 px-4 py-2 text-sm font-black text-blue-900">
          {currentIndex + 1} / {words.length}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid place-items-center rounded-[2rem] bg-yellow-50 p-8 shadow-inner">
          <div className="text-[6rem] leading-none md:text-[9rem]">
            {currentWord.image || "🔊"}
          </div>
        </div>

        <div className="rounded-[2rem] bg-sky-50 p-6">
          <div className="text-center">
            <div className="text-5xl font-black text-blue-950">
              {currentText}
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <SpeakButton text={currentText} lang={lang} />

              <button
                type="button"
                onClick={startListening}
                disabled={listening}
                className="mt-4 rounded-full bg-purple-600 px-4 py-2 text-sm font-black text-white shadow hover:bg-purple-700 disabled:opacity-60"
              >
                {listening ? "Listening..." : "🎙️ Say it"}
              </button>
            </div>

            {result && (
              <div className="mt-6 rounded-2xl bg-white p-4 text-base font-bold text-slate-700 shadow">
                {result}
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  markCorrect();
                  setResult("✅ Marked as practiced.");
                }}
                className="rounded-full bg-green-600 px-5 py-3 font-black text-white shadow hover:bg-green-700"
              >
                I said it correctly
              </button>

              <button
                type="button"
                onClick={nextWord}
                className="rounded-full bg-blue-600 px-5 py-3 font-black text-white shadow hover:bg-blue-700"
              >
                Continue →
              </button>
            </div>

<div className="mt-6 rounded-2xl bg-slate-900 p-4 text-left text-sm font-mono text-green-200">
  <div>supported: {String(debug.supported)}</div>
  <div>recognitionLang: {debug.recognitionLang}</div>
  <div>expected: {debug.expected}</div>
  <div>heard: {debug.heard}</div>
  <div>normalizedExpected: {debug.normalizedExpected}</div>
  <div>normalizedHeard: {debug.normalizedHeard}</div>
  <div>error: {debug.error}</div>
</div>

            {!recognitionSupported && (
              <p className="mt-5 text-sm font-semibold text-slate-500">
                Automatic speech recognition is not available in this browser.
                You can still listen, repeat, and mark the word as practiced.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}