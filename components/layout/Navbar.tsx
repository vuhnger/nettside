"use client";

import NextLink from "next/link";
import { useState, useEffect } from "react";
import { FiSun, FiMoon, FiHome } from "react-icons/fi";

const Navbar = () => {
  const [navColour, setNavColour] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [apiStatus, setApiStatus] = useState<"unknown" | "up" | "down">("unknown");

  useEffect(() => {
    const scrollHandler = () => {
      if (window.scrollY >= 20) {
        setNavColour(true);
      } else {
        setNavColour(false);
      }
    };

    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    document.documentElement.setAttribute('data-color-scheme', isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const checkApi = async () => {
      try {
        const response = await fetch("https://api.vuhnger.dev/strava/health", {
          signal: controller.signal,
          cache: "no-store"
        });
        if (!active) return;
        setApiStatus(response.ok ? "up" : "down");
      } catch {
        if (!active) return;
        setApiStatus("down");
      }
    };

    checkApi();
    const interval = setInterval(checkApi, 60000);

    return () => {
      active = false;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.setAttribute('data-color-scheme', newDarkMode ? 'dark' : 'light');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 transition-all duration-300 ${
        navColour ? "backdrop-blur-md border-b shadow-sm" : ""
      }`}
      style={{
        backgroundColor: navColour ? 'var(--ds-color-neutral-background-tinted)' : 'transparent',
        borderColor: 'var(--ds-color-neutral-border-subtle)'
      }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Home + API status */}
        <div className="flex items-center gap-2">
          <NextLink
            href="/"
            aria-label="Hjem"
            style={{
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--ds-color-accent-base-default)',
              borderRadius: '0.375rem',
              color: 'var(--ds-color-accent-base-default)',
              boxShadow: 'var(--accent-shadow)',
              transition: 'all 0.2s'
            }}
          >
            <FiHome style={{ fontSize: '1.125rem' }} />
          </NextLink>

          <a
            href="https://api.vuhnger.dev/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="API status"
            style={{
              height: '2rem',
              padding: '0 0.625rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              border: '2px solid var(--ds-color-accent-base-default)',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              color: 'var(--ds-color-neutral-text-default)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              boxShadow: 'var(--accent-shadow)',
              transition: 'all 0.2s'
            }}
          >
            API
            <span
              aria-hidden="true"
              style={{
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '999px',
                backgroundColor:
                  apiStatus === "up"
                    ? "var(--ds-color-success-base-default)"
                    : apiStatus === "down"
                    ? "var(--ds-color-danger-base-default)"
                    : "var(--ds-color-neutral-border-default)"
              }}
            />
          </a>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={darkMode ? "Bytt til lys modus" : "Bytt til mørk modus"}
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
            {darkMode ? <FiSun style={{ fontSize: '1.125rem' }} /> : <FiMoon style={{ fontSize: '1.125rem' }} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
