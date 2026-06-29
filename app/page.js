import Link from "next/link";

const apps = [
  {
    title: "Vocabulary Islands",
    subtitle: "Learn your first words through islands, songs, pictures and games.",
    href: "/vocabulary",
    emoji: "🏝️",
    status: "Available",
    active: true,
    gradient: "from-sky-400 to-emerald-400",
  },
  {
  title: "Latin Conjugation",
  subtitle:
    "Practice regular and irregular verbs in French, Spanish, Italian and Portuguese.",
  href: "/conjugation",
  emoji: "🧩",
  status: "Available",
  active: true,
  gradient: "from-indigo-400 to-sky-500",
},
  {
    title: "Pronunciation Coach",
    subtitle: "Train your speaking, listening and pronunciation skills.",
    href: "/pronunciation",
    emoji: "🎙️",
    status: "Coming soon",
    active: false,
    gradient: "from-slate-300 to-slate-400",
  },
  {
    title: "Writing Systems",
    subtitle: "Explore alphabets, scripts and letter sounds around the world.",
    href: "/writing-systems",
    emoji: "✍️",
    status: "Coming soon",
    active: true,
    gradient: "from-slate-300 to-slate-400",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-white to-emerald-50 px-4 py-8 text-slate-900">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-sky-600">
            Language Playground
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Choose your language app
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-slate-600 sm:text-lg">
            Small, playful learning apps for vocabulary, pronunciation,
            conjugation and writing systems.
          </p>
        </header>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {apps.map((app) => {
            const card = (
              <article
                className={[
                  "relative flex min-h-[260px] flex-col overflow-hidden rounded-[2rem] border p-5 shadow-lg transition",
                  app.active
                    ? "border-white/80 bg-white hover:-translate-y-1 hover:shadow-2xl"
                    : "border-slate-200 bg-slate-100 opacity-70 grayscale",
                ].join(" ")}
              >
                {!app.active && (
                  <div className="absolute inset-x-4 top-4 z-10 rounded-full bg-slate-900/80 px-3 py-1 text-center text-xs font-black uppercase tracking-wide text-white">
                    Coming soon
                  </div>
                )}

                <div
                  className={`flex h-24 items-center justify-center rounded-[1.5rem] bg-gradient-to-br ${app.gradient} text-5xl shadow-inner`}
                >
                  {app.emoji}
                </div>

                <div className="mt-5 flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-black text-slate-950">
                      {app.title}
                    </h2>

                    {app.active && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">
                        Open
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
                    {app.subtitle}
                  </p>

                  <div className="mt-auto pt-6">
                    {app.active ? (
                      <span className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-md">
                        Start learning →
                      </span>
                    ) : (
                      <span className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-300 px-4 py-3 text-sm font-black text-slate-600">
                        Coming soon
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );

            return app.active ? (
              <Link key={app.title} href={app.href} className="block">
                {card}
              </Link>
            ) : (
              <div key={app.title} aria-disabled="true">
                {card}
              </div>
            );
          })}
        </section>


        <footer className="text-center text-sm font-medium text-slate-500">
  Vocabulary Islands, Writing Systems and Latin Conjugation are ready.
</footer>
      </section>
    </main>
  );
}