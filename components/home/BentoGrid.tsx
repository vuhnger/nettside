"use client";

import NextLink from "next/link";
import { Heading, Paragraph, Link, Button, Avatar } from "@digdir/designsystemet-react";
import { AiFillGithub } from "react-icons/ai";
import { FaLinkedinIn, FaStrava } from "react-icons/fa";
import MasterCountdown from "./MasterCountdown";
import StatsCards from "./StatsCards";

const BentoGrid = () => {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="mb-6">
        <div className="grid md:grid-cols-[1fr,200px] gap-6 items-center">
          {/* Left: Intro */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <Heading data-size="xl" style={{ marginBottom: '0.25rem', color: 'var(--ds-color-accent-base-default)' }}>
                Victor Uhnger
              </Heading>
              <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0 }}>
                Masterstudent i Informatikk · UiO
              </Paragraph>
            </div>

            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', maxWidth: '36rem', margin: 0 }}>
              Full-stack utvikler med fokus på åpen kildekode og komplekse problemer.
            </Paragraph>

            {/* Social Links */}
            <div className="flex gap-2">
              <Link
                href="https://github.com/vuhnger"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: '0.375rem',
                  transition: 'all 0.2s'
                }}
              >
                <AiFillGithub style={{ fontSize: '1.125rem' }} />
              </Link>
              <Link
                href="https://www.linkedin.com/in/victoruhnger"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: '0.375rem',
                  transition: 'all 0.2s'
                }}
              >
                <FaLinkedinIn style={{ fontSize: '1rem' }} />
              </Link>
              <Link
                href="https://www.strava.com/athletes/34349129"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Strava"
                style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: '0.375rem',
                  transition: 'all 0.2s'
                }}
              >
                <FaStrava style={{ fontSize: '1rem' }} />
              </Link>
              <Button asChild data-size="sm" variant="primary">
                <NextLink href="/cv">CV</NextLink>
              </Button>
            </div>
          </div>

          {/* Right: Avatar */}
          <div className="flex justify-center md:justify-end">
            <div
              style={{
                width: '8rem',
                height: '8rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(to bottom right, var(--ds-color-accent-base-default), var(--ds-color-accent-second-default))',
                padding: '0.125rem'
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '0.75rem',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--ds-color-accent-base-default)' }}>
                  VU
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="col-span-2">
          <MasterCountdown />
        </div>
        <StatsCards />
      </div>
    </div>
  );
};

export default BentoGrid;
