"use client";

import { useSyncExternalStore } from "react";

export type ColorScheme = "light" | "dark";

export const THEME_STORAGE_KEY = "color-scheme";
export const THEME_CHANGE_EVENT = "color-scheme-change";

export const getColorScheme = (): ColorScheme =>
  document.documentElement.dataset.colorScheme === "dark" ? "dark" : "light";

export const applyColorScheme = (scheme: ColorScheme) => {
  document.documentElement.dataset.colorScheme = scheme;
  document.documentElement.style.colorScheme = scheme;
};

export const setColorScheme = (scheme: ColorScheme) => {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, scheme);
  } catch {}
  applyColorScheme(scheme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
};

const isDaytime = () => {
  const hour = new Date().getHours();
  return hour >= 8 && hour < 20;
};

const DEFAULT_SCHEME_CHECK_INTERVAL_MS = 60_000;

const subscribe = (onStoreChange: () => void) => {
  const applyDefaultScheme = () => {
    let storedScheme: string | null = null;
    try {
      storedScheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch {}

    if (storedScheme === "light" || storedScheme === "dark") return;

    applyColorScheme(isDaytime() ? "light" : "dark");
    onStoreChange();
  };

  const intervalId = window.setInterval(applyDefaultScheme, DEFAULT_SCHEME_CHECK_INTERVAL_MS);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    window.clearInterval(intervalId);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
};

/**
 * Fargetemaet ligger på `documentElement` og byttes både av brukeren og av en
 * klokkestyrt standard. Kartet må vite om det for å bytte bakgrunnskart, så
 * abonnementet bor her framfor inne i temaknappen.
 */
export const useColorScheme = (): ColorScheme =>
  useSyncExternalStore(subscribe, getColorScheme, () => "light");
