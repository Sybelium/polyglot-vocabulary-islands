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

function getWritingSystems() {
  return (
    readJsonIfExists("public/data/writing-systems/writing-systems.json") || []
  );
}

function getSystemMeta(systemId) {
  return getWritingSystems().find((system) => system.id === systemId) || null;
}

function getSongs(systemId) {
  return readJsonIfExists(`public/data/writing-systems/songs/${systemId}.json`);
}

function getVideoEmbedUrl(url) {
  if (!url) return "";

  if (url.includes("youtube.com/embed/")) return url;

  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch?.[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch?.[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  return url;
}

export async function generateMetadata({ params }) {
  const { system } = await params;
  const meta = getSystemMeta(system);
  const title = getText(meta?.title) || "Writing System";

  return {
    title: `${title} Songs | Writing Systems`,
    description: `Songs and sound practice for ${title}.`,
  };
}

export default async function WritingSystemSongsPage({ params }) {
  const { system } = await params;

  const meta = getSystemMeta(system);
  if (!meta) return notFound();

  const songData = getSongs(system);
  const title = getText(meta.title) || system;

  const songs = Array.isArray(songData?.songs) ? songData.songs : [];
const lyrics = Array.isArray(songData?.lyrics) ? songData.lyrics : [];
const intro = Array.isArray(songData?.intro?.en) ? songData.intro.en : [];
const pageTitle = getText(songData?.pageTitle) || `${title} Songs`;
const hasSongContent = songs.length > 0 || lyrics.length > 0;

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
                Songs
              </p>

              <h1 className="mt-1 text-3xl font-black text-slate-950">
  {pageTitle}
</h1>

              <p className="mt-1 text-sm font-medium text-slate-600">
                Use rhythm and repetition to remember the script.
              </p>
            </div>
          </div>
        </header>

        <section className="mt-5 rounded-[2rem] border border-white/80 bg-white p-5 shadow-lg">
          {!songData || !hasSongContent ? (
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-4xl">
                🎵
              </div>

              <h2 className="mt-4 text-2xl font-black text-slate-950">
                Song page ready
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-600">
                The route is now active. To add songs for this script, create:
              </p>

              <code className="mt-4 inline-block rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">
                public/data/writing-systems/songs/{system}.json
              </code>
            </div>
          ) : (
            <div className="space-y-6">
              {intro.length > 0 && (
  <div className="rounded-[2rem] bg-violet-50 p-5">
    <div className="space-y-2">
      {intro.map((paragraph, index) => (
        <p
          key={index}
          className="text-sm font-medium leading-relaxed text-slate-700"
        >
          {paragraph}
        </p>
      ))}
    </div>
  </div>
)}

{songs.length > 0 && (
  <div className="grid gap-5 md:grid-cols-2">
    {songs.map((song, index) => {
      const embedUrl = song.embedUrl || getVideoEmbedUrl(song.url);

      return (
        <article
          key={index}
          className="overflow-hidden rounded-[2rem] border border-slate-100 bg-slate-50 shadow-sm"
        >
          {embedUrl && (
            <div className="aspect-video bg-slate-200">
              <iframe
                src={embedUrl}
                title={getText(song.title) || `${title} song`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <div className="p-4">
            <h2 className="text-lg font-black text-slate-950">
              {getText(song.title) || `${title} song`}
            </h2>

            {getText(song.description) && (
              <p className="mt-2 text-sm font-medium text-slate-600">
                {getText(song.description)}
              </p>
            )}
          </div>
        </article>
      );
    })}
  </div>
)}

              {lyrics.length > 0 && (
                <div className="rounded-[2rem] bg-violet-50 p-5">
                  <h2 className="text-xl font-black text-slate-950">
                    Lyrics / practice lines
                  </h2>

                  <div className="mt-4 space-y-3">
                    {lyrics.map((line, index) => (
                      <div
                        key={index}
                        className="rounded-2xl bg-white px-4 py-3 shadow-sm"
                      >
                        <p className="text-lg font-black text-slate-950">
                          {line.script || line.text || ""}
                        </p>

                        {(line.romanization || line.translation) && (
                          <p className="mt-1 text-sm font-medium text-slate-600">
                            {line.romanization || line.translation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}