"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildConjugationRows } from "./conjugationUtils";

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function ConjugationEndingExercise({ verb, pattern, persons,tense, }) {
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

  function getExpectedAnswer(row) {
  if (tense?.patternType === "compound") {
    return row.stem;
  }

  return row.ending;
}

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

  function normalize(value) {
    return value.trim().toLowerCase();
  }

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

  const expectedAnswer = getExpectedAnswer(currentQuestion);

  const isCorrect = normalize(answer) === normalize(expectedAnswer);

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
      <section className="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-emerald-700">
          Exercise complete
        </p>

        <h2 className="mt-2 text-3xl font-black text-slate-900">
          Score: {score} / {questions.length}
        </h2>

        <p className="mt-3 text-slate-700">
          You practiced the present tense endings for{" "}
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
    <section className="mt-8 rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-amber-600">
            Exercise
          </p>

          <h2 className="mt-1 text-2xl font-black text-slate-900">
            Type the ending
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {tense?.patternType === "compound"
  ? "Look at the pronoun and type the conjugated auxiliary."
  : "Look at the pronoun and type only the orange ending."}
          </p>
        </div>

        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-black text-amber-700">
          {questionIndex + 1} / {questions.length} · Score {score}
        </div>
      </div>

      <form
        onSubmit={checkAnswer}
        className={`rounded-3xl border p-6 transition ${feedbackClass}`}
      >
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-wide text-slate-500">
            Complete the form
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-4xl font-black">
  {tense?.patternType === "compound" ? (
    <>
      <span className="text-slate-700">
        {currentQuestion.pronoun}
      </span>

      <span className="rounded-xl border-2 border-dashed border-amber-400 px-3 py-2 text-orange-600">
        ?
      </span>

      <span className="text-blue-700">
        {currentQuestion.ending}
      </span>
    </>
  ) : (
    <>
      <span className="text-slate-700">
        {currentQuestion.pronoun}
      </span>

      <span className="text-blue-700">
        {currentQuestion.stem}
      </span>

      <span className="rounded-xl border-2 border-dashed border-amber-400 px-3 py-2 text-orange-600">
        ?
      </span>
    </>
  )}
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <input
              ref={inputRef}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              disabled={Boolean(feedback)}
              placeholder="ending..."
              className="w-full max-w-xs rounded-2xl border border-slate-200 px-4 py-3 text-center text-2xl font-black text-slate-900 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:bg-slate-100"
            />

            <button
              type="submit"
              disabled={!answer.trim() || Boolean(feedback)}
              className="rounded-2xl bg-amber-500 px-6 py-3 font-black text-white shadow-sm hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
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