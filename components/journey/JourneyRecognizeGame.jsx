"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import SpeakButton from "@/components/journey/SpeakButton";
import {
  getJourneyWordIds,
  saveJourneyStepProgress,
} from "@/lib/app/progress/saveJourneyStepProgress";

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

function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[randomIndex]] = [copy[randomIndex], copy[i]];
  }

  return copy;
}

function speakText(text, lang) {
  if (typeof window === "undefined") return;
  if (!text || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechLangs[lang] || "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

function buildQuestions(words, lang) {
  return shuffleArray(words).map((word) => {
    const wrongChoices = shuffleArray(
      words.filter((candidate) => candidate.id !== word.id)
    ).slice(0, 3);

    const choices = shuffleArray([word, ...wrongChoices]);

    return {
      answer: word,
      prompt: getWordText(word, lang),
      choices,
    };
  });
}

export default function JourneyRecognizeGame({ lang, island, words }) {
  const [questions, setQuestions] = useState([]);
  const [isReady, setIsReady] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const [finished, setFinished] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);

  const savingRef = useRef(false);
  const advanceTimerRef = useRef(null);
  const speakTimerRef = useRef(null);
  
  useEffect(() => {
  setIsReady(false);
  setCurrentIndex(0);
  setSelectedId(null);
  setFeedback(null);
  setScore(0);
  setMistakes([]);
  setFinished(false);
  setProgressSaved(false);

  if (!Array.isArray(words) || words.length === 0) {
    setQuestions([]);
    setIsReady(true);
    return;
  }

  setQuestions(buildQuestions(words, lang));
  setIsReady(true);
}, [words, lang]);

  const currentQuestion = questions[currentIndex] || null;

  async function saveRecognizeProgress(finalScore) {
    if (savingRef.current) return;
    if (progressSaved) return;

    savingRef.current = true;

    const result = await saveJourneyStepProgress({
      targetLang: lang,
      level: "a0",
      islandId: island.id,
      category: island.category,
      step: "recognize",
      score: finalScore,
      total: questions.length,
      wordIds: getJourneyWordIds(words),
    });

    if (result?.success) {
      setProgressSaved(true);
    }

    savingRef.current = false;
  }

  function finishExercise(finalScore) {
    setFinished(true);
    setSelectedId(null);
    setFeedback(null);
    saveRecognizeProgress(finalScore);
  }

  function handleChoice(choice) {
    if (selectedId !== null || finished) return;

    const isCorrect = choice.id === currentQuestion.answer.id;
    const nextScore = isCorrect ? score + 1 : score;

    setSelectedId(choice.id);
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setScore(nextScore);
    } else {
      setMistakes((prev) => [
        ...prev,
        {
          id: currentQuestion.answer.id,
          expected: getWordText(currentQuestion.answer, lang),
          selected: getWordText(choice, lang),
          image: currentQuestion.answer.image,
        },
      ]);
    }

    advanceTimerRef.current = setTimeout(() => {
      const nextIndex = currentIndex + 1;

      if (nextIndex >= questions.length) {
        finishExercise(nextScore);
        return;
      }

      setCurrentIndex(nextIndex);
      setSelectedId(null);
      setFeedback(null);
    }, 1000);
  }

  useEffect(() => {
    if (!currentQuestion || finished) return;

    speakTimerRef.current = setTimeout(() => {
      speakText(currentQuestion.prompt, lang);
    }, 350);

    return () => {
      if (speakTimerRef.current) {
        clearTimeout(speakTimerRef.current);
      }
    };
  }, [currentQuestion, lang, finished]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }

      if (speakTimerRef.current) {
        clearTimeout(speakTimerRef.current);
      }

      if (typeof window !== "undefined") {
  window.speechSynthesis?.cancel();
}
    };
  }, []);

  if (!questions.length) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center shadow-2xl">
        <h2 className="text-3xl font-black text-blue-950">
          No words available.
        </h2>

        <Link
          href={`/vocabulary/${lang}/journey/a0/${island.id}`}
          className="mt-6 inline-block rounded-full bg-blue-600 px-5 py-3 font-black text-white shadow hover:bg-blue-700"
        >
          ← Back to island
        </Link>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center shadow-2xl">
        <div className="text-6xl">🏆</div>

        <h2 className="mt-4 text-4xl font-black text-blue-950">
          Recognition complete!
        </h2>

        <p className="mt-4 text-xl font-bold text-slate-700">
          Score: {score} / {questions.length}
        </p>

        {mistakes.length > 0 ? (
          <div className="mx-auto mt-8 max-w-2xl rounded-[2rem] bg-red-50 p-5 text-left">
            <h3 className="text-xl font-black text-red-800">
              Words to review
            </h3>

            <div className="mt-4 grid gap-3">
              {mistakes.map((mistake, index) => (
                <div
                  key={`${mistake.id}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{mistake.image || "❔"}</div>

                    <div>
                      <div className="text-lg font-black text-blue-950">
                        {mistake.expected}
                      </div>

                      <div className="text-sm font-semibold text-slate-500">
                        You chose: {mistake.selected}
                      </div>
                    </div>
                  </div>

                  <SpeakButton text={mistake.expected} lang={lang} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-8 max-w-xl rounded-[2rem] bg-green-50 p-5 text-green-800">
            <div className="text-xl font-black">Perfect score!</div>
            <p className="mt-2 font-semibold">
              You recognized every word correctly.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-between gap-3">
          <Link
            href={`/vocabulary/${lang}/journey/a0/${island.id}`}
            className="rounded-full bg-white px-5 py-3 font-black text-blue-900 shadow hover:bg-blue-50"
          >
            ← Back to island
          </Link>

          <Link
            href={`/vocabulary/${lang}/journey/a0/${island.id}/write`}
            className="rounded-full bg-blue-600 px-5 py-3 font-black text-white shadow hover:bg-blue-700"
          >
            Continue to Write →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-white p-4 shadow-2xl md:p-8">
      <div className="text-center">
        <p className="text-sm font-black uppercase tracking-wide text-blue-600">
          Question {currentIndex + 1} / {questions.length}
        </p>

        <h2 className="mt-3 text-3xl font-black text-blue-950 md:text-4xl">
          Which one do you hear?
        </h2>

        <button
          type="button"
          onClick={() => speakText(currentQuestion.prompt, lang)}
          className="mt-5 rounded-full bg-blue-600 px-5 py-3 font-black text-white shadow hover:bg-blue-700"
        >
          🔊 Play again
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
  {currentQuestion.choices.map((choice) => {
    const isSelected = selectedId === choice.id;
    const isAnswer = choice.id === currentQuestion.answer.id;

    let stateClass =
      "border-slate-200 bg-white hover:-translate-y-0.5 hover:bg-blue-50";

    if (selectedId !== null && isAnswer) {
      stateClass = "border-green-500 bg-green-100 ring-4 ring-green-200";
    }

    if (isSelected && feedback === "wrong") {
      stateClass = "border-red-500 bg-red-100 ring-4 ring-red-200";
    }

    return (
      <button
        key={choice.id}
        type="button"
        onClick={() => handleChoice(choice)}
        disabled={selectedId !== null}
        className={[
          "flex w-full items-center gap-3 rounded-[1.25rem] border-2 px-4 py-3 text-left shadow-md transition active:scale-[0.99]",
          "sm:flex-col sm:justify-center sm:p-4 sm:text-center",
          "lg:p-5",
          stateClass,
        ].join(" ")}
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-yellow-100 text-xl font-black text-yellow-700 sm:h-14 sm:w-14 sm:text-2xl lg:h-16 lg:w-16">
          {choice.image || choice.id}
        </div>

        <div className="min-w-0 flex-1 truncate text-xl font-black text-blue-950 sm:mt-3 sm:flex-none sm:text-2xl">
          {getWordText(choice, lang)}
        </div>
      </button>
    );
  })}
</div>

      <div className="mt-8 rounded-2xl bg-sky-50 p-4 text-center font-bold text-slate-700">
        Score: {score} / {questions.length}
      </div>
    </div>
  );
}