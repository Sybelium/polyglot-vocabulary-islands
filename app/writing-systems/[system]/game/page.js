import Link from "next/link";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import AlphabetClickGame from "@/components/writing-systems/AlphabetClickGame";

function readJsonIfExists(relativePath) {
  const filePath = path.join(process.cwd(), relativePath);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const file = fs.readFileSync(filePath, "utf8");
  return JSON.parse(file);
}

function getText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.en || Object.values(value)[0] || "";
}

function getWritingSystems() {
  return (
    readJsonIfExists("public/data/writing-systems/writing-systems.json") || []
  );
}

function getSystemMeta(systemId) {
  return getWritingSystems().find((system) => system.id === systemId) || null;
}

function normalizeLetters(data) {
  const rawLetters = Array.isArray(data)
    ? data
    : data.letters ||
      data.characters ||
      data.items ||
      data.symbols ||
      data.characterSet ||
      [];

  return rawLetters
    .map((item, index) => {
      const symbol =
        item.symbol ||
        item.glyph ||
        item.character ||
        item.char ||
        item.letter ||
        item.sign ||
        "";

      const name =
        getText(item.name) ||
        getText(item.label) ||
        getText(item.letterName) ||
        getText(item.transliteration) ||
        getText(item.romanization) ||
        "";

      const sound =
        getText(item.sound) ||
        getText(item.pronunciation) ||
        getText(item.audio) ||
        getText(item.audioText) ||
        getText(item.value) ||
        "";

      return {
        id: item.id || `${symbol}-${index}`,
        symbol,
        name,
        sound,
        transliteration:
          getText(item.transliteration) || getText(item.romanization) || "",
        audioText:
          getText(item.audioText) ||
          getText(item.audio) ||
          sound ||
          name ||
          symbol,
      };
    })
    .filter((letter) => letter.symbol);
}

function getCharacterSet(systemId) {
  const data = readJsonIfExists(
    `public/data/writing-systems/character-sets/${systemId}.json`
  );

  if (!data) return null;

  return normalizeLetters(data);
}

export async function generateMetadata({ params }) {
  const { system } = await params;
  const meta = getSystemMeta(system);
  const title = getText(meta?.title) || "Alphabet Game";

  return {
    title: `${title} Game | Writing Systems`,
    description: `Practice recognizing the characters of ${title}.`,
  };
}

export default async function WritingSystemGamePage({ params }) {
  const { system } = await params;

  const meta = getSystemMeta(system);
  const letters = getCharacterSet(system);

  if (!meta || !letters) return notFound();

  const title = getText(meta.title) || system;

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-100 via-white to-sky-50 px-4 py-6 text-slate-900">
      <section className="mx-auto max-w-5xl">
        <header className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-lg">
          <Link
            href={`/writing-systems/${system}`}
            className="text-sm font-bold text-violet-700 hover:text-violet-900"
          >
            ← Back to {title}
          </Link>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-5xl font-black text-white shadow-inner">
              {meta.glyph || "✦"}
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-violet-600">
                Alphabet Game
              </p>

              <h1 className="mt-1 text-3xl font-black text-slate-950">
                {title}
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-600">
                Tap characters, hear their sounds, then test yourself.
              </p>
            </div>
          </div>
        </header>

        <div className="mt-5">
          <AlphabetClickGame system={system} letters={letters} />
        </div>
      </section>
    </main>
  );
}