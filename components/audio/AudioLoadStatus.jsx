"use client";

import useAudioBundleStatus from "./useAudioBundleStatus";

const STATUS_STYLES = {
  loading: "bg-amber-50 text-amber-700 ring-amber-100",
  ready: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  fallback: "bg-slate-50 text-slate-600 ring-slate-100",
};

const STATUS_ICONS = {
  loading: "⏳",
  ready: "✅",
  fallback: "🗣️",
};

export default function AudioLoadStatus({
  audioSrc,
  mapSrc,
  className = "",
  showDetails = false,
}) {
  const state = useAudioBundleStatus({ audioSrc, mapSrc });

  const style =
    STATUS_STYLES[state.status] ||
    "bg-slate-50 text-slate-600 ring-slate-100";

  const icon = STATUS_ICONS[state.status] || "🗣️";

  return (
    <div
      className={[
        "inline-flex max-w-full flex-col gap-1 rounded-2xl px-3 py-2 text-xs font-black ring-1",
        style,
        className,
      ].join(" ")}
    >
      <span className="inline-flex items-center gap-2">
        <span>{icon}</span>
        <span>{state.message}</span>
      </span>

      {showDetails && (
        <span className="truncate text-[11px] font-bold opacity-70">
          {state.status === "ready" ? state.audioSrc : "Browser voice is available."}
        </span>
      )}
    </div>
  );
}