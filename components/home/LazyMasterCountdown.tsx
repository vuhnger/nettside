"use client";

import dynamic from "next/dynamic";
import { Card, Paragraph } from "@digdir/designsystemet-react";

const MasterCountdown = dynamic(() => import("./MasterCountdown"), {
  loading: () => (
    <Card
      style={{
        backgroundColor: 'color-mix(in srgb, var(--ds-color-neutral-background-default) 85%, transparent)',
        padding: '0.5rem',
        height: '100%',
        border: '2px solid var(--ds-color-accent-base-default)',
        boxShadow: 'var(--accent-shadow)'
      }}
    >
      <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-default)', marginBottom: '0.375rem' }}>
        🎓 Masteroppgaven min
      </Paragraph>
      <div
        style={{
          height: '0.3rem',
          borderRadius: '999px',
          backgroundColor: 'var(--ds-color-neutral-border-subtle)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            height: '100%',
            width: '20%',
            backgroundColor: 'var(--ds-color-accent-base-default)'
          }}
        />
      </div>
    </Card>
  ),
  ssr: false,
});

const LazyMasterCountdown = () => <MasterCountdown />;

export default LazyMasterCountdown;
