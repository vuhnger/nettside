"use client";

import { Moon, Sun } from "lucide-react";
import { setColorScheme, useColorScheme } from "@/lib/color-scheme";

const ThemeToggle = () => {
  const scheme = useColorScheme();

  return (
    <button
      type="button"
      onClick={() => setColorScheme(scheme === "dark" ? "light" : "dark")}
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
