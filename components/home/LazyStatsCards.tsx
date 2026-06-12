"use client";

import dynamic from "next/dynamic";
import { Card, Heading, Paragraph } from "@digdir/designsystemet-react";

const StatsCards = dynamic(() => import("./StatsCards"), {
  loading: () => (
    <>
      {["Koding", "Strava"].map((label) => (
        <Card
          key={label}
          style={{
            padding: '0.625rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: 'color-mix(in srgb, var(--ds-color-neutral-background-default) 85%, transparent)',
            border: '2px solid var(--ds-color-neutral-border-strong)'
          }}
        >
          <div style={{ width: '1.125rem', height: '1.125rem', borderRadius: '999px', backgroundColor: 'var(--ds-color-neutral-border-subtle)', marginBottom: '0.375rem' }} />
          <div>
            <Heading data-size="xs" style={{ color: 'var(--ds-color-neutral-text-default)', marginBottom: 0 }}>
              ...
            </Heading>
            <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0 }}>
              {label}
            </Paragraph>
          </div>
        </Card>
      ))}
    </>
  ),
  ssr: false,
});

const LazyStatsCards = () => <StatsCards />;

export default LazyStatsCards;
