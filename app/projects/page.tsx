import Image from "next/image";
import { Card, Heading, Paragraph } from "@digdir/designsystemet-react";
import type { Metadata } from "next";
import AutoSnakeBackground from "@/components/projects/AutoSnakeBackground";
import AccessibleDialog from "@/components/ui/accessible-dialog";
import { projects } from "./projects.data";

export const metadata: Metadata = {
  title: "Prosjekter",
  description:
    "Et utvalg prosjekter jeg har jobbet med de siste årene - sikkerhet, API-er, KI-drevet infrastruktur og webutvikling.",
};

const isDataImage = (src?: string) => Boolean(src && src.startsWith("data:"));
const isExternalLink = (href?: string) => (href ? /^https?:\/\//.test(href) : false);

const ProjectsPage = () => {

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
                  boxShadow: "var(--ds-shadow-md)",
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
                    <AccessibleDialog
                      labelId={`${project.id}-title`}
                      descriptionId={`${project.id}-details`}
                      triggerClassName="group flex w-full flex-col justify-between gap-4 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm border-[color:var(--ds-color-neutral-border-subtle)] bg-[color:color-mix(in_srgb,var(--ds-color-neutral-surface-default)_85%,transparent)] hover:border-[color:var(--ds-color-accent-border-default)]"
                      dialogClassName="max-w-6xl rounded-3xl border border-[color:var(--ds-color-neutral-border-subtle)] bg-[color:color-mix(in_srgb,var(--ds-color-neutral-surface-default)_95%,transparent)] shadow-[var(--ds-shadow-xl)]"
                      trigger={
                        <>
                      <div className="flex flex-col gap-3">
                        <div className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--ds-color-neutral-text-subtle)]">
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
                        </>
                      }
                    >
                      <div className="p-6 pr-24 md:p-8 md:pr-28">
                        <Heading data-size="md" id={`${project.id}-title`} style={{ marginBottom: 0 }}>
                          {project.title}
                        </Heading>
                        <Paragraph
                          data-size="sm"
                          id={`${project.id}-details`}
                          style={{ margin: "0.75rem 0 0", color: "var(--ds-color-neutral-text-default)" }}
                        >
                          {project.details}
                        </Paragraph>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl border p-4 border-[color:var(--ds-color-neutral-border-subtle)] bg-[color:color-mix(in_srgb,var(--ds-color-neutral-surface-default)_90%,transparent)]">
                            <div className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--ds-color-neutral-text-subtle)]">
                              Teknologistakk
                            </div>
                            <div className="mt-3 flex flex-wrap gap-3">
                              {project.stack.map((item) => (
                                <span
                                  key={item.label}
                                  role="img"
                                  aria-label={item.label}
                                  title={item.label}
                                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--ds-color-neutral-border-subtle)] bg-[color:color-mix(in_srgb,var(--ds-color-neutral-surface-default)_95%,transparent)] text-[color:var(--ds-color-neutral-text-default)] shadow-[var(--ds-shadow-sm)]"
                                >
                                  <item.icon className="text-xl" aria-hidden="true" />
                                </span>
                              ))}
                            </div>
                            {project.link && (
                              <a
                                href={project.link}
                                target={isExternalLink(project.link) ? "_blank" : undefined}
                                rel={isExternalLink(project.link) ? "noopener noreferrer" : undefined}
                                aria-label={`Prosjektside for ${project.title}`}
                                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[var(--ds-color-accent-base-default)] hover:underline"
                              >
                                Prosjektside
                                <span aria-hidden="true">↗</span>
                              </a>
                            )}
                          </div>
                          <div className="rounded-2xl border p-4 border-[color:var(--ds-color-neutral-border-subtle)] bg-[color:color-mix(in_srgb,var(--ds-color-neutral-surface-default)_90%,transparent)]">
                            <div className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--ds-color-neutral-text-subtle)]">
                              Læringsutbytte
                            </div>
                            <ul className="mt-3 space-y-2 text-sm text-[color:var(--ds-color-neutral-text-default)]">
                              {project.learningOutcomes.map((item) => (
                                <li key={item} className="flex items-start gap-2">
                                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--ds-color-accent-base-default)]" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-6">
                          {project.sections.map((section, sectionIndex) => {
                            const sectionReversed = sectionIndex % 2 === 1;
                            const sectionImage = section.image;
                            const sectionHasImage = Boolean(sectionImage);
                            return (
                              <div
                                key={`${project.id}-${section.title}`}
                                className={`flex flex-col gap-4 md:items-stretch ${
                                  sectionHasImage ? (sectionReversed ? "md:flex-row-reverse" : "md:flex-row") : ""
                                }`}
                              >
                                {sectionImage && (
                                  <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-[color:var(--ds-color-neutral-border-subtle)] bg-[color:color-mix(in_srgb,var(--ds-color-neutral-surface-default)_85%,transparent)] md:w-5/12">
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
                                <div className={`flex w-full flex-col justify-center gap-3 ${sectionHasImage ? "md:w-7/12" : "md:w-full"}`}>
                                  <Heading data-size="sm" style={{ marginBottom: 0 }}>
                                    {section.title}
                                  </Heading>
                                  <Paragraph data-size="sm" style={{ margin: 0, color: "var(--ds-color-neutral-text-default)" }}>
                                    {section.description}
                                  </Paragraph>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </AccessibleDialog>
                  </div>

                  {imageSrc && (
                    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-[color:var(--ds-color-neutral-border-subtle)] bg-[color:color-mix(in_srgb,var(--ds-color-neutral-surface-default)_85%,transparent)] md:w-5/12">
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

    </div>
  );
};

export default ProjectsPage;
