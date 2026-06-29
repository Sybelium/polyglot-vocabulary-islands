"use client";

import { useEffect, useMemo, useState } from "react";
import { buildConjugationRows, displayEnding } from "./conjugationUtils";

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function ConjugationBuildForm({ verb, pattern, persons, tense }) {
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
  const isCompound = tense?.patternType === "compound";

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

    const uniqueWrongEndings = [...new Set(wrongEndings)].slice(0, 3);

    const nextChoices = [currentQuestion.ending, ...uniqueWrongEndings];

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
    if (feedback || !currentQuestion) return;

    setSelectedEnding(ending);

    const isCorrect = ending === currentQuestion.ending;

    if (isCorrect) {
      setFeedback("correct");
      setScore((value) => value + 1);

      setTimeout(() => {
        goNext();
      }, 700);
    } else {
      setFeedback("wrong");

      setTimeout(() => {
        setSelectedEnding(null);
        setFeedback(null);
      }, 800);
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
          You practiced endings for{" "}
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
    <section className="rounded-2xl border border-blue-100 bg-white p-3 shadow-sm md:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wide text-blue-600 md:text-sm">
            Exercise
          </p>

          <h2 className="truncate text-2xl font-black leading-tight text-slate-900 md:text-3xl">
            Choose the {isCompound ? "participle" : "ending"}
          </h2>

          <p className="mt-1 hidden text-sm font-semibold text-slate-600 sm:block">
            {isCompound
              ? "Choose the correct participle."
              : "The root is given. Pick the correct ending."}
          </p>
        </div>

        <div className="shrink-0 rounded-2xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 md:text-sm">
          {questionIndex + 1}/{questions.length}
          <span className="hidden sm:inline"> · Score </span>
          <span className="sm:hidden"> · </span>
          {score}
        </div>
      </div>

      <div className={`rounded-2xl border p-2 transition md:p-4 ${feedbackClass}`}>
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl bg-slate-50 p-3 text-center">
            <div className="flex flex-wrap items-center justify-center gap-2 font-black">
              <span className="rounded-xl bg-white px-3 py-2 text-2xl leading-none text-slate-700 shadow-sm md:text-3xl">
                {currentQuestion.pronoun}
              </span>

              <span className="rounded-xl bg-blue-50 px-3 py-2 text-2xl leading-none text-blue-700 md:text-3xl">
                {currentQuestion.stem}
              </span>

              <span
                className={`rounded-xl border-2 border-dashed px-3 py-2 text-2xl leading-none md:text-3xl ${
                  selectedEnding !== null
                    ? "border-amber-300 bg-amber-50 text-amber-700"
                    : "border-slate-300 bg-white text-slate-400"
                }`}
              >
                {selectedEnding !== null ? displayEnding(selectedEnding) : "?"}
              </span>
            </div>

          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            {choices.map((ending, index) => {
              const isSelected = selectedEnding === ending;
              const isCorrectChoice =
                feedback && ending === currentQuestion.ending;
              const isWrongChoice =
                feedback === "wrong" && isSelected && ending !== currentQuestion.ending;

              return (
                <button
                  key={`${displayEnding(ending)}-${index}`}
                  type="button"
                  onClick={() => handleEndingClick(ending)}
                  disabled={Boolean(feedback)}
                  className={`rounded-xl px-3 py-2 text-lg font-black shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed md:text-xl ${
                    isCorrectChoice
                      ? "bg-emerald-100 text-emerald-700"
                      : isWrongChoice
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
                >
                  {displayEnding(ending)}
                </button>
              );
            })}
          </div>

          {feedback === "correct" && (
            <div className="mt-3 rounded-2xl bg-emerald-100 px-4 py-3 text-center text-sm font-black text-emerald-800">
              Correct! {currentQuestion.fullForm}
            </div>
          )}

          {feedback === "wrong" && (
            <div className="mt-3 rounded-2xl bg-red-100 px-4 py-3 text-center text-sm font-black text-red-700">
              Try again.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}