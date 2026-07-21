"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import { Card, Paragraph } from "@digdir/designsystemet-react";
import { MASTER_TIMELINE } from "@/lib/master";

const calculateProgress = (startDate: number, targetDate: number) => {
  const now = Date.now();
  const total = targetDate - startDate;
  const elapsed = Math.min(Math.max(now - startDate, 0), total);
  return total > 0 ? Math.round((elapsed / total) * 100) : 100;
};

const startDate = Date.parse(MASTER_TIMELINE.start);
const targetDate = Date.parse(MASTER_TIMELINE.end);

const MasterCountdown = () => {
  const [progress, setProgress] = useState(() => calculateProgress(startDate, targetDate));
  const [initialProgress] = useState(progress);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const timer = setInterval(
      () => setProgress(calculateProgress(startDate, targetDate)),
      60000,
    );

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setDisplayProgress(Math.min(20, initialProgress));
    }, 0);
    const finishTimeout = setTimeout(() => {
      setIntroDone(true);
    }, 1600);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(finishTimeout);
    };
  }, [initialProgress]);

  const visibleProgress = introDone ? progress : displayProgress;

  return (
    <NextLink
      href="/master"
      prefetch={false}
      aria-label="Masteroppgave"
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-color-accent-base-default)] focus-visible:ring-offset-2"
    >
      <Card
        className="relative overflow-hidden transition group-hover:-translate-y-0.5 group-hover:shadow-sm motion-reduce:transform-none"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--ds-color-neutral-background-default) 85%, transparent)',
          padding: '0.5rem',
          height: '100%',
          transition: 'all 0.2s',
          border: '2px solid var(--ds-color-accent-base-default)',
          boxShadow: 'var(--accent-shadow)',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-[0.5rem] border animate-pulse motion-reduce:animate-none"
          style={{
            borderColor: 'var(--ds-color-accent-base-default)',
            opacity: 0.45
          }}
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute right-3 top-3 inline-flex h-2.5 w-2.5"
          aria-hidden="true"
        >
          <span
            className="absolute inline-flex h-full w-full rounded-full animate-ping motion-reduce:animate-none"
            style={{
              backgroundColor: 'var(--ds-color-accent-base-default)',
              opacity: 0.5
            }}
          />
          <span
            className="relative inline-flex h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: 'var(--ds-color-accent-base-default)',
              opacity: 0.85
            }}
          />
        </span>
        <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-default)', marginBottom: '0.375rem' }}>
          🎓 Masteroppgaven min
        </Paragraph>
        <div className="mt-2 flex items-center gap-2">
          <div
            style={{
              flex: 1,
              height: '0.3rem',
              borderRadius: '999px',
              backgroundColor: 'var(--ds-color-neutral-border-subtle)',
              overflow: 'hidden'
            }}
          >
          <div
            style={{
              height: '100%',
              width: `${visibleProgress}%`,
              backgroundColor: 'var(--ds-color-accent-base-default)',
              transition: `width ${introDone ? '0.3s' : '1.6s'} ease`
            }}
          />
        </div>
        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)', minWidth: '2.25rem', textAlign: 'right' }}>
          {Math.round(visibleProgress)}%
        </Paragraph>
        </div>
      </Card>
    </NextLink>
  );
};

export default MasterCountdown;
