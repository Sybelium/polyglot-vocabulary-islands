"use client";

import { useEffect, useMemo, useState } from "react";
import ConjugationPatternTable from "./ConjugationPatternTable";
import ConjugationEndingExercise from "./ConjugationEndingExercise";
import ConjugationFullFormExercise from "./ConjugationFullFormExercise";
import ConjugationBuildForm from "./ConjugationBuildForm";
import PolyglotConjugationTable from "./polyglot/PolyglotConjugationTable";

export default function ConjugationTrainer({ targetLang = "fr" }) {
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
      try {
        setLoading(true);

        const [verbsRes, personsRes, patternsRes] = await Promise.all([
          fetch(`/data/${targetLang}/grammar/conjugation/regular-verbs.json`),
          fetch(`/data/${targetLang}/grammar/conjugation/persons.json`),
          fetch(`/data/${targetLang}/grammar/conjugation/regular-patterns.json`),
        ]);

        if (!verbsRes.ok) {
          throw new Error("Could not load conjugation/regular-verbs.json");
        }

        if (!personsRes.ok) {
          throw new Error("Could not load conjugation/persons.json");
        }

        if (!patternsRes.ok) {
          throw new Error("Could not load conjugation/regular-patterns.json");
        }

        const verbsData = await verbsRes.json();
        const personsData = await personsRes.json();
        const patternsData = await patternsRes.json();

        if (alive) {
          setVerbs(Array.isArray(verbsData) ? verbsData : verbsData.verbs || []);
          setPersons(personsData.persons || []);
          setPatterns(patternsData);

          const firstTenseId =
            Object.keys(patternsData.tenses || {})[0] || "present";

          const firstGroupId =
            Object.keys(patternsData.tenses?.[firstTenseId]?.groups || {})[0] ||
            "regular-er";

          const firstVerbInGroup =
            (Array.isArray(verbsData) ? verbsData : verbsData.verbs || []).find(
              (verb) => verb.group === firstGroupId
            ) || (Array.isArray(verbsData) ? verbsData : verbsData.verbs || [])[0];

          setSelectedTenseId(firstTenseId);
          setSelectedGroupId(firstGroupId);
          setSelectedVerbId(firstVerbInGroup?.id || "");
        }
      } catch (error) {
        console.error(error);

        if (alive) {
          setVerbs([]);
          setPatterns(null);
        }
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
  }, [targetLang]);

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
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-slate-600">Loading conjugation trainer...</p>
      </main>
    );
  }

  if (!selectedPattern) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-red-700">
          Could not load the conjugation data.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-8 rounded-3xl bg-gradient-to-br from-sky-50 to-emerald-50 p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-sky-700">
          Regular Conjugation Trainer
        </p>

        <h1 className="mt-2 text-4xl font-black text-slate-900">
          Regular verbs
        </h1>

        <p className="mt-3 max-w-2xl text-slate-700">
          Learn conjugation patterns, practice forms, and compare Romance
          languages.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_1fr_2fr]">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <label className="block text-xs font-black uppercase tracking-wide text-slate-500">
              Tense
            </label>

            <select
              value={selectedTenseId}
              onChange={(event) => {
                setSelectedTenseId(event.target.value);
                setActiveMode("pattern");
              }}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-800 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            >
              {availableTenses.map((tense) => (
                <option key={tense.id} value={tense.id}>
                  {tense.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <label className="block text-xs font-black uppercase tracking-wide text-slate-500">
              Verb group
            </label>

            <select
              value={selectedGroupId}
              onChange={(event) => {
                setSelectedGroupId(event.target.value);
                setActiveMode("pattern");
              }}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-800 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            >
              {availableGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <label className="block text-xs font-black uppercase tracking-wide text-slate-500">
              Choose a verb
            </label>

            <select
              value={selectedVerb?.id || ""}
              onChange={(event) => setSelectedVerbId(event.target.value)}
              disabled={filteredVerbs.length === 0}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-800 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-400"
            >
              {filteredVerbs.map((verb) => (
                <option key={verb.id} value={verb.id}>
                  {verb.infinitive}
                </option>
              ))}
            </select>

            <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-600">
              <input
                type="checkbox"
                checked={showPolyglotOnly}
                onChange={(event) => setShowPolyglotOnly(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Polyglot verbs only
            </label>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              Meaning
            </p>

            <p className="mt-2 text-xl font-black text-slate-900">
              {selectedVerb?.meaning?.en || "No verb selected"}
            </p>

            {selectedVerb?.example?.[targetLang] && (
              <p className="mt-2 text-sm font-semibold text-slate-600">
                {selectedVerb.example[targetLang]}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {modeTabs.map((tab) => {
            const isActive = activeMode === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMode(tab.id)}
                className={`rounded-2xl px-4 py-3 text-left transition ${
                  isActive
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="block text-sm font-black">{tab.label}</span>
                <span
                  className={`mt-1 block text-xs font-semibold ${
                    isActive ? "text-sky-100" : "text-slate-500"
                  }`}
                >
                  {tab.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

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