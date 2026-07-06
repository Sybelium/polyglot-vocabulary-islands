"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getDisplayChunk,
  makeSpokenText,
  shuffleArray,
  speakText,
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

function getWrongOptions(verbs, currentVerb, missingSlot, correctAnswer) {
  const wrongOptions = verbs
    .filter((verb) => verb.id !== currentVerb.id)
    .map((verb) => getDisplayChunk(verb[missingSlot]))
    .filter((value) => value && value !== correctAnswer);

  return [...new Set(wrongOptions)];
}

export default function IrregularVerbsMissingForm({
  verbs = [],
  config,
  onBack,
}) {
  const [questionOrder, setQuestionOrder] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [missingSlot, setMissingSlot] = useState("pastSimple");
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const totalQuestions = verbs.length;

  useEffect(() => {
    if (!verbs.length) return;

    setQuestionOrder(shuffleArray(verbs));
    setQuestionIndex(0);
    setScore(0);
    setFinished(false);
    setFeedback(null);
    setSelectedAnswer(null);
  }, [verbs]);

  const currentVerb = useMemo(() => {
    return questionOrder[questionIndex] || null;
  }, [questionOrder, questionIndex]);

  const chain = useMemo(() => {
    if (!currentVerb) return null;
    return makeChainChunks(currentVerb);
  }, [currentVerb]);

  useEffect(() => {
    if (!currentVerb || !chain) return;

    const slot = getRandomMissingSlot();
    const correctAnswer = chain[slot];

    const wrongOptions = getWrongOptions(
      verbs,
      currentVerb,
      slot,
      correctAnswer
    );

    const finalOptions = shuffleArray([
      correctAnswer,
      ...shuffleArray(wrongOptions).slice(0, 3),
    ]);

    setMissingSlot(slot);
    setOptions(finalOptions);
    setFeedback(null);
    setSelectedAnswer(null);
  }, [currentVerb, chain, verbs]);

  function goToNextQuestion() {
    if (questionIndex + 1 >= totalQuestions) {
      setFinished(true);
      setFeedback(null);
      setSelectedAnswer(null);
      return;
    }

    setQuestionIndex((value) => value + 1);
  }

  function handleAnswer(answer) {
    if (!chain || feedback) return;

    const correctAnswer = chain[missingSlot];
    const isCorrect = answer === correctAnswer;

    setSelectedAnswer(answer);
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setScore((value) => value + 1);

      if (currentVerb) {
        speakText(makeSpokenText(currentVerb, config), config);
      }

      setTimeout(() => {
        goToNextQuestion();
      }, 1200);
    } else {
      setTimeout(() => {
        setFeedback(null);
        setSelectedAnswer(null);
      }, 900);
    }
  }

  function restartExercise() {
    setQuestionOrder(shuffleArray(verbs));
    setQuestionIndex(0);
    setScore(0);
    setFinished(false);
    setFeedback(null);
    setSelectedAnswer(null);
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
          Nice work!
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
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
            Exercise
          </p>

          <h2 className="mt-1 text-3xl font-black text-slate-900">
            Missing Form
          </h2>

          <p className="mt-2 text-slate-600">
            Choose the missing part of the verb chain.
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

      <div className="mt-8 rounded-3xl bg-gradient-to-br from-amber-50 to-sky-50 p-5 md:p-8">
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
              feedback === "correct" && missingSlot === "pastSimple"
                ? "bg-emerald-50"
                : feedback === "wrong" && missingSlot === "pastSimple"
                ? "bg-red-50"
                : "bg-white"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              {config?.form2 || "Past"}
            </p>
            <p className="mt-2 text-3xl font-black text-amber-700">
              {missingSlot === "pastSimple" ? "?" : chain?.pastSimple}
            </p>
          </div>

          <div
            className={`rounded-3xl px-4 py-6 text-center shadow-sm ${
              feedback === "correct" && missingSlot === "pastParticiple"
                ? "bg-emerald-50"
                : feedback === "wrong" && missingSlot === "pastParticiple"
                ? "bg-red-50"
                : "bg-white"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              {config?.form3 || "Participle"}
            </p>
            <p className="mt-2 text-3xl font-black text-sky-700">
              {missingSlot === "pastParticiple"
                ? "?"
                : chain?.pastParticiple}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {options.map((option) => {
            const isSelected = selectedAnswer === option;
            const correctAnswer = chain?.[missingSlot];
            const isCorrectOption = option === correctAnswer;

            let buttonClass =
              "bg-white text-slate-900 hover:-translate-y-1 hover:bg-sky-50 hover:shadow-md";

            if (feedback && isSelected && isCorrectOption) {
              buttonClass = "bg-emerald-100 text-emerald-800";
            }

            if (feedback && isSelected && !isCorrectOption) {
              buttonClass = "bg-red-100 text-red-700";
            }

            if (feedback && !isSelected && isCorrectOption) {
              buttonClass = "bg-emerald-50 text-emerald-700";
            }

            return (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={!!feedback}
                className={`rounded-2xl px-6 py-4 text-xl font-black shadow-sm transition ${buttonClass}`}
              >
                {option}
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
            {feedback === "correct" ? "Correct!" : "Try again."}
          </div>
        )}
      </div>
    </section>
  );
}