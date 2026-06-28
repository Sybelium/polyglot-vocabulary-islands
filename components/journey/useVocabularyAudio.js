"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const speechLangs = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-PT",
  de: "de-DE",
  nl: "nl-NL",
};

function getWordText(word, lang) {
  return word?.[lang] || word?.text || word?.en || "";
}

function getSegmentId(word) {
  if (!word) return "";
  return String(word.id ?? "");
}

export default function useVocabularyAudio({ category, lang }) {
  const [audioMap, setAudioMap] = useState(null);
  const [audioStatus, setAudioStatus] = useState("loading");

  const audioRef = useRef(null);
  const segmentTimerRef = useRef(null);

  const segmentById = useMemo(() => {
    const segments = Array.isArray(audioMap?.segments) ? audioMap.segments : [];

    return new Map(
      segments
        .filter((segment) => segment.id !== undefined && segment.id !== null)
        .map((segment) => [String(segment.id), segment])
    );
  }, [audioMap]);

  const stopAudio = useCallback(() => {
    if (segmentTimerRef.current) {
      clearTimeout(segmentTimerRef.current);
      segmentTimerRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
  }, []);

  const speakWithBrowserTts = useCallback(
    ({ text, rate = 0.9, onEnd }) => {
      if (typeof window === "undefined") {
        onEnd?.();
        return;
      }

      if (!text || !window.speechSynthesis) {
        window.setTimeout(() => onEnd?.(), 600);
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechLangs[lang] || "en-US";
      utterance.rate = rate;
      utterance.pitch = 1;

      utterance.onend = () => onEnd?.();
      utterance.onerror = () => onEnd?.();

      window.speechSynthesis.speak(utterance);
    },
    [lang]
  );

  const playWord = useCallback(
    (word, options = {}) => {
      const text = options.text || getWordText(word, lang);
      const rate = options.rate ?? 0.9;
      const onEnd = options.onEnd;

      const segment = segmentById.get(getSegmentId(word));
      const audio = audioRef.current;

      stopAudio();

      if (!segment || !audio) {
        speakWithBrowserTts({ text, rate, onEnd });
        return false;
      }

      const start = Number(segment.start);
      const end = Number(segment.end);

      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
        speakWithBrowserTts({ text, rate, onEnd });
        return false;
      }

      audio.currentTime = start;

      const playPromise = audio.play();

      segmentTimerRef.current = window.setTimeout(() => {
        audio.pause();
        segmentTimerRef.current = null;
        onEnd?.();
      }, Math.max(250, (end - start) * 1000 + 80));

      if (playPromise?.catch) {
        playPromise.catch(() => {
          if (segmentTimerRef.current) {
            clearTimeout(segmentTimerRef.current);
            segmentTimerRef.current = null;
          }

          speakWithBrowserTts({ text, rate, onEnd });
        });
      }

      return true;
    },
    [lang, segmentById, speakWithBrowserTts, stopAudio]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadAudioMap() {
      setAudioStatus("loading");
      setAudioMap(null);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      if (!category || !lang) {
        setAudioStatus("fallback");
        return;
      }

      try {
        const response = await fetch(
          `/data/vocabulary/audio-maps/${category}/${lang}.json`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("No vocabulary timestamp map found.");
        }

        const map = await response.json();

        if (!map?.audioSrc || !Array.isArray(map.segments)) {
          throw new Error("Invalid vocabulary timestamp map.");
        }

        if (cancelled) return;

        const audio = new Audio(map.audioSrc);
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
      stopAudio();

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [category, lang, stopAudio]);

  return {
    audioStatus,
    playWord,
    stopAudio,
  };
}