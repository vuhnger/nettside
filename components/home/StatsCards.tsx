"use client";

import { Card, Heading, Paragraph } from "@digdir/designsystemet-react";
import { FaCode, FaRunning } from "react-icons/fa";

const StatsCards = () => {
  const stats = [
    {
      icon: <FaCode style={{ fontSize: '1.125rem', color: 'var(--ds-color-accent-base-default)' }} />,
      value: "...",
      label: "Koding",
      color: "var(--ds-color-accent-base-default)",
    },
    {
      icon: <FaRunning style={{ fontSize: '1.125rem', color: 'var(--ds-color-accent-second-default)' }} />,
      value: "...",
      label: "Løping",
      color: "var(--ds-color-accent-second-default)",
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <Card
          key={stat.label}
          style={{
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.2s',
            border: '2px solid var(--ds-color-neutral-border-strong)'
          }}
        >
          <div style={{ marginBottom: '0.5rem' }}>
            {stat.icon}
          </div>
          <div>
            <Heading data-size="sm" style={{ color: stat.color, marginBottom: '0.125rem' }}>
              {stat.value}
            </Heading>
            <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0 }}>
              {stat.label}
            </Paragraph>
          </div>
        </Card>
      ))}
    </>
  );
};

export default StatsCards;
