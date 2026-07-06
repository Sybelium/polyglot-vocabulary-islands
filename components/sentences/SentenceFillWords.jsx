"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  chooseBlankWord,
  getSentenceText,
  normalizeAnswer,
} from "./sentenceUtils";

export default function SentenceFillWords({ lang, supportLang, sentences }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [blank, setBlank] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const [finished, setFinished] = useState(false);

  const inputRef = useRef(null);
  const questions = useMemo(() => sentences || [], [sentences]);
  const currentSentence = questions[questionIndex];

  useEffect(() => {
    if (!currentSentence) return;

    setBlank(chooseBlankWord(getSentenceText(currentSentence, lang)));
    setAnswer("");
    setFeedback(null);

    setTimeout(() => inputRef.current?.focus(), 50);
  }, [currentSentence, lang]);

  function nextQuestion() {
    const next = questionIndex + 1;

    if (next >= questions.length) {
      setFinished(true);
      return;
    }

    setQuestionIndex(next);
  }

  function checkAnswer(event) {
    event.preventDefault();

    if (!blank || feedback) return;

    const correct = normalizeAnswer(answer) === normalizeAnswer(blank.answer);

    if (correct) {
      setScore((value) => value + 1);
      setFeedback("correct");
      setTimeout(nextQuestion, 750);
    } else {
      setMistakes((items) => [
        ...items,
        {
          id: currentSentence.id,
          prompt: getSentenceText(currentSentence, supportLang),
          expected: blank.answer,
          userAnswer: answer || "—",
          fullSentence: getSentenceText(currentSentence, lang),
        },
      ]);
      setFeedback("wrong");
      setTimeout(nextQuestion, 1100);
    }
  }

  function restart() {
    setQuestionIndex(0);
    setAnswer("");
    setFeedback(null);
    setScore(0);
    setMistakes([]);
    setFinished(false);
  }

  if (!currentSentence || !blank) return null;

  if (finished) {
    return (
      <section className="rounded-[2rem] bg-white p-6 text-center shadow-xl">
        <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
          Fill complete
        </p>

        <h2 className="mt-2 text-3xl font-black text-slate-950">
          Score: {score} / {questions.length}
        </h2>

        {mistakes.length > 0 && (
          <div className="mx-auto mt-5 max-w-3xl text-left">
            <h3 className="text-lg font-black text-slate-950">
              Mistaken sentences
            </h3>

            <div className="mt-3 grid gap-3">
              {mistakes.map((mistake) => (
                <div
                  key={mistake.id}
                  className="rounded-3xl border border-red-100 bg-red-50 p-4"
                >
                  <p className="text-sm font-bold text-slate-600">
                    {mistake.prompt}
                  </p>
                  <p className="mt-2 text-sm font-black text-slate-950">
                    {mistake.fullSentence}
                  </p>
                  <p className="mt-2 text-sm font-bold text-red-700">
                    Your answer: {mistake.userAnswer}
                  </p>
                  <p className="text-sm font-bold text-emerald-700">
                    Correct: {mistake.expected}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={restart}
          className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white"
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/95 p-4 shadow-xl md:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-sky-600">
            Fill in the words
          </p>
          <h2 className="text-2xl font-black text-slate-950">
            Type the missing word
          </h2>
        </div>

        <div className="rounded-2xl bg-sky-50 px-3 py-2 text-sm font-black text-sky-700">
          {questionIndex + 1}/{questions.length} · {score}
        </div>
      </div>

      <div className="rounded-3xl bg-slate-50 p-4">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
          Meaning
        </p>

        <p className="mt-1 text-lg font-black text-slate-950">
          {getSentenceText(currentSentence, supportLang)}
        </p>
      </div>

      <form onSubmit={checkAnswer} className="mt-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-black leading-relaxed text-slate-950">
            {blank.displayText}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <input
            ref={inputRef}
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            disabled={Boolean(feedback)}
            className="min-w-0 rounded-2xl border border-slate-200 px-4 py-3 text-lg font-black outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            placeholder="missing word..."
          />

          <button
            type="submit"
            disabled={!answer.trim() || Boolean(feedback)}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-40"
          >
            Check
          </button>
        </div>
      </form>

      {feedback === "correct" && (
        <p className="mt-3 rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-700">
          Correct!
        </p>
      )}

      {feedback === "wrong" && (
        <p className="mt-3 rounded-2xl bg-red-100 px-4 py-3 text-center font-black text-red-700">
          Correct answer: {blank.answer}
        </p>
      )}
    </section>
  );
}