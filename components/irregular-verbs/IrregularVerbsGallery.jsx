"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import IrregularVerbsChainBuilder from "@/components/irregular-verbs/IrregularVerbsChainBuilder";
import IrregularVerbsMissingForm from "@/components/irregular-verbs/IrregularVerbsMissingForm";
import IrregularVerbsSpeedMatch from "@/components/irregular-verbs/IrregularVerbsSpeedMatch";
import IrregularVerbsTypeForm from "@/components/irregular-verbs/IrregularVerbsTypeForm";
import { getIrregularVerbConfig } from "@/components/irregular-verbs/irregularVerbConfig";
import {
  getDisplayChunk,
  makeSpokenText,
  speakText,
} from "@/components/irregular-verbs/irregularVerbUtils";
import EnglishTwelveTensesPanel from "@/components/irregular-verbs/EnglishTwelveTensesPanel";
import GermanicVerbDetailPanel from "@/components/irregular-verbs/GermanicVerbDetailPanel";

const SUPPORT_LANGUAGES = [
  { code: "fr", label: "FR" },
  { code: "es", label: "ES" },
  { code: "it", label: "IT" },
  { code: "de", label: "DE" },
  { code: "nl", label: "NL" },
  { code: "pt", label: "PT" },
];

const IRREGULAR_VERB_LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "de", label: "German", short: "DE" },
  { code: "nl", label: "Dutch", short: "NL" },
];

const CHUNK_SIZE = 10;

function makeChunks(verbs) {
  const chunks = [];

  for (let index = 0; index < verbs.length; index += CHUNK_SIZE) {
    const chunkVerbs = verbs.slice(index, index + CHUNK_SIZE);
    const firstVerb = chunkVerbs[0];
    const lastVerb = chunkVerbs[chunkVerbs.length - 1];

    chunks.push({
      id: `chunk-${index / CHUNK_SIZE + 1}`,
      index: index / CHUNK_SIZE,
      label:
        firstVerb?.groupName && verbs.length <= CHUNK_SIZE
          ? `Group ${firstVerb.group}`
          : `${index + 1}–${index + chunkVerbs.length}`,
      subtitle:
        firstVerb?.groupName && verbs.length <= CHUNK_SIZE
          ? firstVerb.groupName
          : `${firstVerb?.base || "Verb"} – ${lastVerb?.base || "Verb"}`,
      verbs: chunkVerbs,
    });
  }

  return chunks;
}

export default function IrregularVerbsGallery({ targetLang = "en" }) {
  const router = useRouter();

  const activeTargetLang = IRREGULAR_VERB_LANGUAGES.some(
    (language) => language.code === targetLang
  )
    ? targetLang
    : "en";

  const config = getIrregularVerbConfig(activeTargetLang);
  const lists = config.lists || [];

  const [verbs, setVerbs] = useState([]);
  const [selectedListId, setSelectedListId] = useState(lists[0]?.id || "top-50");
  const [selectedChunkIndex, setSelectedChunkIndex] = useState(0);
  const [supportLang, setSupportLang] = useState("fr");
  const [showTranslations, setShowTranslations] = useState(true);
  const [activeVerbId, setActiveVerbId] = useState(null);
  const [isPlayingGroup, setIsPlayingGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [mode, setMode] = useState("gallery");
  const [selectedVerbForTable, setSelectedVerbForTable] = useState(null);
  const tensePanelRef = useRef(null);

  const selectedList = useMemo(() => {
    return lists.find((list) => list.id === selectedListId) || lists[0];
  }, [lists, selectedListId]);

  useEffect(() => {
    if (!lists.some((list) => list.id === selectedListId)) {
      setSelectedListId(lists[0]?.id || "top-50");
    }
  }, [lists, selectedListId]);

  useEffect(() => {
    let alive = true;

    async function loadVerbs() {
      if (!selectedList?.file) return;

      setLoading(true);
      setLoadError("");
      setVerbs([]);
      setSelectedChunkIndex(0);
      setMode("gallery");
      setSelectedVerbForTable(null);

      try {
        const path = `/data/irregular-verbs/${activeTargetLang}/${selectedList.file}`;
        const res = await fetch(path);

        if (!res.ok) {
          throw new Error(`Could not load ${path}`);
        }

        const data = await res.json();
        const loadedVerbs = Array.isArray(data) ? data : data.verbs || [];

        if (alive) {
          setVerbs(loadedVerbs);
        }
      } catch (error) {
        console.error(error);

        if (alive) {
          setLoadError(error.message || "Could not load irregular verbs.");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadVerbs();

    return () => {
      alive = false;

      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedList?.file, activeTargetLang]);

  const chunks = useMemo(() => makeChunks(verbs), [verbs]);

  const currentChunk = useMemo(() => {
    return chunks[selectedChunkIndex] || chunks[0] || null;
  }, [chunks, selectedChunkIndex]);

  const currentVerbs = currentChunk?.verbs || [];

  function stopAudio() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsPlayingGroup(false);
    setActiveVerbId(null);
  }

  function playSingleVerb(verb) {
    stopAudio();

    setActiveVerbId(verb.id);

    speakText(makeSpokenText(verb, config), config, () => {
      setActiveVerbId(null);
    });
  }

  function playGroup(index = 0) {
    if (!currentVerbs[index]) {
      setIsPlayingGroup(false);
      setActiveVerbId(null);
      return;
    }

    const verb = currentVerbs[index];

    setIsPlayingGroup(true);
    setActiveVerbId(verb.id);

    speakText(makeSpokenText(verb, config), config, () => {
      setTimeout(() => {
        playGroup(index + 1);
      }, 350);
    });
  }

  function handlePlayGroup() {
    stopAudio();

    setTimeout(() => {
      playGroup(0);
    }, 100);
  }

  function handleChunkChange(chunkIndex) {
    stopAudio();
    setSelectedChunkIndex(chunkIndex);
    setMode("gallery");
    setSelectedVerbForTable(null);
  }

  function handleListChange(event) {
    stopAudio();
    setSelectedListId(event.target.value);
  }

  function handleTargetLangChange(event) {
  const nextLang = event.target.value;

  stopAudio();
  setSelectedVerbForTable(null);
  router.push(`/irregular-verbs/${nextLang}`);
}

  function changeMode(nextMode) {
    stopAudio();
    setMode(nextMode);
    setSelectedVerbForTable(null);
  }

  function openVerbTable(verb) {
  setSelectedVerbForTable(verb);

  setTimeout(() => {
    tensePanelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 80);
}

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-slate-600">Loading Verb Forge...</p>
        </div>
      </main>
    );
  }

  if (!verbs.length) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 px-4 py-10">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            {config.title || "Verb Forge"}
          </h1>

          <p className="mt-3 text-slate-600">
            The irregular verbs list could not be loaded.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Check that the file exists at{" "}
            <code>
              /public/data/irregular-verbs/{activeTargetLang}/{selectedList?.file || "irregular-verbs-50.json"}
            </code>
            .
          </p>

          {loadError && (
            <p className="mt-3 text-xs font-semibold text-red-600">
              {loadError}
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 px-4 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur md:p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,380px)] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
                {config.trainerLabel || "Verb trainer"}
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                {config.title || "Verb Forge"}
              </h1>

              <p className="mt-1 text-lg font-black text-slate-700">
                {config.subtitle}
              </p>

              <p className="mt-2 max-w-2xl text-base text-slate-600">
                {config.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
  <label className="block">
    <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
      Verb language
    </span>

    <select
      value={activeTargetLang}
      onChange={handleTargetLangChange}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
    >
      {IRREGULAR_VERB_LANGUAGES.map((language) => (
        <option key={language.code} value={language.code}>
          {language.label}
        </option>
      ))}
    </select>
  </label>

  <label className="block">
    <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
      Verb list
    </span>

    <select
      value={selectedListId}
      onChange={handleListChange}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
    >
      {lists.map((list) => (
        <option key={list.id} value={list.id}>
          {list.label}
        </option>
      ))}
    </select>
  </label>
</div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {chunks.map((chunk) => {
              const active = chunk.index === selectedChunkIndex;

              return (
                <button
                  key={chunk.id}
                  onClick={() => handleChunkChange(chunk.index)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? "border-amber-400 bg-amber-100 text-amber-900 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50"
                  }`}
                >
                  <span className="block text-sm font-black">
                    {chunk.label}
                  </span>
                  <span className="block text-sm font-medium">
                    {chunk.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
          <button
            onClick={() => changeMode("gallery")}
            className={`rounded-full px-5 py-3 text-base font-bold transition ${
              mode === "gallery"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Verb Gallery
          </button>

          <button
            onClick={() => changeMode("chain-builder")}
            className={`rounded-full px-5 py-3 text-base font-bold transition ${
              mode === "chain-builder"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Build the Chain
          </button>

          <button
            onClick={() => changeMode("missing-form")}
            className={`rounded-full px-5 py-3 text-base font-bold transition ${
              mode === "missing-form"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Missing Form
          </button>

          <button
            onClick={() => changeMode("speed-match")}
            className={`rounded-full px-5 py-3 text-base font-bold transition ${
              mode === "speed-match"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Speed Match
          </button>

          <button
            onClick={() => changeMode("type-form")}
            className={`rounded-full px-5 py-3 text-base font-bold transition ${
              mode === "type-form"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Type Form
          </button>
        </div>

        {mode === "gallery" && (
          <div className="mt-6 rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {selectedList?.label} — {currentChunk?.label}
                </h2>

                <p className="mt-1 text-base text-slate-500">
                  {config.groupIntro || "Listen to the verb chains in this set."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handlePlayGroup}
                  disabled={isPlayingGroup}
                  className="rounded-full bg-slate-900 px-5 py-3 text-base font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  ▶ Play set
                </button>

                <button
                  onClick={stopAudio}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Stop
                </button>

                <button
                  onClick={() => setShowTranslations((value) => !value)}
                  className={`rounded-full px-5 py-3 text-sm font-bold transition ${
                    showTranslations
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {showTranslations ? "Translations ON" : "Translations OFF"}
                </button>
              </div>
            </div>

            {showTranslations && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-sm font-semibold text-slate-500">
                  Translation:
                </span>

                {SUPPORT_LANGUAGES.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => setSupportLang(language.code)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      supportLang === language.code
                        ? "bg-sky-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {language.label}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {currentVerbs.map((verb, index) => {
                const isActive = activeVerbId === verb.id;

                return (
                  <article
  key={verb.id}
  role="button"
  tabIndex={0}
  onClick={() => {
  openVerbTable(verb);
}}
onKeyDown={(event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openVerbTable(verb);
  }
}}
  className={`group relative cursor-pointer overflow-hidden rounded-3xl border p-4 transition ${
                      isActive
                        ? "scale-[1.02] border-amber-400 bg-amber-50 shadow-lg shadow-amber-100"
                        : "border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:border-sky-300 hover:shadow-md"
                    }`}
                  >
                    <div className="absolute right-4 top-4">
                      <button
  onClick={(event) => {
    event.stopPropagation();
    playSingleVerb(verb);
  }}
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition ${
                          isActive
                            ? "bg-amber-400 text-white"
                            : "bg-sky-100 text-sky-700 hover:bg-sky-200"
                        }`}
                        aria-label={`Listen to ${verb.base}`}
                      >
                        🔊
                      </button>
                    </div>

                    <div className="pr-12">
                      <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
                        Verb {selectedChunkIndex * CHUNK_SIZE + index + 1}
                      </p>

                      <div className="mt-3 space-y-2">
                        <div>
                          <p className="text-[13px] font-bold uppercase text-slate-400">
                            {config.form1 || "Base"}
                          </p>
                          <p className="text-2xl font-black text-slate-900">
                            {verb.base}
                          </p>
                        </div>

                        <div className="h-px bg-slate-100" />

                        <div>
                          <p className="text-[13px] font-bold uppercase text-slate-400">
                            {config.form2 || "Past"}
                          </p>
                          <p className="text-xl font-extrabold text-amber-700">
                            {getDisplayChunk(verb.pastSimple)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[13px] font-bold uppercase text-slate-400">
                            {config.form3 || "Participle"}
                          </p>
                          <p className="text-xl font-extrabold text-sky-700">
                            {getDisplayChunk(verb.pastParticiple)}
                          </p>
                        </div>
                      </div>

                                            {showTranslations && (
                        <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-2">
                          <p className="text-sm font-bold uppercase text-slate-400">
                            Meaning
                          </p>
                          <p className="mt-0.5 text-base font-bold text-slate-700">
                            {verb.translations?.[supportLang] || "—"}
                          </p>
                        </div>
                      )}
                    </div>

                    {isActive && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-amber-400" />
                    )}
                  </article>
                );
              })}
            </div>

            {selectedVerbForTable && (
  <div ref={tensePanelRef}>
    {activeTargetLang === "en" ? (
      <EnglishTwelveTensesPanel
        verb={selectedVerbForTable}
        listFile={selectedList?.file || "irregular-verbs-50.json"}
        onClose={() => setSelectedVerbForTable(null)}
      />
    ) : (
      <GermanicVerbDetailPanel
        verb={selectedVerbForTable}
        targetLang={activeTargetLang}
        supportLang={supportLang}
        listFile={selectedList?.file || "irregular-verbs-50.json"}
        onClose={() => setSelectedVerbForTable(null)}
      />
    )}
  </div>
)}
          </div>
        )}

        {mode === "chain-builder" && (
          <div className="mt-6">
            <IrregularVerbsChainBuilder
              verbs={currentVerbs}
              config={config}
              onBack={() => setMode("gallery")}
            />
          </div>
        )}

        {mode === "missing-form" && (
          <div className="mt-6">
            <IrregularVerbsMissingForm
              verbs={currentVerbs}
              config={config}
              onBack={() => setMode("gallery")}
            />
          </div>
        )}

        {mode === "speed-match" && (
          <div className="mt-6">
            <IrregularVerbsSpeedMatch
              verbs={currentVerbs}
              config={config}
              onBack={() => setMode("gallery")}
            />
          </div>
        )}

        {mode === "type-form" && (
          <div className="mt-6">
            <IrregularVerbsTypeForm
              verbs={currentVerbs}
              config={config}
              onBack={() => setMode("gallery")}
            />
          </div>
        )}
      </section>
    </main>
  );
}
