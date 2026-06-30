"use client";

import { useEffect, useMemo, useState } from "react";
import ConjugationPatternTable from "./ConjugationPatternTable";
import ConjugationEndingExercise from "./ConjugationEndingExercise";
import ConjugationFullFormExercise from "./ConjugationFullFormExercise";
import ConjugationBuildForm from "./ConjugationBuildForm";
import PolyglotConjugationTable from "./polyglot/PolyglotConjugationTable";
import ConjugationAppControls from "./ConjugationAppControls";
import ConjugationModeDock from "./ConjugationModeDock";

export default function ConjugationTrainer({ targetLang = "fr" }) {
  const [selectedLang, setSelectedLang] = useState(targetLang);
  const [verbs, setVerbs] = useState([]);
  const [persons, setPersons] = useState([]);
  const [patterns, setPatterns] = useState(null);
  const [selectedTenseId, setSelectedTenseId] = useState("present");
  const [selectedVerbId, setSelectedVerbId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("regular-er");
  const [activeMode, setActiveMode] = useState("pattern");
  const [showPolyglotOnly, setShowPolyglotOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  let alive = true;

  async function loadData() {
    setLoading(true);

    try {
      const [verbsRes, personsRes, patternsRes] = await Promise.all([
        fetch(`/data/conjugation/${selectedLang}/regular-verbs.json`, {
          cache: "no-store",
        }),
        fetch(`/data/conjugation/${selectedLang}/persons.json`, {
          cache: "no-store",
        }),
        fetch(`/data/conjugation/${selectedLang}/regular-patterns.json`, {
          cache: "no-store",
        }),
      ]);

      if (!verbsRes.ok || !personsRes.ok || !patternsRes.ok) {
        throw new Error(`Could not load regular conjugation data for ${selectedLang}`);
      }

      const verbsData = await verbsRes.json();
      const personsData = await personsRes.json();
      const patternsData = await patternsRes.json();

      if (!alive) return;

      const nextVerbs = Array.isArray(verbsData) ? verbsData : [];
      const nextPersons = Array.isArray(personsData?.persons)
        ? personsData.persons
        : [];
      const nextPatterns = patternsData || { tenses: {} };
const nextTenses = nextPatterns.tenses || {};

const firstTenseId = Object.keys(nextTenses)[0] || "";
const firstGroupId = firstTenseId
  ? Object.keys(nextTenses[firstTenseId]?.groups || {})[0] || ""
  : "";

      const firstVerb =
        nextVerbs.find((verb) => verb.group === firstGroupId) ||
        nextVerbs[0] ||
        null;

      setVerbs(nextVerbs);
      setPersons(nextPersons);
      setPatterns(nextPatterns);

      setSelectedTenseId(firstTenseId);
      setSelectedGroupId(firstGroupId);
      setSelectedVerbId(firstVerb?.id || "");

      setActiveMode("pattern");
      setShowPolyglotOnly(false);
    } catch (error) {
      console.error(error);

      if (!alive) return;

      setVerbs([]);
      setPersons([]);
      setPatterns({});
      setSelectedTenseId("");
      setSelectedGroupId("");
      setSelectedVerbId("");
    } finally {
      if (alive) {
        setLoading(false);
      }
    }
  }

  loadData();

  return () => {
    alive = false;
  };
}, [selectedLang]);

  useEffect(() => {
    const firstVerbInGroup = verbs.find(
      (verb) =>
        verb.group === selectedGroupId &&
        (!showPolyglotOnly || Boolean(verb.polyglotId))
    );

    setSelectedVerbId(firstVerbInGroup?.id || "");
  }, [selectedGroupId, verbs, showPolyglotOnly]);

  const availableTenses = useMemo(() => {
    if (!patterns?.tenses) return [];

    return Object.entries(patterns.tenses).map(([id, tense]) => ({
      id,
      label: tense.label?.en || id,
    }));
  }, [patterns]);

  const selectedTense = useMemo(() => {
    if (!patterns || !selectedTenseId) return null;

    return patterns.tenses?.[selectedTenseId] || null;
  }, [patterns, selectedTenseId]);

  const availableGroups = useMemo(() => {
    if (!selectedTense?.groups) return [];

    return Object.entries(selectedTense.groups).map(([id, group]) => ({
      id,
      label: group.label?.en || id,
    }));
  }, [selectedTense]);

  const filteredVerbs = useMemo(() => {
    return verbs.filter(
      (verb) =>
        verb.group === selectedGroupId &&
        (!showPolyglotOnly || Boolean(verb.polyglotId))
    );
  }, [verbs, selectedGroupId, showPolyglotOnly]);

  const selectedVerb = useMemo(() => {
    return (
      filteredVerbs.find((verb) => verb.id === selectedVerbId) ||
      filteredVerbs[0] ||
      null
    );
  }, [filteredVerbs, selectedVerbId]);

  const selectedPattern = useMemo(() => {
    if (!selectedTense || !selectedGroupId) return null;

    return selectedTense.groups?.[selectedGroupId] || null;
  }, [selectedTense, selectedGroupId]);

  const modeTabs = [
    {
      id: "pattern",
      label: "Pattern",
      description: "See the full conjugation table.",
    },
    {
      id: "choose-ending",
      label: "Choose ending",
      description: "Click the correct ending.",
    },
    {
      id: "type-ending",
      label: "Type ending",
      description: "Write only the ending.",
    },
    {
      id: "type-full-form",
      label: "Type full form",
      description: "Write the complete form.",
    },
    {
      id: "polyglot",
      label: "Polyglot",
      description: "Compare the verb in 4 Romance languages.",
    },
  ];

  if (loading) {
  return (
    <main className="mx-auto max-w-6xl px-2 py-2 pb-20 md:px-4 md:py-6">
      <ConjugationAppControls
        selectedLang={selectedLang}
        activeType="regular"
        onLanguageChange={(languageId) => {
          setSelectedLang(languageId);
          setActiveMode("pattern");
          setShowPolyglotOnly(false);
        }}
      />

      <section className="mt-4 rounded-3xl bg-white/90 p-6 shadow-sm">
        <p className="font-bold text-slate-600">
          Loading conjugation trainer...
        </p>
      </section>
    </main>
  );
}

if (!selectedPattern) {
  return (
    <main className="mx-auto max-w-6xl px-2 py-2 pb-20 md:px-4 md:py-6">
      <ConjugationAppControls
        selectedLang={selectedLang}
        activeType="regular"
        onLanguageChange={(languageId) => {
          setSelectedLang(languageId);
          setActiveMode("pattern");
          setShowPolyglotOnly(false);
        }}
      />

      <section className="mt-4 rounded-3xl border border-red-100 bg-red-50 p-6 text-red-700">
        Could not load the conjugation data.
      </section>
    </main>
  );
}

return (
  <main className="mx-auto max-w-6xl px-2 py-2 pb-20 md:px-4 md:py-6">
    <ConjugationAppControls
      selectedLang={selectedLang}
      activeType="regular"
      onLanguageChange={(languageId) => {
        setSelectedLang(languageId);
        setActiveMode("pattern");
        setShowPolyglotOnly(false);
      }}
    />

    <section className="mb-2 rounded-2xl border border-sky-100 bg-white/95 p-2 shadow-sm">
  <div className="grid grid-cols-2 gap-2">
    <label className="rounded-xl bg-sky-50/70 p-2">
      <span className="block text-[10px] font-black uppercase tracking-wide text-slate-500">
        Tense
      </span>

      <select
        value={selectedTenseId}
        onChange={(event) => {
          setSelectedTenseId(event.target.value);
          setActiveMode("pattern");
        }}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-black text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 sm:text-sm"
      >
        {availableTenses.map((tense) => (
          <option key={tense.id} value={tense.id}>
            {tense.label}
          </option>
        ))}
      </select>
    </label>

    <label className="rounded-xl bg-sky-50/70 p-2">
      <span className="block text-[10px] font-black uppercase tracking-wide text-slate-500">
        Group
      </span>

      <select
        value={selectedGroupId}
        onChange={(event) => {
          setSelectedGroupId(event.target.value);
          setActiveMode("pattern");
        }}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-black text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 sm:text-sm"
      >
        {availableGroups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.label}
          </option>
        ))}
      </select>
    </label>

    <label className="rounded-xl bg-emerald-50/70 p-2">
      <span className="block text-[10px] font-black uppercase tracking-wide text-slate-500">
        Verb
      </span>

      <select
        value={selectedVerb?.id || ""}
        onChange={(event) => setSelectedVerbId(event.target.value)}
        disabled={filteredVerbs.length === 0}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-black text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-400 sm:text-sm"
      >
        {filteredVerbs.map((verb) => (
          <option key={verb.id} value={verb.id}>
            {verb.infinitive}
          </option>
        ))}
      </select>

      <span className="mt-2 flex items-center gap-2 text-[11px] font-black text-slate-600">
        <input
          type="checkbox"
          checked={showPolyglotOnly}
          onChange={(event) => setShowPolyglotOnly(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        Polyglot
      </span>
    </label>

    <div className="rounded-xl bg-emerald-50/70 p-2">
      <span className="block text-[10px] font-black uppercase tracking-wide text-slate-500">
        Meaning
      </span>

      <p className="mt-1 line-clamp-1 text-sm font-black text-slate-900 sm:text-base">
        {selectedVerb?.meaning?.en || "No verb selected"}
      </p>

      {selectedVerb?.example?.[selectedLang] && (
        <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-snug text-slate-600 sm:text-xs">
          {selectedVerb.example[selectedLang]}
        </p>
      )}
    </div>
  </div>
</section>

    <ConjugationModeDock
  modeTabs={modeTabs}
  activeMode={activeMode}
  onModeChange={setActiveMode}
/>

    {filteredVerbs.length === 0 && (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
        <p className="text-lg font-black text-slate-800">
          No Polyglot verbs in this group yet
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Turn off the filter or choose another verb group.
        </p>
      </div>
    )}

      {filteredVerbs.length > 0 && activeMode === "pattern" && (
        <ConjugationPatternTable
  verb={selectedVerb}
  pattern={selectedPattern}
  persons={persons}
  tense={selectedTense}
  tenseId={selectedTenseId}
  targetLang={selectedLang}
/>
      )}

      {filteredVerbs.length > 0 && activeMode === "choose-ending" && (
        <ConjugationBuildForm
          verb={selectedVerb}
          pattern={selectedPattern}
          persons={persons}
          tense={selectedTense}
        />
      )}

      {filteredVerbs.length > 0 && activeMode === "type-ending" && (
        <ConjugationEndingExercise
          verb={selectedVerb}
          pattern={selectedPattern}
          persons={persons}
          tense={selectedTense}
        />
      )}

      {filteredVerbs.length > 0 && activeMode === "type-full-form" && (
        <ConjugationFullFormExercise
          verb={selectedVerb}
          pattern={selectedPattern}
          persons={persons}
          tense={selectedTense}
        />
      )}

      {filteredVerbs.length > 0 && activeMode === "polyglot" && (
        <PolyglotConjugationTable
          polyglotId={selectedVerb.polyglotId}
          tenseId={selectedTenseId}
        />
      )}
    </main>
  );
}