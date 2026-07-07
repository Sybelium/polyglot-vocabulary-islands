import Link from "next/link";

const apps = [
  {
    title: "Vocabulary Islands",
    subtitle:
      "Learn your first words through islands, songs, pictures and games.",
    href: "/vocabulary",
    image: "/images/vocabulary-Island-appPicker.webp",
    status: "Available",
    active: true,
  },
  {
    title: "Sentences",
    subtitle:
      "Practice useful sentences by listening, ordering words, matching meanings and comparing languages.",
    href: "/sentences",
    image: "/images/sentences-appPicker.webp",
    status: "Available",
    active: true,
  },
  {
    title: "Latin Conjugation",
    subtitle:
      "Practice regular and irregular verbs in French, Spanish, Italian and Portuguese.",
    href: "/conjugation",
    image: "/images/latin-conjugation-appPicker%20.webp",
    status: "Available",
    active: true,
  },
  {
    title: "Germanic Conjugation",
    subtitle:
      "Train English, German and Dutch irregular verbs, with English tense tables.",
    href: "/irregular-verbs/en",
    image: "/images/germanic-conjugation-appPicker%20.webp",
    status: "Available",
    active: true,
  },
  {
    title: "Writing Systems",
    subtitle: "Explore alphabets, scripts and letter sounds around the world.",
    href: "/writing-systems",
    image: "/images/writing-systems-appPicker.webp",
    status: "Available",
    active: true,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-white to-emerald-50 px-4 py-8 text-slate-900">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <header
          className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-slate-900 shadow-xl"
          style={{
            backgroundImage: "url('/images/language-playground-hero.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="relative z-10 px-6 py-16 text-left text-white sm:px-10 sm:py-20 lg:px-14"
            style={{
              textShadow: "0 3px 12px rgba(15, 23, 42, 0.75)",
            }}
          >
            <p className="text-sm font-black uppercase tracking-[0.28em] text-sky-200">
              Language Playground
            </p>

            <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Choose your language app
            </h1>

            <p className="mt-5 max-w-xl text-base font-semibold leading-relaxed text-sky-50 sm:text-lg">
              Small, playful learning apps for vocabulary, sentences,
              conjugation and writing systems.
            </p>
          </div>
        </header>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {apps.map((app) => {
            const card = (
              <article
                className={[
                  "relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-[2rem] border p-5 shadow-lg transition",
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

                <div className="h-24 overflow-hidden rounded-[1.5rem] bg-slate-100 shadow-inner">
                  <img
                    src={app.image}
                    alt=""
                    className="h-full w-full object-cover"
                    draggable="false"
                  />
                </div>

                <div className="mt-5 flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-black text-slate-950">
                      {app.title}
                    </h2>
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
              <Link key={app.title} href={app.href} className="block h-full">
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
          Vocabulary Islands, Sentences, Latin Conjugation, Germanic
          Conjugation and Writing Systems are ready.
        </footer>
      </section>
    </main>
  );
}