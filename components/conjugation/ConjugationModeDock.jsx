"use client";

const ICONS = {
  pattern: "▦",
  "choose-ending": "✓",
  "type-ending": "✎",
  "type-full-form": "Aa",
  "choose-form": "✓",
  "type-form": "✎",
  polyglot: "🌐",
  "other-forms": "⋯",
};

function shortLabel(label) {
  if (label === "Choose ending") return "Choose";
  if (label === "Type ending") return "Ending";
  if (label === "Type full form") return "Full";
  if (label === "Choose form") return "Choose";
  if (label === "Type form") return "Type";
  if (label === "Other forms") return "Other";
  return label;
}

export default function ConjugationModeDock({
  modeTabs,
  activeMode,
  onModeChange,
}) {
  return (
    <>
      <section className="hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-sm md:block">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${modeTabs.length}, minmax(0, 1fr))`,
          }}
        >
          {modeTabs.map((tab) => {
            const isActive = activeMode === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onModeChange(tab.id)}
                className={`rounded-xl px-3 py-2 text-left transition ${
                  isActive
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="block text-sm font-black">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
        <div
          className="mx-auto grid max-w-lg gap-1"
          style={{
            gridTemplateColumns: `repeat(${modeTabs.length}, minmax(0, 1fr))`,
          }}
        >
          {modeTabs.map((tab) => {
            const isActive = activeMode === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onModeChange(tab.id)}
                className={`rounded-2xl px-1 py-2 text-center transition ${
                  isActive
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                <span className="block text-base leading-none">
                  {ICONS[tab.id] || "•"}
                </span>
                <span className="mt-1 block text-[10px] font-black leading-none">
                  {shortLabel(tab.label)}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}