import Link from "next/link";
import fs from "fs/promises";
import path from "path";
import JourneyStepTabs from "@/components/journey/JourneyStepTabs";
import JourneyLearnWords from "@/components/journey/JourneyLearnWords";
import JourneyIslandHeader from "@/components/journey/JourneyIslandHeader";

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

export default async function A0IslandPage({ params }) {
  const { lang, islandId } = await params;
  const island = await getIsland(islandId);
  const categoryData = await getVocabularyCategory(island.category);

  const selectedWords = categoryData.words.filter((word) =>
    island.wordIds.includes(word.id)
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-cyan-100 to-blue-200 px-4 py-8">
      <section className="mx-auto max-w-6xl">
        <Link
          href={`/${lang}/journey/a0`}
          className="rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-blue-900 shadow hover:bg-white"
        >
          ← Back to A0 Map
        </Link>

        <div className="mt-8">
  <JourneyIslandHeader island={island} defaultOpen={true} />
</div>

        <div className="mt-8">
          <JourneyStepTabs lang={lang} island={island} activeStep="learn" />
        </div>

        <JourneyLearnWords
          lang={lang}
          island={island}
          words={selectedWords}
        />
      </section>
    </main>
  );
}