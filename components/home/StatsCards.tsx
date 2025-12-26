"use client";

import { useEffect, useState } from "react";
import { Card, Heading, Paragraph } from "@digdir/designsystemet-react";
import { FaCode, FaRunning } from "react-icons/fa";

const StatsCards = () => {
  const [runKm, setRunKm] = useState("...");

  useEffect(() => {
    let active = true;

    const loadStravaKm = async () => {
      try {
        const response = await fetch("https://api.vuhnger.dev/strava/stats/ytd", {
          cache: "no-store"
        });

        if (!response.ok) return;
        const data = await response.json();
        const distance = data?.data?.run?.distance;

        if (typeof distance === "number") {
          const km = distance / 1000;
          const formatted = new Intl.NumberFormat("no-NO", {
            maximumFractionDigits: 0
          }).format(km);

          if (active) {
            setRunKm(`${formatted} km`);
          }
        }
      } catch {
        // Silent fail - keep placeholder
      }
    };

    loadStravaKm();

    return () => {
      active = false;
    };
  }, []);

  const stats = [
    {
      icon: <FaCode style={{ fontSize: '1.125rem', color: 'var(--ds-color-accent-base-default)' }} />,
      value: "...",
      label: "Koding",
      color: "var(--ds-color-accent-base-default)",
    },
    {
      icon: <FaRunning style={{ fontSize: '1.125rem', color: 'var(--ds-color-accent-second-default)' }} />,
      value: runKm,
      label: "Strava km i " + new Date().getFullYear(),
      color: "var(--ds-color-accent-second-default)",
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <Card
          key={stat.label}
          style={{
            padding: '0.625rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: 'transparent',
            transition: 'all 0.2s',
            border: '2px solid var(--ds-color-neutral-border-strong)'
          }}
        >
          <div style={{ marginBottom: '0.375rem' }}>
            {stat.icon}
          </div>
          <div>
            <Heading data-size="xs" style={{ color: stat.color, marginBottom: '0' }}>
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
