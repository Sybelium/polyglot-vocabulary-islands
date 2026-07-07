"use client";

import { useEffect, useMemo, useState } from "react";
import { getSentenceText, shuffleArray } from "./sentenceUtils";

export default function SentenceMatchingGame({ lang, supportLang, sentences }) {
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedLeftId, setSelectedLeftId] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const items = useMemo(() => sentences || [], [sentences]);

  useEffect(() => {
    setLeftItems(items);
    setRightItems(shuffleArray(items));
    setSelectedLeftId(null);
    setMatchedIds([]);
    setFeedback(null);
  }, [items]);

  function selectRight(sentence) {
    if (!selectedLeftId) return;
    if (matchedIds.includes(sentence.id)) return;

    if (selectedLeftId === sentence.id) {
      setMatchedIds((ids) => [...ids, sentence.id]);
      setFeedback("correct");
      setSelectedLeftId(null);
      setTimeout(() => setFeedback(null), 600);
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 700);
    }
  }

  const complete = matchedIds.length === items.length;
  const rowCount = Math.max(leftItems.length, rightItems.length);

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/95 p-4 shadow-xl md:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-sky-600">
            Matching sentences
          </p>

          <h2 className="text-2xl font-black leading-tight text-slate-950 md:text-3xl">
            Match meaning and sentence
          </h2>
        </div>

        <div className="rounded-2xl bg-sky-50 px-3 py-2 text-sm font-black text-sky-700 md:text-base">
          {matchedIds.length}/{items.length}
        </div>
      </div>

      {complete && (
        <div className="mb-4 rounded-3xl bg-emerald-100 p-4 text-center font-black text-emerald-700">
          Complete! All sentences matched.
        </div>
      )}

      {feedback === "wrong" && (
        <div className="mb-4 rounded-3xl bg-red-100 p-3 text-center font-black text-red-700">
          Try another match.
        </div>
      )}

      <div className="grid gap-2 md:grid-cols-2 md:gap-x-5 md:gap-y-3">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
          Meaning
        </p>

        <p className="hidden text-xs font-black uppercase tracking-wide text-slate-500 md:block">
          Target sentence
        </p>

        {Array.from({ length: rowCount }).map((_, index) => {
          const leftSentence = leftItems[index];
          const rightSentence = rightItems[index];

          const leftMatched = leftSentence
            ? matchedIds.includes(leftSentence.id)
            : false;

          const leftSelected = leftSentence
            ? selectedLeftId === leftSentence.id
            : false;

          const rightMatched = rightSentence
            ? matchedIds.includes(rightSentence.id)
            : false;

          return (
            <div key={`row-${index}`} className="contents">
              {leftSentence ? (
                <button
                  type="button"
                  disabled={leftMatched}
                  onClick={() => setSelectedLeftId(leftSentence.id)}
                  className={[
                    "flex min-h-[3.75rem] items-center rounded-2xl border px-4 py-3 text-left text-base font-black leading-snug transition md:px-5 md:py-4 md:text-lg",
                    leftMatched
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : leftSelected
                      ? "border-sky-400 bg-sky-50 text-sky-800"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {getSentenceText(leftSentence, supportLang)}
                </button>
              ) : (
                <div />
              )}

              {index === 0 && (
                <p className="mt-3 text-xs font-black uppercase tracking-wide text-slate-500 md:hidden">
                  Target sentence
                </p>
              )}

              {rightSentence ? (
                <button
                  type="button"
                  disabled={rightMatched}
                  onClick={() => selectRight(rightSentence)}
                  className={[
                    "flex min-h-[3.75rem] items-center rounded-2xl border px-4 py-3 text-left text-base font-black leading-snug transition md:px-5 md:py-4 md:text-lg",
                    rightMatched
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-sky-50",
                  ].join(" ")}
                >
                  {getSentenceText(rightSentence, lang)}
                </button>
              ) : (
                <div />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}