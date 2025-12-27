"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Heading, Paragraph } from "@digdir/designsystemet-react";
import type { IconType } from "react-icons";
import {
  SiAndroid,
  SiDocker,
  SiFastapi,
  SiGrafana,
  SiGradle,
  SiKotlin,
  SiKubernetes,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPrometheus,
  SiPython,
  SiReact,
  SiSqlite,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from "react-icons/si";
import AutoSnakeBackground from "@/components/projects/AutoSnakeBackground";

type Project = {
  id: string;
  title: string;
  tag: string;
  summary: string;
  details: string;
  image: string;
  stack: { label: string; icon: IconType }[];
  learningOutcomes: string[];
  sections: { title: string; description: string; image: string }[];
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
        id: "kartverket-security",
        title: "Sikkerhetsmikrotjeneste for Kartverket",
        tag: "Offentlig sikkerhet",
        summary:
          "Mikrotjeneste som håndterer sikkerhetskontroller, policy og revisjon i Kartverkets plattform.",
        details:
          "Prosjektet samler tilgangskontroll, audit logging og risikobasert overvåkning i én tjeneste med klare API-er og eventstrømmer.",
        image: buildPlaceholderImage("Kartverket", "#2563eb", "#38bdf8"),
        stack: [
          { label: "Kubernetes", icon: SiKubernetes },
          { label: "FastAPI", icon: SiFastapi },
          { label: "PostgreSQL", icon: SiPostgresql },
          { label: "Docker", icon: SiDocker },
        ],
        learningOutcomes: [
          "Policy-as-code og revisjonsspor for kritiske tjenester",
          "Tjenestegrenser med tydelig ansvar i sikkerhetsdomenet",
          "Observability og drift for sensitiv infrastruktur",
        ],
        sections: [
          {
            title: "Mandat og risikobilde",
            description:
              "Definerer sikkerhetskravene som må verifiseres i plattformen, med fokus på tilgangskontroll og sporbarhet.",
            image: buildPlaceholderImage("Risikobilde", "#1e3a8a", "#38bdf8"),
          },
          {
            title: "Kontrollplan og hendelser",
            description:
              "Mikrotjenesten orkestrerer kontrollpunkter og publiserer hendelser til resten av systemet for audit og varsling.",
            image: buildPlaceholderImage("Kontrollplan", "#0f172a", "#22d3ee"),
          },
        ],
      },
      {
        id: "terje-aiops",
        title:
          "TERJE - KI-drevet tjeneste for monitorering og gjenoppretting av serverinfrastruktur",
        tag: "AIOps",
        summary:
          "AIOps-tjeneste som oppdager avvik, foreslår tiltak og automatiserer gjenoppretting.",
        details:
          "Kombinerer metrikker, logger og hendelser til et beslutningslag som prioriterer tiltak og reduserer nedetid i drift.",
        image: buildPlaceholderImage("TERJE", "#0ea5e9", "#22d3ee"),
        stack: [
          { label: "Python", icon: SiPython },
          { label: "Prometheus", icon: SiPrometheus },
          { label: "Grafana", icon: SiGrafana },
          { label: "Kubernetes", icon: SiKubernetes },
        ],
        learningOutcomes: [
          "Korrelasjon av metrikker, logger og hendelser",
          "Automatiserte runbooks og self-healing workflows",
          "Evaluering av KI-forslag mot driftssikkerhet",
        ],
        sections: [
          {
            title: "Signalgrunnlag",
            description:
              "Samler tidsserier og loggdata til et samlet beslutningsgrunnlag for anbefalinger.",
            image: buildPlaceholderImage("Signalgrunnlag", "#0ea5e9", "#38bdf8"),
          },
          {
            title: "Gjenoppretting og tiltak",
            description:
              "Definerer gjenopprettingsplaner som kan trigges automatisk eller manuelt når terskler brytes.",
            image: buildPlaceholderImage("Gjenoppretting", "#0f766e", "#22d3ee"),
          },
        ],
      },
      {
        id: "api-vuhnger",
        title: "api.vuhnger.dev - Personlig API for mikrotjenestene mine",
        tag: "Plattform",
        summary:
          "Samler interne endepunkter for Strava, Wakatime og små automasjoner.",
        details:
          "Tjenestelaget eksponerer stabile API-er, caching og rate-limits som gir pålitelig data til dashboards og widgets.",
        image: buildPlaceholderImage("api.vuhnger.dev", "#334155", "#64748b"),
        stack: [
          { label: "FastAPI", icon: SiFastapi },
          { label: "PostgreSQL", icon: SiPostgresql },
          { label: "Docker", icon: SiDocker },
          { label: "Kubernetes", icon: SiKubernetes },
        ],
        learningOutcomes: [
          "Stabil API-design med versjonering og caching",
          "Sikker eksponering av persondata og private endepunkter",
          "Observability og rask feilsøking i små tjenester",
        ],
        sections: [
          {
            title: "API-oversikt",
            description:
              "Konsoliderer flere mikrotjenester bak et ryddig API-lag som er enkelt å videreutvikle.",
            image: buildPlaceholderImage("API-oversikt", "#1e293b", "#0ea5e9"),
          },
          {
            title: "Drift og vedlikehold",
            description:
              "Fokus på enkel utrulling, overvåkning og trygg eksponering av interne data.",
            image: buildPlaceholderImage("Drift", "#475569", "#94a3b8"),
          },
        ],
      },
      {
        id: "vuhnger-dev",
        title: "vuhnger.dev - Personlig nettside",
        tag: "Produkt",
        summary:
          "Portfolio og labs bygget i Next.js med App Router og Designsystemet som designbase.",
        details:
          "Nettsiden samler prosjekter, CV og eksperimenter med fokus på typografi, responsivitet og rask iterasjon.",
        image: buildPlaceholderImage("vuhnger.dev", "#14b8a6", "#22c55e"),
        stack: [
          { label: "Next.js", icon: SiNextdotjs },
          { label: "TypeScript", icon: SiTypescript },
          { label: "Tailwind CSS", icon: SiTailwindcss },
          { label: "Vercel", icon: SiVercel },
        ],
        learningOutcomes: [
          "Komponentbasert design og typografisk hierarki",
          "Tilgjengelighet, kontrast og responsivitet",
          "Effektiv release-flyt og observasjon i prod",
        ],
        sections: [
          {
            title: "Visuell identitet",
            description:
              "Kombinerer design-tokens med håndlagde layoutvalg for å bygge en tydelig visuell profil.",
            image: buildPlaceholderImage("Visuell identitet", "#0f766e", "#34d399"),
          },
          {
            title: "Interaksjoner og historiefortelling",
            description:
              "Mikrointeraksjoner, animasjoner og tekstflyt gjør innholdet lettere å navigere.",
            image: buildPlaceholderImage("Interaksjoner", "#15803d", "#4ade80"),
          },
        ],
      },
      {
        id: "universet",
        title:
          "Universet - Læringsplattform og monitorering av studenter på Universitetet i Oslo",
        tag: "Utdanning",
        summary:
          "Læringsplattform for oppfølging, innsikt og progresjon i kurs og undervisning.",
        details:
          "Kombinerer innleveringsdata, aktivitet og varsling for veiledere som trenger rask oversikt.",
        image: buildPlaceholderImage("Universet", "#8b5cf6", "#ec4899"),
        stack: [
          { label: "React", icon: SiReact },
          { label: "Node.js", icon: SiNodedotjs },
          { label: "PostgreSQL", icon: SiPostgresql },
          { label: "Docker", icon: SiDocker },
        ],
        learningOutcomes: [
          "Datamodell for progresjon og aktivitet i læring",
          "Personvern, roller og tilgangskontroll i utdanning",
          "Dashboarding for veiledere og emneansvarlige",
        ],
        sections: [
          {
            title: "Læringsflyt",
            description:
              "Støtter innleveringer, tilbakemeldinger og progresjon med en tydelig studentreise.",
            image: buildPlaceholderImage("Læringsflyt", "#7c3aed", "#ec4899"),
          },
          {
            title: "Monitorering og innsikt",
            description:
              "Bygger oversikt over aktivitet, risiko og tiltak for å følge opp studentene.",
            image: buildPlaceholderImage("Innsikt", "#6d28d9", "#a855f7"),
          },
        ],
      },
      {
        id: "vannplan",
        title: "Vannplan - Kotlin-app for planlegging av vannforbruk",
        tag: "Mobil",
        summary:
          "Mobilapp for planlegging av vanningsrutiner og oppfølging av forbruk over tid.",
        details:
          "Fokuserer på enkel planlegging, offline-støtte og historikk som gir bedre oversikt.",
        image: buildPlaceholderImage("Vannplan", "#f97316", "#facc15"),
        stack: [
          { label: "Kotlin", icon: SiKotlin },
          { label: "Android", icon: SiAndroid },
          { label: "SQLite", icon: SiSqlite },
          { label: "Gradle", icon: SiGradle },
        ],
        learningOutcomes: [
          "Offline-first arbeidsflyt og lokal lagring",
          "State-håndtering og ytelse på mobil",
          "Modularisering av Kotlin-baserte features",
        ],
        sections: [
          {
            title: "Planlegging og påminnelser",
            description:
              "Gjør det enkelt å sette opp planer og varsler for vanningsrutiner.",
            image: buildPlaceholderImage("Planlegging", "#f97316", "#fdba74"),
          },
          {
            title: "Data og historikk",
            description:
              "Lagrer historikk lokalt og gir innsikt i forbruk over tid.",
            image: buildPlaceholderImage("Historikk", "#d97706", "#f59e0b"),
          },
        ],
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
            Utvalgte prosjekter innen sikkerhet, AIOps, plattform og produktutvikling.
          </Paragraph>
          <Paragraph data-size="xs" style={{ margin: "0.4rem 0 0", color: "var(--ds-color-neutral-text-subtle)" }}>
            Klikk på et prosjekt for detaljer. BTW: Slangen som kjører i bakgrunnen bruker A*-pathfinding for å finne eplene sine.
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
                        {project.tag}
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
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8">
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
            className="relative z-10 w-full max-w-6xl rounded-3xl border border-slate-200/80 bg-white/95 shadow-2xl dark:border-slate-700/70 dark:bg-slate-950/95"
          >
            <div className="p-6 md:p-8">
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

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-700/70 dark:bg-slate-900/60">
                  <div className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                    Tech stack
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {activeProject.stack.map((item) => (
                      <span
                        key={item.label}
                        role="img"
                        aria-label={item.label}
                        title={item.label}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-700 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-200"
                      >
                        <item.icon className="text-xl" aria-hidden="true" />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-700/70 dark:bg-slate-900/60">
                  <div className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                    Læringsutbytte
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                    {activeProject.learningOutcomes.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span
                          aria-hidden="true"
                          className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--ds-color-accent-base-default)]"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-6">
                {activeProject.sections.map((section, index) => {
                  const isReversed = index % 2 === 1;
                  return (
                    <div
                      key={`${activeProject.id}-${section.title}`}
                      className={`flex flex-col gap-4 md:items-stretch ${
                        isReversed ? "md:flex-row-reverse" : "md:flex-row"
                      }`}
                    >
                      <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800/70 dark:bg-slate-900/60 md:w-5/12">
                        <img
                          src={section.image}
                          alt={section.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex w-full flex-col justify-center gap-3 md:w-7/12">
                        <Heading data-size="sm" style={{ marginBottom: 0 }}>
                          {section.title}
                        </Heading>
                        <Paragraph
                          data-size="sm"
                          style={{ margin: 0, color: "var(--ds-color-neutral-text-default)" }}
                        >
                          {section.description}
                        </Paragraph>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
