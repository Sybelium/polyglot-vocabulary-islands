"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  getJourneyWordIds,
  saveJourneyStepProgress,
} from "@/lib/app/progress/saveJourneyStepProgress";

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function buildOptionsForBlank(answer, wordBank) {
  const wrongOptions = wordBank.filter((word) => word !== answer);
  const selectedWrongOptions = shuffle(wrongOptions).slice(0, 4);

  return shuffle([answer, ...selectedWrongOptions]);
}

export default function SongChallengeExercise({
  lang,
  island,
  challenge,
  words = [],
  children,
}) {
  const blanks = useMemo(() => {
    return challenge.lines.flatMap((line, lineIndex) =>
      (line.answers || []).map((answer, answerIndex) => ({
        id: `${lineIndex}-${answerIndex}`,
        lineIndex,
        answerIndex,
        answer,
        lineText: line.text,
      }))
    );
  }, [challenge.lines]);

  const [placedWords, setPlacedWords] = useState({});
  const [dropdownOptions, setDropdownOptions] = useState({});
  const [checked, setChecked] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const savingRef = useRef(false);

  useEffect(() => {
    const optionsByBlank = {};

    blanks.forEach((blank) => {
      optionsByBlank[blank.id] = buildOptionsForBlank(
        blank.answer,
        challenge.wordBank || []
      );
    });

    setPlacedWords({});
    setDropdownOptions(optionsByBlank);
    setChecked(false);
    setProgressSaved(false);
    setIsReady(true);
  }, [blanks, challenge.wordBank]);

  const totalBlanks = blanks.length;

  const score = useMemo(() => {
    return blanks.filter((blank) => placedWords[blank.id] === blank.answer)
      .length;
  }, [blanks, placedWords]);

  const mistakes = useMemo(() => {
    if (!checked) return [];

    return blanks
      .filter((blank) => placedWords[blank.id] !== blank.answer)
      .map((blank) => ({
        id: blank.id,
        expected: blank.answer,
        received: placedWords[blank.id] || "—",
      }));
  }, [checked, blanks, placedWords]);

  const finished = checked && score === totalBlanks;

  async function saveChallengeProgress(finalScore) {
    if (savingRef.current) return;
    if (progressSaved) return;

    savingRef.current = true;

    try {
      const result = await saveJourneyStepProgress({
        lang,
        targetLang: lang,
        level: "a0",
        islandId: island.id,
        category: island.category,
        step: "song-challenge",
        completed: true,
        score: finalScore,
        total: totalBlanks,
        wordIds: getJourneyWordIds(words),
      });

      if (result?.success || result?.ok) {
        setProgressSaved(true);
      }
    } finally {
      savingRef.current = false;
    }
  }

  function checkAnswers() {
    setChecked(true);

    if (score === totalBlanks) {
      saveChallengeProgress(score);
    }
  }

  function selectWord(blankId, word) {
    setPlacedWords((prev) => ({
      ...prev,
      [blankId]: word,
    }));

    setChecked(false);
  }

  function resetChallenge() {
    const optionsByBlank = {};

    blanks.forEach((blank) => {
      optionsByBlank[blank.id] = buildOptionsForBlank(
        blank.answer,
        challenge.wordBank || []
      );
    });

    setPlacedWords({});
    setDropdownOptions(optionsByBlank);
    setChecked(false);
  }

  function renderLyricLine(line, lineIndex) {
    if (!line.answers?.length) {
      return <span>{line.text}</span>;
    }

    const parts = line.text.split("___");

    return parts.map((part, partIndex) => {
      const blankIndex = partIndex - 1;
      const blankId = blankIndex >= 0 ? `${lineIndex}-${blankIndex}` : null;
      const expectedAnswer = blankId ? line.answers[blankIndex] : null;
      const selectedWord = blankId ? placedWords[blankId] || "" : "";
      const options = blankId ? dropdownOptions[blankId] || [] : [];

      let selectStateClass =
        "border-blue-200 bg-white text-blue-950 focus:border-blue-500 focus:ring-blue-200";

      if (checked && selectedWord === expectedAnswer) {
        selectStateClass =
          "border-green-500 bg-green-50 text-green-800 focus:border-green-500 focus:ring-green-200";
      }

      if (checked && selectedWord && selectedWord !== expectedAnswer) {
        selectStateClass =
          "border-red-500 bg-red-50 text-red-800 focus:border-red-500 focus:ring-red-200";
      }

      if (checked && !selectedWord) {
        selectStateClass =
          "border-orange-500 bg-orange-50 text-orange-800 focus:border-orange-500 focus:ring-orange-200";
      }

      return (
        <span key={`${lineIndex}-${partIndex}`}>
          {partIndex > 0 && blankId ? (
            <select
              value={selectedWord}
              onChange={(event) => selectWord(blankId, event.target.value)}
              disabled={finished}
              className={[
                "mx-1 my-1 inline-flex min-w-[120px] rounded-xl border-2 px-3 py-1.5 text-base font-black shadow-sm outline-none transition focus:ring-4",
                "md:min-w-[140px] md:text-lg",
                selectStateClass,
              ].join(" ")}
            >
              <option value="">---</option>

              {options.map((option) => (
                <option key={`${blankId}-${option}`} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : null}

          {part}
        </span>
      );
    });
  }

  if (!isReady) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center shadow-2xl">
        <p className="text-lg font-black text-blue-950">
          Loading challenge...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-white p-4 shadow-2xl md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-blue-600">
            Step 5 · Song Challenge
          </p>

          <h1 className="text-3xl font-black text-blue-950 md:text-5xl">
            {challenge.title}
          </h1>

          {children && <div className="mt-4">{children}</div>}

          <p className="mt-3 max-w-2xl font-semibold text-slate-600">
            Choose the missing words directly in the lyrics.
          </p>
        </div>

        <div className="rounded-full bg-sky-100 px-4 py-2 text-sm font-black text-blue-900">
          {score} / {totalBlanks}
        </div>
      </div>

      <div className="mt-6 rounded-[2rem] bg-sky-50 p-4 shadow-inner md:mt-8 md:p-5">
        <div className="space-y-3 text-lg font-bold leading-relaxed text-blue-950 md:text-xl">
          {challenge.lines.map((line, lineIndex) => {
            if (line.type === "section") {
              return (
                <div
                  key={`${line.label}-${lineIndex}`}
                  className="pt-4 text-sm font-black uppercase tracking-wide text-purple-600"
                >
                  {line.label}
                </div>
              );
            }

            return (
              <p key={`${line.text}-${lineIndex}`}>
                {renderLyricLine(line, lineIndex)}
              </p>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-[2rem] bg-yellow-50 p-4 shadow-inner md:p-5">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={checkAnswers}
            disabled={finished}
            className="rounded-full bg-blue-600 px-5 py-3 font-black text-white shadow hover:bg-blue-700 disabled:opacity-60"
          >
            Check answers
          </button>

          <button
            type="button"
            onClick={resetChallenge}
            className="rounded-full bg-white px-5 py-3 font-black text-blue-900 shadow hover:bg-blue-50"
          >
            Reset
          </button>
        </div>

        {checked && (
          <div
            className={[
              "mt-5 rounded-2xl p-4 font-black",
              finished
                ? "bg-green-100 text-green-800"
                : "bg-orange-100 text-orange-800",
            ].join(" ")}
          >
            {finished
              ? "🏆 Perfect! Island challenge complete."
              : `You got ${score} out of ${totalBlanks}. Review the red dropdowns and try again.`}
          </div>
        )}

        {checked && mistakes.length > 0 && (
          <div className="mt-5 rounded-[1.5rem] bg-red-50 p-4">
            <h3 className="text-lg font-black text-red-800">
              Words to review
            </h3>

            <div className="mt-3 grid gap-3">
              {mistakes.map((mistake) => (
                <div
                  key={mistake.id}
                  className="rounded-2xl bg-white p-4 shadow"
                >
                  <div className="text-lg font-black text-blue-950">
                    {mistake.expected}
                  </div>

                  <div className="mt-1 text-sm font-semibold text-slate-500">
                    You chose: {mistake.received}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {finished && (
          <div className="mt-6 flex flex-wrap justify-between gap-3">
            <Link
              href={`/${lang}/journey/a0/${island.id}/song`}
              className="rounded-full bg-white px-5 py-3 font-black text-blue-900 shadow hover:bg-blue-50"
            >
              ← Back to Song
            </Link>

            <Link
              href={`/${lang}/journey/a0`}
              className="rounded-full bg-green-600 px-5 py-3 font-black text-white shadow hover:bg-green-700"
            >
              Continue to A0 Map →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}