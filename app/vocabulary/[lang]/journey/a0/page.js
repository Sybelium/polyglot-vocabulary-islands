import Link from "next/link";
import fs from "fs/promises";
import path from "path";
import A0IslandGrid from "@/components/journey/A0IslandGrid";
import A0JourneyProgress from "@/components/journey/A0JourneyProgress";

async function readJson(relativePath) {
  const filePath = path.join(process.cwd(), "public", relativePath);
  const file = await fs.readFile(filePath, "utf8");
  return JSON.parse(file);
}

async function getJourneyIndex() {
  return readJson("data/journeys/a0/a0-index.json");
}

async function getIslandFromCollection(collection) {
  const islandPath = collection.path.startsWith("/")
    ? collection.path.slice(1)
    : collection.path;

  return readJson(islandPath);
}

export const metadata = {
  title: "A0 Journey Map | Polyglot World",
  description:
    "Choose your first learning island and start your A0 language journey.",
};

export default async function A0JourneyMapPage({ params }) {
  const { lang } = await params;

  const index = await getJourneyIndex();

  const islands = await Promise.all(
    (index.collections || []).map((collection) =>
      getIslandFromCollection(collection)
    )
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-cyan-100 to-blue-200 px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-blue-900 shadow hover:bg-white"
          >
            ← Back to Start
          </Link>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl">
  <div className="relative h-48 sm:h-64 md:h-80">
    <img
      src="/images/journeys/a0/choose_island.webp"
      alt="Choose your island"
      className="h-full w-full object-cover"
    />

    <div className="absolute inset-0 bg-blue-950/10" />
  </div>

  <div className="p-5 md:p-8">
    <p className="text-xs font-black uppercase tracking-wide text-blue-600">
      A0 First Steps
    </p>

    <h1 className="mt-1 text-3xl font-black leading-tight text-blue-950 md:text-5xl">
      Choose your island
    </h1>

    <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-slate-600 md:text-lg">
      Learn words, play quick games, listen to the song, and complete the
      challenge to finish each island.
    </p>
  </div>
</div>

        <A0JourneyProgress lang={lang} islands={islands} />

<A0IslandGrid lang={lang} islands={islands} />
      </section>
    </main>
  );
}