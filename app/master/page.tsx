"use client";

import NextLink from "next/link";
import { Card, Heading, Link, Paragraph } from "@digdir/designsystemet-react";
import { MASTER_INFO, MASTER_TIMELINE } from "@/lib/master";

const MasterPage = () => {
  const timeline = [
    { label: "Oppstart", value: MASTER_TIMELINE.start.split("T")[0] },
    { label: "Levering", value: MASTER_TIMELINE.end.split("T")[0] },
  ];

  return (
    <div
      className="min-h-screen pt-20 pb-12 px-4"
      style={{ backgroundColor: "var(--ds-color-neutral-background-default)" }}
    >
      <div className="mx-auto max-w-3xl">
        <Card
          className="relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{
            padding: "1.5rem",
            backgroundColor:
              "color-mix(in srgb, var(--ds-color-neutral-background-default) 92%, transparent)",
            backgroundImage:
              "linear-gradient(140deg, color-mix(in srgb, var(--ds-color-accent-second-subtle) 55%, transparent), transparent 60%)",
            border: "2px solid var(--ds-color-neutral-border-strong)",
            boxShadow: "0 18px 30px rgba(0, 0, 0, 0.08)",
          }}
        >
          <header className="border-b pb-4" style={{ borderColor: "var(--ds-color-neutral-border-subtle)" }}>
            <div className="flex flex-wrap items-center gap-3">
              <Heading data-size="lg" style={{ marginBottom: 0 }}>
                {MASTER_INFO.title}
              </Heading>
              <span
                className="rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em]"
                style={{
                  borderColor: "var(--ds-color-accent-base-default)",
                  color: "var(--ds-color-accent-base-default)",
                }}
              >
                {MASTER_INFO.status}
              </span>
            </div>
            <Paragraph data-size="sm" style={{ margin: "0.25rem 0 0", color: "var(--ds-color-neutral-text-default)" }}>
              {MASTER_INFO.subtitle}
            </Paragraph>
            <Paragraph data-size="xs" style={{ margin: "0.5rem 0 0", color: "var(--ds-color-neutral-text-default)" }}>
              {MASTER_INFO.summary}
            </Paragraph>
          </header>

          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            {MASTER_INFO.highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-md border p-3 transition hover:-translate-y-0.5 hover:border-[var(--ds-color-accent-base-default)] hover:shadow-sm motion-reduce:transform-none"
                style={{
                  borderColor: "var(--ds-color-neutral-border-subtle)",
                  backgroundColor:
                    "color-mix(in srgb, var(--ds-color-neutral-background-default) 88%, transparent)",
                }}
              >
                <Paragraph data-size="xs" style={{ marginBottom: "0.25rem", fontWeight: 600 }}>
                  {item.label}
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, color: "var(--ds-color-neutral-text-default)" }}>
                  {item.value}
                </Paragraph>
              </div>
            ))}
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            <div
              className="rounded-md border p-3 transition hover:-translate-y-0.5 hover:border-[var(--ds-color-accent-second-default)] hover:shadow-sm motion-reduce:transform-none"
              style={{
                borderColor: "var(--ds-color-neutral-border-subtle)",
                backgroundColor:
                  "color-mix(in srgb, var(--ds-color-neutral-background-default) 88%, transparent)",
              }}
            >
              <Heading data-size="sm" style={{ marginBottom: "0.5rem", color: "var(--ds-color-accent-second-default)" }}>
                Fokusomrader
              </Heading>
              <ul className="list-disc pl-4 text-xs" style={{ color: "var(--ds-color-neutral-text-default)" }}>
                {MASTER_INFO.focusAreas.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-md border p-3 transition hover:-translate-y-0.5 hover:border-[var(--ds-color-accent-second-default)] hover:shadow-sm motion-reduce:transform-none"
              style={{
                borderColor: "var(--ds-color-neutral-border-subtle)",
                backgroundColor:
                  "color-mix(in srgb, var(--ds-color-neutral-background-default) 88%, transparent)",
              }}
            >
              <Heading data-size="sm" style={{ marginBottom: "0.5rem", color: "var(--ds-color-accent-second-default)" }}>
                Metode
              </Heading>
              <ul className="list-disc pl-4 text-xs" style={{ color: "var(--ds-color-neutral-text-default)" }}>
                {MASTER_INFO.methods.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            <div
              className="rounded-md border p-3 transition hover:-translate-y-0.5 hover:border-[var(--ds-color-accent-base-default)] hover:shadow-sm motion-reduce:transform-none"
              style={{
                borderColor: "var(--ds-color-neutral-border-subtle)",
                backgroundColor:
                  "color-mix(in srgb, var(--ds-color-neutral-background-default) 88%, transparent)",
              }}
            >
              <Heading data-size="sm" style={{ marginBottom: "0.5rem", color: "var(--ds-color-accent-base-default)" }}>
                Teknologi
              </Heading>
              <div className="flex flex-wrap gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.15em]">
                {MASTER_INFO.stack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border px-2 py-1"
                    style={{
                      borderColor: "var(--ds-color-neutral-border-default)",
                      color: "var(--ds-color-neutral-text-default)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div
              className="rounded-md border p-3 transition hover:-translate-y-0.5 hover:border-[var(--ds-color-accent-base-default)] hover:shadow-sm motion-reduce:transform-none"
              style={{
                borderColor: "var(--ds-color-neutral-border-subtle)",
                backgroundColor:
                  "color-mix(in srgb, var(--ds-color-neutral-background-default) 88%, transparent)",
              }}
            >
              <Heading data-size="sm" style={{ marginBottom: "0.5rem", color: "var(--ds-color-accent-base-default)" }}>
                Tidslinje
              </Heading>
              <div className="space-y-2 text-xs" style={{ color: "var(--ds-color-neutral-text-default)" }}>
                {timeline.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-6 text-center">
            <Link href="/" asChild>
              <NextLink
                href="/"
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:-translate-y-0.5 hover:border-[var(--ds-color-accent-base-default)] hover:text-[var(--ds-color-accent-base-default)] motion-reduce:transform-none"
                style={{ borderColor: "var(--ds-color-neutral-border-default)" }}
              >
                Tilbake til forsiden
              </NextLink>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MasterPage;
