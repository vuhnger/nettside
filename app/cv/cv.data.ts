import type { IconType } from "react-icons";
import {
  FaDocker,
  FaFigma,
  FaGitAlt,
  FaGithub,
  FaHtml5,
  FaJava,
  FaPython,
  FaReact,
} from "react-icons/fa";
import {
  SiFastapi,
  SiGooglecloud,
  SiKotlin,
  SiNextdotjs,
  SiPostgresql,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

export type Experience = {
  id: string;
  company: string;
  location: string;
  role: string;
  period: string;
  summary: string;
  details: string[];
  logo: string;
};

export type IconEntry = { name: string; icon: IconType };

export const education = [
  {
    school: "Universitetet i Oslo",
    location: "Oslo",
    program: "Master i programmering og systemarkitektur",
    period: "2025 - ",
    details: ["Snitt: B"],
  },
  {
    school: "Universitetet i Oslo",
    location: "Oslo",
    program: "Bachelor i informatikk",
    period: "2022 - 2025",
    details: ["Snitt: B"],
  },
];

export const experience: Experience[] = [
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
    logo: "/images/logos/drdropin-logo.png",
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
      "Jobbet i et tverrfaglig team på fire.",
    ],
    logo: "/images/logos/bekk-logo.jpeg",
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
      "Krevde taushetsplikt og høy integritet.",
    ],
    logo: "/images/logos/uio-logo.jpg",
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
      "Bygget REST-API med Django, frontend i React + TypeScript, containerisert med Docker.",
    ],
    logo: "/images/logos/uio-logo.jpg",
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
      "Skrevet i TypeScript med React, deployet og brukt som alternativ til tradisjonelle innleveringer.",
    ],
    logo: "/images/logos/uio-logo.jpg",
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
    logo: "/images/logos/uio-logo.jpg",
  },
  {
    id: "military",
    company: "Forsvaret",
    location: "Værnes",
    role: "Militærtjeneste",
    period: "2020 - 2021",
    summary: "Militærtjeneste i HV-12 på Værnes garnison.",
    details: ["Valgt som tillitsvalgt av medsoldater og fikk svært god tjenesteuttalelse."],
    logo: "/images/logos/forsvaret-logo.jpg",
  },
];

export const organizations = [
  { name: "Navet (næringslivsutvalg)", role: "Styremedlem" },
  {
    name: "MAPS",
    role: "Styremedlem, ansvar for webutvikling og teknologi. Utnevnt til æresmedlem for innsatsen i foreningen. ",
  },
  { name: "QUIZIFI", role: "Styremedlem" },
  { name: "LI:ST", role: "Ledet foreningen fra 2023 til 2024, Var økonomiansvarlig 2022 - 2023" },
];

export const tools: IconEntry[] = [
  { name: "GitHub", icon: FaGithub },
  { name: "Git", icon: FaGitAlt },
  { name: "Docker", icon: FaDocker },
  { name: "Figma", icon: FaFigma },
  { name: "Google Cloud", icon: SiGooglecloud },
  { name: "PostgreSQL", icon: SiPostgresql },
  { name: "FastAPI", icon: SiFastapi },
];

export const technologies: IconEntry[] = [
  { name: "Java", icon: FaJava },
  { name: "Kotlin", icon: SiKotlin },
  { name: "Python", icon: FaPython },
  { name: "TypeScript", icon: SiTypescript },
  { name: "React", icon: FaReact },
  { name: "Next.js", icon: SiNextdotjs },
  { name: "HTML/CSS", icon: FaHtml5 },
  { name: "Tailwind", icon: SiTailwindcss },
];

export const skills = [{ label: "Språk", value: "🇳🇴🇬🇧 Norsk og engelsk flytende" }];
