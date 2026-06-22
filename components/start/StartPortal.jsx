import Link from "next/link";

const languages = [
  { lang: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { lang: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { lang: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { lang: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { lang: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { lang: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { lang: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
];

const languageZones = [
  { lang: "en", name: "English", left: "10%", top: "23%", width: "16%", height: "33%" },
  { lang: "fr", name: "French", left: "28%", top: "20%", width: "14%", height: "30%" },
  { lang: "es", name: "Spanish", left: "44%", top: "18%", width: "14%", height: "28%" },
  { lang: "it", name: "Italian", left: "60%", top: "22%", width: "14%", height: "28%" },
  { lang: "de", name: "German", left: "77%", top: "23%", width: "16%", height: "32%" },
  { lang: "pt", name: "Portuguese", left: "18%", top: "53%", width: "15%", height: "26%" },
  { lang: "nl", name: "Dutch", left: "68%", top: "53%", width: "15%", height: "27%" },
];

export default function StartPortal() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-cyan-100 to-blue-200">
      {/* Mobile app-style start page */}
      <section className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-6 md:hidden">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl">
          <div className="relative h-44">
            <img
              src="/images/start/world-portal.jpg"
              alt="Polyglot World language journey map"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-blue-950/20" />

          </div>

          <div className="p-5">
            <p className="text-sm font-semibold leading-relaxed text-slate-600">
              Pick a language and start exploring vocabulary islands with words,
              games, songs, and challenges.
            </p>

            <div className="mt-5 grid gap-3">
              {languages.map((language) => (
                <Link
                  key={language.lang}
                  href={`/${language.lang}/journey/a0`}
                  className="flex items-center justify-between rounded-[1.5rem] border border-blue-100 bg-sky-50 px-4 py-4 shadow-sm transition active:scale-[0.98]"
                  aria-label={`Start learning ${language.name}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-sm">
                      {language.flag}
                    </span>

                    <div>
                      <div className="text-lg font-black text-blue-950">
                        {language.nativeName}
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        {language.name}
                      </div>
                    </div>
                  </div>

                  <span className="text-2xl font-black text-blue-600">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Desktop / tablet map start page */}
      <section className="relative mx-auto hidden min-h-screen max-w-[1800px] overflow-hidden bg-sky-200 md:block">
        <img
          src="/images/start/world-portal.jpg"
          alt="Polyglot World language journey map"
          className="h-screen w-full object-cover object-center"
        />

        <div className="absolute left-1/2 top-8 z-30 w-[min(92%,720px)] -translate-x-1/2 rounded-[2rem] bg-white/90 px-6 py-4 text-center shadow-xl backdrop-blur">
          <h1 className="text-4xl font-black text-blue-950">
            Choose your language
          </h1>
          <p className="mt-2 text-base font-semibold text-slate-600">
            Pick a language and start exploring vocabulary islands.
          </p>
        </div>

        {languageZones.map((zone) => (
          <Link
            key={zone.lang}
            href={`/${zone.lang}/journey/a0`}
            className="group absolute z-20"
            style={{
              left: zone.left,
              top: zone.top,
              width: zone.width,
              height: zone.height,
            }}
            aria-label={`Start learning ${zone.name}`}
          >
            <div className="absolute inset-0 rounded-[2rem] transition group-hover:bg-white/10" />

            <div
              className={[
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                "rounded-full bg-white/95 px-4 py-2 text-sm font-black text-blue-950 shadow-xl backdrop-blur",
                "opacity-0 scale-95 transition duration-200",
                "group-hover:opacity-100 group-hover:scale-100",
              ].join(" ")}
            >
              {zone.name}
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}