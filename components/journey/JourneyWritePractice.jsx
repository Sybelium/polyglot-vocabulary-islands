"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SpeakButton from "@/components/journey/SpeakButton";
import {
  getJourneyWordIds,
  saveJourneyStepProgress,
} from "@/lib/app/progress/saveJourneyStepProgress";

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

const speechLangs = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-PT",
  de: "de-DE",
  nl: "nl-NL",
};

function speakText(text, lang) {
  if (typeof window === "undefined") return;
  if (!text || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechLangs[lang] || "en-US";
  utterance.rate = 0.9;

  window.speechSynthesis.speak(utterance);
}

export default function JourneyWritePractice({ lang, island, words }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [failedWords, setFailedWords] = useState([]);
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);

  const inputRef = useRef(null);
  const savingRef = useRef(false);

  const currentWord = words[currentIndex];
  const currentText = currentWord ? getWordText(currentWord, lang) : "";

  async function saveWriteProgress(finalScore) {
    if (savingRef.current) return;
    if (progressSaved) return;

    savingRef.current = true;

    const result = await saveJourneyStepProgress({
      targetLang: lang,
      level: "a0",
      islandId: island.id,
      category: island.category,
      step: "write",
      score: finalScore,
      total: words.length,
      wordIds: getJourneyWordIds(words),
    });

    if (result?.success) {
      setProgressSaved(true);
    }

    savingRef.current = false;
  }

  function finishExercise(finalScore) {
    setFinished(true);
    saveWriteProgress(finalScore);
  }

  useEffect(() => {
    if (!finished && !locked) {
      inputRef.current?.focus();
    }
  }, [currentIndex, locked, finished]);

  useEffect(() => {
    if (!currentText || finished) return;

    const timer = setTimeout(() => {
      speakText(currentText, lang);
    }, 400);

    return () => clearTimeout(timer);
  }, [currentText, lang, finished]);

  function goNext(nextScore) {
    setAnswer("");
    setFeedback("");
    setLocked(false);

    if (currentIndex + 1 >= words.length) {
      finishExercise(nextScore);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  }

  function checkAnswer(event) {
    event.preventDefault();

    if (locked || !currentWord) return;

    const expected = normalizeText(currentText);
    const received = normalizeText(answer);

    setLocked(true);

    if (received === expected) {
      const nextScore = score + 1;

      setScore(nextScore);
      setFeedback("✅ Correct!");

      setTimeout(() => {
        goNext(nextScore);
      }, 700);

      return;
    }

    const nextScore = score;

    setFailedWords((prev) => [
      ...prev,
      {
        id: currentWord.id,
        expected: currentText,
        received: answer || "—",
        image: currentWord.image,
      },
    ]);

    setFeedback(`🔁 The answer was: ${currentText}`);

    setTimeout(() => {
      goNext(nextScore);
    }, 1200);
  }

  if (!currentWord && !finished) {
    return <p>No words found for this journey.</p>;
  }

  if (finished) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center shadow-2xl">
        <div className="text-6xl">✍️</div>

        <h2 className="mt-4 text-4xl font-black text-blue-950">
          Writing practice complete!
        </h2>

        <p className="mt-4 text-xl font-bold text-slate-700">
          Score: {score} / {words.length}
        </p>

        {failedWords.length > 0 ? (
          <div className="mx-auto mt-8 max-w-2xl rounded-[2rem] bg-red-50 p-5 text-left">
            <h3 className="text-xl font-black text-red-800">
              Words to review
            </h3>

            <div className="mt-4 grid gap-3">
              {failedWords.map((word, index) => (
                <div
                  key={`${word.id}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{word.image || "❔"}</div>

                    <div>
                      <div className="text-lg font-black text-blue-950">
                        {word.expected}
                      </div>

                      <div className="text-sm font-semibold text-slate-500">
                        You wrote: {word.received}
                      </div>
                    </div>
                  </div>

                  <SpeakButton text={word.expected} lang={lang} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-8 max-w-xl rounded-[2rem] bg-green-50 p-5 text-green-800">
            <div className="text-xl font-black">Perfect score!</div>

            <p className="mt-2 font-semibold">
              You wrote every word correctly.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/vocabulary/${lang}/journey/a0/${island.id}`}
              className="rounded-full bg-white px-5 py-3 font-black text-blue-900 shadow hover:bg-blue-50"
            >
              ← Back to island
            </Link>

            <Link
              href={`/vocabulary/${lang}/journey/a0/${island.id}/write`}
              className="rounded-full bg-yellow-300 px-5 py-3 font-black text-amber-950 shadow hover:bg-yellow-400"
            >
              Try again
            </Link>
          </div>

          <Link
            href={`/vocabulary/${lang}/journey/a0/${island.id}/song`}
            className="rounded-full bg-blue-600 px-5 py-3 font-black text-white shadow hover:bg-blue-700"
          >
            Continue to Song →
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
            Step 3 · Write
          </p>

          <h1 className="text-3xl font-black text-blue-950 md:text-5xl">
            Write the word
          </h1>
        </div>

        <div className="rounded-full bg-sky-100 px-4 py-2 text-sm font-black text-blue-900">
          {currentIndex + 1} / {words.length}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid place-items-center rounded-[2rem] bg-yellow-50 p-8 text-center shadow-inner">
          <div className="text-[6rem] leading-none md:text-[9rem]">
            {currentWord.image || "❔"}
          </div>

          <div className="mt-4 text-sm font-bold uppercase tracking-wide text-slate-500">
            Listen, then type the word
          </div>

          <SpeakButton text={currentText} lang={lang} />
        </div>

        <form onSubmit={checkAnswer} className="rounded-[2rem] bg-sky-50 p-6">
          <label className="block text-lg font-black text-blue-950">
            What word did you hear?
          </label>

          <input
            ref={inputRef}
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            disabled={locked}
            autoFocus
            className="mt-4 w-full rounded-2xl border-2 border-blue-200 bg-white px-5 py-4 text-3xl font-black text-blue-950 outline-none focus:border-blue-500 disabled:bg-slate-100"
            placeholder="Type here..."
          />

          {feedback && (
            <div className="mt-5 rounded-2xl bg-white p-4 text-lg font-bold text-slate-700 shadow">
              {feedback}
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={locked}
              className="rounded-full bg-blue-600 px-5 py-3 font-black text-white shadow hover:bg-blue-700 disabled:opacity-60"
            >
              Check answer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}