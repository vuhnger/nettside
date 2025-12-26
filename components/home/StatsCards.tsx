"use client";

import { useEffect, useState } from "react";
import { Card, Heading, Paragraph } from "@digdir/designsystemet-react";
import { FaCode, FaRunning } from "react-icons/fa";

const StatsCards = () => {
  const currentYear = new Date().getFullYear();
  const [runKm, setRunKm] = useState("...");
  const [codingHours, setCodingHours] = useState("...");
  const [codingLabel, setCodingLabel] = useState(`Koding i ${currentYear}`);
  const [codingLanguages, setCodingLanguages] = useState<string[]>([]);

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

  useEffect(() => {
    let active = true;

    const loadWakatime = async () => {
      try {
        const response = await fetch("https://api.vuhnger.dev/wakatime/stats/weekly", {
          cache: "no-store"
        });

        if (!response.ok) return;
        const data = await response.json();

        const range = data?.data?.range;
        if (range === "last_7_days") {
          setCodingLabel("Koding (7d)");
        } else if (range === "all_time") {
          setCodingLabel("Koding (all time)");
        }

        const codingCategory = data?.data?.categories?.find(
          (category: { name?: string }) => category?.name === "Coding"
        );
        const totalSeconds = codingCategory?.total_seconds ?? data?.data?.total_seconds;

        if (typeof totalSeconds === "number" && active) {
          const hours = totalSeconds / 3600;
          const formatted = new Intl.NumberFormat("no-NO", {
            maximumFractionDigits: hours >= 10 ? 0 : 1
          }).format(hours);
          setCodingHours(`${formatted} t`);
        }

        const languages = Array.isArray(data?.data?.languages)
          ? data.data.languages.slice(0, 4).map((lang: { name?: string }) => lang.name).filter(Boolean)
          : [];

        if (active && languages.length > 0) {
          setCodingLanguages(languages as string[]);
        }
      } catch {
        // Silent fail - keep placeholder
      }
    };

    loadWakatime();

    return () => {
      active = false;
    };
  }, []);

  const stats = [
    {
      key: "coding",
      icon: <FaCode style={{ fontSize: '1.125rem', color: 'var(--ds-color-accent-base-default)' }} />,
      value: codingHours,
      label: codingLabel,
      color: "var(--ds-color-accent-base-default)",
      extra: codingLanguages.length > 0 ? (
        <Paragraph
          data-size="xs"
          style={{
            color: 'var(--ds-color-neutral-text-default)',
            marginTop: '0.25rem',
            marginBottom: 0,
            fontSize: '0.6rem',
            lineHeight: 1.1,
            opacity: 0.7
          }}
        >
          {codingLanguages.join(" · ")}
        </Paragraph>
      ) : null
    },
    {
      key: "strava",
      icon: <FaRunning style={{ fontSize: '1.125rem', color: 'var(--ds-color-accent-second-default)' }} />,
      value: runKm,
      label: `Strava km i ${currentYear}`,
      color: "var(--ds-color-accent-second-default)",
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <Card
          key={stat.key}
          style={{
            padding: '0.625rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: 'color-mix(in srgb, var(--ds-color-neutral-background-default) 85%, transparent)',
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
            {stat.extra}
          </div>
        </Card>
      ))}
    </>
  );
};

export default StatsCards;
