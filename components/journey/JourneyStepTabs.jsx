import Link from "next/link";

const steps = [
  {
    id: "learn",
    label: "Learn",
    shortLabel: "Learn",
    icon: "👀",
  },
  {
    id: "recognize",
    label: "Recognize",
    shortLabel: "Pick",
    icon: "🖼️",
  },
  {
    id: "write",
    label: "Write",
    shortLabel: "Write",
    icon: "✍️",
  },
  {
    id: "song",
    label: "Song",
    shortLabel: "Song",
    icon: "🎵",
  },
  {
    id: "song-challenge",
    label: "Challenge",
    shortLabel: "Test",
    icon: "🏆",
  },
];

function getIslandId(island) {
  return island?.id || island?.islandId;
}

function getStepHref(lang, island, stepId) {
  const islandId = getIslandId(island);
  return `/${lang}/journey/a0/${islandId}/${stepId}`;
}

export default function JourneyStepTabs({ lang, island, activeStep }) {
  return (
    <>
      {/* Desktop / tablet tabs */}
      <nav className="mb-6 hidden rounded-[2rem] bg-white/85 p-2 shadow-xl backdrop-blur md:flex md:flex-wrap md:gap-2">
        {steps.map((step) => {
          const isActive = activeStep === step.id;

          return (
            <Link
              key={step.id}
              href={getStepHref(lang, island, step.id)}
              className={[
                "flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition",
                isActive
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-blue-950 hover:bg-blue-50",
              ].join(" ")}
            >
              <span>{step.icon}</span>
              <span>{step.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile bottom navigation spacer */}

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-blue-100 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.15)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {steps.map((step) => {
            const isActive = activeStep === step.id;

            return (
              <Link
                key={step.id}
                href={getStepHref(lang, island, step.id)}
                className={[
                  "flex min-h-14 flex-col items-center justify-center rounded-2xl px-1 py-2 text-center text-[11px] font-black transition",
                  isActive
                    ? "bg-blue-600 text-white shadow"
                    : "text-blue-950 hover:bg-blue-50",
                ].join(" ")}
              >
                <span className="text-lg leading-none">{step.icon}</span>
                <span className="mt-1 leading-none">{step.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}