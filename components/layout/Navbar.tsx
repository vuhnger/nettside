import NextLink from "next/link";
import { House } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b px-4 py-3 backdrop-blur-md"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--ds-color-neutral-background-tinted) 88%, transparent)',
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
            <House aria-hidden="true" size={17} strokeWidth={2.25} absoluteStrokeWidth />
          </NextLink>

          <a
            href="https://api.vuhnger.dev/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="API"
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
                backgroundColor: 'var(--ds-color-accent-base-default)'
              }}
            />
          </a>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
