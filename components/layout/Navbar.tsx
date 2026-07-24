import { Link as NextLink } from "next-view-transitions";
import { House } from "lucide-react";
import { Suspense } from "react";
import BackgroundVisualizationToggle from "./BackgroundVisualizationToggle";
import PrefetchedApiStatusLink from "./PrefetchedApiStatusLink";
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
        {/* Home + API link */}
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
              transition: 'color 0.2s, background-color 0.2s, box-shadow 0.2s'
            }}
          >
            <House aria-hidden="true" size={17} strokeWidth={2.25} absoluteStrokeWidth />
          </NextLink>

          <Suspense fallback={null}>
            <PrefetchedApiStatusLink />
          </Suspense>
        </div>

        <div className="flex items-center gap-2">
          <BackgroundVisualizationToggle />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
