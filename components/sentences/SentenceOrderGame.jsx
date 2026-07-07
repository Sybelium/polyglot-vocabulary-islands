"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getSentenceText,
  shuffleArray,
  splitSentenceWords,
} from "./sentenceUtils";

export default function SentenceOrderGame({ lang, supportLang, sentences }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [availableWords, setAvailableWords] = useState([]);
  const [answerWords, setAnswerWords] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const timeoutRef = useRef(null);

  const questions = useMemo(() => sentences || [], [sentences]);
  const currentSentence = questions[questionIndex];

  function clearCurrentTimer() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  useEffect(() => {
    if (!currentSentence) return;

    clearCurrentTimer();

    const words = splitSentenceWords(getSentenceText(currentSentence, lang));
    setAvailableWords(shuffleArray(words));
    setAnswerWords([]);
    setFeedback(null);

    return () => {
      clearCurrentTimer();
    };
  }, [currentSentence, lang]);

  function getExpectedAnswer(sentence) {
    return splitSentenceWords(getSentenceText(sentence, lang))
      .map((word) => word.text)
      .join(" ");
  }

  function nextQuestion() {
    const next = questionIndex + 1;

    if (next >= questions.length) {
      setFinished(true);
      return;
    }

    setQuestionIndex(next);
  }

  function checkAnswer(nextAnswerWords) {
    if (!currentSentence) return;

    const expected = getExpectedAnswer(currentSentence);
    const userAnswer = nextAnswerWords.map((word) => word.text).join(" ");

    if (userAnswer === expected) {
      setFeedback("correct");
      setScore((value) => value + 1);

      timeoutRef.current = setTimeout(() => {
        nextQuestion();
      }, 900);

      return;
    }

    setFeedback("wrong");

    timeoutRef.current = setTimeout(() => {
      nextQuestion();
    }, 1500);
  }

  function chooseWord(word) {
    if (feedback) return;

    const nextAvailableWords = availableWords.filter(
      (item) => item.id !== word.id
    );

    const nextAnswerWords = [...answerWords, word];

    setAvailableWords(nextAvailableWords);
    setAnswerWords(nextAnswerWords);

    if (nextAvailableWords.length === 0) {
      checkAnswer(nextAnswerWords);
    }
  }

  function removeWord(word) {
    if (feedback) return;

    setAnswerWords((items) => items.filter((item) => item.id !== word.id));
    setAvailableWords((items) => [...items, word]);
  }

  function restart() {
    clearCurrentTimer();
    setQuestionIndex(0);
    setScore(0);
    setFeedback(null);
    setFinished(false);
  }

  if (!currentSentence) return null;

  if (finished) {
    return (
      <section className="rounded-[2rem] bg-white p-6 text-center shadow-xl">
        <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
          Order complete
        </p>

        <h2 className="mt-2 text-3xl font-black text-slate-950">
          Score: {score} / {questions.length}
        </h2>

        <button
          type="button"
          onClick={restart}
          className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white"
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/95 p-4 shadow-xl md:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-sky-600">
            Put words in order
          </p>

          <h2 className="text-2xl font-black leading-tight text-slate-950 md:text-3xl">
            Build the sentence
          </h2>
        </div>

        <div className="rounded-2xl bg-sky-50 px-3 py-2 text-sm font-black text-sky-700 md:text-base">
          {questionIndex + 1}/{questions.length} · {score}
        </div>
      </div>

      <div className="rounded-3xl bg-slate-50 p-4 md:p-5">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
          Meaning
        </p>

        <p className="mt-1 text-lg font-black leading-snug text-slate-950 md:text-2xl">
          {getSentenceText(currentSentence, supportLang)}
        </p>
      </div>

      <div
        className={[
          "mt-4 min-h-28 rounded-3xl border-2 border-dashed p-3 transition md:min-h-32 md:p-4",
          feedback === "correct"
            ? "border-emerald-300 bg-emerald-50"
            : feedback === "wrong"
            ? "border-red-300 bg-red-50"
            : "border-slate-200 bg-white",
        ].join(" ")}
      >
        <div className="flex flex-wrap gap-2 md:gap-3">
          {answerWords.map((word) => (
            <button
              key={word.id}
              type="button"
              onClick={() => removeWord(word)}
              disabled={Boolean(feedback)}
              className="rounded-2xl bg-sky-600 px-4 py-3 text-base font-black leading-tight text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-default disabled:hover:bg-sky-600 md:px-5 md:py-4 md:text-xl"
            >
              {word.text}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 md:gap-3">
        {availableWords.map((word) => (
          <button
            key={word.id}
            type="button"
            onClick={() => chooseWord(word)}
            disabled={Boolean(feedback)}
            className="rounded-2xl bg-amber-100 px-4 py-3 text-base font-black leading-tight text-amber-800 shadow-sm transition hover:bg-amber-200 disabled:cursor-default disabled:opacity-60 md:px-5 md:py-4 md:text-xl"
          >
            {word.text}
          </button>
        ))}
      </div>

      {feedback === "correct" && (
        <p className="mt-4 rounded-2xl bg-emerald-100 px-4 py-3 text-center text-base font-black text-emerald-700 md:text-lg">
          Correct!
        </p>
      )}

      {feedback === "wrong" && (
        <div className="mt-4 rounded-2xl bg-red-100 px-4 py-3 text-center text-base font-black text-red-700 md:text-lg">
          <p>Not this time.</p>
          <p className="mt-1 text-sm md:text-base">
            Correct answer: {getSentenceText(currentSentence, lang)}
          </p>
        </div>
      )}
    </section>
  );
}