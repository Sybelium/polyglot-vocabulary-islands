"use client";

import { useEffect, useRef, useState } from "react";
import { getSentenceText } from "./sentenceUtils";
import useSentenceAudio from "./useSentenceAudio";
import AudioLoadStatus from "@/components/audio/AudioLoadStatus";

export default function SentenceLearn({
  lang,
  supportLang,
  subjectId,
  sentences,
}) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const stoppedRef = useRef(false);

  const { audioPaths, playSentence, stopAudio } = useSentenceAudio({
    lang,
    subjectId,
  });

  function playOne(index) {
    const sentence = sentences[index];
    if (!sentence) return;

    stoppedRef.current = false;
    setPlaying(false);
    setActiveIndex(index);

    playSentence(sentence, {
      text: getSentenceText(sentence, lang),
      onEnd: () => {
        if (stoppedRef.current) return;
        setActiveIndex(-1);
      },
    });
  }

  function playAll(startIndex = 0) {
    stoppedRef.current = false;
    setPlaying(true);
    stopAudio();

    const playAt = (index) => {
      if (stoppedRef.current) return;

      if (index >= sentences.length) {
        setPlaying(false);
        setActiveIndex(-1);
        return;
      }

      const sentence = sentences[index];

      setActiveIndex(index);

      playSentence(sentence, {
        text: getSentenceText(sentence, lang),
        onEnd: () => {
          if (stoppedRef.current) return;

          window.setTimeout(() => {
            playAt(index + 1);
          }, 650);
        },
      });
    };

    playAt(startIndex);
  }

  function stop() {
    stoppedRef.current = true;
    setPlaying(false);
    setActiveIndex(-1);
    stopAudio();
  }

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/95 p-4 shadow-xl md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-sky-600">
            Learn
          </p>

          <h2 className="text-2xl font-black text-slate-950 md:text-3xl">
            Listen and read
          </h2>

          <div className="mt-2">
            <AudioLoadStatus
              audioSrc={audioPaths.audioSrc}
              mapSrc={audioPaths.mapSrc}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => playAll(0)}
            className="rounded-full bg-sky-600 px-4 py-2 text-sm font-black text-white shadow hover:bg-sky-700"
          >
            ▶ Play all
          </button>

          {playing && (
            <button
              type="button"
              onClick={stop}
              className="rounded-full bg-slate-700 px-4 py-2 text-sm font-black text-white shadow hover:bg-slate-800"
            >
              Stop
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {sentences.map((sentence, index) => {
          const active = activeIndex === index;

          return (
            <article
              key={sentence.id}
              className={[
                "rounded-3xl border p-4 transition md:p-5",
                active
                  ? "border-yellow-300 bg-yellow-50 shadow-md"
                  : "border-slate-100 bg-white hover:bg-sky-50",
              ].join(" ")}
            >
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => playOne(index)}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-lg shadow-sm hover:bg-sky-200"
                  aria-label="Listen"
                >
                  🔊
                </button>

                <div className="min-w-0 flex-1">
                  <p className="text-xl font-black leading-snug text-slate-950 md:text-2xl">
                    {getSentenceText(sentence, lang)}
                  </p>

                  <p className="mt-1 text-base font-bold leading-snug text-slate-500 md:text-lg">
                    {getSentenceText(sentence, supportLang)}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}