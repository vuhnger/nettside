"use client";

import { useEffect, useState } from "react";
import { Card, Heading, Paragraph } from "@digdir/designsystemet-react";

const CodeIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" style={{ width: '1.125rem', height: '1.125rem' }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m8 16-4-4 4-4" />
    <path d="m16 8 4 4-4 4" />
    <path d="m14 4-4 16" />
  </svg>
);

const RunningIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" style={{ width: '1.125rem', height: '1.125rem' }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="17" cy="5" r="1.5" />
    <path d="M14 8.5 11.5 12l-2.5 1" />
    <path d="m7 22 2-6 2.5 2 1.5 4" />
    <path d="m12 10 3 2 4 .5" />
    <path d="M8.5 14.5 5 18" />
  </svg>
);

const StatsCards = () => {
  const currentYear = new Date().getFullYear();
  const [runKm, setRunKm] = useState("...");
  const [topRuns, setTopRuns] = useState<string[]>([]);
  const [codingHours, setCodingHours] = useState("...");
  const [codingLabel, setCodingLabel] = useState(`Koding i ${currentYear}`);
  const [codingLanguages, setCodingLanguages] = useState<string[]>([]);

  const formatPace = (distanceMeters: number, movingTimeSeconds?: number) => {
    if (typeof movingTimeSeconds !== "number" || distanceMeters <= 0) return null;

    const km = distanceMeters / 1000;
    const paceSeconds = Math.round(movingTimeSeconds / km);
    const paceMinutes = Math.floor(paceSeconds / 60);
    const paceRemainder = String(paceSeconds % 60).padStart(2, "0");

    return `${paceMinutes}:${paceRemainder}/km`;
  };

  useEffect(() => {
    let active = true;

    const loadStravaStats = async () => {
      try {
        const [ytdResponse, activitiesResponse] = await Promise.all([
          fetch("https://api.vuhnger.dev/strava/stats/ytd", {
            cache: "no-store"
          }),
          fetch(`https://api.vuhnger.dev/strava/activities?year=${currentYear}&activity_type=Run&limit=500`, {
            cache: "no-store"
          })
        ]);

        if (ytdResponse.ok) {
          const data = await ytdResponse.json();
          const distance = data?.data?.run?.distance;

          if (typeof distance === "number" && active) {
            const km = distance / 1000;
            const formatted = new Intl.NumberFormat("no-NO", {
              maximumFractionDigits: 0
            }).format(km);

            setRunKm(`${formatted} km`);
          }
        }

        if (activitiesResponse.ok) {
          const data = await activitiesResponse.json();
          const activities = Array.isArray(data?.data) ? data.data : [];

          if (active && activities.length > 0) {
            const topThreeRuns = activities
              .filter((activity: { distance?: number }) => typeof activity?.distance === "number")
              .sort(
                (
                  a: { distance: number },
                  b: { distance: number }
                ) => b.distance - a.distance
              )
              .slice(0, 3)
              .map((activity: { distance: number; moving_time?: number }, index: number) => {
                const formattedDistance = new Intl.NumberFormat("no-NO", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1
                }).format(activity.distance / 1000);
                const pace = formatPace(activity.distance, activity.moving_time);

                return pace
                  ? `${index + 1}. ${formattedDistance} km · ${pace}`
                  : `${index + 1}. ${formattedDistance} km`;
              });

            setTopRuns(topThreeRuns);
          }
        }
      } catch {
        // Silent fail - keep placeholder
      }
    };

    loadStravaStats();

    return () => {
      active = false;
    };
  }, [currentYear]);

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
      icon: <CodeIcon />,
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
      icon: <RunningIcon />,
      value: runKm,
      label: `Strava km i ${currentYear}`,
      color: "var(--ds-color-brand2-base-default)",
      extra: topRuns.length > 0 ? (
        <div style={{ marginTop: '0.25rem' }}>
          {topRuns.map((run) => (
            <Paragraph
              key={run}
              data-size="xs"
              style={{
                color: 'var(--ds-color-neutral-text-default)',
                margin: 0,
                fontSize: '0.8rem',
                lineHeight: 1.25,
                opacity: 0.78
              }}
            >
              {run}
            </Paragraph>
          ))}
        </div>
      ) : null
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
            <span style={{ display: 'inline-flex', color: stat.color }}>
              {stat.icon}
            </span>
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
