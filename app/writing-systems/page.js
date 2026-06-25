import Link from "next/link";
import fs from "fs";
import path from "path";
import InstallAppButton from "@/components/writing-systems/InstallAppButton";

function readJson(relativePath) {
  const filePath = path.join(process.cwd(), relativePath);
  const file = fs.readFileSync(filePath, "utf8");
  return JSON.parse(file);
}

function getText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.en || Object.values(value)[0] || "";
}

function getWritingSystems() {
  return readJson("public/data/writing-systems/writing-systems.json");
}

export const metadata = {
  title: "Writing Systems | Language Playground",
  description: "Explore alphabets and writing systems through explanations, sounds and games.",
};

export default function WritingSystemsPage() {
  const systems = getWritingSystems();

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-100 via-white to-sky-50 px-4 py-6 text-slate-900">
      <section className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-lg">
          <Link
            href="/"
            className="text-sm font-bold text-violet-700 hover:text-violet-900"
          >
            ← Language Playground
          </Link>

          <div className="mt-5">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-violet-600">
              Writing Systems
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Explore the world of scripts
            </h1>

            <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-slate-600">
              Learn how alphabets and writing systems work, recognize their
              letters, and soon practice them with interactive games.
            </p>
            <div className="mt-5">
  <InstallAppButton />
</div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {systems.map((system) => (
            <article
              key={system.id}
              className="group overflow-hidden rounded-[2rem] border border-white/80 bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-5xl font-black text-white shadow-inner transition group-hover:scale-105">
                  {system.glyph || "✦"}
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    {getText(system.title) || system.id}
                  </h2>

                  <p className="mt-1 text-sm font-medium leading-snug text-slate-600">
                    {getText(system.subtitle)}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-2">
  <Link
    href={`/writing-systems/${system.id}`}
    className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white shadow-md transition hover:bg-violet-800"
  >
    Learn this script →
  </Link>

  <div className="grid grid-cols-2 gap-2">
    <Link
      href={`/writing-systems/${system.id}/game`}
      className="rounded-2xl bg-violet-100 px-4 py-3 text-center text-sm font-black text-violet-700 transition hover:bg-violet-200"
    >
      Game
    </Link>

    <Link
      href={`/writing-systems/${system.id}/songs`}
      className="rounded-2xl bg-violet-100 px-4 py-3 text-center text-sm font-black text-violet-700 transition hover:bg-violet-200"
    >
      Songs
    </Link>
  </div>
</div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}