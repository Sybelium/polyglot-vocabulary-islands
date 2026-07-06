"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getDisplayChunk,
  makeSpokenText,
  shuffleArray,
  speakText,
} from "@/components/irregular-verbs/irregularVerbUtils";

function makeVerbChain(verb, config) {
  return [
    {
      slot: "base",
      label: config?.form1 || "Base",
      value: verb.base,
    },
    {
      slot: "pastSimple",
      label: config?.form2 || "Past",
      value: getDisplayChunk(verb.pastSimple),
    },
    {
      slot: "pastParticiple",
      label: config?.form3 || "Participle",
      value: getDisplayChunk(verb.pastParticiple),
    },
  ];
}

export default function IrregularVerbsChainBuilder({
  verbs = [],
  config,
  onBack,
}) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionOrder, setQuestionOrder] = useState([]);
  const [choices, setChoices] = useState([]);
  const [selectedChunks, setSelectedChunks] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const totalQuestions = verbs.length;

  useEffect(() => {
    if (!verbs.length) return;

    const shuffledVerbs = shuffleArray(verbs);
    setQuestionOrder(shuffledVerbs);
    setQuestionIndex(0);
    setScore(0);
    setFinished(false);
    setFeedback(null);
    setSelectedChunks([]);
  }, [verbs]);

  const currentVerb = useMemo(() => {
    return questionOrder[questionIndex] || null;
  }, [questionOrder, questionIndex]);

  const correctChain = useMemo(() => {
    if (!currentVerb) return [];
    return makeVerbChain(currentVerb, config);
  }, [currentVerb]);

  useEffect(() => {
    if (!currentVerb) return;

    setChoices(shuffleArray(correctChain));
    setSelectedChunks([]);
    setFeedback(null);
  }, [currentVerb, correctChain]);

  function handleChoiceClick(chunk) {
    if (feedback || selectedChunks.find((item) => item.slot === chunk.slot)) {
      return;
    }

    const nextSelected = [...selectedChunks, chunk];
    setSelectedChunks(nextSelected);

    if (nextSelected.length === 3) {
      const isCorrect = nextSelected.every(
  (item, index) => item.value === correctChain[index].value
);

      if (isCorrect) {
        setFeedback("correct");
        setScore((value) => value + 1);

        if (currentVerb) {
          speakText(makeSpokenText(currentVerb, config), config);
        }

        setTimeout(() => {
          goToNextQuestion();
        }, 1300);
      } else {
        setFeedback("wrong");

        setTimeout(() => {
          setSelectedChunks([]);
          setFeedback(null);
        }, 1000);
      }
    }
  }

  function handleSelectedClick(chunk) {
    if (feedback) return;

    setSelectedChunks((items) =>
      items.filter((item) => item.slot !== chunk.slot)
    );
  }

  function goToNextQuestion() {
    if (questionIndex + 1 >= totalQuestions) {
      setFinished(true);
      setFeedback(null);
      setSelectedChunks([]);
      return;
    }

    setQuestionIndex((value) => value + 1);
  }

  function restartExercise() {
    const shuffledVerbs = shuffleArray(verbs);
    setQuestionOrder(shuffledVerbs);
    setQuestionIndex(0);
    setScore(0);
    setFinished(false);
    setFeedback(null);
    setSelectedChunks([]);
  }

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
          Exercise complete
        </p>

        <h2 className="mt-3 text-4xl font-black text-slate-900">
          Great work!
        </h2>

        <p className="mt-4 text-lg font-bold text-slate-700">
          Score: {score} / {totalQuestions}
        </p>

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
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">
            Exercise
          </p>

          <h2 className="mt-1 text-3xl font-black text-slate-900">
            Build the Chain
          </h2>

          <p className="mt-2 text-slate-600">
            Click the three forms in the right order.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700">
            {questionIndex + 1} / {totalQuestions}
          </div>

          <div className="rounded-full bg-emerald-100 px-5 py-3 text-sm font-bold text-emerald-800">
            Score: {score}
          </div>

          <button
            onClick={onBack}
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Back
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-3xl bg-gradient-to-br from-sky-50 to-amber-50 p-5 md:p-8">
        <p className="text-center text-sm font-bold uppercase tracking-wide text-slate-400">
          Verb to rebuild
        </p>

        <p className="mt-2 text-center text-4xl font-black text-slate-900">
          {currentVerb?.base}
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((slotIndex) => {
            const selected = selectedChunks[slotIndex];

            return (
              <button
                key={slotIndex}
                onClick={() => selected && handleSelectedClick(selected)}
                className={`min-h-24 rounded-3xl border-2 border-dashed px-4 py-5 text-center transition ${
                  feedback === "correct"
                    ? "border-emerald-400 bg-emerald-50"
                    : feedback === "wrong"
                    ? "border-red-400 bg-red-50"
                    : selected
                    ? "border-sky-300 bg-white"
                    : "border-slate-200 bg-white/60"
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {slotIndex === 0
                    ? "First"
                    : slotIndex === 1
                    ? "Second"
                    : "Third"}
                </p>

                <p className="mt-2 text-2xl font-black text-slate-900">
                  {selected ? selected.value : "?"}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {choices.map((choice) => {
            const alreadySelected = selectedChunks.find(
              (item) => item.slot === choice.slot
            );

            return (
              <button
                key={choice.slot}
                onClick={() => handleChoiceClick(choice)}
                disabled={alreadySelected || feedback === "correct"}
                className={`rounded-2xl px-6 py-4 text-xl font-black shadow-sm transition ${
                  alreadySelected
                    ? "cursor-not-allowed bg-slate-100 text-slate-300"
                    : "bg-white text-slate-900 hover:-translate-y-1 hover:bg-sky-50 hover:shadow-md"
                }`}
              >
                {choice.value}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div
            className={`mt-8 rounded-3xl px-5 py-4 text-center font-black ${
              feedback === "correct"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-700"
            }`}
          >
            {feedback === "correct"
              ? "Correct chain!"
              : "Not quite. Try again."}
          </div>
        )}
      </div>
    </section>
  );
}