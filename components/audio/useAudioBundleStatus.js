"use client";

import { useEffect, useState } from "react";

const audioBundleCache = new Map();

function getBundleKey(audioSrc, mapSrc) {
  return `${audioSrc || ""}::${mapSrc || ""}`;
}

function waitForAudioMetadata(audioSrc, signal) {
  return new Promise((resolve, reject) => {
    if (!audioSrc) {
      reject(new Error("Missing audio source"));
      return;
    }

    const audio = new Audio();

    let settled = false;

    function cleanup() {
      audio.onloadedmetadata = null;
      audio.onerror = null;
      audio.onabort = null;
      audio.src = "";
    }

    function finish(result) {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    }

    function fail(error) {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    }

    audio.preload = "metadata";
    audio.src = audioSrc;

    audio.onloadedmetadata = () => {
      finish({
        duration: Number.isFinite(audio.duration) ? audio.duration : null,
      });
    };

    audio.onerror = () => {
      fail(new Error("Audio file could not be loaded"));
    };

    audio.onabort = () => {
      fail(new Error("Audio loading was aborted"));
    };

    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          fail(new Error("Audio loading was cancelled"));
        },
        { once: true }
      );
    }

    audio.load();
  });
}

async function loadAudioBundle({ audioSrc, mapSrc, signal }) {
  if (!audioSrc || !mapSrc) {
    return {
      status: "fallback",
      audioSrc,
      mapSrc,
      map: null,
      audio: null,
      message: "Using browser voice fallback",
    };
  }

  const mapResponse = await fetch(mapSrc, {
    cache: "force-cache",
    signal,
  });

  if (!mapResponse.ok) {
    return {
      status: "fallback",
      audioSrc,
      mapSrc,
      map: null,
      audio: null,
      message: "Using browser voice fallback",
    };
  }

  const map = await mapResponse.json();
  const audio = await waitForAudioMetadata(audioSrc, signal);

  return {
    status: "ready",
    audioSrc,
    mapSrc,
    map,
    audio,
    message: "Audio ready",
  };
}

export default function useAudioBundleStatus({ audioSrc, mapSrc }) {
  const [state, setState] = useState(() => ({
    status: audioSrc && mapSrc ? "loading" : "fallback",
    message: audioSrc && mapSrc ? "Loading audio…" : "Using browser voice fallback",
    audioSrc,
    mapSrc,
    map: null,
    audio: null,
    error: null,
  }));

  useEffect(() => {
    const key = getBundleKey(audioSrc, mapSrc);

    if (!audioSrc || !mapSrc) {
      setState({
        status: "fallback",
        message: "Using browser voice fallback",
        audioSrc,
        mapSrc,
        map: null,
        audio: null,
        error: null,
      });
      return;
    }

    const cached = audioBundleCache.get(key);

    if (cached) {
      setState(cached);
      return;
    }

    const controller = new AbortController();

    setState({
      status: "loading",
      message: "Loading audio…",
      audioSrc,
      mapSrc,
      map: null,
      audio: null,
      error: null,
    });

    loadAudioBundle({
      audioSrc,
      mapSrc,
      signal: controller.signal,
    })
      .then((result) => {
        const nextState = {
          ...result,
          error: null,
        };

        audioBundleCache.set(key, nextState);
        setState(nextState);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;

        const fallbackState = {
          status: "fallback",
          message: "Using browser voice fallback",
          audioSrc,
          mapSrc,
          map: null,
          audio: null,
          error,
        };

        audioBundleCache.set(key, fallbackState);
        setState(fallbackState);
      });

    return () => {
      controller.abort();
    };
  }, [audioSrc, mapSrc]);

  return state;
}