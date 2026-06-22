import Link from "next/link";

export default function LanguageIsland({
  lang,
  name,
  flag,
  description,
  monument,
  color = "from-blue-500 to-cyan-400",
  className = "",
}) {
  return (
    <Link
      href={`/start?lang=${lang}`}
      className={[
        "group relative block rounded-[2rem] p-[3px]",
        "bg-white/70 shadow-xl shadow-slate-900/10",
        "transition duration-300 hover:-translate-y-2 hover:scale-[1.03]",
        className,
      ].join(" ")}
    >
      <div
        className={[
          "relative overflow-hidden rounded-[1.85rem]",
          "bg-gradient-to-br",
          color,
          "px-5 py-5 text-white",
          "min-h-[170px]",
        ].join(" ")}
      >
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/20 blur-xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="text-4xl drop-shadow-sm">{flag}</div>
            <h2 className="mt-3 text-2xl font-black tracking-tight drop-shadow-sm">
              {name}
            </h2>
            <p className="mt-2 max-w-[180px] text-sm font-semibold leading-snug text-white/95">
              {description}
            </p>
          </div>

          <div className="rounded-2xl bg-white/25 px-3 py-2 text-4xl shadow-inner backdrop-blur-sm">
            {monument}
          </div>
        </div>

        <div className="relative z-10 mt-5 inline-flex rounded-full bg-white/25 px-4 py-2 text-sm font-bold text-white shadow-inner backdrop-blur-sm">
          Start exploring →
        </div>
      </div>
    </Link>
  );
}