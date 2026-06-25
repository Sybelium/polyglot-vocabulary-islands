"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SpeakButton from "@/components/journey/SpeakButton";
import {
  getJourneyWordIds,
  saveJourneyStepProgress,
} from "@/lib/app/progress/saveJourneyStepProgress";

const speechLangs = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-PT",
  de: "de-DE",
  nl: "nl-NL",
};

const INITIAL_PLAY_DELAY = 1200;
const BETWEEN_WORD_DELAY = 900;

function getWordText(word, lang) {
  return word[lang] || word.en || "";
}

export default function JourneyLearnWords({ lang, island, words }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);

  const timeoutRef = useRef(null);
  const stoppedRef = useRef(false);
  const savingRef = useRef(false);

  const activeWord =
    activeIndex >= 0 && words?.[activeIndex] ? words[activeIndex] : null;

  function clearCurrentTimer() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  async function saveLearnProgress() {
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
        step: "learn",
        completed: true,
        wordIds: getJourneyWordIds(words),
      });

      if (result?.success || result?.ok) {
        setProgressSaved(true);
      }
    } finally {
      savingRef.current = false;
    }
  }

  function speak(text, onEnd) {
    if (typeof window === "undefined") return;
    if (!text || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLangs[lang] || "en-US";
    utterance.rate = 0.88;
    utterance.pitch = 1;

    utterance.onend = () => {
      if (stoppedRef.current) return;

      timeoutRef.current = setTimeout(() => {
        onEnd?.();
      }, BETWEEN_WORD_DELAY);
    };

    utterance.onerror = () => {
      if (stoppedRef.current) return;

      timeoutRef.current = setTimeout(() => {
        onEnd?.();
      }, BETWEEN_WORD_DELAY);
    };

    window.speechSynthesis.speak(utterance);
  }

  function stopAutoplay() {
    stoppedRef.current = true;
    setPlaying(false);
    setActiveIndex(-1);
    clearCurrentTimer();

    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
  }

  function playFrom(index = 0) {
    if (!words.length) return;

    stoppedRef.current = false;
    clearCurrentTimer();

    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }

    setPlaying(true);
    setCompleted(false);

    const playWord = (wordIndex) => {
      if (stoppedRef.current) return;

      if (wordIndex >= words.length) {
        setPlaying(false);
        setCompleted(true);
        setActiveIndex(-1);
        saveLearnProgress();
        return;
      }

      const word = words[wordIndex];
      const text = getWordText(word, lang);

      setActiveIndex(wordIndex);

      speak(text, () => {
        playWord(wordIndex + 1);
      });
    };

    playWord(index);
  }

  useEffect(() => {
    stoppedRef.current = false;

    const startTimer = setTimeout(() => {
      playFrom(0);
    }, INITIAL_PLAY_DELAY);

    return () => {
      stoppedRef.current = true;
      clearTimeout(startTimer);
      clearCurrentTimer();

      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  return (
    <>
      <div className="mt-4 rounded-[1.5rem] bg-white/90 p-4 shadow-xl md:mt-8 md:rounded-[2rem] md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black text-blue-950 md:text-2xl">
              Listen and discover
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-600 md:text-base">
              The words are read automatically, one after another.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => playFrom(0)}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-black text-white shadow hover:bg-blue-700 md:px-5 md:py-3 md:text-base"
            >
              ▶ Replay all
            </button>

            {playing && (
              <button
                type="button"
                onClick={stopAutoplay}
                className="rounded-full bg-slate-700 px-4 py-2 text-sm font-black text-white shadow hover:bg-slate-800 md:px-5 md:py-3 md:text-base"
              >
                ⏸ Pause
              </button>
            )}

            {completed && (
              <Link
                href={`/vocabulary/${lang}/journey/a0/${island.id}/recognize`}
                className="rounded-full bg-green-600 px-4 py-2 text-sm font-black text-white shadow hover:bg-green-700 md:px-5 md:py-3 md:text-base"
              >
                Continue →
              </Link>
            )}
          </div>
        </div>

        {activeWord ? (
          <div className="mt-4 rounded-2xl bg-blue-600 px-4 py-3 text-center font-black text-white shadow-lg">
            🔊 {getWordText(activeWord, lang)}
          </div>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-white/95 shadow-xl md:mt-6 md:rounded-[2rem]">
        <div className="divide-y divide-sky-100">
          {words.map((word, index) => {
            const text = getWordText(word, lang);
            const isActive = activeIndex === index;

            return (
              <div
                key={word.id}
                className={[
                  "flex items-center gap-3 px-4 py-3 transition md:px-5 md:py-4",
                  isActive
                    ? "bg-yellow-100 ring-2 ring-inset ring-yellow-300"
                    : "bg-white hover:bg-sky-50",
                ].join(" ")}
              >
                <div
                  className={[
                    "grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl font-black md:h-12 md:w-12",
                    isActive
                      ? "bg-yellow-300 text-yellow-900"
                      : "bg-sky-100 text-blue-900",
                  ].join(" ")}
                >
                  {word.image || index + 1}
                </div>

                <div
                  className={[
                    "min-w-0 flex-1 truncate text-xl font-black md:text-2xl",
                    isActive ? "text-blue-700" : "text-blue-950",
                  ].join(" ")}
                >
                  {text}
                </div>

                <div className="shrink-0 [&_button]:!px-3 [&_button]:!py-2 [&_button]:!text-lg [&_button]:!leading-none">
                  <SpeakButton text={text} lang={lang} hideLabel />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}