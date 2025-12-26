"use client";

import NextLink from "next/link";
import { useState, useEffect } from "react";
import { Link } from "@digdir/designsystemet-react";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { FiSun, FiMoon } from "react-icons/fi";

const Navbar = () => {
  const [expand, setExpand] = useState(false);
  const [navColour, setNavColour] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.setAttribute('data-color-scheme', 'dark');
      }
      return isDark;
    }
    return false;
  });

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

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.setAttribute('data-color-scheme', newDarkMode ? 'dark' : 'light');
  };

  const navItems = [
    { name: "Om meg?", path: "/about" },
    { name: "Prosjekter", path: "/projects" },
    { name: "Spill", path: "/game" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 transition-all duration-300 ${
        navColour ? "backdrop-blur-md border-b shadow-sm" : ""
      }`}
      style={{
        backgroundColor: navColour ? 'var(--ds-color-neutral-background-subtle)' : 'transparent',
        borderColor: 'var(--ds-color-neutral-border-subtle)'
      }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <NextLink href="/" className="text-xl font-bold" style={{ color: 'var(--ds-color-accent-base-default)' }}>
          VU
        </NextLink>

        {/* Right side: Theme toggle + Hamburger */}
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
              border: '1px solid var(--ds-color-neutral-border-default)',
              borderRadius: '0.375rem',
              backgroundColor: 'transparent',
              color: 'var(--ds-color-accent-base-default)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {darkMode ? <FiSun style={{ fontSize: '1.125rem' }} /> : <FiMoon style={{ fontSize: '1.125rem' }} />}
          </button>

          {/* Hamburger Menu */}
          <button
            onClick={() => setExpand(!expand)}
            aria-label={expand ? "Lukk meny" : "Åpne meny"}
            style={{
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--ds-color-neutral-border-default)',
              borderRadius: '0.375rem',
              backgroundColor: 'transparent',
              color: 'var(--ds-color-accent-base-default)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {expand ? <IoMdClose style={{ fontSize: '1.125rem' }} /> : <GiHamburgerMenu style={{ fontSize: '1.125rem' }} />}
          </button>
        </div>
      </div>

      {/* Menu */}
      {expand && (
        <div className="overflow-hidden">
          <div className="flex flex-col gap-4 pt-6 pb-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                asChild
              >
                <NextLink href={item.path} onClick={() => setExpand(false)}>
                  {item.name}
                </NextLink>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
