"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const VOICE_BY_SYSTEM = {
  latin: "en-US",
  cyrillic: "ru-RU",
  greek: "el-GR",
  arabic: "ar-SA",
  hangul: "ko-KR",
  hebrew: "he-IL",
  devanagari: "hi-IN",
  hiragana: "ja-JP",
  katakana: "ja-JP",
  "thai-consonants": "th-TH",
  "thai-vowels": "th-TH",
};

const LISTEN_GAME_QUESTION_COUNT = 10;

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function getPrompt(letter) {
  return letter.sound || letter.name || letter.transliteration || letter.symbol;
}

function getLetterLabel(letter) {
  return letter.name || letter.sound || letter.transliteration || "";
}

function getPreferredVoiceLang(system, voiceLang = "") {
  return voiceLang || VOICE_BY_SYSTEM[system] || "en-US";
}

function withCacheBuster(src, value = "") {
  if (!src) return src;

  const marker = encodeURIComponent(value || Date.now());
  const separator = src.includes("?") ? "&" : "?";

  return `${src}${separator}v=${marker}`;
}

function findBestSpeechVoice(lang) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  const normalizedLang = String(lang || "").toLowerCase();

  if (!normalizedLang || !voices.length) return null;

  return (
    voices.find((voice) => voice.lang?.toLowerCase() === normalizedLang) ||
    voices.find((voice) =>
      voice.lang?.toLowerCase().startsWith(normalizedLang.split("-")[0])
    ) ||
    null
  );
}

function waitForSpeechVoices() {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }

    const synth = window.speechSynthesis;

    if (synth.getVoices().length > 0) {
      resolve();
      return;
    }

    const timeout = setTimeout(() => {
      resolve();
    }, 1000);

    synth.onvoiceschanged = () => {
      clearTimeout(timeout);
      resolve();
    };
  });
}

function formatElapsedTime(ms) {
  const totalTenths = Math.floor(ms / 100);
  const minutes = Math.floor(totalTenths / 600);
  const seconds = Math.floor((totalTenths % 600) / 10);
  const tenths = totalTenths % 10;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}.${tenths}`;
}

function getListenGameTitle(mode) {
  if (mode === "listen-shuffled") return "Game 2 · Shuffled listening";
  return "Game 1 · Ordered listening";
}

export default function AlphabetClickGame({
  system,
  letters,
  voiceLang = "",
  audioMode = "timestamped",
}) {
  const [mode, setMode] = useState("training");
  const [questions, setQuestions] = useState([]);
  const [boardLetters, setBoardLetters] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const [finished, setFinished] = useState(false);
  const [activeTrainingId, setActiveTrainingId] = useState(null);
  const [isReadingSet, setIsReadingSet] = useState(false);
  const [audioMap, setAudioMap] = useState(null);
  const [audioStatus, setAudioStatus] = useState("loading");
  const [correctOrderIds, setCorrectOrderIds] = useState([]);
  const [wrongFlashId, setWrongFlashId] = useState(null);
  const [hintFlashId, setHintFlashId] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const timersRef = useRef([]);
  const audioRef = useRef(null);
  const segmentTimerRef = useRef(null);
  const raceStartedAtRef = useRef(null);

  const current = questions[index];
  const speechLang = getPreferredVoiceLang(system, voiceLang);
  const shouldUseTimestampAudio = audioMode !== "browser-tts";

  const visibleLetters = useMemo(() => {
    return letters.slice(0, 48);
  }, [letters]);

  const correctOrderIdSet = useMemo(() => {
    return new Set(correctOrderIds);
  }, [correctOrderIds]);

  const segmentById = useMemo(() => {
    const segments = Array.isArray(audioMap?.segments) ? audioMap.segments : [];

    return new Map(
      segments
        .filter((segment) => segment.id)
        .map((segment) => [segment.id, segment])
    );
  }, [audioMap]);


  function clearReadingTimers() {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  }

  function stopCurrentSound() {
    if (segmentTimerRef.current) {
      clearTimeout(segmentTimerRef.current);
      segmentTimerRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  function stopSpeech() {
    clearReadingTimers();
    stopCurrentSound();

    setIsReadingSet(false);
    setActiveTrainingId(null);
  }

  function speakWithBrowserTts(letter) {
    if (typeof window === "undefined") return;
    if (!window.speechSynthesis) return;

    const text = letter.audioText || letter.sound || letter.name || letter.symbol;
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    utterance.rate = 0.7;

    const matchingVoice = findBestSpeechVoice(speechLang);
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  function playTimestampSegment(letter) {
    const segment = segmentById.get(letter.id);
    const audio = audioRef.current;

    if (!segment || !audio) return false;

    const start = Number(segment.start);
    const end = Number(segment.end);

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return false;
    }

    audio.currentTime = start;

    const playPromise = audio.play();

    segmentTimerRef.current = setTimeout(() => {
      audio.pause();
    }, Math.max(200, (end - start) * 1000 + 80));

    if (playPromise?.catch) {
      playPromise.catch(() => {
        if (segmentTimerRef.current) {
          clearTimeout(segmentTimerRef.current);
          segmentTimerRef.current = null;
        }

        speakWithBrowserTts(letter);
      });
    }

    return true;
  }

  function speak(letter) {
    if (!letter) return;

    stopCurrentSound();

    const playedSegment = playTimestampSegment(letter);

    if (!playedSegment) {
      speakWithBrowserTts(letter);
    }
  }

  async function readLetterSet(repetitions = 1) {
    stopSpeech();

    if (!visibleLetters.length) return;

    setIsReadingSet(true);

    if (audioStatus !== "ready") {
      await waitForSpeechVoices();
    }

    const sequence = [];

    for (let round = 0; round < repetitions; round += 1) {
      visibleLetters.forEach((letter) => sequence.push(letter));
    }

    let delay = 900;

    sequence.forEach((letter) => {
      const timer = setTimeout(() => {
        setActiveTrainingId(letter.id);
        speak(letter);
      }, delay);

      timersRef.current.push(timer);
      delay += 1600;
    });

    const endTimer = setTimeout(() => {
      setIsReadingSet(false);
      setActiveTrainingId(null);
    }, delay + 300);

    timersRef.current.push(endTimer);
  }

  function resetSharedGameState() {
    stopSpeech();
    setIndex(0);
    setSelectedId(null);
    setScore(0);
    setMistakes([]);
    setFinished(false);
    setCorrectOrderIds([]);
    setWrongFlashId(null);
    setHintFlashId(null);
    setTimerRunning(false);
    setElapsedMs(0);
    raceStartedAtRef.current = null;
  }

  function startListenGame({ shuffledBoard }) {
    if (!visibleLetters.length) return;

    resetSharedGameState();

    const prepared = shuffle(visibleLetters).slice(
      0,
      Math.min(LISTEN_GAME_QUESTION_COUNT, visibleLetters.length)
    );

    setQuestions(prepared);
    setBoardLetters(shuffledBoard ? shuffle(visibleLetters) : visibleLetters);

    setTimeout(() => {
      if (prepared[0]) speak(prepared[0]);
    }, 400);
  }

  function startAlphabetOrderGame() {
    if (!visibleLetters.length) return;

    resetSharedGameState();
    setQuestions([]);
    setBoardLetters(shuffle(visibleLetters));
  }

  function startCurrentGame() {
    if (mode === "listen-ordered") {
      startListenGame({ shuffledBoard: false });
      return;
    }

    if (mode === "listen-shuffled") {
      startListenGame({ shuffledBoard: true });
      return;
    }

    if (mode === "alphabet-order") {
      startAlphabetOrderGame();
    }
  }

  function handleTrainingClick(letter) {
    stopSpeech();
    setActiveTrainingId(letter.id);
    speak(letter);

    const timer = setTimeout(() => {
      setActiveTrainingId(null);
    }, 900);

    timersRef.current.push(timer);
  }

  function handleListenGameChoice(letter) {
    if (!current || selectedId !== null || finished) return;

    setSelectedId(letter.id);

    const isCorrect = letter.id === current.id;

    if (isCorrect) {
      setScore((value) => value + 1);
    } else {
      setMistakes((currentMistakes) => [
        ...currentMistakes,
        {
          expected: current,
          selected: letter,
        },
      ]);
    }

    const timer = setTimeout(() => {
      const nextIndex = index + 1;

      if (nextIndex >= questions.length) {
        setFinished(true);
        return;
      }

      setIndex(nextIndex);
      setSelectedId(null);
      speak(questions[nextIndex]);
    }, 900);

    timersRef.current.push(timer);
  }

  function startRaceTimerIfNeeded() {
    if (timerRunning) return;

    raceStartedAtRef.current = Date.now();
    setElapsedMs(0);
    setTimerRunning(true);
  }

  function handleAlphabetOrderChoice(letter) {
    if (finished) return;

    const target = visibleLetters[index];
    if (!target) return;

    startRaceTimerIfNeeded();

    const isCorrect = letter.id === target.id;

    if (isCorrect) {
      const nextIndex = index + 1;

      setCorrectOrderIds((currentIds) => [...currentIds, letter.id]);
      setScore((value) => value + 1);
      setIndex(nextIndex);
      speak(letter);

      if (nextIndex >= visibleLetters.length) {
        setFinished(true);
        setTimerRunning(false);

        if (raceStartedAtRef.current) {
          setElapsedMs(Date.now() - raceStartedAtRef.current);
        }
      }

      return;
    }

    setWrongFlashId(letter.id);
    setHintFlashId(target.id);
    setMistakes((currentMistakes) => [
      ...currentMistakes,
      {
        expected: target,
        selected: letter,
      },
    ]);
    speak(target);

    const timer = setTimeout(() => {
      setWrongFlashId(null);
      setHintFlashId(null);
    }, 650);

    timersRef.current.push(timer);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadAudioMap() {
      setAudioStatus("loading");
      setAudioMap(null);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      if (!shouldUseTimestampAudio) {
        setAudioStatus("fallback");
        return;
      }

      try {
        const response = await fetch(
          `/data/writing-systems/audio-maps/${system}.json`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("No timestamped audio map found.");
        }

        const map = await response.json();

        if (!map?.audioSrc || !Array.isArray(map.segments)) {
          throw new Error("Invalid timestamped audio map.");
        }

        if (cancelled) return;

        const audio = new Audio(
          withCacheBuster(map.audioSrc, map.createdAt || system)
        );
        audio.preload = "auto";

        audioRef.current = audio;
        setAudioMap(map);
        setAudioStatus("ready");
      } catch {
        if (cancelled) return;

        setAudioMap(null);
        setAudioStatus("fallback");
      }
    }

    loadAudioMap();

    return () => {
      cancelled = true;

      if (segmentTimerRef.current) {
        clearTimeout(segmentTimerRef.current);
        segmentTimerRef.current = null;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [system, shouldUseTimestampAudio]);

  useEffect(() => {
    if (mode !== "training") return;
    if (!visibleLetters.length) return;
    if (audioStatus === "loading") return;

    const timer = setTimeout(() => {
      readLetterSet(1);
    }, 700);

    return () => {
      clearTimeout(timer);
      stopSpeech();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, visibleLetters, audioStatus]);

  useEffect(() => {
    if (mode === "training") return;
    if (!visibleLetters.length) return;
    if (audioStatus === "loading") return;

    startCurrentGame();

    return () => {
      stopSpeech();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, visibleLetters, audioStatus]);

  useEffect(() => {
    if (mode !== "alphabet-order") return;
    if (!timerRunning || finished) return;
    if (!raceStartedAtRef.current) return;

    const interval = setInterval(() => {
      setElapsedMs(Date.now() - raceStartedAtRef.current);
    }, 100);

    return () => clearInterval(interval);
  }, [mode, timerRunning, finished]);

  if (!letters.length) {
    return (
      <div className="rounded-[2rem] bg-white p-6 text-center shadow-md">
        <p className="font-bold text-slate-700">
          No characters found for this writing system.
        </p>
      </div>
    );
  }

  const isListenGame = mode === "listen-ordered" || mode === "listen-shuffled";
  const isAlphabetOrderGame = mode === "alphabet-order";
  const currentAlphabetTarget = visibleLetters[index] || null;

  return (
    <section className="space-y-5">
      <div className="rounded-[2rem] border border-white/80 bg-white p-4 shadow-lg">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => setMode("training")}
            className={[
              "rounded-2xl px-4 py-3 text-sm font-black transition",
              mode === "training"
                ? "bg-violet-700 text-white shadow-md"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            ].join(" ")}
          >
            Training
          </button>

          <button
            type="button"
            onClick={() => setMode("listen-ordered")}
            className={[
              "rounded-2xl px-4 py-3 text-sm font-black transition",
              mode === "listen-ordered"
                ? "bg-violet-700 text-white shadow-md"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            ].join(" ")}
          >
            Game 1 · Ordered
          </button>

          <button
            type="button"
            onClick={() => setMode("listen-shuffled")}
            className={[
              "rounded-2xl px-4 py-3 text-sm font-black transition",
              mode === "listen-shuffled"
                ? "bg-violet-700 text-white shadow-md"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            ].join(" ")}
          >
            Game 2 · Shuffled
          </button>

          <button
            type="button"
            onClick={() => setMode("alphabet-order")}
            className={[
              "rounded-2xl px-4 py-3 text-sm font-black transition",
              mode === "alphabet-order"
                ? "bg-violet-700 text-white shadow-md"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            ].join(" ")}
          >
            Game 3 · Alphabet
          </button>
        </div>
      </div>

      {mode === "training" && (
        <div className="rounded-[2rem] border border-white/80 bg-white p-4 shadow-lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Tap a character to hear it
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-600">
                Read and listen to the letters with great attention 3 times and
                then try the games.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => readLetterSet(1)}
                disabled={isReadingSet}
                className="rounded-2xl bg-violet-100 px-4 py-3 text-sm font-black text-violet-700 transition hover:bg-violet-200 disabled:opacity-60"
              >
                🔊 Read once
              </button>

              <button
                type="button"
                onClick={() => readLetterSet(3)}
                disabled={isReadingSet}
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-md transition hover:bg-violet-800 disabled:opacity-60"
              >
                3 times
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-8">
            {visibleLetters.map((letter) => {
              const isActive = activeTrainingId === letter.id;

              return (
                <button
                  key={letter.id}
                  type="button"
                  onClick={() => handleTrainingClick(letter)}
                  className={[
                    "rounded-2xl border p-3 text-center shadow-sm transition hover:-translate-y-0.5",
                    isActive
                      ? "border-violet-400 bg-violet-200 ring-4 ring-violet-200"
                      : "border-violet-100 bg-violet-50 hover:bg-violet-100",
                  ].join(" ")}
                >
                  <div className="text-4xl font-black text-slate-950">
                    {letter.symbol}
                  </div>

                  <div className="mt-2 truncate text-xs font-bold text-slate-600">
                    {getLetterLabel(letter)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isListenGame && (
        <div className="rounded-[2rem] border border-white/80 bg-white p-4 shadow-lg">
          {!finished ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-violet-600">
                    {getListenGameTitle(mode)}
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    Listen and click the letter
                  </h2>

                  <p className="mt-1 text-sm font-bold text-slate-600">
                    Question {index + 1} / {questions.length} · Score {score}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => current && speak(current)}
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-md"
                >
                  🔊 Replay
                </button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-8">
                {boardLetters.map((letter) => {
                  const isSelected = selectedId === letter.id;
                  const isCorrect = current && letter.id === current.id;

                  let stateClass =
                    "border-violet-100 bg-violet-50 hover:bg-violet-100";

                  if (selectedId !== null && isCorrect) {
                    stateClass = "border-emerald-400 bg-emerald-100";
                  } else if (isSelected && !isCorrect) {
                    stateClass = "border-red-400 bg-red-100";
                  }

                  return (
                    <button
                      key={letter.id}
                      type="button"
                      onClick={() => handleListenGameChoice(letter)}
                      disabled={selectedId !== null}
                      className={[
                        "rounded-2xl border p-3 text-center shadow-sm transition hover:-translate-y-0.5 disabled:cursor-default disabled:hover:translate-y-0",
                        stateClass,
                      ].join(" ")}
                    >
                      <div className="text-4xl font-black text-slate-950">
                        {letter.symbol}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-5xl">
                🏆
              </div>

              <h2 className="mt-4 text-3xl font-black text-slate-950">
                Game finished!
              </h2>

              <p className="mt-2 text-lg font-bold text-slate-700">
                Score: {score} / {questions.length}
              </p>

              {mistakes.length > 0 ? (
                <div className="mx-auto mt-5 max-w-2xl rounded-[2rem] bg-red-50 p-4 text-left">
                  <h3 className="text-center text-lg font-black text-red-700">
                    Mistakes
                  </h3>

                  <div className="mt-4 space-y-3">
                    {mistakes.map((mistake, mistakeIndex) => (
                      <div
                        key={`${mistake.expected.id}-${mistakeIndex}`}
                        className="rounded-2xl bg-white p-4 shadow-sm"
                      >
                        <p className="text-sm font-black text-slate-500">
                          Question: {getPrompt(mistake.expected)}
                        </p>

                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <div className="rounded-2xl bg-emerald-50 p-3">
                            <p className="text-xs font-black uppercase text-emerald-700">
                              Correct answer
                            </p>
                            <p className="mt-1 text-3xl font-black text-slate-950">
                              {mistake.expected.symbol}
                            </p>
                            <p className="text-sm font-bold text-slate-600">
                              {getLetterLabel(mistake.expected)}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-red-50 p-3">
                            <p className="text-xs font-black uppercase text-red-700">
                              Your answer
                            </p>
                            <p className="mt-1 text-3xl font-black text-slate-950">
                              {mistake.selected.symbol}
                            </p>
                            <p className="text-sm font-bold text-slate-600">
                              {getLetterLabel(mistake.selected)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mx-auto mt-4 max-w-xl rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
                  Perfect round — no mistakes!
                </p>
              )}

              <button
                type="button"
                onClick={startCurrentGame}
                className="mt-5 rounded-2xl bg-violet-700 px-6 py-3 text-sm font-black text-white shadow-md"
              >
                Play again
              </button>
            </div>
          )}
        </div>
      )}

      {isAlphabetOrderGame && (
        <div className="rounded-[2rem] border border-white/80 bg-white p-4 shadow-lg">
          {!finished ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-violet-600">
                    Game 3 · Alphabet order
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-slate-950">
                    Click all letters in alphabetical order
                  </h2>

                  <p className="mt-1 text-sm font-bold text-slate-600">
                    Next: {currentAlphabetTarget?.symbol || "—"} · Score {score} / {visibleLetters.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white shadow-md">
                  ⏱ {formatElapsedTime(elapsedMs)}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-8">
                {boardLetters.map((letter) => {
                  const isCorrectDone = correctOrderIdSet.has(letter.id);
                  const isWrongFlash = wrongFlashId === letter.id;
                  const isHintFlash = hintFlashId === letter.id;

                  let stateClass =
                    "border-violet-100 bg-violet-50 hover:bg-violet-100";

                  if (isCorrectDone) {
                    stateClass = "border-emerald-400 bg-emerald-100";
                  } else if (isWrongFlash) {
                    stateClass = "border-red-400 bg-red-100";
                  } else if (isHintFlash) {
                    stateClass =
                      "border-amber-400 bg-amber-100 ring-4 ring-amber-200";
                  }

                  return (
                    <button
                      key={letter.id}
                      type="button"
                      onClick={() => handleAlphabetOrderChoice(letter)}
                      disabled={isCorrectDone}
                      className={[
                        "rounded-2xl border p-3 text-center shadow-sm transition hover:-translate-y-0.5 disabled:cursor-default disabled:hover:translate-y-0",
                        stateClass,
                      ].join(" ")}
                    >
                      <div className="text-4xl font-black text-slate-950">
                        {letter.symbol}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-5xl">
                🏁
              </div>

              <h2 className="mt-4 text-3xl font-black text-slate-950">
                Alphabet complete!
              </h2>

              <p className="mt-2 text-lg font-bold text-slate-700">
                Score: {score} / {visibleLetters.length}
              </p>

              <p className="mt-1 text-lg font-bold text-slate-700">
                Time: {formatElapsedTime(elapsedMs)}
              </p>

              {mistakes.length > 0 ? (
                <p className="mx-auto mt-4 max-w-xl rounded-2xl bg-amber-50 px-4 py-3 text-sm font-black text-amber-700">
                  Wrong clicks: {mistakes.length}. Only correct clicks counted
                  for points.
                </p>
              ) : (
                <p className="mx-auto mt-4 max-w-xl rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
                  Perfect order — no wrong clicks!
                </p>
              )}

              <button
                type="button"
                onClick={startCurrentGame}
                className="mt-5 rounded-2xl bg-violet-700 px-6 py-3 text-sm font-black text-white shadow-md"
              >
                Play again
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}