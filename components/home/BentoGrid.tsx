"use client";

import Image from "next/image";
import NextLink from "next/link";
import { Card, Heading, Paragraph, Link } from "@digdir/designsystemet-react";
import { AiFillGithub } from "react-icons/ai";
import { FaLinkedinIn, FaStrava } from "react-icons/fa";
import { FiFileText, FiGrid } from "react-icons/fi";
import MasterCountdown from "./MasterCountdown";
import StatsCards from "./StatsCards";

const BentoGrid = () => {
  const clickableOutline = '2px solid var(--ds-color-accent-base-default)';
  const clickableShadow = '0 12px 20px rgba(37, 99, 235, 0.18)';

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-3">
          <Card
            style={{
              padding: '1rem',
              height: '100%',
              backgroundColor: 'color-mix(in srgb, var(--ds-color-neutral-background-default) 85%, transparent)',
              border: '2px solid var(--ds-color-neutral-border-strong)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <Heading data-size="lg" style={{ marginBottom: '0.125rem', color: 'var(--ds-color-accent-base-default)' }}>
                  Victor Uhnger
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0 }}>
                  Masterstudent i programmering og systemarkitektur · Universitetet i Oslo (4. år)
                </Paragraph>
              </div>

              <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-default)', maxWidth: '36rem', margin: 0 }}>
                Full-stack utvikler med erfaring fra Bekk.
              </Paragraph>
              <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-default)', maxWidth: '36rem', margin: 0 }}>
                Skriver masteroppgave om Edge Computing for Forsvarets Forskningsinstitutt.
              </Paragraph>
              <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-default)', maxWidth: '36rem', margin: 0 }}>
                Interessert i distribuerte systemert og nettverk. 
              </Paragraph>
              <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-default)', maxWidth: '36rem', margin: 0 }}>
                Liker også automatisering og KI!
              </Paragraph>
              <Paragraph></Paragraph>
              <Paragraph></Paragraph>
              <Paragraph></Paragraph>
              <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-default)', maxWidth: '36rem', margin: 0 }}>
                Denne siden bruker <a href="https://github.com/digdir/designsystemet">Designsystemet</a> fra DigDir for universell utforming.
              </Paragraph>
            </div>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card
            style={{
              padding: '0.75rem',
              height: '100%',
              backgroundColor: 'color-mix(in srgb, var(--ds-color-neutral-background-default) 85%, transparent)',
              border: '2px solid var(--ds-color-neutral-border-strong)'
            }}
          >
            <div
              className="relative w-full max-w-[180px] sm:max-w-[220px] md:max-w-none mx-auto md:mx-0"
              style={{
                borderRadius: '0.5rem',
                border: '1px dashed var(--ds-color-neutral-border-subtle)',
                background: 'linear-gradient(135deg, var(--ds-color-accent-base-subtle), var(--ds-color-accent-second-subtle))',
                aspectRatio: '3 / 4',
                overflow: 'hidden'
              }}
            >
              <Image
                src="/images/portrait.jpg"
                alt="Bilde av meg"
                fill
                sizes="(min-width: 768px) 220px, 180px"
                className="object-cover"
              />
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card
            style={{
              padding: '0.75rem',
              height: '100%',
              backgroundColor: 'color-mix(in srgb, var(--ds-color-neutral-background-default) 85%, transparent)',
              border: '2px solid var(--ds-color-neutral-border-strong)'
            }}
          >
            <div className="flex gap-2 flex-wrap justify-between">
              <Link
                href="https://github.com/vuhnger"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: '2.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: clickableOutline,
                  borderRadius: '0.375rem',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  boxShadow: clickableShadow,
                  transition: 'all 0.2s'
                }}
              >
                <AiFillGithub style={{ fontSize: '1.4rem' }} />
              </Link>
              <Link
                href="https://www.linkedin.com/in/victoruhnger"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: '2.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: clickableOutline,
                  borderRadius: '0.375rem',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  boxShadow: clickableShadow,
                  transition: 'all 0.2s'
                }}
              >
                <FaLinkedinIn style={{ fontSize: '1.25rem' }} />
              </Link>
              <Link
                href="https://www.strava.com/athletes/34349129"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Strava"
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: '2.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: clickableOutline,
                  borderRadius: '0.375rem',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  boxShadow: clickableShadow,
                  transition: 'all 0.2s'
                }}
              >
                <FaStrava style={{ fontSize: '1.25rem' }} />
              </Link>
            </div>
          </Card>
        </div>

        <div className="md:col-span-1">
          <NextLink href="/cv" aria-label="CV" className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-color-accent-base-default)] focus-visible:ring-offset-2">
            <Card
              className="relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-sm motion-reduce:transform-none"
              style={{
                padding: '0.75rem',
                height: '100%',
                backgroundColor: 'color-mix(in srgb, var(--ds-color-neutral-background-default) 85%, transparent)',
                border: clickableOutline,
                boxShadow: clickableShadow,
                cursor: 'pointer'
              }}
            >
              <span
                className="pointer-events-none absolute inset-0 rounded-[0.5rem] border animate-pulse"
                style={{
                  borderColor: 'var(--ds-color-accent-base-default)',
                  opacity: 0.35
                }}
                aria-hidden="true"
              />
              <div className="flex h-full items-center justify-center gap-2">
                <FiFileText style={{ fontSize: '2rem', color: 'var(--ds-color-accent-base-default)' }} />
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-accent-base-default)', fontWeight: 600 }}>
                  CV
                </Paragraph>
              </div>
            </Card>
          </NextLink>
        </div>
        <div className="md:col-span-1">
          <NextLink
            href="/projects"
            aria-label="Prosjekter"
            className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-color-accent-base-default)] focus-visible:ring-offset-2"
          >
            <Card
              className="relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-sm motion-reduce:transform-none"
              style={{
                padding: '0.75rem',
                height: '100%',
                backgroundColor: 'color-mix(in srgb, var(--ds-color-neutral-background-default) 85%, transparent)',
                border: clickableOutline,
                boxShadow: clickableShadow,
                cursor: 'pointer'
              }}
            >
              <span
                className="pointer-events-none absolute inset-0 rounded-[0.5rem] border animate-pulse"
                style={{
                  borderColor: 'var(--ds-color-accent-base-default)',
                  opacity: 0.35
                }}
                aria-hidden="true"
              />
              <div className="flex h-full items-center justify-center gap-2">
                <FiGrid style={{ fontSize: '2rem', color: 'var(--ds-color-accent-base-default)' }} />
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-accent-base-default)', fontWeight: 600 }}>
                  Prosjekter
                </Paragraph>
              </div>
            </Card>
          </NextLink>
        </div>
        <div className="md:col-span-2">
          <MasterCountdown />
        </div>
        <StatsCards />
      </div>
    </div>
  );
};

export default BentoGrid;
