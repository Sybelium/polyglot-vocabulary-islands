"use client";

import { useState } from "react";
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

export default function JourneyMiniSongToggle({
  lang,
  songInfo,
  title = "Song",
  label = "Song",
}) {
  const [isOpen, setIsOpen] = useState(false);

  const audioLang = langCodes[lang] || "EN";
  const audioSrc = songInfo?.audioBase
    ? getMediaUrl(`${songInfo.audioBase}_${audioLang}.mp3`)
    : null;

  if (!audioSrc) return null;

  return (
    <div className="mb-6 rounded-[1.5rem] border border-blue-100 bg-blue-50/80 p-4 shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white shadow hover:bg-blue-700"
      >
        {isOpen ? "Hide song" : `▶ Play ${label}`}
      </button>

      {isOpen ? (
        <div className="mt-4">
          <audio controls preload="metadata" className="w-full">
            <source src={audioSrc} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      ) : null}
    </div>
  );
}