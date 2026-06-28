"use client";

import { useEffect, useMemo, useState } from "react";
import { buildConjugationRows, displayEnding } from "./conjugationUtils";

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function ConjugationBuildForm({ verb, pattern, persons, tense, }) {
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [choices, setChoices] = useState([]);
  const [selectedEnding, setSelectedEnding] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const rows = useMemo(() => {
    return buildConjugationRows(verb, pattern, persons, tense);
  }, [verb, pattern, persons, tense]);

  const currentQuestion = questions[questionIndex];

  useEffect(() => {
    if (!rows.length) return;

    setQuestions(shuffleArray(rows));
    setQuestionIndex(0);
    setSelectedEnding(null);
    setFeedback(null);
    setScore(0);
    setFinished(false);
  }, [rows]);

  useEffect(() => {
    if (!currentQuestion || !rows.length) return;

    const wrongEndings = rows
      .filter((row) => row.ending !== currentQuestion.ending)
      .map((row) => row.ending);

    const uniqueWrongEndings = [...new Set(wrongEndings)].slice(0, 4);

    const nextChoices = [
      currentQuestion.ending,
      ...uniqueWrongEndings,
    ];

    setChoices(shuffleArray(nextChoices));
    setSelectedEnding(null);
    setFeedback(null);
  }, [currentQuestion, rows]);

  function restart() {
    setQuestions(shuffleArray(rows));
    setQuestionIndex(0);
    setSelectedEnding(null);
    setFeedback(null);
    setScore(0);
    setFinished(false);
  }

  function goNext() {
    const nextIndex = questionIndex + 1;

    if (nextIndex >= questions.length) {
      setFinished(true);
      return;
    }

    setQuestionIndex(nextIndex);
    setSelectedEnding(null);
    setFeedback(null);
  }

  function handleEndingClick(ending) {
    if (feedback) return;

    setSelectedEnding(ending);

    const isCorrect = ending === currentQuestion.ending;

    if (isCorrect) {
      setFeedback("correct");
      setScore((value) => value + 1);

      setTimeout(() => {
        goNext();
      }, 800);
    } else {
      setFeedback("wrong");

      setTimeout(() => {
        setSelectedEnding(null);
        setFeedback(null);
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
          You selected the present tense endings for{" "}
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
    <section className="mt-8 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-blue-600">
            Exercise
          </p>

          <h2 className="mt-1 text-2xl font-black text-slate-900">
            Choose the ending
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            The root is already given. Click the correct ending.
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700">
          {questionIndex + 1} / {questions.length} · Score {score}
        </div>
      </div>

      <div className={`rounded-3xl border p-6 transition ${feedbackClass}`}>
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-wide text-slate-500">
            Complete the conjugation
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-4xl font-black">
            <span className="rounded-2xl bg-slate-100 px-4 py-2 text-slate-700">
              {currentQuestion.pronoun}
            </span>

            <span className="rounded-2xl bg-blue-50 px-4 py-2 text-blue-700">
              {currentQuestion.stem}
            </span>

            <span
              className={`rounded-2xl border-2 border-dashed px-4 py-2 ${
                selectedEnding
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-slate-300 bg-slate-50 text-slate-400"
              }`}
            >
              {selectedEnding !== null ? displayEnding(selectedEnding) : "?"}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {choices.map((ending) => (
              <button
                key={displayEnding(ending)}
                type="button"
                onClick={() => handleEndingClick(ending)}
                disabled={Boolean(feedback)}
                className="rounded-2xl bg-amber-100 px-6 py-3 text-2xl font-black text-amber-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {displayEnding(ending)}
              </button>
            ))}
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
      </div>
    </section>
  );
}