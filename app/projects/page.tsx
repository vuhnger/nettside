"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Heading, Paragraph } from "@digdir/designsystemet-react";
import AutoSnakeBackground from "@/components/projects/AutoSnakeBackground";

type Project = {
  id: string;
  title: string;
  summary: string;
  details: string;
  highlights: { label: string; value: string }[];
  image: string;
};

const buildPlaceholderImage = (title: string, accent: string, accentTwo: string) => {
  const svg = `
    <svg width="720" height="480" viewBox="0 0 720 480" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="${accentTwo}" />
        </linearGradient>
        <linearGradient id="glow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="white" stop-opacity="0.1" />
          <stop offset="100%" stop-color="white" stop-opacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="720" height="480" rx="32" fill="url(#bg)" />
      <circle cx="580" cy="90" r="90" fill="url(#glow)" />
      <circle cx="120" cy="380" r="120" fill="url(#glow)" />
      <rect x="60" y="80" width="260" height="36" rx="18" fill="rgba(255,255,255,0.35)" />
      <rect x="60" y="140" width="340" height="20" rx="10" fill="rgba(255,255,255,0.2)" />
      <rect x="60" y="175" width="300" height="20" rx="10" fill="rgba(255,255,255,0.15)" />
      <text x="60" y="110" fill="white" font-size="20" font-family="Arial, sans-serif" font-weight="600">
        ${title}
      </text>
      <text x="60" y="220" fill="white" font-size="14" font-family="Arial, sans-serif" opacity="0.8">
        Placeholder visual
      </text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const ProjectsPage = () => {
  const projects = useMemo<Project[]>(
    () => [
      {
        id: "project-01",
        title: "Prosjekt 01",
        summary: "Placeholder for et fremtidig prosjekt med fokus på distribuert edge-telemetri.",
        details:
          "Detaljert prosjektinfo kommer senere. Dette er en midlertidig plassholder som viser hvordan caset skal presenteres.",
        highlights: [
          { label: "Status", value: "Skisse" },
          { label: "Tema", value: "Edge telemetri" },
          { label: "Format", value: "Prototype" },
        ],
        image: buildPlaceholderImage("Prosjekt 01", "#2563eb", "#38bdf8"),
      },
      {
        id: "project-02",
        title: "Prosjekt 02",
        summary: "Placeholder for et prosjekt som handler om pålitelig tjenesteoppdagelse.",
        details:
          "Mer informasjon kommer. Denne plassen er reservert for bakgrunn, mål og resultater.",
        highlights: [
          { label: "Status", value: "Planlagt" },
          { label: "Tema", value: "Service mesh" },
          { label: "Format", value: "Feltstudie" },
        ],
        image: buildPlaceholderImage("Prosjekt 02", "#0ea5e9", "#22d3ee"),
      },
      {
        id: "project-03",
        title: "Prosjekt 03",
        summary: "Placeholder for et case rundt robusthetstesting på ressurs-svake noder.",
        details:
          "Her kommer detaljer om testoppsett, målinger og innsikt når prosjektet er klart.",
        highlights: [
          { label: "Status", value: "Konsept" },
          { label: "Tema", value: "Robusthet" },
          { label: "Format", value: "Benchmark" },
        ],
        image: buildPlaceholderImage("Prosjekt 03", "#8b5cf6", "#ec4899"),
      },
      {
        id: "project-04",
        title: "Prosjekt 04",
        summary: "Placeholder for visualisering av kontrollplan vs edge-behavior under feil.",
        details:
          "Innholdet vil beskrive scenarioer, metoder og læring fra eksperimentene.",
        highlights: [
          { label: "Status", value: "Idé" },
          { label: "Tema", value: "Kontrollplan" },
          { label: "Format", value: "Visualisering" },
        ],
        image: buildPlaceholderImage("Prosjekt 04", "#14b8a6", "#22c55e"),
      },
      {
        id: "project-05",
        title: "Prosjekt 05",
        summary: "Placeholder for prosjekt om edge-sikkerhet og gjenoppretting etter brudd.",
        details:
          "Detaljer kommer senere, inkludert verktøy, trusselforståelse og resultatmålinger.",
        highlights: [
          { label: "Status", value: "Skisse" },
          { label: "Tema", value: "Sikkerhet" },
          { label: "Format", value: "Case" },
        ],
        image: buildPlaceholderImage("Prosjekt 05", "#f97316", "#facc15"),
      },
      {
        id: "project-06",
        title: "Prosjekt 06",
        summary: "Placeholder for et prosjekt om overvåkning og resiliente ruterstrategier.",
        details:
          "Legges inn senere. Vil dekke måledata, dashboards og operative funn.",
        highlights: [
          { label: "Status", value: "Planlagt" },
          { label: "Tema", value: "Observability" },
          { label: "Format", value: "Dashboard" },
        ],
        image: buildPlaceholderImage("Prosjekt 06", "#334155", "#64748b"),
      },
    ],
    []
  );

  const [activeProject, setActiveProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!activeProject) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveProject(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeProject]);

  return (
    <div
      className="relative min-h-screen overflow-hidden pt-20 pb-16 px-4"
      style={{ backgroundColor: "var(--ds-color-neutral-background-default)" }}
    >
      <AutoSnakeBackground />
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-8">
          <Heading data-size="lg" style={{ marginBottom: "0.25rem" }}>
            Prosjekter
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, color: "var(--ds-color-neutral-text-default)" }}>
            Her kommer prosjektene mine. Foreløpig er dette seks placeholders som viser layouten.
          </Paragraph>
          <Paragraph data-size="xs" style={{ margin: "0.4rem 0 0", color: "var(--ds-color-neutral-text-subtle)" }}>
            BTW: Slangen som kjører i bakgrunnen bruker A*-pathfinding for å finne eplene sine.
          </Paragraph>
        </div>

        <div className="flex flex-col gap-6">
          {projects.map((project, index) => {
            const isReversed = index % 2 === 1;
            return (
              <Card
                key={project.id}
                className="relative overflow-hidden"
                style={{
                  padding: "1.5rem",
                  backgroundColor:
                    "color-mix(in srgb, var(--ds-color-neutral-background-default) 94%, transparent)",
                  border: "2px solid var(--ds-color-neutral-border-strong)",
                  boxShadow: "0 12px 24px rgba(0, 0, 0, 0.06)",
                }}
              >
                <div
                  className={`flex flex-col gap-4 md:items-stretch ${
                    isReversed ? "md:flex-row-reverse" : "md:flex-row"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveProject(project)}
                    aria-haspopup="dialog"
                    aria-expanded={activeProject?.id === project.id}
                    className="group flex w-full flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--ds-color-accent-base-default)] hover:shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60 md:w-7/12"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                        Placeholder prosjekt
                      </div>
                      <Heading data-size="sm" style={{ marginBottom: 0 }}>
                        {project.title}
                      </Heading>
                      <Paragraph data-size="sm" style={{ margin: 0, color: "var(--ds-color-neutral-text-default)" }}>
                        {project.summary}
                      </Paragraph>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--ds-color-accent-base-default)]">
                      Les mer
                      <span aria-hidden="true" className="transition group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </button>

                  <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800/70 dark:bg-slate-900/60 md:w-5/12">
                    <img
                      src={project.image}
                      alt={`Illustrasjon for ${project.title}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60"
            onClick={() => setActiveProject(null)}
            aria-label="Lukk prosjekt"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${activeProject.id}-title`}
            aria-describedby={`${activeProject.id}-details`}
            className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-2xl dark:border-slate-700/70 dark:bg-slate-950/95"
          >
            <div className="flex items-start justify-between gap-4">
              <Heading data-size="md" id={`${activeProject.id}-title`} style={{ marginBottom: 0 }}>
                {activeProject.title}
              </Heading>
              <button
                type="button"
                className="rounded-full border border-slate-200/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-[var(--ds-color-accent-base-default)] hover:text-[var(--ds-color-accent-base-default)] dark:border-slate-700/70 dark:text-slate-300"
                onClick={() => setActiveProject(null)}
              >
                Lukk
              </button>
            </div>
            <Paragraph
              data-size="sm"
              id={`${activeProject.id}-details`}
              style={{ margin: "0.75rem 0 0", color: "var(--ds-color-neutral-text-default)" }}
            >
              {activeProject.details}
            </Paragraph>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {activeProject.highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 dark:border-slate-700/70 dark:bg-slate-900/60"
                >
                  <div className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                    {item.label}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
