import Link from "next/link";
import fs from "fs/promises";
import path from "path";

import JourneyLearnWords from "@/components/journey/JourneyLearnWords";
import JourneyRecognizeGame from "@/components/journey/JourneyRecognizeGame";
import JourneyWritePractice from "@/components/journey/JourneyWritePractice";
import SongChallengeExercise from "@/components/journey/SongChallengeExercise";
import JourneyStepTabs from "@/components/journey/JourneyStepTabs";
import JourneySongPlayer from "@/components/journey/JourneySongPlayer";
import JourneyIslandHeader from "@/components/journey/JourneyIslandHeader";
import JourneyMiniSongToggle from "@/components/journey/JourneyMiniSongToggle";

async function readJson(relativePath) {
  const filePath = path.join(process.cwd(), "public", relativePath);
  const file = await fs.readFile(filePath, "utf8");
  return JSON.parse(file);
}

async function getIsland(islandId) {
  return readJson(`data/journeys/a0/${islandId}.json`);
}

async function getVocabularyCategory(category) {
  return readJson(`data/vocabulary/${category}.json`);
}

async function getSong(song) {
  return readJson(`data/vocabulary/songs/${song}.json`);
}

async function getA0Songs() {
  return readJson("data/journeys/a0/a0-songs.json");
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeAnswer(text) {
  return String(text || "")
    .trim()
    .toLowerCase();
}

function buildSongChallenge({ lang, island, songData, selectedWords }) {
  const lyrics = songData.lyrics?.[lang] || songData.lyrics?.en || [];

  const targetWords = selectedWords
    .map((word) => word[lang] || word.en)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  const alreadyBlanked = new Set();
  const wordBank = [];

  const wordPattern = targetWords.map(escapeRegExp).join("|");

  const regex = wordPattern
    ? new RegExp(
        `(^|[^\\p{L}\\p{N}])(${wordPattern})(?=$|[^\\p{L}\\p{N}])`,
        "giu"
      )
    : null;

  const lines = lyrics.map((line) => {
    let text = line.target || line.text || String(line);
    const answers = [];

    if (regex) {
      text = text.replace(regex, (fullMatch, prefix, matchedWord) => {
        const normalizedWord = normalizeAnswer(matchedWord);

        if (alreadyBlanked.has(normalizedWord)) {
          return fullMatch;
        }

        alreadyBlanked.add(normalizedWord);
        answers.push(normalizedWord);
        wordBank.push(normalizedWord);

        return `${prefix}___`;
      });
    }

    return {
      type: "lyrics",
      text,
      answers,
    };
  });

  return {
    id: `${island.song}_${String(lang).toUpperCase()}`,
    journeyId: "a0",
    islandId: island.id,
    song: island.song,
    language: lang,
    title: `${
      songData.titles?.[lang] || songData.titles?.en || island.title
    } Song Challenge`,
    instructions: "Place the missing vocabulary words in the lyrics.",
    wordBank,
    lines,
  };
}

export default async function A0JourneyStepPage({ params }) {
  const { lang, islandId, step } = await params;

  const island = await getIsland(islandId);
  const categoryData = await getVocabularyCategory(island.category);

  const selectedWords = categoryData.words.filter((word) =>
    island.wordIds.includes(word.id)
  );

  let content = null;

  if (step === "learn") {
    content = (
      <JourneyLearnWords lang={lang} island={island} words={selectedWords} />
    );
  }

  if (step === "recognize") {
    content = (
      <JourneyRecognizeGame
        lang={lang}
        island={island}
        words={selectedWords}
      />
    );
  }

  if (step === "write") {
    content = (
      <JourneyWritePractice
        lang={lang}
        island={island}
        words={selectedWords}
      />
    );
  }

  if (step === "song") {
    const songs = await getA0Songs();
    const songInfo = songs[island.song];

    content = (
      <JourneySongPlayer
        lang={lang}
        island={island}
        songInfo={songInfo}
        words={selectedWords}
      />
    );
  }

  if (step === "song-challenge") {
    const songData = await getSong(island.song);
    const songs = await getA0Songs();
    const songInfo = songs[island.song];

    const challenge = buildSongChallenge({
      lang,
      island,
      songData,
      selectedWords,
    });

    content = (
      <SongChallengeExercise
        lang={lang}
        island={island}
        challenge={challenge}
        words={selectedWords}
      >
        <JourneyMiniSongToggle
          lang={lang}
          songInfo={songInfo}
          title={songData.titles?.[lang] || songData.titles?.en || island.title}
          label="Song"
        />
      </SongChallengeExercise>
    );
  }

  if (!content) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-3xl font-black">Invalid journey step</h1>
        <Link href={`/${lang}/journey/a0/${islandId}`}>Back to island</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-cyan-100 to-blue-200 px-3 py-4 pb-28 md:px-4 md:py-8 md:pb-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href={`/${lang}/journey/a0/${island.id}`}
            className="rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-blue-900 shadow hover:bg-white"
          >
            ← Back to {island.title}
          </Link>

          <Link
            href={`/${lang}/journey/a0`}
            className="rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-blue-900 shadow hover:bg-white"
          >
            Back to A0 Map
          </Link>
        </div>

        <JourneyIslandHeader island={island} defaultOpen={false} />

        <JourneyStepTabs lang={lang} island={island} activeStep={step} />

        {content}
      </section>
    </main>
  );
}