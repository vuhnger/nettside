"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Card, Heading, Paragraph } from "@digdir/designsystemet-react";
import type { IconType } from "react-icons";
import {
  SiDocker,
  SiFastapi,
  SiKotlin,
  SiKubernetes,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiGraphql,
  SiSpringboot,
  SiCaddy,
  SiN8N,
  SiDiscord,
  SiJavascript,
  SiGit,
  SiGithub,
  SiHtml5,
  SiCss3,
  SiDjango,
} from "react-icons/si";
import AutoSnakeBackground from "@/components/projects/AutoSnakeBackground";

type Project = {
  id: string;
  title: string;
  tag: string;
  summary: string;
  details: string;
  image?: string;
  link?: string;
  stack: { label: string; icon: IconType }[];
  learningOutcomes: string[];
  sections: { title: string; description: string; image?: string }[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

const isDataImage = (src?: string) => Boolean(src && src.startsWith("data:"));
const isExternalLink = (href?: string) => (href ? /^https?:\/\//.test(href) : false);

const ProjectsPage = () => {
  const projects = useMemo<Project[]>(
    () => [
      {
        id: "kartverket-security",
        title: "Sikkerhetsmikrotjeneste for Kartverket",
        tag: "Sikkerhet i byggekjede, monitorering av webapplikasjoner",
        summary:
          "Mikrotjeneste utfører dynamiske skanninger som et steg i byggekjeden til Kartverkets webapplikasjoner.",
        details:
          "Prosjektet samler tilgangskontroll, audit logging og risikobasert overvåkning i én tjeneste med klare API-er og eventstrømmer.",
        image: "/images/logos/kartverket-logo.svg",
        link: "https://www.npmjs.com/package/@kartverket/backstage-plugin-security-metrics-frontend?activeTab=readme",
        stack: [
          { label: "Docker", icon: SiDocker },
          { label: "Kotlin", icon: SiKotlin },
          { label: "PostgreSQL", icon: SiPostgresql },
          { label: "React", icon: SiReact },
          { label: "TypeScript", icon: SiTypescript },
          { label: "GraphQL", icon: SiGraphql },
          { label: "SpringBoot", icon: SiSpringboot },
          { label: "Git", icon: SiGit },
          { label: "GitHub", icon: SiGithub },
        ],
        learningOutcomes: [
          "Angrepsvektorer i webapplikasjoner",
          "Docker",
          "Github Actions og byggekjede",
          "Full-stack utvikling",
        ],
        sections: [
          {
            title: "Introduksjon",
            description:
              "Sommeren 2025 hadde jeg sommervikariat i Bekk, der jeg jobbet hos Kartverket! Bakgrunnen for prosjektet var en satsning på digital sikkerhet hos Kartverket. Jeg jobbet på et team bestående av to sikkerhetsutviklere og to fullstack utviklere. Vi jobbet med Governance, Risc and Complience (GRC) med fokus på dynamisk applikasjonsskanning (DAST). Dynamisk skanning av applikasjoner betyr å skanne applikasjonen mens den kjører. En slik skann kan innebære å crawle applikasjonens URL for åpne endepunkter, skjemaer, inputfelt og manglende headers. Vi bygget en mikrotjeneste som bruker et verktøy for slike skanninger (Tenable) til å skanne Kartverket sine tjenester som eksponeres til internett før de deployeres.",
            image: "/images/projects/kartverket-preview.png",
          },
          {
            title: "Frontend",
            description:
              "Vi bakte metrikkene vi fikk fra skanningene inn i et dashboard i Kartverket sin utviklerportal. Av sikkerhetsmessige hensyn publiserer jeg ikke bilder av dashboardet her, men her ser du en etterlikning. Vi bygde dette som en npm-pakke for Backstage in Security Metrics plugin, som gjør det mulig å legge den til på Kartverket sin utviklerportal. På dette prosjektet utviklet jeg store deler av frontenden, herunder å lage komponenter, koble opp endepunkter og route gjennom proxy for autentisering.",
            image: "/images/projects/kartverket-dashboard.png",
          },
          {
            title: "Backend",
            description:
              "Vi brukte PostgresQL og Kotlin med SpringBoot for backenden. Her var vi nødt til å knytte resultatene fra skanningene opp mot repoene tjenestene tilhørte, slik at utviklerene i Kartverket får en oversikt over hvor sikkerhetshullene ligger. Dette gjorde vi med GitHub sitt API og GraphQL. Her satt jeg opp endepunkter og controllere. Avbildet ser du kollega og sikkerhetsutvikler Aleksander under en kodegjennomgang. :)",
            image: "/images/projects/kartverket-backend.png",
          },
          {
            title: "Morsom sommer med mye teamarbeid ☀️",
            description:
              "Hadde en veldig kul sommer i Bekk! Lærte mye om styring av team, å jobbe på større prosjekter og om sikkerhet i utvikling. ",
            image: "",
          },
        ],
      },
      {
        id: "api-vuhnger",
        title: "api.vuhnger.dev - Personlig API for mikrotjenestene mine",
        tag: "REST API",
        summary:
          "Samler endepunkter som jeg bruker på nettsiden min",
        details:
          "Eksponerer stabile API-er som har caching og rate-limits som gir pålitelig data til dashboards.",
        image: "/images/projects/api-demo.png",
        link: "https://api.vuhnger.dev/",
        stack: [
          { label: "FastAPI", icon: SiFastapi },
          { label: "Python", icon: SiPython },
          { label: "PostgreSQL", icon: SiPostgresql },
          { label: "Docker", icon: SiDocker },
          { label: "Kubernetes", icon: SiKubernetes },
          { label: "Caddy", icon: SiCaddy },
          { label: "Git", icon: SiGit },
          { label: "GitHub", icon: SiGithub },
        ],
        learningOutcomes: [
          "Stabilt API-design",
          "Sikker eksponering av endepunkter",
          "Kubernetes",
        ],
        sections: [
          {
            title: "Hvorfor i det hele tatt sette opp et REST API for dette?",
            description:
              "Det er i bunn to grunner! Først og fremst liker jeg å ha fri tilgang på min egen data, men først og fremst for å lagre roterende refresh-tokens som tillater meg å hente fersk data fra strava.",
          },
          {
            title: "Arkitektur",
            description:
              "Backenden består av tre servere; én reverse proxy, én server for APIene og én server for n8n. Jeg bruker Caddy til reverse proxy og Kubernetes til å håndtere skalering.",
          },
        ],
      },
      {
        id: "terje-aiops",
        title:
          "TERJE - KI-drevet tjeneste for monitorering og gjenoppretting av serverinfrastruktur",
        tag: "KI, Systemovervåking, Automatisering",
        summary:
          "AIOps-tjeneste som oppdager avvik, foreslår tiltak og automatiserer gjenoppretting av døde containere. ",
        details:
          "TERJE bruker logger og shell-kommandoer til å diagnosere clusteret mitt og rette opp i systemfeil autonomt. ",
        image: "/images/projects/terje-demo.png",
        link: "/projects#terje-aiops",
        stack: [
          { label: "Docker", icon: SiDocker },
          { label: "n8n", icon: SiN8N },
          { label: "JS", icon: SiJavascript },
          { label: "Discord", icon: SiDiscord },
        ],
        learningOutcomes: [
          "Analyse av metrikker, logger og hendelser",
          "Automatisering av self-healing",
          "KI, agenter og prompting",
        ],
        sections: [
          {
            title: "Men er dette egentlig programmering?",
            description:
              "Ja og nei. Dette prosjektet er mindre teknisk enn jeg pleier å jobbe. For uten å sette opp serveren og konfigurere triggere og agenter, så er ikke dette særlig komplekst, men det fungerer som et Proof-Of-Concept på hva man enkelt kan gjøre med ny teknologi.",
          },
          {
            title: "Hvordan fungerer TERJE?",
            description:
              "Terje er en KI-agent som ved jevne mellomrom kjører health-checker av tjenestene mine. Hvis de ikke ser operative ut, følger TERJE en prosedyre for å feilsøke og gjenopprette tjenestene. TERJE har en 80% suksessrate på mine ad-hoc tester, men intensjonen er å gjøre systemet smartere og mer avansert med tid. TERJE benytter en LLM chain og en Structured Output Parser for å gi outpput som kan parses til JSON og analyseres. ",
          },
          {
            title: "Hvor lurt er det å gi en KI-agent fri tilgang til å kjøre kommandoer på clusteret ditt?",
            description:
              "Godt spørsmål! Det er selvfølgelig idiotisk, men TERJE kjører med begrensede tilganger og er implementert med Human-In-The-Loop ved kommandoer som modifiserer systemet. Dette gir meg mulighet til å sjekke hvilken kommando TERJE foreslår å kjøre, gitt hvilke systemer som er nede og hva feilen er. ",
          },
          {
            title: "Hva er n8n?",
            description:
              "n8n er en plattform for automatisering med mange integrasjoner. Plattformen er low-code og veldig enkel å bruke, her er det bare kreativiteten (og din tilgang på KI-tokens) som setter grenser for hva man kan gjøre på kort tid. :)",
          },
        ],
      },
      {
        id: "vuhnger-dev",
        title: "vuhnger.dev - Personlig nettside",
        tag: "Webutvikling",
        summary:
          "Personlig hjemmeside bygget med Next.js, TailwindCSS, React og Designsystemet til DigDir som designbase.",
        details:
          "Nettsiden samler prosjekter, CV og visualiseringer jeg bruker til å forklare arbeidet mitt.",
        image: "/images/projects/website-preview.png",
        link: "https://vuhnger.dev/",
        stack: [
          { label: "Next.js", icon: SiNextdotjs },
          { label: "TypeScript", icon: SiTypescript },
          { label: "Tailwind CSS", icon: SiTailwindcss },
          { label: "Vercel", icon: SiVercel },
          { label: "Git", icon: SiGit },
          { label: "GitHub", icon: SiGithub },
        ],
        learningOutcomes: [
          "Komponentbasert design",
          "Tilgjengelighet, kontrast og responsivitet",
          "Webutvikling"
        ],
        sections: [
          {
            title: "Visuell identitet",
            description:
              "Jeg liker teknologi - særlig arkitektur og datastrukturer, jeg vil at nettsiden min skal gjenskape den identiteten. Derfor ser du blant annet et 'Minimal Spanning Tree' (MST) som bakgrunn på hovedsiden. Dette er en datastruktur som representerer den 'billigste' måten å koble alle nodene i eksempelvis et nettverk sammen. Hvis du ikke vet hva dette er, så er ikke det så farlig, men det er meningen å se litt nerdete ut. ",
            image: "/images/projects/website-mst.png",
          },
          {
            title: "Teknisk",
            description:
              "Nettsiden er ikke så kompleks, den bruker Next.js og vanilje-react, men denne gangen har jeg utfordret meg selv til å legge en innsats i å lære brukervennlig design og tilstand i webapplikasjoner.",
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
          "Plattformen revolusjonerer høyere utdanning ved å tilby studenter en ny måte å lære dateknologi på. Plattformen tar studentene gjennom oppgaver i nettverk, sikkerhet og programmering. Oppgavene presenteres som puslespill, der man må knekke koder for å komme seg videre i spillet. Spillet er også gamifisert for å øke fullføringsraten hos studentene, og det har det gjort! Studentene som har gjennomført prosjektet har høyere beståttrate på eksamen (ja, dette er nok også til dels survivorship bias, men ta gjerne kontakt hvis du vil høre mer!).",
        image: "/images/projects/universet-demo.png",
        stack: [
          { label: "React", icon: SiReact },
          { label: "HTML", icon: SiHtml5 },
          { label: "CSS", icon: SiCss3 },
          { label: "Node.js", icon: SiNodedotjs },
          { label: "Git", icon: SiGit },
          { label: "GitHub", icon: SiGithub },
          { label: "Django", icon: SiDjango },
        ],
        learningOutcomes: [
          "Full-stack utvikling",
          "Dashboarding for veiledere og emneansvarlige",
        ],
        sections: [
          {
            title: "En introduksjon til front- og backendutvikling",
            description:
              "Dette prosjektet var mitt første internship. Bildene viser hvordan prosjektet ser ut nå, etter fire år med iterasjon, men jeg utviklet på dette prosjektet sommeren 2023 og 2024!",
            image: "/images/projects/universet-chat-demo.png",
          },
          {
            title: "Første møte med REST APIer",
            description:
              "Da jeg jobbet på dette prosjektet i 2023 hadde jeg kun hatt tre emner innen programmering, derfor var læringskurven noe bratt da vi fikk beskjed om å bygge en plattform som kan håndtere oppgaveløsning, monitorering og gamifisering av studenter. Jeg lærte å sette opp databaser, endepunkter og webutvikling!",
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
            Her er noen av prosjektene jeg har jobbet med de siste årene. Hvert prosjekt inneholder en liten beskrivelse av innhold, hva jeg lærte og fremstillinger av resultater!
          </Paragraph>
          <Paragraph data-size="sm" style={{ margin: 0, color: "var(--ds-color-neutral-text-default)" }}>
            Dett er ikke en uttømmende liste og inneholder ingen prosjekter relatert til skolearbeid, sistnevnte finner du på GitHub.
          </Paragraph>
          <Paragraph data-size="xs" style={{ margin: "0.4rem 0 0", color: "var(--ds-color-neutral-text-subtle)" }}>
            Og BTW: Slangen som kjører i bakgrunnen bruker A* for å finne eplene sine :)
          </Paragraph>
        </div>

        <div className="flex flex-col gap-6">
          {projects.map((project, index) => {
            const isReversed = index % 2 === 1;
            const imageSrc = project.image;
            const hasImage = Boolean(imageSrc);
            return (
              <Card
                key={project.id}
                id={project.id}
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
                    hasImage ? (isReversed ? "md:flex-row-reverse" : "md:flex-row") : ""
                  }`}
                >
                  <div
                    className={`flex w-full flex-col gap-3 ${
                      hasImage ? "md:w-7/12" : "md:w-full"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveProject(project)}
                      aria-haspopup="dialog"
                      aria-expanded={activeProject?.id === project.id}
                      className="group flex w-full flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--ds-color-accent-base-default)] hover:shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60"
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
                  </div>

                  {imageSrc && (
                    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800/70 dark:bg-slate-900/60 md:w-5/12">
                      <Image
                        src={imageSrc}
                        alt={`Illustrasjon for ${project.title}`}
                        fill
                        sizes="(min-width: 768px) 40vw, 100vw"
                        className="object-cover"
                        unoptimized={isDataImage(imageSrc)}
                      />
                    </div>
                  )}
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
                    Teknologistakk
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
                  {activeProject.link && (
                    <a
                      href={activeProject.link}
                      target={isExternalLink(activeProject.link) ? "_blank" : undefined}
                      rel={isExternalLink(activeProject.link) ? "noopener noreferrer" : undefined}
                      aria-label={`Prosjektside for ${activeProject.title}`}
                      className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[var(--ds-color-accent-base-default)] hover:underline"
                    >
                      Prosjektside
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}
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
                  const sectionImage = section.image;
                  const hasImage = Boolean(sectionImage);
                  return (
                    <div
                      key={`${activeProject.id}-${section.title}`}
                      className={`flex flex-col gap-4 md:items-stretch ${
                        hasImage ? (isReversed ? "md:flex-row-reverse" : "md:flex-row") : ""
                      }`}
                    >
                      {sectionImage && (
                        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800/70 dark:bg-slate-900/60 md:w-5/12">
                          <Image
                            src={sectionImage}
                            alt={section.title}
                            fill
                            sizes="(min-width: 768px) 40vw, 100vw"
                            className="object-cover"
                            unoptimized={isDataImage(sectionImage)}
                          />
                        </div>
                      )}
                      <div
                        className={`flex w-full flex-col justify-center gap-3 ${
                          hasImage ? "md:w-7/12" : "md:w-full"
                        }`}
                      >
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
