"use client";

import NextLink from "next/link";
import { Card, Heading, Paragraph, Link } from "@digdir/designsystemet-react";
import { AiFillGithub } from "react-icons/ai";
import { FaLinkedinIn, FaStrava } from "react-icons/fa";
import MasterCountdown from "./MasterCountdown";
import StatsCards from "./StatsCards";

const BentoGrid = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-3">
          <Card
            style={{
              padding: '1rem',
              height: '100%',
              backgroundColor: 'transparent',
              border: '2px solid var(--ds-color-neutral-border-strong)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <Heading data-size="lg" style={{ marginBottom: '0.125rem', color: 'var(--ds-color-accent-base-default)' }}>
                  Victor Uhnger
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0 }}>
                  Masterstudent i programmering og systemarkitektur · Universitetet i Oslo
                </Paragraph>
              </div>

              <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-default)', maxWidth: '36rem', margin: 0 }}>
                Full-stack utvikler med interesse for nettverk, distribuerte systemer og effektivitet.
              </Paragraph>
              <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-default)', maxWidth: '36rem', margin: 0 }}>
                test
              </Paragraph>
            </div>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card
            style={{
              padding: '0.75rem',
              height: '100%',
              backgroundColor: 'transparent',
              border: '2px solid var(--ds-color-neutral-border-strong)'
            }}
          >
            <div
              className="w-full max-w-[180px] sm:max-w-[220px] md:max-w-none mx-auto md:mx-0"
              style={{
                borderRadius: '0.5rem',
                border: '1px dashed var(--ds-color-neutral-border-subtle)',
                background: 'linear-gradient(135deg, var(--ds-color-accent-base-subtle), var(--ds-color-accent-second-subtle))',
                aspectRatio: '3 / 4',
                overflow: 'hidden'
              }}
            >
              <img
                src="/images/portrait.jpg"
                alt="Bilde av meg"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card
            style={{
              padding: '0.75rem',
              height: '100%',
              backgroundColor: 'transparent',
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
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: '0.375rem',
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
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: '0.375rem',
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
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: '0.375rem',
                  transition: 'all 0.2s'
                }}
              >
                <FaStrava style={{ fontSize: '1.25rem' }} />
              </Link>
              <Link
                href="/cv"
                asChild
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: '2.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  color: 'var(--ds-color-accent-base-default)',
                  border: '1px solid var(--ds-color-accent-base-default)',
                  borderRadius: '0.375rem',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  transition: 'all 0.2s'
                }}
              >
                <NextLink href="/cv">CV</NextLink>
              </Link>
            </div>
          </Card>
        </div>

        <div className="md:col-span-1">
          <MasterCountdown />
        </div>
        <StatsCards />
      </div>
    </div>
  );
};

export default BentoGrid;
