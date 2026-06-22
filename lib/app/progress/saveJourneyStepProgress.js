const STORAGE_KEY = "polyglotJourneyProgress";

function canUseStorage() {
  return typeof window !== "undefined" && window.localStorage;
}

function readProgress() {
  if (!canUseStorage()) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeProgress(progress) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage errors.
  }
}

export function getJourneyWordIds(island) {
  if (!island) return [];

  if (Array.isArray(island.wordIds)) {
    return island.wordIds;
  }

  if (Array.isArray(island.words)) {
    return island.words
      .map((word) => word.id || word.wordId || word.en)
      .filter(Boolean);
  }

  return [];
}

export function getJourneyProgress(lang) {
  const progress = readProgress();
  return progress?.[lang] || {};
}

export function isIslandCompleted(lang, islandId) {
  const langProgress = getJourneyProgress(lang);
  return Boolean(langProgress?.[islandId]?.completed);
}

export async function saveJourneyStepProgress({
  lang,
  targetLang,
  islandId,
  step,
  completed = true,
  score = null,
  total = null,
} = {}) {
  const resolvedLang = lang || targetLang;

  if (!resolvedLang || !islandId || !step) {
    return {
      ok: false,
      success: false,
      saved: false,
      reason: "Missing lang, islandId, or step.",
    };
  }

  const progress = readProgress();

  if (!progress[resolvedLang]) {
    progress[resolvedLang] = {};
  }

  if (!progress[resolvedLang][islandId]) {
    progress[resolvedLang][islandId] = {
      steps: {},
      completed: false,
    };
  }

  progress[resolvedLang][islandId].steps[step] = {
    completed,
    score,
    total,
    updatedAt: new Date().toISOString(),
  };

  if (step === "song-challenge" && completed) {
    progress[resolvedLang][islandId].completed = true;
    progress[resolvedLang][islandId].completedAt = new Date().toISOString();
  }

  writeProgress(progress);

  return {
    ok: true,
    success: true,
    saved: true,
  };
}