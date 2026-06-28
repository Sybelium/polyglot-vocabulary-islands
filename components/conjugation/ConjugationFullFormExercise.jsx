"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildConjugationRows } from "./conjugationUtils";

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function normalizeAnswer(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ");
}

function getAcceptedAnswers(question) {
  const fullForm = normalizeAnswer(question.fullForm);
  const verbOnly = normalizeAnswer(question.form);

  const accepted = [fullForm, verbOnly];

  // Accept both j’aime and j'aime.
  if (fullForm.includes("'")) {
    accepted.push(fullForm.replace("'", "’"));
  }

  return accepted;
}

export default function ConjugationFullFormExercise({ verb, pattern, persons, tense, }) {
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
      }, 1000);
    }
  }

  if (!verb || !pattern || !currentQuestion) {
    return null;
  }

  if (finished) {
    return (
      <section className="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-emerald-700">
          Exercise complete
        </p>

        <h2 className="mt-2 text-3xl font-black text-slate-900">
          Score: {score} / {questions.length}
        </h2>

        <p className="mt-3 text-slate-700">
          You practiced full present tense forms for{" "}
          <span className="font-black">{verb.infinitive}</span>.
        </p>

        <button
          type="button"
          onClick={restart}
          className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white shadow-sm hover:bg-emerald-700"
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
    <section className="mt-8 rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-violet-600">
            Exercise
          </p>

          <h2 className="mt-1 text-2xl font-black text-slate-900">
            Type the full form
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Type the complete conjugated form. You can write the full form with
            the pronoun, or only the verb form.
          </p>
        </div>

        <div className="rounded-2xl bg-violet-50 px-4 py-3 text-sm font-black text-violet-700">
          {questionIndex + 1} / {questions.length} · Score {score}
        </div>
      </div>

      <form
        onSubmit={checkAnswer}
        className={`rounded-3xl border p-6 transition ${feedbackClass}`}
      >
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-wide text-slate-500">
  Conjugate
</p>

<p className="mt-2 inline-flex rounded-full bg-violet-50 px-4 py-2 text-sm font-black text-violet-700">
  {tenseLabel}
</p>

<div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-4xl font-black">
            <span className="rounded-2xl bg-slate-100 px-4 py-2 text-slate-700">
              {currentQuestion.pronoun}
            </span>

            <span className="text-slate-400">+</span>

            <span className="rounded-2xl bg-blue-50 px-4 py-2 text-blue-700">
              {verb.infinitive}
            </span>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <input
              ref={inputRef}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              disabled={Boolean(feedback)}
              placeholder="type the form..."
              className="w-full max-w-md rounded-2xl border border-slate-200 px-4 py-3 text-center text-2xl font-black text-slate-900 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-100"
            />

            <button
              type="submit"
              disabled={!answer.trim() || Boolean(feedback)}
              className="rounded-2xl bg-violet-600 px-6 py-3 font-black text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Check
            </button>
          </div>

          {feedback === "correct" && (
            <p className="mt-5 text-lg font-black text-emerald-700">
              Correct! {currentQuestion.fullForm}
            </p>
          )}

          {feedback === "wrong" && (
            <p className="mt-5 text-lg font-black text-red-700">
              Try again.
            </p>
          )}
        </div>
      </form>
    </section>
  );
}