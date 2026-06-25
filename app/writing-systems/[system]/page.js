import Link from "next/link";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";

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

function getParagraphs(value) {
  if (!value) return [];

  const localized = Array.isArray(value)
    ? value
    : typeof value === "object"
      ? value.en || Object.values(value)[0]
      : value;

  if (Array.isArray(localized)) return localized;
  if (typeof localized === "string") return [localized];

  return [];
}

function getWritingSystems() {
  return (
    readJsonIfExists("public/data/writing-systems/writing-systems.json") || []
  );
}

function getSystemMeta(systemId) {
  return getWritingSystems().find((system) => system.id === systemId) || null;
}

function getExplanation(systemId) {
  return readJsonIfExists(
    `public/data/writing-systems/explanations/${systemId}.json`
  );
}

export async function generateMetadata({ params }) {
  const { system } = await params;
  const meta = getSystemMeta(system);
  const explanation = getExplanation(system);

  const title =
    getText(explanation?.title) || getText(meta?.title) || "Writing System";

  const subtitle =
    getText(meta?.subtitle) ||
    "Learn how this writing system works in Language Playground.";

  return {
    title: `${title} | Writing Systems`,
    description: subtitle,
  };
}

export default async function WritingSystemExplanationPage({ params }) {
  const { system } = await params;

  const meta = getSystemMeta(system);
  const data = getExplanation(system);

  if (!data) return notFound();

  const title = getText(data.title) || getText(meta?.title) || system;
  const subtitle = getText(meta?.subtitle);
  const intro = getParagraphs(data.intro);
  const sections = Array.isArray(data.sections) ? data.sections : [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-100 via-white to-sky-50 px-4 py-6 text-slate-900">
      <article className="mx-auto max-w-4xl">
        <header className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-lg">
          <Link
            href="/writing-systems"
            className="text-sm font-bold text-violet-700 hover:text-violet-900"
          >
            ← All writing systems
          </Link>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-6xl font-black text-white shadow-inner">
              {meta?.glyph || "✦"}
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-violet-600">
                Writing System
              </p>

              <h1 className="mt-1 text-4xl font-black tracking-tight text-slate-950">
                {title}
              </h1>

              {subtitle && (
                <p className="mt-2 text-base font-medium leading-relaxed text-slate-600">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
  <span className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white">
    Explanation
  </span>

  <Link
    href={`/writing-systems/${system}/game`}
    className="rounded-2xl bg-violet-100 px-4 py-3 text-center text-sm font-black text-violet-700 transition hover:bg-violet-200"
  >
    Game
  </Link>

  <Link
    href={`/writing-systems/${system}/songs`}
    className="rounded-2xl bg-violet-100 px-4 py-3 text-center text-sm font-black text-violet-700 transition hover:bg-violet-200"
  >
    Songs
  </Link>
</div>
        </header>

        <section className="mt-5 rounded-[2rem] border border-white/80 bg-white p-5 shadow-md sm:p-7">
          {intro.length > 0 && (
            <div className="space-y-4">
              {intro.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-base font-medium leading-relaxed text-slate-700"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {sections.length > 0 && (
            <div className="mt-8 space-y-8">
              {sections.map((section) => {
                const sectionTitle = getText(section.title);
                const paragraphs = getParagraphs(section.content);

                return (
                  <section key={section.id || sectionTitle}>
                    {sectionTitle && (
                      <h2 className="text-2xl font-black text-slate-950">
                        {sectionTitle}
                      </h2>
                    )}

                    <div className="mt-3 space-y-3">
                      {paragraphs.map((paragraph, index) => (
                        <p
                          key={index}
                          className="text-base font-medium leading-relaxed text-slate-700"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>
      </article>
    </main>
  );
}