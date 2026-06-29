"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import IrregularPatternTable from "./IrregularPatternTable";
import IrregularFormExercise from "./IrregularFormExercise";
import IrregularOtherForms from "./IrregularOtherForms";
import PolyglotConjugationTable from "../polyglot/PolyglotConjugationTable";
import ConjugationAppControls from "../ConjugationAppControls";
import ConjugationModeDock from "../ConjugationModeDock";

const languageNames = {
  fr: "French",
  es: "Spanish",
  it: "Italian",
  pt: "Portuguese",
};

export default function IrregularConjugationTrainer({ targetLang = "fr" }) {
  const [selectedLang, setSelectedLang] = useState(targetLang);
  const [persons, setPersons] = useState([]);
  const [families, setFamilies] = useState([]);
  const [verbs, setVerbs] = useState([]);
  const [tenses, setTenses] = useState([]);
  const [selectedTenseId, setSelectedTenseId] = useState("");
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [selectedVerbId, setSelectedVerbId] = useState("");
  const [activeMode, setActiveMode] = useState("pattern");
  const [showPolyglotOnly, setShowPolyglotOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const practiceAreaRef = useRef(null);

  useEffect(() => {
    let alive = true;

    async function loadData() {
      try {
        setLoading(true);
        setLoadError(false);

        const [personsRes, familiesRes, verbsRes, tensesRes] = await Promise.all([
          fetch(`/data/conjugation/${selectedLang}/irregular/persons.json`),
          fetch(`/data/conjugation/${selectedLang}/irregular/families.json`),
          fetch(`/data/conjugation/${selectedLang}/irregular/verbs.json`),
          fetch(`/data/conjugation/${selectedLang}/irregular/tenses.json`),
        ]);

        if (!personsRes.ok || !familiesRes.ok || !verbsRes.ok || !tensesRes.ok) {
          throw new Error("Could not load irregular conjugation data.");
        }

        const personsData = await personsRes.json();
        const familiesData = await familiesRes.json();
        const verbsData = await verbsRes.json();
        const tensesData = await tensesRes.json();

        if (!alive) return;

        setPersons(personsData.persons || []);
        setFamilies(familiesData || []);
        setVerbs(verbsData || []);
        setTenses(tensesData.tenses || []);

        const firstTense = tensesData.tenses?.[0];
        const firstFamily = familiesData?.[0];
        const firstVerb =
          verbsData.find((verb) => verb.family === firstFamily?.id) ||
          verbsData[0];

        setSelectedTenseId(firstTense?.id || "");
        setSelectedFamilyId(firstFamily?.id || "");
        setSelectedVerbId(firstVerb?.id || "");
      } catch (error) {
        if (alive) {
          console.error(error);
          setLoadError(true);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadData();

    return () => {
      alive = false;
    };
  }, [selectedLang]);

  const selectedTense = useMemo(() => {
    return tenses.find((tense) => tense.id === selectedTenseId) || tenses[0];
  }, [tenses, selectedTenseId]);

  const selectedFamily = useMemo(() => {
    return families.find((family) => family.id === selectedFamilyId) || families[0];
  }, [families, selectedFamilyId]);

  const filteredVerbs = useMemo(() => {
    return verbs.filter(
      (verb) =>
        verb.family === selectedFamilyId &&
        (!showPolyglotOnly || Boolean(verb.polyglotId))
    );
  }, [verbs, selectedFamilyId, showPolyglotOnly]);

  const selectedVerb = useMemo(() => {
    return (
      filteredVerbs.find((verb) => verb.id === selectedVerbId) ||
      filteredVerbs[0] ||
      null
    );
  }, [filteredVerbs, selectedVerbId]);

  const firstSimpleTense = useMemo(() => {
    return tenses.find((tense) => tense.patternType === "simple") || tenses[0];
  }, [tenses]);

  const similarVerbs = useMemo(() => {
    if (!selectedVerb?.family) return [];
    return verbs.filter(
      (verb) =>
        verb.family === selectedVerb.family &&
        (!showPolyglotOnly || Boolean(verb.polyglotId))
    );
  }, [verbs, selectedVerb, showPolyglotOnly]);

  const scrollToPracticeArea = () => {
    window.setTimeout(() => {
      practiceAreaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const showPatternMode = () => {
    if (selectedTense?.patternType === "otherForms" && firstSimpleTense?.id) {
      setSelectedTenseId(firstSimpleTense.id);
    }

    setActiveMode("pattern");
  };

  const handleFamilyChange = (familyId) => {
    setSelectedFamilyId(familyId);
    showPatternMode();
    scrollToPracticeArea();
  };

  const handleVerbChange = (verbId) => {
    setSelectedVerbId(verbId);
    showPatternMode();
    scrollToPracticeArea();
  };

  const handleSimilarVerbClick = (verb) => {
    setSelectedFamilyId(verb.family);
    setSelectedVerbId(verb.id);
    showPatternMode();
    scrollToPracticeArea();
  };

  useEffect(() => {
    const selectedVerbStillBelongsToFamily = verbs.some(
      (verb) =>
        verb.id === selectedVerbId &&
        verb.family === selectedFamilyId &&
        (!showPolyglotOnly || Boolean(verb.polyglotId))
    );

    if (selectedVerbStillBelongsToFamily) return;

    const firstVerbInFamily = verbs.find(
      (verb) =>
        verb.family === selectedFamilyId &&
        (!showPolyglotOnly || Boolean(verb.polyglotId))
    );
    setSelectedVerbId(firstVerbInFamily?.id || "");
  }, [selectedFamilyId, selectedVerbId, verbs, showPolyglotOnly]);

  useEffect(() => {
    if (selectedTense?.patternType === "otherForms") {
      setActiveMode("other-forms");
    } else if (activeMode === "other-forms") {
      setActiveMode("pattern");
    }
  }, [selectedTense, activeMode]);

  const isOtherForms = selectedTense?.patternType === "otherForms";

  const modeTabs = isOtherForms
    ? [
        {
          id: "other-forms",
          label: "Other forms",
          description: "Infinitive, participles, gerund and imperative.",
        },
      ]
    : [
        {
          id: "pattern",
          label: "Pattern",
          description: "See the full conjugation table.",
        },
        {
          id: "choose-form",
          label: "Choose form",
          description: "Click the correct form.",
        },
        {
          id: "type-form",
          label: "Type form",
          description: "Write only the verb form.",
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
    <main className="mx-auto max-w-6xl px-3 py-4 pb-24 md:px-4 md:py-8">
      <ConjugationAppControls
        selectedLang={selectedLang}
        activeType="irregular"
        onLanguageChange={(languageId) => {
          setSelectedLang(languageId);
          setActiveMode("pattern");
          setShowPolyglotOnly(false);
        }}
      />

      <section className="mt-4 rounded-3xl bg-white/90 p-6 shadow-sm">
        <p className="font-bold text-slate-600">
          Loading irregular conjugation trainer...
        </p>
      </section>
    </main>
  );
}

if (loadError || !selectedTense || verbs.length === 0) {
  return (
    <main className="mx-auto max-w-6xl px-3 py-4 pb-24 md:px-4 md:py-8">
      <ConjugationAppControls
        selectedLang={selectedLang}
        activeType="irregular"
        onLanguageChange={(languageId) => {
          setSelectedLang(languageId);
          setActiveMode("pattern");
          setShowPolyglotOnly(false);
        }}
      />

      <section className="mt-4 rounded-3xl border border-red-100 bg-red-50 p-6 font-bold text-red-700">
        Could not load the irregular conjugation data.
      </section>
    </main>
  );
}

return (
  <main className="mx-auto max-w-6xl px-3 py-4 pb-24 md:px-4 md:py-8">
    <ConjugationAppControls
      selectedLang={selectedLang}
      activeType="irregular"
      onLanguageChange={(languageId) => {
        setSelectedLang(languageId);
        setActiveMode("pattern");
        setShowPolyglotOnly(false);
      }}
    />

    <section className="mb-3 rounded-2xl bg-gradient-to-br from-sky-50 to-emerald-50 p-2 shadow-sm md:p-3">
      <div className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_1.4fr]">
        <label className="rounded-xl bg-white p-2 shadow-sm md:p-3">
          <span className="block text-[10px] font-black uppercase tracking-wide text-slate-500">
            Tense
          </span>

          <select
            value={selectedTenseId}
            onChange={(event) => {
              setSelectedTenseId(event.target.value);
              setActiveMode("pattern");
            }}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-bold text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          >
            {tenses.map((tense) => (
              <option key={tense.id} value={tense.id}>
                {tense.label?.en || tense.id}
              </option>
            ))}
          </select>
        </label>

        <label className="rounded-xl bg-white p-2 shadow-sm md:p-3">
          <span className="block text-[10px] font-black uppercase tracking-wide text-slate-500">
            Verb family
          </span>

          <select
            value={selectedFamilyId}
            onChange={(event) => handleFamilyChange(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-bold text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          >
            {families.map((family) => (
              <option key={family.id} value={family.id}>
                {family.label?.en || family.id}
              </option>
            ))}
          </select>
        </label>

        <label className="rounded-xl bg-white p-2 shadow-sm md:p-3">
          <span className="block text-[10px] font-black uppercase tracking-wide text-slate-500">
            Verb
          </span>

          <select
            value={selectedVerb?.id || ""}
            onChange={(event) => handleVerbChange(event.target.value)}
            disabled={filteredVerbs.length === 0}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-bold text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-400 md:text-base"
          >
            {filteredVerbs.map((verb) => (
              <option key={verb.id} value={verb.id}>
                {verb.infinitive}
              </option>
            ))}
          </select>

          <span className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-600">
            <input
              type="checkbox"
              checked={showPolyglotOnly}
              onChange={(event) => setShowPolyglotOnly(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Polyglot only
          </span>
        </label>

        <div className="rounded-xl bg-white p-2 shadow-sm md:p-3">
          <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">
            Meaning
          </span>

          <p className="mt-2 text-lg font-black text-slate-900 md:text-xl">
            {selectedVerb?.meaning?.en || "No verb selected"}
          </p>

          {selectedVerb?.example?.[selectedLang] && (
            <p className="mt-2 text-sm font-semibold text-slate-600">
              {selectedVerb.example[selectedLang]}
            </p>
          )}
        </div>
      </div>
    </section>

    <div ref={practiceAreaRef} className="scroll-mt-24">
        {selectedFamily && (
        <section className="mt-5 rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-wide text-indigo-600">
                About this family
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900">
                {selectedFamily.label?.en || selectedFamily.id}
              </h2>

              {selectedFamily.patternHint?.en && (
                <p className="mt-3 text-base font-semibold leading-7 text-slate-700">
                  {selectedFamily.patternHint.en}
                </p>
              )}
            </div>

            {similarVerbs.length > 0 && (
              <div className="rounded-3xl bg-indigo-50 p-4 lg:min-w-80">
                <p className="text-xs font-black uppercase tracking-wide text-indigo-700">
                  Similar verbs
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {similarVerbs.map((verb) => {
                    const isCurrentVerb = verb.id === selectedVerb?.id;

                    return (
                      <button
                        key={verb.id}
                        type="button"
                        onClick={() => handleSimilarVerbClick(verb)}
                        className={`rounded-full px-3 py-2 text-sm font-black shadow-sm transition ${
                          isCurrentVerb
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-indigo-700 hover:bg-indigo-100"
                        }`}
                      >
                        {verb.infinitive}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <ConjugationModeDock
  modeTabs={modeTabs}
  activeMode={activeMode}
  onModeChange={(modeId) => {
    setActiveMode(modeId);
    practiceAreaRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }}
/>

      {filteredVerbs.length === 0 && (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-black text-slate-800">
            No Polyglot verbs in this family yet
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Turn off the filter or choose another verb family.
          </p>
        </div>
      )}

      {filteredVerbs.length > 0 && isOtherForms && (
        <IrregularOtherForms verb={selectedVerb} targetLang={selectedLang} />
      )}

      {filteredVerbs.length > 0 && !isOtherForms && activeMode === "pattern" && (
        <IrregularPatternTable
  verb={selectedVerb}
  tense={selectedTense}
  persons={persons}
  targetLang={selectedLang}
/>
      )}

      {filteredVerbs.length > 0 && !isOtherForms && activeMode === "choose-form" && (
        <IrregularFormExercise
          verb={selectedVerb}
          tense={selectedTense}
          persons={persons}
          mode="choose"
        />
      )}

      {filteredVerbs.length > 0 && !isOtherForms && activeMode === "type-form" && (
        <IrregularFormExercise
          verb={selectedVerb}
          tense={selectedTense}
          persons={persons}
          mode="type"
        />
      )}

      {filteredVerbs.length > 0 && !isOtherForms && activeMode === "type-full-form" && (
        <IrregularFormExercise
          verb={selectedVerb}
          tense={selectedTense}
          persons={persons}
          mode="full"
        />
      )}

      {filteredVerbs.length > 0 && !isOtherForms && activeMode === "polyglot" && (
        <PolyglotConjugationTable
          polyglotId={selectedVerb.polyglotId}
          tenseId={selectedTenseId}
        />
      )}
      </div>
    </main>
  );
}
