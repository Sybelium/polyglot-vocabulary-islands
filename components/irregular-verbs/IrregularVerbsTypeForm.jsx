"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getDisplayChunk,
  isAcceptedAnswer,
  makeSpokenText,
  normalizeAnswer,
  shuffleArray,
  speakText,
  getAcceptedAnswers,
} from "@/components/irregular-verbs/irregularVerbUtils";

function makeChainChunks(verb) {
  return {
    base: verb.base,
    pastSimple: getDisplayChunk(verb.pastSimple),
    pastParticiple: getDisplayChunk(verb.pastParticiple),
  };
}

function getRandomMissingSlot() {
  const slots = ["pastSimple", "pastParticiple"];
  return slots[Math.floor(Math.random() * slots.length)];
}

export default function IrregularVerbsTypeForm({
  verbs = [],
  config,
  onBack,
}) {
  const inputRef = useRef(null);
  
  const [questionOrder, setQuestionOrder] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [missingSlot, setMissingSlot] = useState("pastSimple");
  const [answer, setAnswer] = useState("");
  const [pastAnswer, setPastAnswer] = useState("");
  const [participleAnswer, setParticipleAnswer] = useState("");
  const [typeMode, setTypeMode] = useState("one");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
const [mistakenItems, setMistakenItems] = useState([]);
const [finished, setFinished] = useState(false);

  const totalQuestions = verbs.length;

  useEffect(() => {
    if (!verbs.length) return;

    setQuestionOrder(shuffleArray(verbs));
    setQuestionIndex(0);
    setMissingSlot(getRandomMissingSlot());
    setAnswer("");
    setPastAnswer("");
    setParticipleAnswer("");
    setFeedback(null);
    setScore(0);
    setMistakes(0);
setMistakenItems([]);
setFinished(false);
  }, [verbs]);

  const currentVerb = useMemo(() => {
    return questionOrder[questionIndex] || null;
  }, [questionOrder, questionIndex]);

  const chain = useMemo(() => {
    if (!currentVerb) return null;
    return makeChainChunks(currentVerb);
  }, [currentVerb]);

  useEffect(() => {
    if (!currentVerb) return;

    setMissingSlot(getRandomMissingSlot());
    setAnswer("");
    setPastAnswer("");
    setParticipleAnswer("");
    setFeedback(null);
  }, [currentVerb]);

  useEffect(() => {
  if (finished) return;

  const timer = setTimeout(() => {
    inputRef.current?.focus();
  }, 50);

  return () => clearTimeout(timer);
}, [questionIndex, finished]);

  function goToNextQuestion() {
    if (questionIndex + 1 >= totalQuestions) {
      setFinished(true);
      setFeedback(null);
      setAnswer("");
      setPastAnswer("");
      setParticipleAnswer("");
      return;
    }

    setQuestionIndex((value) => value + 1);
  }

  function recordMistake(mistake) {
  if (!currentVerb) return;

  setMistakenItems((items) => [
    ...items,
    {
      id: `${currentVerb.id}-${questionIndex}-${Date.now()}`,
      verbId: currentVerb.id,
      base: currentVerb.base,
      display: currentVerb.display,
      translation: currentVerb.translations?.fr || "",
      groupName: currentVerb.groupName || "",
      ...mistake,
    },
  ]);
}

  function handleSubmit(event) {
  event.preventDefault();

  if (!currentVerb || !chain || feedback) return;

  if (typeMode === "two") {
    const pastIsCorrect = isAcceptedAnswer(
      currentVerb,
      "pastSimple",
      pastAnswer
    );

    const participleIsCorrect = isAcceptedAnswer(
      currentVerb,
      "pastParticiple",
      participleAnswer
    );

    const isCorrect = pastIsCorrect && participleIsCorrect;

    if (isCorrect) {
      setFeedback("correct");
      setScore((value) => value + 1);
      speakText(makeSpokenText(currentVerb, config), config);

      setTimeout(() => {
        goToNextQuestion();
      }, 1200);
    } else {
  setFeedback("wrong");
  setMistakes((value) => value + 1);

  recordMistake({
    mode: "two",
    expected: `${chain?.pastSimple} → ${chain?.pastParticiple}`,
    userAnswer: `${pastAnswer.trim() || "—"} → ${
      participleAnswer.trim() || "—"
    }`,
    pastCorrect: pastIsCorrect,
    participleCorrect: participleIsCorrect,
  });

  setTimeout(() => {
    goToNextQuestion();
  }, 1100);
}

    return;
  }

  const userAnswer = normalizeAnswer(answer);
  const acceptedAnswers = getAcceptedAnswers(currentVerb, missingSlot);
  const isCorrect = acceptedAnswers.includes(userAnswer);

  if (isCorrect) {
    setFeedback("correct");
    setScore((value) => value + 1);
    speakText(makeSpokenText(currentVerb, config), config);

    setTimeout(() => {
      goToNextQuestion();
    }, 1200);
  } else {
  setFeedback("wrong");
  setMistakes((value) => value + 1);

  recordMistake({
    mode: "one",
    slot: missingSlot,
    expected: correctDisplay,
    userAnswer: answer.trim() || "—",
  });

  setTimeout(() => {
    goToNextQuestion();
  }, 1100);
}
}

  function restartExercise() {
    setQuestionOrder(shuffleArray(verbs));
    setQuestionIndex(0);
    setMissingSlot(getRandomMissingSlot());
    setAnswer("");
    setPastAnswer("");
    setParticipleAnswer("");
    setFeedback(null);
    setScore(0);
    setMistakes(0);
    setMistakenItems([]);
    setFinished(false);
  }

  const correctDisplay = chain?.[missingSlot] || "";

  if (!verbs.length) {
    return (
      <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 text-center shadow-sm">
        <p className="font-semibold text-slate-600">
          No verbs available for this group.
        </p>
      </div>
    );
  }

  if (finished) {
  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/90 p-6 text-center shadow-sm md:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">
        Typing complete
      </p>

      <h2 className="mt-3 text-4xl font-black text-slate-900">
        Strong memory work!
      </h2>

      <div className="mx-auto mt-5 grid max-w-xl gap-3 sm:grid-cols-3">
        <div className="rounded-3xl bg-emerald-50 px-4 py-4">
          <p className="text-xs font-black uppercase text-emerald-600">
            Score
          </p>
          <p className="mt-1 text-3xl font-black text-emerald-800">
            {score} / {totalQuestions}
          </p>
        </div>

        <div className="rounded-3xl bg-red-50 px-4 py-4">
          <p className="text-xs font-black uppercase text-red-600">
            Mistakes
          </p>
          <p className="mt-1 text-3xl font-black text-red-700">
            {mistakes}
          </p>
        </div>

        <div className="rounded-3xl bg-slate-50 px-4 py-4">
          <p className="text-xs font-black uppercase text-slate-500">
            Success
          </p>
          <p className="mt-1 text-3xl font-black text-slate-800">
            {Math.round((score / totalQuestions) * 100)}%
          </p>
        </div>
      </div>

      {mistakenItems.length > 0 && (
        <div className="mx-auto mt-7 max-w-3xl text-left">
          <h3 className="text-lg font-black text-slate-900">
            Mistaken words
          </h3>

          <div className="mt-3 grid gap-3">
            {mistakenItems.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-red-100 bg-red-50 px-4 py-3"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xl font-black text-slate-900">
                      {item.display || item.base}
                    </p>

                    {item.translation && (
                      <p className="text-sm font-bold text-slate-500">
                        {item.translation}
                      </p>
                    )}
                  </div>

                  {item.groupName && (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">
                      {item.groupName}
                    </span>
                  )}
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white px-3 py-2">
                    <p className="text-xs font-black uppercase text-red-400">
                      Your answer
                    </p>
                    <p className="mt-1 text-sm font-black text-red-700">
                      {item.userAnswer}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-3 py-2">
                    <p className="text-xs font-black uppercase text-emerald-500">
                      Correct answer
                    </p>
                    <p className="mt-1 text-sm font-black text-emerald-700">
                      {item.expected}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mistakenItems.length === 0 && (
        <p className="mt-6 text-lg font-black text-emerald-700">
          Perfect round — no mistaken words!
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={restartExercise}
          className="rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Try again
        </button>

        <button
          onClick={onBack}
          className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Back to gallery
        </button>
      </div>
    </section>
  );
}

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-600">
            Exercise
          </p>

          <h2 className="mt-1 text-3xl font-black text-slate-900">
            Type the Form
          </h2>

          <p className="mt-2 text-slate-600">
            Type the missing part of the verb chain.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
  <button
    type="button"
    onClick={() => {
      setTypeMode("one");
      setFeedback(null);
      setAnswer("");
      setPastAnswer("");
      setParticipleAnswer("");

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }}
    className={`rounded-full px-4 py-2 text-xs font-black transition ${
      typeMode === "one"
        ? "bg-rose-600 text-white"
        : "bg-rose-100 text-rose-700 hover:bg-rose-200"
    }`}
  >
    One missing
  </button>

  <button
    type="button"
    onClick={() => {
      setTypeMode("two");
      setFeedback(null);
      setAnswer("");
      setPastAnswer("");
      setParticipleAnswer("");

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }}
    className={`rounded-full px-4 py-2 text-xs font-black transition ${
      typeMode === "two"
        ? "bg-slate-900 text-white"
        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
    }`}
  >
    Two missing
  </button>
</div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700">
            {questionIndex + 1} / {totalQuestions}
          </div>

          <div className="rounded-full bg-emerald-100 px-5 py-3 text-sm font-bold text-emerald-800">
            Score: {score}
          </div>

          <div className="rounded-full bg-red-100 px-5 py-3 text-sm font-bold text-red-700">
            Mistakes: {mistakes}
          </div>

          <button
            onClick={onBack}
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Back
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-3xl bg-gradient-to-br from-rose-50 to-amber-50 p-5 md:p-8">
        <p className="text-center text-sm font-bold uppercase tracking-wide text-slate-400">
          Complete the chain
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
  <div className="rounded-3xl bg-white px-4 py-6 text-center shadow-sm">
    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
      {config?.form1 || "Base"}
    </p>
    <p className="mt-2 text-3xl font-black text-slate-900">
      {chain?.base}
    </p>
  </div>

  <div
    className={`rounded-3xl px-4 py-6 text-center shadow-sm ${
      feedback === "correct" &&
      (typeMode === "two" || missingSlot === "pastSimple")
        ? "bg-emerald-50"
        : feedback === "wrong" &&
          (typeMode === "two" || missingSlot === "pastSimple")
        ? "bg-red-50"
        : "bg-white"
    }`}
  >
    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
      {config?.form2 || "Past"}
    </p>
    <p className="mt-2 text-3xl font-black text-amber-700">
      {typeMode === "two"
        ? feedback === "correct"
          ? chain?.pastSimple
          : "?"
        : missingSlot === "pastSimple"
        ? feedback === "correct"
          ? correctDisplay
          : "?"
        : chain?.pastSimple}
    </p>
  </div>

  <div
    className={`rounded-3xl px-4 py-6 text-center shadow-sm ${
      feedback === "correct" &&
      (typeMode === "two" || missingSlot === "pastParticiple")
        ? "bg-emerald-50"
        : feedback === "wrong" &&
          (typeMode === "two" || missingSlot === "pastParticiple")
        ? "bg-red-50"
        : "bg-white"
    }`}
  >
    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
      {config?.form3 || "Participle"}
    </p>
    <p className="mt-2 text-3xl font-black text-sky-700">
      {typeMode === "two"
        ? feedback === "correct"
          ? chain?.pastParticiple
          : "?"
        : missingSlot === "pastParticiple"
        ? feedback === "correct"
          ? correctDisplay
          : "?"
        : chain?.pastParticiple}
    </p>
  </div>
</div>

        <form
  onSubmit={handleSubmit}
  className={`mx-auto mt-8 flex max-w-2xl flex-col gap-3 ${
    typeMode === "one" ? "sm:flex-row" : ""
  }`}
>
  {typeMode === "one" && (
    <>
      <input
        ref={inputRef}
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        disabled={!!feedback}
        autoFocus
        placeholder={`Type ${
  missingSlot === "pastSimple"
    ? config?.form2 || "Past"
    : config?.form3 || "Participle"
}...`}
        className="min-h-14 flex-1 rounded-2xl border border-slate-200 bg-white px-5 text-xl font-bold text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 disabled:bg-slate-100"
      />

      <button
        type="submit"
        disabled={!answer.trim() || !!feedback}
        className="rounded-2xl bg-slate-900 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Check
      </button>
    </>
  )}

  {typeMode === "two" && (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          ref={inputRef}
          value={pastAnswer}
          onChange={(event) => setPastAnswer(event.target.value)}
          disabled={!!feedback}
          autoFocus
          placeholder={`${config?.form2 || "Past"}...`}
          className="min-h-14 rounded-2xl border border-slate-200 bg-white px-5 text-xl font-bold text-amber-700 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100 disabled:bg-slate-100"
        />

        <input
          value={participleAnswer}
          onChange={(event) => setParticipleAnswer(event.target.value)}
          disabled={!!feedback}
          placeholder={`${config?.form3 || "Participle"}...`}
          className="min-h-14 rounded-2xl border border-slate-200 bg-white px-5 text-xl font-bold text-sky-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-100"
        />
      </div>

      <button
        type="submit"
        disabled={
          !pastAnswer.trim() || !participleAnswer.trim() || !!feedback
        }
        className="rounded-2xl bg-slate-900 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Check both
      </button>
    </>
  )}
</form>

        {feedback && (
  <div
    className={`mx-auto mt-6 max-w-xl rounded-3xl px-5 py-4 text-center font-black ${
      feedback === "correct"
        ? "bg-emerald-100 text-emerald-800"
        : "bg-red-100 text-red-700"
    }`}
  >
    {feedback === "correct"
      ? "Correct!"
      : typeMode === "two"
      ? `Not quite. Correct answer: ${chain?.pastSimple} → ${chain?.pastParticiple}`
      : `Not quite. Correct answer: ${correctDisplay}`}
  </div>
)}
      </div>
    </section>
  );
}