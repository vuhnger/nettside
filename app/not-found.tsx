import Link from "next/link";
import { Heading, Paragraph } from "@digdir/designsystemet-react";

import AStarVisualization from "@/components/home/AStarVisualization";

export default function NotFound() {
  return (
    <main
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-24"
      style={{ backgroundColor: "var(--ds-color-neutral-background-default)" }}
    >
      <AStarVisualization />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <div
          className="mb-6 rounded-full border px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.25em]"
          style={{
            borderColor: "var(--ds-color-neutral-border-subtle)",
            backgroundColor:
              "color-mix(in srgb, var(--ds-color-neutral-surface-default) 80%, transparent)",
            color: "var(--ds-color-neutral-text-subtle)",
          }}
        >
          Feil 404
        </div>

        <p
          className="font-mono text-7xl font-bold leading-none tracking-tight sm:text-8xl"
          style={{ color: "var(--ds-color-accent-base-default)" }}
          aria-hidden="true"
        >
          404
        </p>

        <Heading data-size="lg" style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>
          Ingen sti funnet
        </Heading>

        <Paragraph
          data-size="sm"
          style={{ margin: 0, color: "var(--ds-color-neutral-text-default)" }}
        >
          Søkealgoritmen lette gjennom hele grafen, men fant ingen rute til
          siden du er ute etter. Den finnes nok ikke – eller så har den flyttet
          på seg.
        </Paragraph>

        <Link
          href="/"
          className="group mt-8 inline-flex items-center gap-2 rounded-md border px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-sm"
          style={{
            borderColor: "var(--ds-color-accent-border-default)",
            backgroundColor:
              "color-mix(in srgb, var(--ds-color-neutral-surface-default) 85%, transparent)",
            color: "var(--ds-color-accent-base-default)",
          }}
        >
          Tilbake til forsiden
          <span aria-hidden="true" className="transition group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </main>
  );
}
