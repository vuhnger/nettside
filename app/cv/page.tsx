"use client";

import { useEffect, useMemo, useState } from "react";
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
import { motion, AnimatePresence, type Variants } from "framer-motion";

// Animation variants - gjenbrukbare animasjoner
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};

const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 }
  }
};

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
    role: "Administrativ koordinator",
    period: "2025 - ",
    summary: "Automatisering og integrasjonsarbeid for bedriftshelsetjenesten.",
    details: [
      "Jobber med tiltak som forbedrer effektivitet på tvers av forretningsplattformer.",
      "Automatisering og integrasjon for bedriftshelsetjenesten.",
      "Samt forefallende administrativt arbeid. ",
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
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeExperience = useMemo(
    () => experience.find((item) => item.id === activeId) ?? null,
    [activeId]
  );

  useEffect(() => {
    if (!activeExperience) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveId(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeExperience]);

  return (
    <div
      className="min-h-screen pt-20 pb-12 px-4"
      style={{ backgroundColor: "var(--ds-color-neutral-background-default)" }}
    >
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={0}
        >
          <Card
            className="relative overflow-hidden cv-card"
            style={{
              padding: "1.5rem"
            }}
          >
            <header className="border-b pb-4 border-neutral-200 dark:border-neutral-700">
              <Heading data-size="lg" style={{ marginBottom: "0.25rem" }} className="text-neutral-800 dark:text-neutral-100">
                Victor Rørslett Uhnger
              </Heading>
              <Paragraph data-size="sm" style={{ margin: 0 }} className="text-neutral-600 dark:text-neutral-400">
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
              <motion.section
                className="min-w-0 md:col-start-1 md:row-start-1"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={0.1}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400"
                    aria-hidden="true"
                  />
                  <Heading data-size="sm" style={{ marginBottom: 0 }} className="text-teal-600 dark:text-teal-400">
                    Utdanning
                  </Heading>
                </div>
                <motion.div
                  className="space-y-3"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {education.map((item) => (
                    <motion.div
                      key={`${item.school}-${item.program}`}
                      variants={cardItem}
                      className="rounded-md border p-3 transition hover:-translate-y-0.5 hover:border-teal-600 dark:hover:border-teal-400 hover:shadow-sm motion-reduce:transform-none border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-800/70"
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
                    </motion.div>
                  ))}
                </motion.div>
              </motion.section>

              {/* Erfaring - andre på mobil, høyre kolonne på desktop */}
              <motion.section
                className="min-w-0 md:col-start-2 md:row-start-1 md:row-span-2"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={0.2}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400"
                    aria-hidden="true"
                  />
                  <Heading data-size="sm" style={{ marginBottom: 0 }} className="text-red-600 dark:text-red-400">
                    Erfaring
                  </Heading>
                </div>
                <motion.div
                  className="mt-2 space-y-2"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {experience.map((item) => (
                    <motion.button
                      key={item.id}
                      variants={cardItem}
                      type="button"
                      onClick={() => setActiveId(item.id)}
                      aria-haspopup="dialog"
                      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      whileTap={{ scale: 0.98 }}
                      className="group w-full rounded-md border p-3 text-left cursor-pointer relative hover:border-red-600 dark:hover:border-red-400 border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-800/70"
                    >
                      {item.id === "bekk" && (
                        <motion.span
                          className="pointer-events-none absolute inset-0 rounded-md border-2 border-red-500"
                          aria-hidden="true"
                          animate={{ opacity: [0.2, 0.5, 0.2] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                      <FiChevronRight
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base opacity-0 translate-x-1 transition-all group-hover:opacity-70 group-hover:translate-x-0 text-red-600 dark:text-red-400"
                      />
                      <div className="flex items-start gap-3 pr-5">
                        <div className="w-10 h-10 flex-shrink-0 rounded-md border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-100 p-1 flex items-center justify-center overflow-hidden">
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
                    </motion.button>
                  ))}
                </motion.div>
              </motion.section>

              {/* Ferdigheter - tredje på mobil, under Utdanning på desktop */}
              <motion.section
                className="min-w-0 md:col-start-1 md:row-start-2"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={0.3}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400"
                    aria-hidden="true"
                  />
                  <Heading data-size="sm" style={{ marginBottom: 0 }} className="text-emerald-600 dark:text-emerald-400">
                    Ferdigheter
                  </Heading>
                </div>
                <motion.div
                  className="space-y-2"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    variants={cardItem}
                    className="rounded-md border p-3 transition hover:-translate-y-0.5 hover:border-emerald-600 dark:hover:border-emerald-400 hover:shadow-sm motion-reduce:transform-none border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-800/70"
                  >
                    <Paragraph data-size="xs" style={{ marginBottom: "0.5rem", fontWeight: 600 }} className="text-neutral-800 dark:text-neutral-100">
                      Verktøy
                    </Paragraph>
                    <div className="flex flex-wrap gap-3">
                      {tools.map((tool) => (
                        <div
                          key={tool.name}
                          className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400"
                          title={tool.name}
                        >
                          <tool.icon className="text-lg" />
                          <span className="text-xs">{tool.name}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                  <motion.div
                    variants={cardItem}
                    className="rounded-md border p-3 transition hover:-translate-y-0.5 hover:border-emerald-600 dark:hover:border-emerald-400 hover:shadow-sm motion-reduce:transform-none border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-800/70"
                  >
                    <Paragraph data-size="xs" style={{ marginBottom: "0.5rem", fontWeight: 600 }} className="text-neutral-800 dark:text-neutral-100">
                      Programmeringsspråk
                    </Paragraph>
                    <div className="flex flex-wrap gap-3">
                      {technologies.map((tech) => (
                        <div
                          key={tech.name}
                          className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400"
                          title={tech.name}
                        >
                          <tech.icon className="text-lg" />
                          <span className="text-xs">{tech.name}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                  {skills.map((skill) => (
                    <motion.div
                      key={skill.label}
                      variants={cardItem}
                      className="rounded-md border p-3 transition hover:-translate-y-0.5 hover:border-emerald-600 dark:hover:border-emerald-400 hover:shadow-sm motion-reduce:transform-none border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-800/70"
                    >
                      <Paragraph data-size="xs" style={{ marginBottom: "0.25rem", fontWeight: 600 }} className="text-neutral-800 dark:text-neutral-100">
                        {skill.label}
                      </Paragraph>
                      <Paragraph data-size="xs" style={{ margin: 0 }} className="text-neutral-600 dark:text-neutral-400">
                        {skill.value}
                      </Paragraph>
                    </motion.div>
                  ))}
                </motion.div>
                <Paragraph data-size="xs" style={{ marginTop: "0.75rem", textAlign: "center", opacity: 0.7 }}>
                  Referanser oppgis på forespørsel.
                </Paragraph>
              </motion.section>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prosjekter */}
              <motion.section
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={0.4}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400"
                    aria-hidden="true"
                  />
                  <Heading data-size="sm" style={{ marginBottom: 0 }} className="text-purple-600 dark:text-purple-400">
                    Prosjekter
                  </Heading>
                </div>
                <motion.div
                  className="space-y-3"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <NextLink href="/projects">
                    <motion.div
                      variants={cardItem}
                      className="group rounded-md border p-3 transition hover:-translate-y-0.5 hover:border-purple-600 dark:hover:border-purple-400 hover:shadow-sm motion-reduce:transform-none border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-800/70 cursor-pointer relative"
                    >
                      <FiChevronRight
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base opacity-0 translate-x-1 transition-all group-hover:opacity-70 group-hover:translate-x-0 text-purple-600 dark:text-purple-400"
                      />
                      <Paragraph data-size="sm" style={{ marginBottom: "0.25rem", fontWeight: 600 }} className="text-neutral-800 dark:text-neutral-100">
                        Se alle prosjekter
                      </Paragraph>
                      <Paragraph data-size="xs" style={{ margin: 0 }} className="text-neutral-600 dark:text-neutral-400 pr-5">
                        Se mine prosjekter og hva jeg har jobbet med
                      </Paragraph>
                    </motion.div>
                  </NextLink>
                </motion.div>
              </motion.section>

              {/* Frivillig arbeid */}
              <motion.section
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={0.5}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full bg-amber-600 dark:bg-amber-400"
                    aria-hidden="true"
                  />
                  <Heading data-size="sm" style={{ marginBottom: 0 }} className="text-amber-600 dark:text-amber-400">
                    Frivillig arbeid
                  </Heading>
                </div>
                <motion.div
                  className="space-y-2"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {organizations.map((org) => (
                    <motion.div
                      key={org.name}
                      variants={cardItem}
                      className="rounded-md border p-3 transition hover:-translate-y-0.5 hover:border-amber-600 dark:hover:border-amber-400 hover:shadow-sm motion-reduce:transform-none border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-neutral-800/70"
                    >
                      <Paragraph data-size="sm" style={{ marginBottom: "0.125rem", fontWeight: 600 }} className="text-neutral-800 dark:text-neutral-100">
                        {org.name}
                      </Paragraph>
                      <Paragraph data-size="xs" style={{ margin: 0 }} className="text-neutral-600 dark:text-neutral-400">
                        {org.role}
                      </Paragraph>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.section>
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
        </motion.div>
      </div>

      <AnimatePresence>
        {activeExperience && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
            variants={modalOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setActiveId(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="w-full max-w-xl rounded-lg border p-4"
              variants={modalContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                backgroundColor: "var(--ds-color-neutral-background-default)",
                borderColor: "var(--ds-color-neutral-border-strong)"
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Heading data-size="sm" style={{ marginBottom: "0.25rem" }}>
                    {activeExperience.role}
                  </Heading>
                  <Paragraph data-size="xs" style={{ margin: 0, color: "var(--ds-color-neutral-text-default)" }}>
                    {activeExperience.company} · {activeExperience.location}
                  </Paragraph>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  className="rounded-md border px-2 py-1 text-xs transition hover:bg-[var(--ds-color-neutral-background-subtle)]"
                  style={{
                    borderColor: "var(--ds-color-neutral-border-default)",
                    color: "var(--ds-color-neutral-text-default)"
                  }}
                >
                  Lukk
                </button>
              </div>
              <Paragraph data-size="xs" style={{ marginTop: "0.5rem", color: "var(--ds-color-neutral-text-default)" }}>
                {activeExperience.period}
              </Paragraph>
              <ul className="mt-3 list-disc pl-4 text-sm" style={{ color: "var(--ds-color-neutral-text-default)" }}>
                {activeExperience.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
