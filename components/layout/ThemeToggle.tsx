"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const getPreferredScheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

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
      {scheme === "dark" ? <Sun aria-hidden="true" size={18} strokeWidth={2} /> : <Moon aria-hidden="true" size={18} strokeWidth={2} />}
    </button>
  );
};

export default ThemeToggle;
