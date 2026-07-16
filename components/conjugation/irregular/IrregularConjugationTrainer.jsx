"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import IrregularPatternTable from "./IrregularPatternTable";
import IrregularFormExercise from "./IrregularFormExercise";
import IrregularOtherForms from "./IrregularOtherForms";
import PolyglotConjugationTable from "../polyglot/PolyglotConjugationTable";
import ConjugationAppControls, {
  getSafeLatinConjugationLanguageId,
  readStoredLatinConjugationLanguage,
  saveLatinConjugationLanguage,
} from "../ConjugationAppControls";
import ConjugationModeDock from "../ConjugationModeDock";

const ALL_PATTERNS_ID = "all-patterns";

const languageNames = {
  fr: "French",
  es: "Spanish",
  it: "Italian",
  pt: "Portuguese",
};

function getLocalizedText(value, preferredLang = "en") {
  if (!value) return "";
  if (typeof value === "string") return value;

  return (
    value[preferredLang] ||
    value.en ||
    value.fr ||
    value.es ||
    value.it ||
    value.pt ||
    Object.values(value).find(Boolean) ||
    ""
  );
}

function getLearningGroupFamilyIds(group, fallbackFamilyIds = []) {
  if (!group) return fallbackFamilyIds;

  if (Array.isArray(group.familyIds)) return group.familyIds;
  if (Array.isArray(group.families)) return group.families;

  return fallbackFamilyIds;
}

function familyHasVisibleVerbs(verbs, familyId, showPolyglotOnly) {
  return verbs.some(
    (verb) =>
      verb.family === familyId &&
      (!showPolyglotOnly || Boolean(verb.polyglotId))
  );
}

function getVerbSortLabel(verb) {
  return String(verb?.infinitive || verb?.id || "").toLocaleLowerCase();
}

function makeUniqueVerbs(verbs) {
  const seen = new Set();
  const result = [];

  for (const verb of verbs) {
    if (!verb?.id || seen.has(verb.id)) continue;
    seen.add(verb.id);
    result.push(verb);
  }

  return result;
}

export default function IrregularConjugationTrainer({
  targetLang = "fr",
  preferStoredLang = true,
}) {
  const [selectedLang, setSelectedLang] = useState(() =>
    getSafeLatinConjugationLanguageId(targetLang)
  );
  const [persons, setPersons] = useState([]);
  const [families, setFamilies] = useState([]);
  const [verbs, setVerbs] = useState([]);
  const [tenses, setTenses] = useState([]);
  const [learningGroups, setLearningGroups] = useState([]);
  const [selectedTenseId, setSelectedTenseId] = useState("");
  const [selectedLearningGroupId, setSelectedLearningGroupId] = useState("all");
  const [selectedFamilyId, setSelectedFamilyId] = useState(ALL_PATTERNS_ID);
  const [selectedVerbId, setSelectedVerbId] = useState("");
  const [activeMode, setActiveMode] = useState("pattern");
  const [showPolyglotOnly, setShowPolyglotOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const practiceAreaRef = useRef(null);

  useEffect(() => {
    const nextLanguageId = getSafeLatinConjugationLanguageId(targetLang);

    setSelectedLang((currentLanguageId) =>
      currentLanguageId === nextLanguageId ? currentLanguageId : nextLanguageId
    );
  }, [targetLang]);

  useEffect(() => {
    if (!preferStoredLang) return;

    const storedLanguageId = readStoredLatinConjugationLanguage();
    if (!storedLanguageId) return;

    setSelectedLang((currentLanguageId) =>
      currentLanguageId === storedLanguageId
        ? currentLanguageId
        : storedLanguageId
    );
  }, [preferStoredLang]);

  useEffect(() => {
    saveLatinConjugationLanguage(selectedLang);
  }, [selectedLang]);

  function handleLanguageChange(languageId) {
    const nextLanguageId = getSafeLatinConjugationLanguageId(languageId);

    saveLatinConjugationLanguage(nextLanguageId);
    setSelectedLang(nextLanguageId);
    setActiveMode("pattern");
    setSelectedLearningGroupId("all");
    setSelectedFamilyId(ALL_PATTERNS_ID);
    setShowPolyglotOnly(false);
  }

  useEffect(() => {
    let alive = true;

    async function loadData() {
      try {
        setLoading(true);
        setLoadError(false);

        const [
          personsRes,
          familiesRes,
          verbsRes,
          tensesRes,
          learningGroupsRes,
        ] = await Promise.all([
          fetch(`/data/conjugation/${selectedLang}/irregular/persons.json`),
          fetch(`/data/conjugation/${selectedLang}/irregular/families.json`),
          fetch(`/data/conjugation/${selectedLang}/irregular/verbs.json`),
          fetch(`/data/conjugation/${selectedLang}/irregular/tenses.json`),
          fetch(`/data/conjugation/${selectedLang}/irregular/learning-groups.json`),
        ]);

        if (!personsRes.ok || !familiesRes.ok || !verbsRes.ok || !tensesRes.ok) {
          throw new Error("Could not load irregular conjugation data.");
        }

        const personsData = await personsRes.json();
        const familiesData = await familiesRes.json();
        const verbsData = await verbsRes.json();
        const tensesData = await tensesRes.json();
        const learningGroupsData = learningGroupsRes.ok
          ? await learningGroupsRes.json()
          : [];

        if (!alive) return;

        const nextFamilies = Array.isArray(familiesData) ? familiesData : [];
        const nextVerbs = Array.isArray(verbsData) ? verbsData : [];

        setPersons(personsData.persons || []);
        setFamilies(nextFamilies);
        setVerbs(nextVerbs);
        setTenses(tensesData.tenses || []);
        setLearningGroups(Array.isArray(learningGroupsData) ? learningGroupsData : []);

        const firstTense = tensesData.tenses?.[0];
        const firstVerb = nextVerbs[0];

        setSelectedTenseId(firstTense?.id || "");
        setSelectedLearningGroupId("all");
        setSelectedFamilyId(ALL_PATTERNS_ID);
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

  const learningGroupOptions = useMemo(() => {
    const allFamilyIds = families.map((family) => family.id);

    return [
      {
        id: "all",
        label: {
          en: "All irregular verbs",
          fr: "Tous les verbes irréguliers",
        },
        level: "All",
        summary: {
          en: "Show all technical families. Useful for review or advanced exploration.",
          fr: "Affiche toutes les familles techniques. Utile pour réviser ou explorer en détail.",
        },
        familyIds: allFamilyIds,
      },
      ...learningGroups,
    ];
  }, [families, learningGroups]);

  const selectedLearningGroup = useMemo(() => {
    return (
      learningGroupOptions.find((group) => group.id === selectedLearningGroupId) ||
      learningGroupOptions[0] ||
      null
    );
  }, [learningGroupOptions, selectedLearningGroupId]);

  const selectedLearningGroupFamilyIds = useMemo(() => {
    return getLearningGroupFamilyIds(
      selectedLearningGroup,
      families.map((family) => family.id)
    );
  }, [selectedLearningGroup, families]);

  const visibleFamilies = useMemo(() => {
    const allowedFamilyIds = new Set(selectedLearningGroupFamilyIds);

    return families.filter(
      (family) =>
        allowedFamilyIds.has(family.id) &&
        familyHasVisibleVerbs(verbs, family.id, showPolyglotOnly)
    );
  }, [families, selectedLearningGroupFamilyIds, verbs, showPolyglotOnly]);

  const isAllPatternsSelected = selectedFamilyId === ALL_PATTERNS_ID;

  const selectedGroupFamilies = useMemo(() => {
    const allowedFamilyIds = new Set(selectedLearningGroupFamilyIds);
    return families.filter((family) => allowedFamilyIds.has(family.id));
  }, [families, selectedLearningGroupFamilyIds]);

  const selectedFamily = useMemo(() => {
    if (isAllPatternsSelected) return null;

    return (
      visibleFamilies.find((family) => family.id === selectedFamilyId) ||
      families.find((family) => family.id === selectedFamilyId) ||
      null
    );
  }, [families, visibleFamilies, selectedFamilyId, isAllPatternsSelected]);

  const focusVerbs = useMemo(() => {
    const allowedFamilyIds = new Set(selectedLearningGroupFamilyIds);

    return verbs
      .filter(
        (verb) =>
          allowedFamilyIds.has(verb.family) &&
          (!showPolyglotOnly || Boolean(verb.polyglotId))
      )
      .sort((a, b) => getVerbSortLabel(a).localeCompare(getVerbSortLabel(b)));
  }, [verbs, selectedLearningGroupFamilyIds, showPolyglotOnly]);

  const filteredVerbs = useMemo(() => {
    if (isAllPatternsSelected) return focusVerbs;

    return verbs.filter(
      (verb) =>
        verb.family === selectedFamilyId &&
        (!showPolyglotOnly || Boolean(verb.polyglotId))
    );
  }, [verbs, selectedFamilyId, showPolyglotOnly, isAllPatternsSelected, focusVerbs]);

  const exerciseVerbs = focusVerbs;

  const exerciseScopeLabel =
    getLocalizedText(selectedLearningGroup?.label, "en") ||
    selectedLearningGroup?.id ||
    "Selected learning focus";

  const selectedVerb = useMemo(() => {
    return (
      filteredVerbs.find((verb) => verb.id === selectedVerbId) ||
      filteredVerbs[0] ||
      null
    );
  }, [filteredVerbs, selectedVerbId]);

  const selectedVerbFamily = useMemo(() => {
    if (!selectedVerb?.family) return null;
    return families.find((family) => family.id === selectedVerb.family) || null;
  }, [families, selectedVerb]);

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

  const featuredVerbs = useMemo(() => {
    const byId = new Map(verbs.map((verb) => [verb.id, verb]));
    const explicitVerbIds = Array.isArray(selectedLearningGroup?.featuredVerbIds)
      ? selectedLearningGroup.featuredVerbIds
      : [];

    const explicitVerbs = explicitVerbIds
      .map((verbId) => byId.get(verbId))
      .filter(
        (verb) =>
          verb &&
          (!showPolyglotOnly || Boolean(verb.polyglotId)) &&
          selectedLearningGroupFamilyIds.includes(verb.family)
      );

    return makeUniqueVerbs([...explicitVerbs, ...focusVerbs]).slice(0, 14);
  }, [verbs, selectedLearningGroup, selectedLearningGroupFamilyIds, focusVerbs, showPolyglotOnly]);

  const verbChipList = isAllPatternsSelected
    ? featuredVerbs
    : similarVerbs;

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

  const getFirstVisibleVerbForFamilyIds = (familyIds) => {
    const allowedFamilyIds = new Set(familyIds);
    return verbs.find(
      (verb) =>
        allowedFamilyIds.has(verb.family) &&
        (!showPolyglotOnly || Boolean(verb.polyglotId))
    );
  };

  const handleLearningGroupChange = (groupId) => {
    const nextGroup =
      learningGroupOptions.find((group) => group.id === groupId) ||
      learningGroupOptions[0];
    const nextFamilyIds = getLearningGroupFamilyIds(
      nextGroup,
      families.map((family) => family.id)
    );
    const nextVerb = getFirstVisibleVerbForFamilyIds(nextFamilyIds);

    setSelectedLearningGroupId(nextGroup?.id || "all");
    setSelectedFamilyId(ALL_PATTERNS_ID);
    setSelectedVerbId(nextVerb?.id || "");
    showPatternMode();
    scrollToPracticeArea();
  };

  const handleFamilyChange = (familyId) => {
    if (familyId === ALL_PATTERNS_ID) {
      const nextVerb = getFirstVisibleVerbForFamilyIds(selectedLearningGroupFamilyIds);
      setSelectedFamilyId(ALL_PATTERNS_ID);
      setSelectedVerbId(nextVerb?.id || "");
      showPatternMode();
      scrollToPracticeArea();
      return;
    }

    const nextVerb = verbs.find(
      (verb) =>
        verb.family === familyId &&
        (!showPolyglotOnly || Boolean(verb.polyglotId))
    );

    setSelectedFamilyId(familyId);
    setSelectedVerbId(nextVerb?.id || "");
    showPatternMode();
    scrollToPracticeArea();
  };

  const handleVerbChange = (verbId) => {
    setSelectedVerbId(verbId);
    showPatternMode();
    scrollToPracticeArea();
  };

  const handleVerbChipClick = (verb) => {
    if (!verb?.id) return;

    if (!isAllPatternsSelected) {
      setSelectedFamilyId(verb.family);
    }

    setSelectedVerbId(verb.id);
    showPatternMode();
    scrollToPracticeArea();
  };

  const handleTechnicalFamilyChipClick = (familyId) => {
    handleFamilyChange(familyId);
  };

  useEffect(() => {
    if (selectedFamilyId === ALL_PATTERNS_ID) {
      const selectedVerbStillVisible = filteredVerbs.some(
        (verb) => verb.id === selectedVerbId
      );

      if (selectedVerbStillVisible) return;

      setSelectedVerbId(filteredVerbs[0]?.id || "");
      return;
    }

    const selectedFamilyStillVisible = visibleFamilies.some(
      (family) => family.id === selectedFamilyId
    );

    if (!selectedFamilyStillVisible) {
      setSelectedFamilyId(ALL_PATTERNS_ID);
      setSelectedVerbId(focusVerbs[0]?.id || "");
      return;
    }

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
  }, [
    selectedFamilyId,
    selectedVerbId,
    verbs,
    showPolyglotOnly,
    visibleFamilies,
    filteredVerbs,
    focusVerbs,
  ]);

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
          description: "See the selected verb in the current tense.",
        },
        {
          id: "choose-form",
          label: "Choose form",
          description: "Practice forms from the selected learning focus.",
        },
        {
          id: "type-form",
          label: "Type form",
          description: "Type forms from the selected learning focus.",
        },
        {
          id: "type-full-form",
          label: "Type full form",
          description: "Type full forms from the selected learning focus.",
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
          onLanguageChange={handleLanguageChange}
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
          onLanguageChange={handleLanguageChange}
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
        onLanguageChange={handleLanguageChange}
      />

      <section className="mb-3 rounded-2xl bg-gradient-to-br from-sky-50 to-emerald-50 p-2 shadow-sm md:p-3">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_1.4fr]">
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
              Learning focus
            </span>

            <select
              value={selectedLearningGroupId}
              onChange={(event) => handleLearningGroupChange(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-bold text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              {learningGroupOptions.map((group) => (
                <option key={group.id} value={group.id}>
                  {getLocalizedText(group.label, "en") || group.id}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-xl bg-white p-2 shadow-sm md:p-3">
            <span className="block text-[10px] font-black uppercase tracking-wide text-slate-500">
              Pattern detail
            </span>

            <select
              value={selectedFamilyId}
              onChange={(event) => handleFamilyChange(event.target.value)}
              disabled={visibleFamilies.length === 0}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-bold text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value={ALL_PATTERNS_ID}>All patterns in this focus</option>
              {visibleFamilies.map((family) => (
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
              Current verb
            </span>

            <p className="mt-2 text-lg font-black text-slate-900 md:text-xl">
              {selectedVerb?.infinitive || "No verb selected"}
            </p>

            {selectedVerb?.meaning?.en && (
              <p className="mt-1 text-sm font-bold text-slate-600">
                {selectedVerb.meaning.en}
              </p>
            )}
          </div>
        </div>
      </section>

      <div ref={practiceAreaRef} className="scroll-mt-24">
        {selectedLearningGroup && (
          <section className="mt-5 rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black uppercase tracking-wide text-indigo-600">
                    About this learning focus
                  </p>
                  {selectedLearningGroup.level && (
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                      {selectedLearningGroup.level}
                    </span>
                  )}
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    {focusVerbs.length} verb{focusVerbs.length === 1 ? "" : "s"}
                  </span>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                    {visibleFamilies.length} pattern{visibleFamilies.length === 1 ? "" : "s"}
                  </span>
                </div>

                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  {getLocalizedText(selectedLearningGroup.label, "en") ||
                    selectedLearningGroup.id}
                </h2>

                {getLocalizedText(selectedLearningGroup.summary, "en") && (
                  <p className="mt-3 text-base font-semibold leading-7 text-slate-700">
                    {getLocalizedText(selectedLearningGroup.summary, "en")}
                  </p>
                )}

                {selectedVerb?.example?.[selectedLang] && (
                  <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-800">
                    Example: {selectedVerb.example[selectedLang]}
                  </p>
                )}

                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Current pattern detail
                  </p>

                  {isAllPatternsSelected ? (
                    <>
                      <h3 className="mt-1 text-lg font-black text-slate-900">
                        All patterns in this focus
                      </h3>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                        The verb picker now contains every visible verb in this learning focus. Use the chips below to narrow to one technical pattern when needed.
                      </p>
                      {selectedVerbFamily?.label?.en && (
                        <p className="mt-2 text-sm font-bold text-indigo-700">
                          Current verb pattern: {selectedVerbFamily.label.en}
                        </p>
                      )}
                    </>
                  ) : selectedFamily ? (
                    <>
                      <h3 className="mt-1 text-lg font-black text-slate-900">
                        {selectedFamily.label?.en || selectedFamily.id}
                      </h3>
                      {selectedFamily.patternHint?.en && (
                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                          {selectedFamily.patternHint.en}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-2 text-sm font-semibold text-slate-600">
                      Choose a pattern detail or keep all patterns visible.
                    </p>
                  )}
                </div>

                {selectedGroupFamilies.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Technical families inside this focus
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleTechnicalFamilyChipClick(ALL_PATTERNS_ID)}
                        className={`rounded-full px-3 py-2 text-xs font-black shadow-sm transition ${
                          isAllPatternsSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        }`}
                      >
                        All patterns
                      </button>
                      {selectedGroupFamilies.map((family) => {
                        const isCurrentFamily = family.id === selectedFamily?.id;

                        return (
                          <button
                            key={family.id}
                            type="button"
                            onClick={() => handleTechnicalFamilyChipClick(family.id)}
                            className={`rounded-full px-3 py-2 text-xs font-black shadow-sm transition ${
                              isCurrentFamily
                                ? "bg-indigo-600 text-white"
                                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                            }`}
                          >
                            {family.label?.en || family.id}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {verbChipList.length > 0 && (
                <div className="rounded-3xl bg-indigo-50 p-4 lg:min-w-80 lg:max-w-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-indigo-700">
                    {isAllPatternsSelected
                      ? "Featured verbs in this focus"
                      : "Verbs in this technical pattern"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {verbChipList.map((verb) => {
                      const isCurrentVerb = verb.id === selectedVerb?.id;

                      return (
                        <button
                          key={verb.id}
                          type="button"
                          onClick={() => handleVerbChipClick(verb)}
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

                  {isAllPatternsSelected && focusVerbs.length > verbChipList.length && (
                    <p className="mt-3 text-xs font-bold text-indigo-700/80">
                      Showing {verbChipList.length} of {focusVerbs.length}. Use the verb picker for the full list.
                    </p>
                  )}
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
              No verbs in this focus yet
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Turn off the Polyglot filter, choose another pattern detail, or choose another learning focus.
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
            tenseId={selectedTenseId}
            targetLang={selectedLang}
          />
        )}

        {exerciseVerbs.length > 0 && !isOtherForms && activeMode === "choose-form" && (
          <IrregularFormExercise
            verb={selectedVerb}
            verbs={exerciseVerbs}
            tense={selectedTense}
            persons={persons}
            mode="choose"
            scopeLabel={exerciseScopeLabel}
            questionCount={12}
          />
        )}

        {exerciseVerbs.length > 0 && !isOtherForms && activeMode === "type-form" && (
          <IrregularFormExercise
            verb={selectedVerb}
            verbs={exerciseVerbs}
            tense={selectedTense}
            persons={persons}
            mode="type"
            scopeLabel={exerciseScopeLabel}
            questionCount={12}
          />
        )}

        {exerciseVerbs.length > 0 && !isOtherForms && activeMode === "type-full-form" && (
          <IrregularFormExercise
            verb={selectedVerb}
            verbs={exerciseVerbs}
            tense={selectedTense}
            persons={persons}
            mode="full"
            scopeLabel={exerciseScopeLabel}
            questionCount={12}
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