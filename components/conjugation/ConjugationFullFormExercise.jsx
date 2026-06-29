"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildConjugationRows } from "./conjugationUtils";

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function normalizeAnswer(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ");
}

function getAcceptedAnswers(question) {
  const fullForm = normalizeAnswer(question.fullForm);
  const verbOnly = normalizeAnswer(question.form);

  return [...new Set([fullForm, verbOnly].filter(Boolean))];
}

export default function ConjugationFullFormExercise({
  verb,
  pattern,
  persons,
  tense,
}) {
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const inputRef = useRef(null);

  const rows = useMemo(() => {
    return buildConjugationRows(verb, pattern, persons, tense);
  }, [verb, pattern, persons, tense]);

  useEffect(() => {
    if (!rows.length) return;

    setQuestions(shuffleArray(rows));
    setQuestionIndex(0);
    setAnswer("");
    setFeedback(null);
    setScore(0);
    setFinished(false);
  }, [rows]);

  useEffect(() => {
    if (finished) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [questionIndex, finished]);

  const currentQuestion = questions[questionIndex];
  const tenseLabel = tense?.label?.en || "Selected tense";

  function restart() {
    setQuestions(shuffleArray(rows));
    setQuestionIndex(0);
    setAnswer("");
    setFeedback(null);
    setScore(0);
    setFinished(false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }

  function goNext() {
    const nextIndex = questionIndex + 1;

    if (nextIndex >= questions.length) {
      setFinished(true);
      return;
    }

    setQuestionIndex(nextIndex);
    setAnswer("");
    setFeedback(null);
  }

  function checkAnswer(event) {
    event.preventDefault();

    if (!currentQuestion || feedback) return;

    const normalizedUserAnswer = normalizeAnswer(answer);
    const acceptedAnswers = getAcceptedAnswers(currentQuestion);
    const isCorrect = acceptedAnswers.includes(normalizedUserAnswer);

    if (isCorrect) {
      setFeedback("correct");
      setScore((value) => value + 1);

      setTimeout(() => {
        goNext();
      }, 700);
    } else {
      setFeedback("wrong");

      setTimeout(() => {
        setFeedback(null);
        setAnswer("");

        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }, 900);
    }
  }

  if (!verb || !pattern || !currentQuestion) {
    return null;
  }

  if (finished) {
    return (
      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm md:p-6">
        <p className="text-[11px] font-black uppercase tracking-wide text-emerald-700 md:text-sm">
          Exercise complete
        </p>

        <h2 className="mt-1 text-2xl font-black text-slate-900 md:text-3xl">
          Score: {score} / {questions.length}
        </h2>

        <p className="mt-2 text-sm font-semibold text-slate-700 md:text-base">
          You practiced full forms for{" "}
          <span className="font-black">{verb.infinitive}</span>.
        </p>

        <button
          type="button"
          onClick={restart}
          className="mt-4 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-emerald-700"
        >
          Practice again
        </button>
      </section>
    );
  }

  const feedbackClass =
    feedback === "correct"
      ? "border-emerald-300 bg-emerald-50"
      : feedback === "wrong"
      ? "border-red-300 bg-red-50"
      : "border-slate-200 bg-white";

  return (
    <section className="rounded-2xl border border-violet-100 bg-white p-3 shadow-sm md:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wide text-violet-600 md:text-sm">
            Exercise
          </p>

          <h2 className="truncate text-2xl font-black leading-tight text-slate-900 md:text-3xl">
            Type the full form
          </h2>

          <p className="mt-1 hidden text-sm font-semibold text-slate-600 sm:block">
            Write the full form or only the verb form.
          </p>
        </div>

        <div className="shrink-0 rounded-2xl bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 md:text-sm">
          {questionIndex + 1}/{questions.length}
          <span className="hidden sm:inline"> · Score </span>
          <span className="sm:hidden"> · </span>
          {score}
        </div>
      </div>

      <form
        onSubmit={checkAnswer}
        className={`rounded-2xl border p-2 transition md:p-4 ${feedbackClass}`}
      >
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl bg-slate-50 p-2 text-center">
            <div className="mb-2 flex items-center justify-center">
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">
                {tenseLabel}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 font-black">
              <span className="rounded-xl bg-white px-3 py-2 text-2xl leading-none text-slate-700 shadow-sm md:text-3xl">
                {currentQuestion.pronoun}
              </span>

              <span className="text-2xl leading-none text-slate-300 md:text-3xl">
                +
              </span>

              <span className="rounded-xl bg-blue-50 px-3 py-2 text-2xl leading-none text-blue-700 md:text-3xl">
                {verb.infinitive}
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
            <input
              ref={inputRef}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              disabled={Boolean(feedback)}
              placeholder="type..."
              className="min-w-0 rounded-2xl border border-slate-200 px-3 py-3 text-center text-xl font-black text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-100 md:text-2xl"
            />

            <button
              type="submit"
              disabled={!answer.trim() || Boolean(feedback)}
              className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 md:px-6"
            >
              Check
            </button>
          </div>

          {feedback === "correct" && (
            <div className="mt-3 rounded-2xl bg-emerald-100 px-4 py-3 text-center text-sm font-black text-emerald-800">
              Correct!{" "}
              <span className="text-emerald-900">
                {currentQuestion.fullForm}
              </span>
            </div>
          )}

          {feedback === "wrong" && (
            <div className="mt-3 rounded-2xl bg-red-100 px-4 py-3 text-center text-sm font-black text-red-700">
              Try again.
            </div>
          )}
        </div>
      </form>
    </section>
  );
}