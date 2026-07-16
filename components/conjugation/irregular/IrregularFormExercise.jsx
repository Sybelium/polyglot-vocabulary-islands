"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildIrregularRows,
  normalizeAnswer,
  shuffleArray,
} from "./irregularConjugationUtils";

function getLocalizedText(value, preferredLang = "en") {
  if (!value) return "";
  if (typeof value === "string") return value;

  return (
    value[preferredLang] ||
    value.en ||
    value.fr ||
    value.es ||
    value.it ||
    value.pt ||
    Object.values(value).find(Boolean) ||
    ""
  );
}

function makeQuestionRows({ verbs, fallbackVerb, tense, persons }) {
  const exerciseVerbs = Array.isArray(verbs) && verbs.length
    ? verbs
    : fallbackVerb
    ? [fallbackVerb]
    : [];

  return exerciseVerbs.flatMap((currentVerb) =>
    buildIrregularRows(currentVerb, tense, persons)
      .filter((row) => row.form || row.auxiliary)
      .map((row) => ({
        ...row,
        verb: currentVerb,
        verbId: currentVerb.id,
        infinitive: currentVerb.infinitive,
        meaning: currentVerb.meaning,
      }))
  );
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

export default function IrregularFormExercise({
  verb,
  verbs = null,
  tense,
  persons,
  mode = "choose",
  scopeLabel = "",
  questionCount = 12,
}) {
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const inputRef = useRef(null);

  const exerciseVerbs = useMemo(() => {
    if (Array.isArray(verbs) && verbs.length) return verbs;
    return verb ? [verb] : [];
  }, [verbs, verb]);

  const rows = useMemo(
    () =>
      makeQuestionRows({
        verbs: exerciseVerbs,
        fallbackVerb: verb,
        tense,
        persons,
      }),
    [exerciseVerbs, verb, tense, persons]
  );

  const isCompound = tense?.patternType === "compound";
  const isFull = mode === "full";
  const isChoose = mode === "choose";

  const tenseLabel =
    tense?.label?.en ||
    tense?.label?.it ||
    tense?.label?.fr ||
    tense?.label?.es ||
    tense?.label?.pt ||
    tense?.name?.en ||
    tense?.name?.it ||
    tense?.id?.replaceAll("-", " ") ||
    "Tense";

  const visibleQuestionCount = Math.max(1, Number(questionCount) || 12);
  const uniqueVerbCount = new Set(rows.map((row) => row.verbId)).size;
  const isGroupPractice = uniqueVerbCount > 1;

  useEffect(() => {
    if (!rows.length) return;

    const nextQuestions = shuffleArray(rows).slice(
      0,
      Math.min(rows.length, visibleQuestionCount)
    );

    setQuestions(nextQuestions);
    setQuestionIndex(0);
    setAnswer("");
    setSelected(null);
    setFeedback(null);
    setScore(0);
    setFinished(false);
  }, [rows, visibleQuestionCount, mode]);

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
    const samePersonPool = rows
      .filter((row) => row.personId === currentQuestion.personId)
      .map((row) => expectedShort(row));
    const allPool = rows.map((row) => expectedShort(row));
    const unique = uniqueValues([
      correct,
      ...shuffleArray(samePersonPool).filter((item) => item !== correct),
      ...shuffleArray(allPool).filter((item) => item !== correct),
    ]);

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
    const nextQuestions = shuffleArray(rows).slice(
      0,
      Math.min(rows.length, visibleQuestionCount)
    );

    setQuestions(nextQuestions);
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
      ? [
          currentQuestion.fullForm,
          currentQuestion.form,
          ...(currentQuestion.acceptedFullForms || []),
          ...(currentQuestion.acceptedForms || []),
        ]
      : [expectedShort(currentQuestion)];

    const uniqueAccepted = uniqueValues(accepted);
    const normalizedAnswer = normalizeAnswer(answer);

    const isCorrect = uniqueAccepted.some(
      (item) => normalizedAnswer === normalizeAnswer(item)
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

  const currentVerb = currentQuestion.verb || verb;
  const currentInfinitive = currentVerb?.infinitive || "";
  const currentMeaning = getLocalizedText(currentVerb?.meaning, "en");
  const exerciseTitle = `${tenseLabel} · ${currentInfinitive}`.trim();
  const poolLabel = scopeLabel || "Selected learning focus";

  if (finished) {
    return (
      <section className="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-emerald-700">
          Exercise complete
        </p>
        <h2 className="mt-2 text-3xl font-black text-slate-900">
          Score: {score} / {questions.length}
        </h2>
        <p className="mt-2 text-sm font-bold text-emerald-800">
          Pool: {poolLabel} · {uniqueVerbCount} verb{uniqueVerbCount === 1 ? "" : "s"}
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

  const title = isChoose
    ? "Choose the form"
    : isFull
    ? "Type the full form"
    : "Type the form";

  const subtitle = isChoose
    ? isCompound
      ? "Click the correct auxiliary for this verb."
      : "Click the correct irregular form for this verb."
    : isFull
    ? "Write the complete form, including the pronoun."
    : isCompound
    ? "Type the conjugated auxiliary."
    : "Type only the conjugated verb form.";

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
          <p className={`text-sm font-black uppercase tracking-wide text-${accent}-600`}>
            Exercise
          </p>
          <h2 className="mt-1 text-3xl font-black text-slate-900">{title}</h2>
          <p className="mt-2 text-slate-600">{subtitle}</p>
          {isGroupPractice && (
            <p className="mt-2 rounded-2xl bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600">
              Pool: {poolLabel} · {uniqueVerbCount} verbs · {questions.length} questions
            </p>
          )}
        </div>
        <div className={`rounded-2xl bg-${accent}-50 px-5 py-3 font-black text-${accent}-700`}>
          {questionIndex + 1} / {questions.length} · Score {score}
        </div>
      </div>

      <div className={`rounded-3xl border p-6 text-center transition ${feedbackClass}`}>
        <p className="text-sm font-black uppercase tracking-wide text-slate-500">
          {exerciseTitle}
        </p>

        {currentMeaning && (
          <p className="mt-2 text-sm font-bold text-slate-500">
            {currentMeaning}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-4xl font-black">
          {isFull ? (
            <>
              <span className="text-slate-700">{currentQuestion.pronoun}</span>
              <span className="text-slate-400">+</span>
              <span className="text-blue-700">{currentInfinitive}</span>
            </>
          ) : (
            <>
              <span className="text-slate-700">{currentQuestion.pronoun}</span>
              <span className="rounded-xl border-2 border-dashed border-amber-400 px-3 py-2 text-orange-600">
                ?
              </span>
              {isCompound && (
                <span className="text-orange-600">{currentQuestion.participle}</span>
              )}
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
          <form
            onSubmit={checkAnswer}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
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