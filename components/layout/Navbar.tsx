"use client";

import NextLink from "next/link";
import { useState, useEffect } from "react";
import { Link, Button, Switch } from "@digdir/designsystemet-react";
import { AiFillGithub } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";

const Navbar = () => {
  const [expand, setExpand] = useState(false);
  const [navColour, setNavColour] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme preference
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.setAttribute('data-color-scheme', 'dark');
    }

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
    { name: "Hjem", path: "/" },
    { name: "Mer om meg?", path: "/about" },
    { name: "CV", path: "/cv" },
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              asChild
            >
              <NextLink href={item.path}>{item.name}</NextLink>
            </Link>
          ))}

          {/* Theme Toggle */}
          <Switch
            checked={darkMode}
            onChange={toggleTheme}
            data-size="sm"
            aria-label="Bytt til mørk modus"
          />

          {/* GitHub Button */}
          <Button
            asChild
            data-size="sm"
            variant="primary"
          >
            <a
              href="https://github.com/vuhnger"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <AiFillGithub style={{ fontSize: '1rem' }} />
              <span>GitHub</span>
            </a>
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setExpand(!expand)}
          className="md:hidden text-xl transition-colors"
          style={{ color: 'var(--ds-color-accent-base-default)' }}
        >
          {expand ? <IoMdClose /> : <GiHamburgerMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {expand && (
        <div className="md:hidden overflow-hidden">
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

            {/* Theme Toggle Mobile */}
            <div className="flex items-center gap-3 px-4">
              <span style={{ fontSize: '0.875rem' }}>Mørk modus</span>
              <Switch
                checked={darkMode}
                onChange={toggleTheme}
                data-size="sm"
                aria-label="Bytt til mørk modus"
              />
            </div>

            <Button
              asChild
              variant="primary"
              data-size="sm"
            >
              <a
                href="https://github.com/vuhnger"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
              >
                <AiFillGithub style={{ fontSize: '1.25rem' }} />
                <span>GitHub</span>
              </a>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
