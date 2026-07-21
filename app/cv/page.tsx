import NextLink from "next/link";
import Image from "next/image";
import { Card, Heading, Link, Paragraph } from "@digdir/designsystemet-react";
import { FaLinkedinIn, FaGithub, FaGitAlt, FaDocker, FaFigma } from "react-icons/fa";
import {
  SiGooglecloud,
  SiPostgresql,
  SiFastapi,
  SiKotlin,
  SiTypescript,
  SiTailwindcss,
  SiNextdotjs
} from "react-icons/si";
import { FaJava, FaPython, FaReact, FaHtml5 } from "react-icons/fa";
import { FiMail, FiChevronRight } from "react-icons/fi";
import AccessibleDialog from "@/components/ui/accessible-dialog";

type Experience = {
  id: string;
  company: string;
  location: string;
  role: string;
  period: string;
  summary: string;
  details: string[];
  logo: string;
};

const education = [
  {
    school: "Universitetet i Oslo",
    location: "Oslo",
    program: "Master i programmering og systemarkitektur",
    period: "2025 - ",
    details: ["Snitt: B"]
  },
  {
    school: "Universitetet i Oslo",
    location: "Oslo",
    program: "Bachelor i informatikk",
    period: "2022 - 2025",
    details: ["Snitt: B"]
  }
];

const experience: Experience[] = [
  {
    id: "dr-dropin",
    company: "Dr. Dropin Bedrift",
    location: "Oslo",
    role: "Utvikler",
    period: "2025 - ",
    summary: "Utvikler på deltid ved siden av mastergraden.",
    details: [
      "Jobber med tiltak som forbedrer effektivitet på tvers av forretningsplattformer.",
      "Automatisering og integrasjon for bedriftshelsetjenesten.",
      "Teknisk leder for ny sykefraværsplattform.",
    ],
    logo: "/images/logos/drdropin-logo.png"
  },
  {
    id: "bekk",
    company: "Bekk",
    location: "Oslo",
    role: "Utvikler (intern)",
    period: "2025 - 2025",
    summary: "Sikkerhetsmikrotjeneste for Kartverket.",
    details: [
      "Bygget en mikrotjeneste som automatiserte og rapporterte resultater fra dynamisk applikasjonstesting.",
      "Frontend i React + TypeScript, backend i Kotlin med Spring Boot.",
      "Jobbet i et tverrfaglig team på fire."
    ],
    logo: "/images/logos/bekk-logo.jpeg"
  },
  {
    id: "uio-admin",
    company: "Institutt for informatikk, Universitetet i Oslo",
    location: "Oslo",
    role: "Konsulent",
    period: "2023 - 2025",
    summary: "Deltidsrolle i studieadministrasjon og veiledning.",
    details: [
      "Saksbehandling, veiledning og administrative oppgaver i studieadministrasjonen.",
      "Krevde taushetsplikt og høy integritet."
    ],
    logo: "/images/logos/uio-logo.jpg"
  },
  {
    id: "uio-intern-2024",
    company: "Institutt for informatikk, Universitetet i Oslo",
    location: "Oslo",
    role: "Utvikler (intern)",
    period: "2024 - 2024",
    summary: "Fullstack-app for oppfølging av oppgaveresultater.",
    details: [
      "Medlem av et 10-studenters team som utviklet en fullstack-app for førsteårsstudenter i informatikk.",
      "Fokus på frontendutvikling, input-validering og oppgavedesign.",
      "Bygget REST-API med Django, frontend i React + TypeScript, containerisert med Docker."
    ],
    logo: "/images/logos/uio-logo.jpg"
  },
  {
    id: "uio-intern-2023",
    company: "Institutt for informatikk, Universitetet i Oslo",
    location: "Oslo",
    role: "Utvikler (intern)",
    period: "2023 - 2023",
    summary: "Gamifiseringsplattform for førsteårsstudenter i informatikk.",
    details: [
      "Utviklet en gamifiseringsplattform i et tverrfaglig team.",
      "Skrevet i TypeScript med React, deployet og brukt som alternativ til tradisjonelle innleveringer."
    ],
    logo: "/images/logos/uio-logo.jpg"
  },
  {
    id: "ta",
    company: "Institutt for informatikk, Universitetet i Oslo",
    location: "Oslo",
    role: "Undervisningsassistent",
    period: "2023 - 2025",
    summary: "Undervisningsassistent i flere emner.",
    details: [
      "Undervisningsassistent i følgende emner: ",
      "IN2000 - Software Engineering med Prosjektarbeid, der jeg veiledet ca. 7 team på 6 studenter gjennom et prosjekt i apputvikling med Kotlin.",
      "IN2010 - Algoritmer og Datastrukturer, der jeg rettet innleveringer!",
      "IN1020 - Introduksjon til datateknologi, der jeg undervist og holdt forelesning i kurset.",
      "IN1010 - Objektorientert programmering, der jeg har undervist i objektorientering med Java og holdt forberedningstimer til eksamen for studentene. ",
      "IN2031 - Prosjektoppgave i programmering, der studentene lager en interpret for et domenespesifikt programmeringsspråk som kontrollerer droner. Har vurdert studentene i kurset.",
      "IN3240 - Testing av programvare, der jeg har sensurert studentene i kurset. ",
      "Jeg har også fulgt opp 70 studenter i et gamifisert undervisningsopplegg (høst 2023).",
    ],
    logo: "/images/logos/uio-logo.jpg"
  },
  {
    id: "military",
    company: "Forsvaret",
    location: "Værnes",
    role: "Militærtjeneste",
    period: "2020 - 2021",
    summary: "Militærtjeneste i HV-12 på Værnes garnison.",
    details: [
      "Valgt som tillitsvalgt av medsoldater og fikk svært god tjenesteuttalelse."
    ],
    logo: "/images/logos/forsvaret-logo.jpg"
  }
];

const organizations = [
  { name: "Navet (næringslivsutvalg)", role: "Styremedlem" },
  { name: "MAPS", role: "Styremedlem, ansvar for webutvikling og teknologi. Utnevnt til æresmedlem for innsatsen i foreningen. " },
  { name: "QUIZIFI", role: "Styremedlem" },
  { name: "LI:ST", role: "Ledet foreningen fra 2023 til 2024, Var økonomiansvarlig 2022 - 2023" }
];

const tools = [
  { name: "GitHub", icon: FaGithub },
  { name: "Git", icon: FaGitAlt },
  { name: "Docker", icon: FaDocker },
  { name: "Figma", icon: FaFigma },
  { name: "Google Cloud", icon: SiGooglecloud },
  { name: "PostgreSQL", icon: SiPostgresql },
  { name: "FastAPI", icon: SiFastapi }
];

const technologies = [
  { name: "Java", icon: FaJava },
  { name: "Kotlin", icon: SiKotlin },
  { name: "Python", icon: FaPython },
  { name: "TypeScript", icon: SiTypescript },
  { name: "React", icon: FaReact },
  { name: "Next.js", icon: SiNextdotjs },
  { name: "HTML/CSS", icon: FaHtml5 },
  { name: "Tailwind", icon: SiTailwindcss }
];

const skills = [
  { label: "Språk", value: "🇳🇴🇬🇧 Norsk og engelsk flytende" }
];

export default function CVPage() {
  return (
    <div
      className="min-h-screen pt-20 pb-12 px-4"
      style={{ backgroundColor: "var(--ds-color-neutral-background-default)" }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card
            className="relative overflow-hidden cv-card"
            style={{
              padding: "1.5rem"
            }}
          >
            <header className="border-b pb-4 border-[color:var(--ds-color-neutral-border-subtle)]">
              <Heading data-size="lg" style={{ marginBottom: "0.25rem" }} className="text-[color:var(--ds-color-neutral-text-default)]">
                Victor Rørslett Uhnger
              </Heading>
              <Paragraph data-size="sm" style={{ margin: 0 }} className="text-[color:var(--ds-color-neutral-text-subtle)]">
                Masterstudent i informatikk, 4. år
              </Paragraph>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <Link
                  href="mailto:victou@ifi.uio.no"
                  className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition hover:-translate-y-0.5 hover:border-[var(--ds-color-accent-base-default)] hover:text-[var(--ds-color-accent-base-default)] motion-reduce:transform-none"
                  style={{ borderColor: "var(--ds-color-neutral-border-default)" }}
                  aria-label="Send e-post"
                >
                  <FiMail className="text-[0.85rem]" />
                  victou@ifi.uio.no
                </Link>
                <Link
                  href="https://www.linkedin.com/in/victoruhnger/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition hover:-translate-y-0.5 hover:border-[var(--ds-color-accent-base-default)] hover:text-[var(--ds-color-accent-base-default)] motion-reduce:transform-none"
                  style={{ borderColor: "var(--ds-color-neutral-border-default)" }}
                  aria-label="LinkedIn"
                >
                  <FaLinkedinIn className="text-[0.85rem]" />
                  linkedin.com/in/victoruhnger
                </Link>
                <Link
                  href="https://github.com/vuhnger"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition hover:-translate-y-0.5 hover:border-[var(--ds-color-accent-base-default)] hover:text-[var(--ds-color-accent-base-default)] motion-reduce:transform-none"
                  style={{ borderColor: "var(--ds-color-neutral-border-default)" }}
                  aria-label="GitHub"
                >
                  <FaGithub className="text-[0.85rem]" />
                  github.com/vuhnger
                </Link>
              </div>
            </header>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {/* Utdanning - første på mobil og desktop */}
              <section className="min-w-0 md:col-start-1 md:row-start-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full bg-[color:var(--ds-color-brand1-base-default)]"
                    aria-hidden="true"
                  />
                  <Heading data-size="sm" style={{ marginBottom: 0 }} className="text-[color:var(--ds-color-brand1-base-default)]">
                    Utdanning
                  </Heading>
                </div>
                <div className="space-y-3">
                  {education.map((item) => (
                    <div
                      key={`${item.school}-${item.program}`}
                      className="rounded-md border p-3 transition hover:-translate-y-0.5 hover:border-[color:var(--ds-color-brand1-border-default)] hover:shadow-sm motion-reduce:transform-none border-[color:var(--ds-color-neutral-border-subtle)] bg-[color:color-mix(in_srgb,var(--ds-color-neutral-surface-default)_85%,transparent)]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
                        <div>
                          <Paragraph data-size="sm" style={{ marginBottom: "0.125rem", fontWeight: 600 }}>
                            {item.school}
                          </Paragraph>
                          <Paragraph data-size="xs" style={{ margin: 0, color: "var(--ds-color-neutral-text-default)" }}>
                            {item.program} · {item.location}
                          </Paragraph>
                        </div>
                        <Paragraph data-size="xs" className="sm:text-right" style={{ margin: 0, color: "var(--ds-color-neutral-text-default)" }}>
                          {item.period}
                        </Paragraph>
                      </div>
                      <ul className="mt-2 list-disc pl-4 text-xs" style={{ color: "var(--ds-color-neutral-text-default)" }}>
                        {item.details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {/* Erfaring - andre på mobil, høyre kolonne på desktop */}
              <section className="min-w-0 md:col-start-2 md:row-start-1 md:row-span-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full bg-[color:var(--ds-color-danger-base-default)]"
                    aria-hidden="true"
                  />
                  <Heading data-size="sm" style={{ marginBottom: 0 }} className="text-[color:var(--ds-color-danger-base-default)]">
                    Erfaring
                  </Heading>
                </div>
                <div className="mt-2 space-y-2">
                  {experience.map((item) => (
                    <AccessibleDialog
                      key={item.id}
                      labelId={`${item.id}-experience-title`}
                      descriptionId={`${item.id}-experience-summary`}
                      animatedTrigger
                      triggerClassName="group w-full rounded-md border p-3 text-left cursor-pointer relative hover:border-[color:var(--ds-color-danger-border-default)] border-[color:var(--ds-color-neutral-border-subtle)] bg-[color:color-mix(in_srgb,var(--ds-color-neutral-surface-default)_85%,transparent)]"
                      dialogClassName="max-w-xl rounded-lg border border-[color:var(--ds-color-neutral-border-strong)] bg-[var(--ds-color-neutral-background-default)]"
                      trigger={
                        <>
                      {item.id === "bekk" && (
                        <span
                          className="pointer-events-none absolute inset-0 animate-pulse rounded-md border-2 border-[color:var(--ds-color-danger-border-strong)] motion-reduce:animate-none"
                          aria-hidden="true"
                        />
                      )}
                      <FiChevronRight
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base opacity-0 translate-x-1 transition-all group-hover:opacity-70 group-hover:translate-x-0 text-[color:var(--ds-color-danger-base-default)]"
                      />
                      <div className="flex items-start gap-3 pr-5">
                        <div className="w-10 h-10 flex-shrink-0 rounded-md border border-[color:var(--ds-color-neutral-border-subtle)] bg-[color:var(--ds-color-neutral-surface-default)] p-1 flex items-center justify-center overflow-hidden">
                          <Image
                            src={item.logo}
                            alt={item.company}
                            width={32}
                            height={32}
                            className="object-contain w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
                            <Paragraph data-size="sm" style={{ marginBottom: "0.125rem", fontWeight: 600 }}>
                              {item.role}
                            </Paragraph>
                            <Paragraph data-size="xs" className="sm:text-right flex-shrink-0" style={{ margin: 0, color: "var(--ds-color-neutral-text-default)" }}>
                              {item.period}
                            </Paragraph>
                          </div>
                          <Paragraph data-size="xs" style={{ margin: 0, color: "var(--ds-color-neutral-text-default)", opacity: 0.8 }}>
                            {item.summary}
                          </Paragraph>
                        </div>
                      </div>
                        </>
                      }
                    >
                      <div className="p-4 pr-24">
                        <Heading id={`${item.id}-experience-title`} data-size="sm" style={{ marginBottom: "0.25rem" }}>
                          {item.role}
                        </Heading>
                        <Paragraph
                          id={`${item.id}-experience-summary`}
                          data-size="xs"
                          style={{ margin: 0, color: "var(--ds-color-neutral-text-default)" }}
                        >
                          {item.company} · {item.location}
                        </Paragraph>
                        <Paragraph data-size="xs" style={{ marginTop: "0.5rem", color: "var(--ds-color-neutral-text-default)" }}>
                          {item.period}
                        </Paragraph>
                        <ul className="mt-3 list-disc pl-4 text-sm" style={{ color: "var(--ds-color-neutral-text-default)" }}>
                          {item.details.map((detail) => (
                            <li key={detail}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                    </AccessibleDialog>
                  ))}
                </div>
              </section>

              {/* Ferdigheter - tredje på mobil, under Utdanning på desktop */}
              <section className="min-w-0 md:col-start-1 md:row-start-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full bg-[color:var(--ds-color-success-base-default)]"
                    aria-hidden="true"
                  />
                  <Heading data-size="sm" style={{ marginBottom: 0 }} className="text-[color:var(--ds-color-success-base-default)]">
                    Ferdigheter
                  </Heading>
                </div>
                <div className="space-y-2">
                  <div
                    className="rounded-md border p-3 transition hover:-translate-y-0.5 hover:border-[color:var(--ds-color-success-border-default)] hover:shadow-sm motion-reduce:transform-none border-[color:var(--ds-color-neutral-border-subtle)] bg-[color:color-mix(in_srgb,var(--ds-color-neutral-surface-default)_85%,transparent)]"
                  >
                    <Paragraph data-size="xs" style={{ marginBottom: "0.5rem", fontWeight: 600 }} className="text-[color:var(--ds-color-neutral-text-default)]">
                      Verktøy
                    </Paragraph>
                    <div className="flex flex-wrap gap-3">
                      {tools.map((tool) => (
                        <div
                          key={tool.name}
                          className="flex items-center gap-1.5 text-[color:var(--ds-color-neutral-text-subtle)]"
                          title={tool.name}
                        >
                          <tool.icon className="text-lg" />
                          <span className="text-xs">{tool.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    className="rounded-md border p-3 transition hover:-translate-y-0.5 hover:border-[color:var(--ds-color-success-border-default)] hover:shadow-sm motion-reduce:transform-none border-[color:var(--ds-color-neutral-border-subtle)] bg-[color:color-mix(in_srgb,var(--ds-color-neutral-surface-default)_85%,transparent)]"
                  >
                    <Paragraph data-size="xs" style={{ marginBottom: "0.5rem", fontWeight: 600 }} className="text-[color:var(--ds-color-neutral-text-default)]">
                      Programmeringsspråk
                    </Paragraph>
                    <div className="flex flex-wrap gap-3">
                      {technologies.map((tech) => (
                        <div
                          key={tech.name}
                          className="flex items-center gap-1.5 text-[color:var(--ds-color-neutral-text-subtle)]"
                          title={tech.name}
                        >
                          <tech.icon className="text-lg" />
                          <span className="text-xs">{tech.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {skills.map((skill) => (
                    <div
                      key={skill.label}
                      className="rounded-md border p-3 transition hover:-translate-y-0.5 hover:border-[color:var(--ds-color-success-border-default)] hover:shadow-sm motion-reduce:transform-none border-[color:var(--ds-color-neutral-border-subtle)] bg-[color:color-mix(in_srgb,var(--ds-color-neutral-surface-default)_85%,transparent)]"
                    >
                      <Paragraph data-size="xs" style={{ marginBottom: "0.25rem", fontWeight: 600 }} className="text-[color:var(--ds-color-neutral-text-default)]">
                        {skill.label}
                      </Paragraph>
                      <Paragraph data-size="xs" style={{ margin: 0 }} className="text-[color:var(--ds-color-neutral-text-subtle)]">
                        {skill.value}
                      </Paragraph>
                    </div>
                  ))}
                </div>
                <Paragraph data-size="xs" style={{ marginTop: "0.75rem", textAlign: "center", opacity: 0.7 }}>
                  Referanser oppgis på forespørsel.
                </Paragraph>
              </section>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prosjekter */}
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full bg-[color:var(--ds-color-accent-base-default)]"
                    aria-hidden="true"
                  />
                  <Heading data-size="sm" style={{ marginBottom: 0 }} className="text-[color:var(--ds-color-accent-base-default)]">
                    Prosjekter
                  </Heading>
                </div>
                <div className="space-y-3">
                  <NextLink href="/projects">
                    <div
                      className="group rounded-md border p-3 transition hover:-translate-y-0.5 hover:border-[color:var(--ds-color-accent-border-default)] hover:shadow-sm motion-reduce:transform-none border-[color:var(--ds-color-neutral-border-subtle)] bg-[color:color-mix(in_srgb,var(--ds-color-neutral-surface-default)_85%,transparent)] cursor-pointer relative"
                    >
                      <FiChevronRight
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base opacity-0 translate-x-1 transition-all group-hover:opacity-70 group-hover:translate-x-0 text-[color:var(--ds-color-accent-base-default)]"
                      />
                      <Paragraph data-size="sm" style={{ marginBottom: "0.25rem", fontWeight: 600 }} className="text-[color:var(--ds-color-neutral-text-default)]">
                        Se alle prosjekter
                      </Paragraph>
                      <Paragraph data-size="xs" style={{ margin: 0 }} className="text-[color:var(--ds-color-neutral-text-subtle)] pr-5">
                        Se mine prosjekter og hva jeg har jobbet med
                      </Paragraph>
                    </div>
                  </NextLink>
                </div>
              </section>

              {/* Frivillig arbeid */}
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full bg-[color:var(--ds-color-warning-base-default)]"
                    aria-hidden="true"
                  />
                  <Heading data-size="sm" style={{ marginBottom: 0 }} className="text-[color:var(--ds-color-warning-base-default)]">
                    Frivillig arbeid
                  </Heading>
                </div>
                <div className="space-y-2">
                  {organizations.map((org) => (
                    <div
                      key={org.name}
                      className="rounded-md border p-3 transition hover:-translate-y-0.5 hover:border-[color:var(--ds-color-warning-border-default)] hover:shadow-sm motion-reduce:transform-none border-[color:var(--ds-color-neutral-border-subtle)] bg-[color:color-mix(in_srgb,var(--ds-color-neutral-surface-default)_85%,transparent)]"
                    >
                      <Paragraph data-size="sm" style={{ marginBottom: "0.125rem", fontWeight: 600 }} className="text-[color:var(--ds-color-neutral-text-default)]">
                        {org.name}
                      </Paragraph>
                      <Paragraph data-size="xs" style={{ margin: 0 }} className="text-[color:var(--ds-color-neutral-text-subtle)]">
                        {org.role}
                      </Paragraph>
                    </div>
                  ))}
                </div>
              </section>
            </div>

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
    </div>
  );
}
