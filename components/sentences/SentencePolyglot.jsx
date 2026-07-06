import { SENTENCE_LANGUAGES, getSentenceText } from "./sentenceUtils";

export default function SentencePolyglot({ sentences }) {
  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/95 p-4 shadow-xl md:p-6">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-wide text-sky-600">
          Polyglot
        </p>

        <h2 className="text-2xl font-black text-slate-950 md:text-3xl">
          Compare all languages
        </h2>
      </div>

      <div className="grid gap-4">
        {sentences.map((sentence, index) => (
          <article
            key={sentence.id}
            className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
          >
            <header className="bg-slate-50 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Sentence {index + 1}
              </p>
            </header>

            <div className="grid gap-2 p-3 md:grid-cols-2">
              {SENTENCE_LANGUAGES.map((language) => (
                <div
                  key={language.id}
                  className="rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <p className="text-xs font-black uppercase text-slate-400">
                    {language.label}
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-950">
                    {getSentenceText(sentence, language.id)}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}