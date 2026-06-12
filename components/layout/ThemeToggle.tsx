"use client";

import { useEffect, useState } from "react";

const getPreferredScheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const SunIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" style={{ width: '1.125rem', height: '1.125rem' }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2.5" />
    <path d="M12 19.5V22" />
    <path d="M4.93 4.93 6.7 6.7" />
    <path d="M17.3 17.3l1.77 1.77" />
    <path d="M2 12h2.5" />
    <path d="M19.5 12H22" />
    <path d="M4.93 19.07 6.7 17.3" />
    <path d="M17.3 6.7l1.77-1.77" />
  </svg>
);

const MoonIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" style={{ width: '1.125rem', height: '1.125rem' }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);

const ThemeToggle = () => {
  const [scheme, setScheme] = useState<"light" | "dark">("light");
  const [userOverride, setUserOverride] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      if (userOverride) return;

      const preferredScheme = getPreferredScheme();
      setScheme(preferredScheme);
      document.documentElement.setAttribute("data-color-scheme", preferredScheme);
    };

    if (!userOverride) {
      update();
    }

    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, [userOverride]);

  const toggleTheme = () => {
    const nextScheme = scheme === "dark" ? "light" : "dark";
    setScheme(nextScheme);
    setUserOverride(true);
    document.documentElement.setAttribute("data-color-scheme", nextScheme);
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
        transition: 'all 0.2s'
      }}
    >
      {scheme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};

export default ThemeToggle;
