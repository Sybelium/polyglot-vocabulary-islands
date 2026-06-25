"use client";

import { useEffect, useState } from "react";

export default function InstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator.standalone === true;

    if (standalone) {
      setIsInstalled(true);
    }

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setInstallPrompt(null);
      setShowHelp(false);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstallClick() {
    if (!installPrompt) {
      setShowHelp((value) => !value);
      return;
    }

    installPrompt.prompt();

    await installPrompt.userChoice;

    setInstallPrompt(null);
  }

  if (isInstalled) {
    return (
      <div className="rounded-2xl bg-emerald-100 px-4 py-3 text-center text-sm font-black text-emerald-700">
        App installed ✓
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleInstallClick}
        className="w-full rounded-2xl bg-violet-700 px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-violet-800 sm:w-auto"
      >
        Download the app
      </button>

      {showHelp && (
        <div className="rounded-2xl bg-violet-50 p-4 text-sm font-medium leading-relaxed text-slate-700">
          <p className="font-black text-slate-950">
            Install option not shown yet.
          </p>
          <p className="mt-1">
            On Chrome or Edge, use the browser install icon or menu. On iPhone,
            use Share → Add to Home Screen.
          </p>
        </div>
      )}
    </div>
  );
}