"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type Scheme = "light" | "dark";

const THEME_STORAGE_KEY = "color-scheme";
const THEME_CHANGE_EVENT = "color-scheme-change";

const getScheme = (): Scheme =>
  document.documentElement.dataset.colorScheme === "dark" ? "dark" : "light";

const applyScheme = (scheme: Scheme) => {
  document.documentElement.dataset.colorScheme = scheme;
  document.documentElement.style.colorScheme = scheme;
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

    applyScheme(isDaytime() ? "light" : "dark");
    onStoreChange();
  };

  const intervalId = window.setInterval(applyDefaultScheme, DEFAULT_SCHEME_CHECK_INTERVAL_MS);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    window.clearInterval(intervalId);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
};

const ThemeToggle = () => {
  const scheme = useSyncExternalStore(subscribe, getScheme, () => "light");

  const toggleTheme = () => {
    const nextScheme = scheme === "dark" ? "light" : "dark";
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextScheme);
    } catch {}
    applyScheme(nextScheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={scheme === "dark" ? "Bytt til lys modus" : "Bytt til mørk modus"}
      style={{
        width: '2rem',
        height: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid var(--ds-color-accent-base-default)',
        borderRadius: '0.375rem',
        backgroundColor: 'transparent',
        color: 'var(--ds-color-accent-base-default)',
        cursor: 'pointer',
        boxShadow: 'var(--accent-shadow)',
        transition: 'color 0.2s, background-color 0.2s, box-shadow 0.2s'
      }}
    >
      {scheme === "dark" ? (
        <Sun aria-hidden="true" size={17} strokeWidth={2.25} absoluteStrokeWidth />
      ) : (
        <Moon aria-hidden="true" size={17} strokeWidth={2.25} absoluteStrokeWidth />
      )}
    </button>
  );
};

export default ThemeToggle;
