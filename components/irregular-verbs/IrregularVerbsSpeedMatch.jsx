"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getDisplayChunk,
  makeSpokenText,
  shuffleArray,
  speakText,
} from "@/components/irregular-verbs/irregularVerbUtils";


function formatTime(ms) {
  return (ms / 1000).toFixed(1);
}

function buildMatchItems(verbs) {
  return verbs.map((verb) => ({
    id: verb.id,
    base: verb.base,
    match: getDisplayChunk(verb.pastSimple),
    verb,
  }));
}

export default function IrregularVerbsSpeedMatch({
  verbs = [],
  config,
  onBack,
}) {
  const [items, setItems] = useState([]);
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedLeftId, setSelectedLeftId] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [wrongPair, setWrongPair] = useState(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!verbs.length) return;

    const matchItems = buildMatchItems(verbs);

    setItems(matchItems);
    setLeftItems(shuffleArray(matchItems));
    setRightItems(shuffleArray(matchItems));
    setSelectedLeftId(null);
    setMatchedIds([]);
    setWrongPair(null);
    setScore(0);
    setMistakes(0);
    setFinished(false);
    setStartedAt(Date.now());
    setElapsedMs(0);
  }, [verbs]);

useEffect(() => {
  if (!startedAt || finished) return;

  const interval = setInterval(() => {
    setElapsedMs(Date.now() - startedAt);
  }, 100);

  return () => clearInterval(interval);
}, [startedAt, finished]);

  const totalPairs = items.length;

  const selectedLeft = useMemo(() => {
    return items.find((item) => item.id === selectedLeftId) || null;
  }, [items, selectedLeftId]);

  function restartExercise() {
    const matchItems = buildMatchItems(verbs);

    setItems(matchItems);
    setLeftItems(shuffleArray(matchItems));
    setRightItems(shuffleArray(matchItems));
    setSelectedLeftId(null);
    setMatchedIds([]);
    setWrongPair(null);
    setScore(0);
    setMistakes(0);
    setFinished(false);
    setStartedAt(Date.now());
    setElapsedMs(0);
  }

  function handleLeftClick(item) {
    if (matchedIds.includes(item.id)) return;

    setWrongPair(null);
    setSelectedLeftId(item.id);
  }

  function handleRightClick(item) {
    if (matchedIds.includes(item.id)) return;
    if (!selectedLeft) return;

    const isCorrect = selectedLeft.id === item.id;

    if (isCorrect) {
      const nextMatchedIds = [...matchedIds, item.id];

      setMatchedIds(nextMatchedIds);
      setSelectedLeftId(null);
      setWrongPair(null);
      setScore((value) => value + 1);

      speakText(makeSpokenText(item.verb, config), config);

      if (nextMatchedIds.length >= totalPairs) {
  const finalElapsed = startedAt ? Date.now() - startedAt : elapsedMs;
  setElapsedMs(finalElapsed);

  setTimeout(() => {
    setFinished(true);
  }, 700);
}
    } else {
      setWrongPair({
        leftId: selectedLeft.id,
        rightId: item.id,
      });

      setMistakes((value) => value + 1);

      setTimeout(() => {
        setWrongPair(null);
        setSelectedLeftId(null);
      }, 650);
    }
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
          Speed match complete
        </p>

        <h2 className="mt-3 text-4xl font-black text-slate-900">
          Fast work!
        </h2>

        <p className="mt-4 text-lg font-bold text-slate-700">
          Matches: {score} / {totalPairs}
        </p>

        <p className="mt-2 text-lg font-bold text-violet-700">
        Time: {formatTime(elapsedMs)}s
</p>

        <p className="mt-2 text-sm font-semibold text-slate-500">
          Mistakes: {mistakes}
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
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">
            Exercise
          </p>

          <h2 className="mt-1 text-3xl font-black text-slate-900">
            Speed Match
          </h2>

          <p className="mt-2 text-slate-600">
            Match each {config?.form1?.toLowerCase() || "base verb"} with its{" "}
{config?.form2?.toLowerCase() || "past form"}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700">
            {matchedIds.length} / {totalPairs}
          </div>

          <div className="rounded-full bg-violet-100 px-5 py-3 text-sm font-bold text-violet-800">
            Time: {formatTime(elapsedMs)}s
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

      <div className="mt-8 rounded-3xl bg-gradient-to-br from-violet-50 to-sky-50 p-5 md:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="mb-3 text-center text-sm font-black uppercase tracking-wide text-slate-400">
              {config?.form1 || "Base"}
            </p>

            <div className="grid gap-3">
              {leftItems.map((item) => {
                const isMatched = matchedIds.includes(item.id);
                const isSelected = selectedLeftId === item.id;
                const isWrong = wrongPair?.leftId === item.id;

                return (
                  <button
                    key={`left-${item.id}`}
                    onClick={() => handleLeftClick(item)}
                    disabled={isMatched}
                    className={`rounded-2xl px-5 py-4 text-xl font-black shadow-sm transition ${
                      isMatched
                        ? "cursor-not-allowed bg-emerald-100 text-emerald-700 opacity-70"
                        : isWrong
                        ? "bg-red-100 text-red-700"
                        : isSelected
                        ? "scale-[1.02] bg-violet-600 text-white shadow-md"
                        : "bg-white text-slate-900 hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
                    }`}
                  >
                    {item.base}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-3 text-center text-sm font-black uppercase tracking-wide text-slate-400">
              {config?.form2 || "Past"}
            </p>

            <div className="grid gap-3">
              {rightItems.map((item) => {
                const isMatched = matchedIds.includes(item.id);
                const isWrong = wrongPair?.rightId === item.id;

                return (
                  <button
                    key={`right-${item.id}`}
                    onClick={() => handleRightClick(item)}
                    disabled={isMatched}
                    className={`rounded-2xl px-5 py-4 text-xl font-black shadow-sm transition ${
                      isMatched
                        ? "cursor-not-allowed bg-emerald-100 text-emerald-700 opacity-70"
                        : isWrong
                        ? "bg-red-100 text-red-700"
                        : "bg-white text-slate-900 hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md"
                    }`}
                  >
                    {item.match}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {!selectedLeft && (
          <p className="mt-6 text-center text-sm font-semibold text-slate-500">
            Choose a base verb first.
          </p>
        )}

        {selectedLeft && (
          <p className="mt-6 text-center text-sm font-semibold text-violet-700">
            Now choose the past form for{" "}
            <span className="font-black">{selectedLeft.base}</span>.
          </p>
        )}
      </div>
    </section>
  );
}