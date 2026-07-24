"use client";

import { useEffect } from "react";
import { Heading, Paragraph } from "@digdir/designsystemet-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-24"
      style={{ backgroundColor: "var(--ds-color-neutral-background-default)" }}
    >
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <Heading data-size="lg" style={{ margin: 0 }}>
          Noe gikk galt
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ margin: 0, color: "var(--ds-color-neutral-text-default)" }}
        >
          Det oppsto en uventet feil. Prøv igjen, så laster vi siden på nytt.
        </Paragraph>
        <button
          type="button"
          onClick={reset}
          className="mt-2 inline-flex items-center gap-2 rounded-md border px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-sm"
          style={{
            borderColor: "var(--ds-color-accent-border-default)",
            backgroundColor:
              "color-mix(in srgb, var(--ds-color-neutral-surface-default) 85%, transparent)",
            color: "var(--ds-color-accent-base-default)",
          }}
        >
          Prøv igjen
        </button>
      </div>
    </main>
  );
}
