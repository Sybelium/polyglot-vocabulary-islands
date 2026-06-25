"use client";

import Link from "next/link";
import {
  getJourneyWordIds,
  saveJourneyStepProgress,
} from "@/lib/app/progress/saveJourneyStepProgress";
import { getMediaUrl } from "@/lib/media/getMediaUrl";

const langCodes = {
  en: "EN",
  fr: "FR",
  es: "ES",
  it: "IT",
  pt: "PT",
  de: "DE",
  nl: "NL",
};

export default function JourneySongPlayer({
  lang,
  island,
  songInfo,
  words = [],
}) {
  const audioLang = langCodes[lang] || "EN";
  const title = songInfo?.title?.[lang] || songInfo?.title?.en || island.title;
  const image = songInfo?.image || island.cover;
  const audioSrc = getMediaUrl(`${songInfo.audioBase}_${audioLang}.mp3`);
  const videoSrc = getMediaUrl(`/data/vocabulary/videos/${island.song}/${audioLang}.mp4`);

  async function saveSongProgress() {
    await saveJourneyStepProgress({
      targetLang: lang,
      level: "a0",
      islandId: island.id,
      category: island.category,
      step: "song",
      wordIds: getJourneyWordIds(words),
    });
  }

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl">
      <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="bg-sky-50 p-6">
          <img
            src={image}
            alt={title}
            className="h-auto w-full rounded-[1.5rem] object-cover shadow-xl"
          />
        </div>

        <div className="p-6 md:p-8">
          <p className="text-sm font-black uppercase tracking-wide text-blue-600">
            Step 4 · Song
          </p>

          <h1 className="mt-2 text-4xl font-black text-blue-950 md:text-5xl">
            {title}
          </h1>

          <p className="mt-4 text-lg font-semibold text-slate-700">
            Listen to the song and review the vocabulary before the final
            challenge.
          </p>

          <div className="mt-8 rounded-[1.5rem] bg-sky-50 p-5">
            <p className="mb-3 font-black text-blue-950">🎧 Listen</p>

            <audio controls className="w-full">
              <source src={audioSrc} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>

          <div className="mt-6 rounded-[1.5rem] bg-white p-5 shadow ring-1 ring-slate-100">
            <p className="text-sm font-black uppercase tracking-wide text-blue-600">
              Song vocabulary
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {words.map((word) => {
                const label = word[lang] || word.en;

                return (
                  <span
                    key={word.id}
                    className="rounded-full bg-blue-50 px-3 py-2 text-sm font-black text-blue-950"
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-between gap-3">
            <Link
              href={`/vocabulary/${lang}/journey/a0/${island.id}/write`}
              className="rounded-full bg-white px-5 py-3 font-black text-blue-900 shadow hover:bg-blue-50"
            >
              ← Back to Write
            </Link>

            <Link
              href={`/vocabulary/${lang}/journey/a0/${island.id}/song-challenge`}
              onClick={saveSongProgress}
              className="rounded-full bg-blue-600 px-5 py-3 font-black text-white shadow hover:bg-blue-700"
            >
              Continue to Song Challenge →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}