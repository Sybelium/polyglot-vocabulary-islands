"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildIrregularRows, normalizeAnswer, shuffleArray } from "./irregularConjugationUtils";

export default function IrregularFormExercise({ verb, tense, persons, mode = "choose" }) {
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const inputRef = useRef(null);
  const rows = useMemo(() => buildIrregularRows(verb, tense, persons), [verb, tense, persons]);
  const isCompound = tense?.patternType === "compound";
  const isFull = mode === "full";
  const isChoose = mode === "choose";

  const tenseLabel =
    tense?.label?.en ||
    tense?.label?.it ||
    tense?.name?.en ||
    tense?.name?.it ||
    tense?.id?.replaceAll("-", " ") ||
    "Tense";

  const exerciseTitle = `${tenseLabel} of ${verb?.infinitive || ""}`.trim();

  useEffect(() => {
    if (!rows.length) return;
    setQuestions(shuffleArray(rows));
    setQuestionIndex(0);
    setAnswer("");
    setSelected(null);
    setFeedback(null);
    setScore(0);
    setFinished(false);
  }, [rows]);

  useEffect(() => {
    if (!isChoose && !finished) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [questionIndex, finished, isChoose]);

  const currentQuestion = questions[questionIndex];

  function expectedShort(row) {
    return isCompound ? row.auxiliary : row.form;
  }

  const choices = useMemo(() => {
    if (!currentQuestion || !isChoose) return [];

    const correct = expectedShort(currentQuestion);
    const pool = rows.map((row) => expectedShort(row)).filter(Boolean);
    const unique = [...new Set([correct, ...shuffleArray(pool).filter((item) => item !== correct)])];

    return shuffleArray(unique.slice(0, 4));
  }, [currentQuestion, rows, isChoose, isCompound]);

  function goNext() {
    const nextIndex = questionIndex + 1;
    if (nextIndex >= questions.length) {
      setFinished(true);
      return;
    }

    setQuestionIndex(nextIndex);
    setAnswer("");
    setSelected(null);
    setFeedback(null);
  }

  function restart() {
    setQuestions(shuffleArray(rows));
    setQuestionIndex(0);
    setAnswer("");
    setSelected(null);
    setFeedback(null);
    setScore(0);
    setFinished(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleChoose(choice) {
    if (!currentQuestion || feedback) return;

    const correct = expectedShort(currentQuestion);
    setSelected(choice);

    if (choice === correct) {
      setFeedback("correct");
      setScore((value) => value + 1);
      setTimeout(goNext, 700);
    } else {
      setFeedback("wrong");
      setTimeout(() => {
        setSelected(null);
        setFeedback(null);
      }, 900);
    }
  }

  function checkAnswer(event) {
    event.preventDefault();
    if (!currentQuestion || feedback) return;

    const accepted = isFull
      ? [currentQuestion.fullForm, currentQuestion.form]
      : [expectedShort(currentQuestion)];

    const isCorrect = accepted.some(
      (item) => normalizeAnswer(answer) === normalizeAnswer(item)
    );

    if (isCorrect) {
      setFeedback("correct");
      setScore((value) => value + 1);
      setTimeout(goNext, 700);
    } else {
      setFeedback("wrong");
      setTimeout(() => {
        setFeedback(null);
        setAnswer("");
        setTimeout(() => inputRef.current?.focus(), 50);
      }, 900);
    }
  }

  if (!currentQuestion) return null;

  if (finished) {
    return (
      <section className="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Exercise complete</p>
        <h2 className="mt-2 text-3xl font-black text-slate-900">
          Score: {score} / {questions.length}
        </h2>
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

  const title = isChoose ? "Choose the form" : isFull ? "Type the full form" : "Type the form";
  const subtitle = isChoose
    ? isCompound ? "Click the correct auxiliary." : "Click the correct irregular form."
    : isFull ? "Write the complete form, including the pronoun."
    : isCompound ? "Type the conjugated auxiliary." : "Type only the conjugated verb form.";

  const accent = isChoose ? "sky" : isFull ? "violet" : "amber";
  const feedbackClass =
    feedback === "correct"
      ? "border-emerald-300 bg-emerald-50"
      : feedback === "wrong"
      ? "border-red-300 bg-red-50"
      : "border-slate-200 bg-white";

  return (
    <section className={`mt-8 rounded-3xl border border-${accent}-100 bg-white p-6 shadow-sm`}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={`text-sm font-black uppercase tracking-wide text-${accent}-600`}>Exercise</p>
          <h2 className="mt-1 text-3xl font-black text-slate-900">{title}</h2>
          <p className="mt-2 text-slate-600">{subtitle}</p>
        </div>
        <div className={`rounded-2xl bg-${accent}-50 px-5 py-3 font-black text-${accent}-700`}>
          {questionIndex + 1} / {questions.length} · Score {score}
        </div>
      </div>

      <div className={`rounded-3xl border p-6 text-center transition ${feedbackClass}`}>
        <p className="text-sm font-black uppercase tracking-wide text-slate-500">
          {exerciseTitle}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-4xl font-black">
          {isFull ? (
            <>
              <span className="text-slate-700">{currentQuestion.pronoun}</span>
              <span className="text-slate-400">+</span>
              <span className="text-blue-700">{verb.infinitive}</span>
            </>
          ) : (
            <>
              <span className="text-slate-700">{currentQuestion.pronoun}</span>
              <span className="rounded-xl border-2 border-dashed border-amber-400 px-3 py-2 text-orange-600">?</span>
              {isCompound && <span className="text-blue-700">{currentQuestion.participle}</span>}
            </>
          )}
        </div>

        {isChoose ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {choices.map((choice) => {
              const correct = expectedShort(currentQuestion);
              const stateClass =
                feedback && choice === correct
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : feedback && choice === selected
                  ? "border-red-400 bg-red-50 text-red-700"
                  : "border-slate-200 bg-white text-slate-800 hover:border-sky-300 hover:bg-sky-50";

              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => handleChoose(choice)}
                  disabled={Boolean(feedback)}
                  className={`rounded-2xl border px-5 py-4 text-xl font-black transition ${stateClass}`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={checkAnswer} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <input
              ref={inputRef}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              disabled={Boolean(feedback)}
              placeholder={isFull ? "full form..." : isCompound ? "auxiliary..." : "form..."}
              className="w-full max-w-md rounded-2xl border border-slate-200 px-4 py-3 text-center text-2xl font-black text-slate-900 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:bg-slate-100"
            />
            <button
              type="submit"
              disabled={Boolean(feedback)}
              className="rounded-2xl bg-amber-500 px-6 py-3 font-black text-white shadow-sm hover:bg-amber-600 disabled:opacity-60"
            >
              Check
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
