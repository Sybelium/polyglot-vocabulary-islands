"use client";

import { useEffect, useMemo, useRef } from "react";
import useAudioBundleStatus from "@/components/audio/useAudioBundleStatus";
import {
  getSentenceAudioPaths,
  speakSentence,
  stopSentenceSpeech,
} from "./sentenceUtils";

function findSegmentForSentence(map, sentence, text) {
  const segments = Array.isArray(map?.segments) ? map.segments : [];

  return (
    segments.find((segment) => segment.sentenceId === sentence?.id) ||
    segments.find((segment) => segment.id === sentence?.id) ||
    segments.find((segment) => segment.text === text) ||
    null
  );
}

function getSafeTime(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export default function useSentenceAudio({ lang, subjectId }) {
  const audioPaths = useMemo(
    () => getSentenceAudioPaths({ lang, subjectId }),
    [lang, subjectId]
  );

  const audioState = useAudioBundleStatus({
    audioSrc: audioPaths.audioSrc,
    mapSrc: audioPaths.mapSrc,
  });

  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const playTokenRef = useRef(0);

  function clearTimer() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function getAudioElement() {
    const audioSrc = audioState.map?.audioSrc || audioState.audioSrc || audioPaths.audioSrc;

    if (!audioSrc) return null;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioSrc);
      audioRef.current.preload = "metadata";
      return audioRef.current;
    }

    if (!audioRef.current.src.endsWith(audioSrc)) {
      audioRef.current.pause();
      audioRef.current.src = audioSrc;
      audioRef.current.preload = "metadata";
      audioRef.current.load();
    }

    return audioRef.current;
  }

  function stopAudio() {
    playTokenRef.current += 1;
    clearTimer();
    stopSentenceSpeech();

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
    }
  }

  function playWithBrowserVoice(text, onEnd) {
    speakSentence(text, lang, onEnd);
  }

  function playSentence(sentence, { text, onEnd } = {}) {
    const sentenceText = text || "";
    const segment = findSegmentForSentence(audioState.map, sentence, sentenceText);

    stopAudio();

    if (audioState.status !== "ready" || !segment) {
      playWithBrowserVoice(sentenceText, onEnd);
      return;
    }

    const audio = getAudioElement();

    if (!audio) {
      playWithBrowserVoice(sentenceText, onEnd);
      return;
    }

    const token = playTokenRef.current + 1;
    playTokenRef.current = token;

    const start = getSafeTime(segment.start, 0);
    const end = getSafeTime(segment.end, start);

    function finish() {
      if (playTokenRef.current !== token) return;

      clearTimer();
      audio.pause();
      onEnd?.();
    }

    function startPlayback() {
      if (playTokenRef.current !== token) return;

      try {
        audio.currentTime = Math.max(0, start);
      } catch {
        playWithBrowserVoice(sentenceText, onEnd);
        return;
      }

      audio.onended = finish;
      audio.onerror = () => {
        clearTimer();
        playWithBrowserVoice(sentenceText, onEnd);
      };

      audio
        .play()
        .then(() => {
          clearTimer();

          timerRef.current = window.setInterval(() => {
            if (playTokenRef.current !== token) {
              clearTimer();
              return;
            }

            if (audio.currentTime >= end - 0.03) {
              finish();
            }
          }, 30);
        })
        .catch(() => {
          clearTimer();
          playWithBrowserVoice(sentenceText, onEnd);
        });
    }

    if (audio.readyState >= 1) {
      startPlayback();
      return;
    }

    audio.onloadedmetadata = startPlayback;
    audio.load();
  }

  useEffect(() => {
    if (audioState.status === "ready") {
      getAudioElement();
    }
  }, [audioState.status, audioState.audioSrc]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return {
    audioStatus: audioState.status,
    audioMessage: audioState.message,
    audioPaths,
    audioMap: audioState.map,
    playSentence,
    stopAudio,
  };
}