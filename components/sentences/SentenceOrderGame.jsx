"use client";

import { useEffect, useMemo, useState } from "react";
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

  const questions = useMemo(() => sentences || [], [sentences]);
  const currentSentence = questions[questionIndex];

  useEffect(() => {
    if (!currentSentence) return;

    const words = splitSentenceWords(getSentenceText(currentSentence, lang));
    setAvailableWords(shuffleArray(words));
    setAnswerWords([]);
    setFeedback(null);
  }, [currentSentence, lang]);

  function chooseWord(word) {
    setAvailableWords((items) => items.filter((item) => item.id !== word.id));
    setAnswerWords((items) => [...items, word]);
  }

  function removeWord(word) {
    setAnswerWords((items) => items.filter((item) => item.id !== word.id));
    setAvailableWords((items) => [...items, word]);
  }

  function nextQuestion() {
    const next = questionIndex + 1;

    if (next >= questions.length) {
      setFinished(true);
      return;
    }

    setQuestionIndex(next);
  }

  function checkAnswer() {
    const expected = splitSentenceWords(getSentenceText(currentSentence, lang))
      .map((word) => word.text)
      .join(" ");

    const userAnswer = answerWords.map((word) => word.text).join(" ");

    if (userAnswer === expected) {
      setFeedback("correct");
      setScore((value) => value + 1);
      setTimeout(nextQuestion, 800);
    } else {
      setFeedback("wrong");
      setTimeout(nextQuestion, 1100);
    }
  }

  function restart() {
    setQuestionIndex(0);
    setScore(0);
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
          <h2 className="text-2xl font-black text-slate-950">
            Build the sentence
          </h2>
        </div>

        <div className="rounded-2xl bg-sky-50 px-3 py-2 text-sm font-black text-sky-700">
          {questionIndex + 1}/{questions.length} · {score}
        </div>
      </div>

      <div className="rounded-3xl bg-slate-50 p-4">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
          Meaning
        </p>
        <p className="mt-1 text-lg font-black text-slate-950">
          {getSentenceText(currentSentence, supportLang)}
        </p>
      </div>

      <div className="mt-4 min-h-24 rounded-3xl border-2 border-dashed border-slate-200 bg-white p-3">
        <div className="flex flex-wrap gap-2">
          {answerWords.map((word) => (
            <button
              key={word.id}
              type="button"
              onClick={() => removeWord(word)}
              className="rounded-2xl bg-sky-600 px-3 py-2 text-sm font-black text-white"
            >
              {word.text}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {availableWords.map((word) => (
          <button
            key={word.id}
            type="button"
            onClick={() => chooseWord(word)}
            className="rounded-2xl bg-amber-100 px-3 py-2 text-sm font-black text-amber-800 hover:bg-amber-200"
          >
            {word.text}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={checkAnswer}
        disabled={!answerWords.length}
        className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-40"
      >
        Check
      </button>

      {feedback === "correct" && (
        <p className="mt-3 rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-700">
          Correct!
        </p>
      )}

      {feedback === "wrong" && (
        <p className="mt-3 rounded-2xl bg-red-100 px-4 py-3 text-center font-black text-red-700">
          Not this time. Correct answer: {getSentenceText(currentSentence, lang)}
        </p>
      )}
    </section>
  );
}