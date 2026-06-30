const SPEECH_LANG_BY_TARGET_LANG = {
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-PT",
};

const audioMapCache = new Map();
const audioElementCache = new Map();

let activePlayback = null;
let playbackToken = 0;

export function getSpeechLangForTargetLang(targetLang = "fr") {
  return SPEECH_LANG_BY_TARGET_LANG[targetLang] || "fr-FR";
}

export function getVoiceForLang(speechLang) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();

  const preferredNames = [
    "Google français",
    "Microsoft Denise",
    "Microsoft Henri",
    "Audrey",
    "Thomas",
    "Amélie",
    "Google español",
    "Microsoft Elvira",
    "Google italiano",
    "Microsoft Elsa",
    "Microsoft Isabella",
    "Google português",
    "Microsoft Raquel",
  ];

  return (
    voices.find(
      (voice) =>
        voice.lang === speechLang &&
        preferredNames.some((name) => voice.name.includes(name))
    ) ||
    voices.find((voice) => voice.lang === speechLang) ||
    voices.find((voice) => voice.lang?.startsWith(speechLang.split("-")[0])) ||
    null
  );
}

export function speakConjugation(text, speechLang = "fr-FR", onEnd) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getVoiceForLang(speechLang);

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = speechLang;
  }

  utterance.rate = 0.9;
  utterance.pitch = 0.95;
  utterance.volume = 1;

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

function normalizeAudioText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/\s+/g, " ");
}

function getAudioMapPath({ languageId, sourceType, tenseId }) {
  return `/data/conjugation/audio-maps/${languageId}/${sourceType}/${tenseId}.json`;
}

async function loadConjugationAudioMap({ languageId, sourceType, tenseId }) {
  if (!languageId || !sourceType || !tenseId) return null;

  const path = getAudioMapPath({ languageId, sourceType, tenseId });

  if (audioMapCache.has(path)) {
    return audioMapCache.get(path);
  }

  const response = await fetch(path, { cache: "force-cache" });

  if (!response.ok) {
    audioMapCache.set(path, null);
    return null;
  }

  const map = await response.json();
  audioMapCache.set(path, map);

  return map;
}

function getAudioElement(audioSrc) {
  if (!audioSrc) return null;

  if (audioElementCache.has(audioSrc)) {
    return audioElementCache.get(audioSrc);
  }

  const audio = new Audio(audioSrc);
  audio.preload = "auto";

  audioElementCache.set(audioSrc, audio);

  return audio;
}

function findSegment(map, { segmentId, verbId, personId, fallbackText }) {
  const segments = Array.isArray(map?.segments) ? map.segments : [];

  if (!segments.length) return null;

  if (segmentId) {
    const exactSegment = segments.find((segment) => segment.id === segmentId);
    if (exactSegment) return exactSegment;
  }

  if (verbId && personId) {
    const exactVerbPerson = segments.find(
      (segment) => segment.verbId === verbId && segment.personId === personId
    );

    if (exactVerbPerson) return exactVerbPerson;
  }

  const normalizedFallback = normalizeAudioText(fallbackText);

  if (verbId && normalizedFallback) {
    const matchingVerbText = segments.find((segment) => {
      if (segment.verbId !== verbId) return false;

      return (
        normalizeAudioText(segment.text) === normalizedFallback ||
        normalizeAudioText(segment.displayText) === normalizedFallback
      );
    });

    if (matchingVerbText) return matchingVerbText;
  }

  if (normalizedFallback) {
    return segments.find(
      (segment) =>
        normalizeAudioText(segment.text) === normalizedFallback ||
        normalizeAudioText(segment.displayText) === normalizedFallback
    );
  }

  return null;
}

function cleanupActivePlayback() {
  if (!activePlayback) return;

  const { audio, timer, onTimeUpdate, onEnded, onError } = activePlayback;

  if (timer) {
    window.clearTimeout(timer);
  }

  if (audio) {
    audio.pause();
    audio.removeEventListener("timeupdate", onTimeUpdate);
    audio.removeEventListener("ended", onEnded);
    audio.removeEventListener("error", onError);
  }

  activePlayback = null;
}

export function stopConjugationAudio() {
  playbackToken += 1;

  cleanupActivePlayback();

  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function fallbackToSpeech({ fallbackText, speechLang, onEnd }) {
  if (!fallbackText) {
    if (onEnd) onEnd();
    return;
  }

  speakConjugation(fallbackText, speechLang, onEnd);
}

export async function playConjugationAudio({
  languageId = "fr",
  sourceType = "regular",
  tenseId = "",
  verbId = "",
  personId = "",
  segmentId = "",
  fallbackText = "",
  speechLang = "",
  onEnd,
}) {
  if (typeof window === "undefined") {
    if (onEnd) onEnd();
    return;
  }

  stopConjugationAudio();

  const token = playbackToken + 1;
  playbackToken = token;

  const finalSpeechLang =
    speechLang || getSpeechLangForTargetLang(languageId) || "fr-FR";

  try {
    const map = await loadConjugationAudioMap({
      languageId,
      sourceType,
      tenseId,
    });

    const segment = findSegment(map, {
      segmentId,
      verbId,
      personId,
      fallbackText,
    });

    const audio = getAudioElement(map?.audioSrc);

    if (!map || !segment || !audio) {
      fallbackToSpeech({
        fallbackText,
        speechLang: finalSpeechLang,
        onEnd,
      });
      return;
    }

    const start = Number(segment.start ?? 0);
    const end = Number(segment.end ?? start);
    const duration = Math.max(0.15, end - start);

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      fallbackToSpeech({
        fallbackText,
        speechLang: finalSpeechLang,
        onEnd,
      });
      return;
    }

    audio.pause();
    audio.currentTime = start;

    function finish() {
      if (token !== playbackToken) return;

      cleanupActivePlayback();

      if (onEnd) onEnd();
    }

    function onTimeUpdate() {
      if (audio.currentTime >= end) {
        finish();
      }
    }

    function onEnded() {
      finish();
    }

    function onError() {
      cleanupActivePlayback();

      fallbackToSpeech({
        fallbackText,
        speechLang: finalSpeechLang,
        onEnd,
      });
    }

    const timer = window.setTimeout(finish, duration * 1000 + 250);

    activePlayback = {
      audio,
      timer,
      onTimeUpdate,
      onEnded,
      onError,
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    await audio.play();
  } catch {
    if (token !== playbackToken) return;

    cleanupActivePlayback();

    fallbackToSpeech({
      fallbackText,
      speechLang: finalSpeechLang,
      onEnd,
    });
  }
}