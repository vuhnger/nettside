"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import { Card, Paragraph } from "@digdir/designsystemet-react";
import { MASTER_TIMELINE } from "@/lib/master";

const MasterCountdown = () => {
  const startDate = Date.parse(MASTER_TIMELINE.start);
  const targetDate = Date.parse(MASTER_TIMELINE.end);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const total = targetDate - startDate;
      const elapsed = Math.min(Math.max(now - startDate, 0), total);
      const percent = total > 0 ? Math.round((elapsed / total) * 100) : 100;
      setProgress(percent);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <NextLink
      href="/master"
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
          border: '1px solid var(--ds-color-neutral-border-strong)',
          cursor: 'pointer',
          position: 'relative'
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
        <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-default)', marginBottom: '0.375rem' }}>
          🎓 Om masteren min
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
                width: `${progress}%`,
                backgroundColor: 'var(--ds-color-accent-base-default)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)', minWidth: '2.25rem', textAlign: 'right' }}>
            {progress}%
          </Paragraph>
        </div>
      </Card>
    </NextLink>
  );
};

export default MasterCountdown;
