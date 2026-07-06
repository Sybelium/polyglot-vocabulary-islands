import Link from "next/link";
import { SENTENCE_STEPS } from "./sentenceUtils";

export default function SentenceStepTabs({ lang, subjectId, activeStep }) {
  return (
    <>
      <section className="hidden rounded-3xl border border-white/80 bg-white/90 p-2 shadow-lg md:block">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${SENTENCE_STEPS.length}, minmax(0, 1fr))`,
          }}
        >
          {SENTENCE_STEPS.map((step) => {
            const active = activeStep === step.id;

            return (
              <Link
                key={step.id}
                href={`/sentences/${lang}/${subjectId}/${step.id}`}
                className={[
                  "rounded-2xl px-3 py-3 text-center text-sm font-black transition",
                  active
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-sky-50",
                ].join(" ")}
              >
                <span className="mr-1">{step.icon}</span>
                {step.label}
              </Link>
            );
          })}
        </div>
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
        <div
          className="mx-auto grid max-w-lg gap-1"
          style={{
            gridTemplateColumns: `repeat(${SENTENCE_STEPS.length}, minmax(0, 1fr))`,
          }}
        >
          {SENTENCE_STEPS.map((step) => {
            const active = activeStep === step.id;

            return (
              <Link
                key={step.id}
                href={`/sentences/${lang}/${subjectId}/${step.id}`}
                className={[
                  "rounded-2xl px-1 py-2 text-center transition",
                  active
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700",
                ].join(" ")}
              >
                <span className="block text-base leading-none">
                  {step.icon}
                </span>
                <span className="mt-1 block text-[10px] font-black leading-none">
                  {step.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}