import SentenceTopControls from "./SentenceTopControls";
import SentenceStepTabs from "./SentenceStepTabs";
import SentenceLearn from "./SentenceLearn";
import SentenceOrderGame from "./SentenceOrderGame";
import SentenceMatchingGame from "./SentenceMatchingGame";
import SentenceFillWords from "./SentenceFillWords";
import SentencePolyglot from "./SentencePolyglot";
import { getSupportLang } from "./sentenceUtils";

export default function SentencesAppShell({
  lang,
  subjectId,
  step,
  themes,
  subject,
  themeData,
}) {
  const supportLang = getSupportLang(lang);
  const sentences = themeData.sentences || [];

  let content = null;

  if (step === "learn") {
    content = (
      <SentenceLearn
        lang={lang}
        supportLang={supportLang}
        subjectId={subjectId}
        sentences={sentences}
      />
    );
  }

  if (step === "order") {
    content = (
      <SentenceOrderGame
        lang={lang}
        supportLang={supportLang}
        sentences={sentences}
      />
    );
  }

  if (step === "matching") {
    content = (
      <SentenceMatchingGame
        lang={lang}
        supportLang={supportLang}
        sentences={sentences}
      />
    );
  }

  if (step === "fill") {
    content = (
      <SentenceFillWords
        lang={lang}
        supportLang={supportLang}
        sentences={sentences}
      />
    );
  }

  if (step === "polyglot") {
  content = (
    <SentencePolyglot
      subjectId={subjectId}
      sentences={sentences}
    />
  );
}

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-white to-emerald-50 px-3 py-4 pb-28 text-slate-900 md:px-6 md:py-8 md:pb-8">
      <section className="mx-auto max-w-6xl">
        <header className="mb-4 rounded-[2rem] border border-white/80 bg-white/90 p-4 shadow-xl md:mb-6 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-600">
                Sentences
              </p>

              <h1 className="mt-2 flex items-center gap-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                <span>{subject.icon}</span>
                <span>{subject.name}</span>
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-600 md:text-base">
                {subject.description}
              </p>
            </div>

            <SentenceTopControls
              lang={lang}
              subjectId={subjectId}
              step={step}
              themes={themes}
            />
          </div>
        </header>

        <SentenceStepTabs lang={lang} subjectId={subjectId} activeStep={step} />

        <div className="mt-4 md:mt-6">{content}</div>
      </section>
    </main>
  );
}