import { Card, Heading, Paragraph } from "@digdir/designsystemet-react";
import { Activity, Code2 } from "lucide-react";
import { fetchCodingStats, fetchRunningStats } from "@/services/api/stats";

const formatPace = (distanceMeters: number, movingTimeSeconds?: number) => {
  if (typeof movingTimeSeconds !== "number" || distanceMeters <= 0) return null;

  const km = distanceMeters / 1000;
  const paceSeconds = Math.round(movingTimeSeconds / km);
  const paceMinutes = Math.floor(paceSeconds / 60);
  const paceRemainder = String(paceSeconds % 60).padStart(2, "0");

  return `${paceMinutes}:${paceRemainder}/km`;
};

const cardStyle = {
  padding: "0.625rem",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between",
  backgroundColor: "color-mix(in srgb, var(--ds-color-neutral-background-default) 85%, transparent)",
  transition: "all 0.2s",
  border: "2px solid var(--ds-color-neutral-border-strong)",
};

export const StatsCardsLoading = () => (
  <>
    {["coding", "strava"].map((key) => (
      <Card key={key} aria-busy="true" style={cardStyle}>
        <Paragraph data-size="xs" style={{ margin: 0 }}>
          Laster statistikk...
        </Paragraph>
      </Card>
    ))}
  </>
);

const StatsCards = async () => {
  const currentYear = new Date().getFullYear();
  const [runningResult, codingResult] = await Promise.allSettled([
    fetchRunningStats(currentYear),
    fetchCodingStats(),
  ]);
  const runningStats = runningResult.status === "fulfilled" ? runningResult.value : undefined;
  const codingStats = codingResult.status === "fulfilled" ? codingResult.value : undefined;
  const runDistance = runningStats?.distanceMeters;
  const runKm = !runningStats || runningStats.distanceError
    ? "Utilgjengelig"
    : typeof runDistance === "number"
      ? `${new Intl.NumberFormat("no-NO", { maximumFractionDigits: 0 }).format(runDistance / 1000)} km`
      : "...";
  const topRuns = (runningStats?.activities ?? [])
    .toSorted((a, b) => b.distance - a.distance)
    .slice(0, 3)
    .map((activity, index) => {
      const formattedDistance = new Intl.NumberFormat("no-NO", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(activity.distance / 1000);
      const pace = formatPace(activity.distance, activity.movingTime);

      return pace
        ? `${index + 1}. ${formattedDistance} km · ${pace}`
        : `${index + 1}. ${formattedDistance} km`;
    });
  const codingSeconds = codingStats?.totalSeconds;
  const codingHours = !codingStats
    ? "Utilgjengelig"
    : typeof codingSeconds === "number"
      ? `${new Intl.NumberFormat("no-NO", {
          maximumFractionDigits: codingSeconds / 3600 >= 10 ? 0 : 1,
        }).format(codingSeconds / 3600)} t`
      : "...";
  const codingLabel =
    codingStats?.range === "last_7_days"
      ? "Koding (7d)"
      : codingStats?.range === "all_time"
        ? "Koding (all time)"
        : `Koding i ${currentYear}`;
  const codingLanguages = codingStats?.languages ?? [];

  const stats = [
    {
      key: "coding",
      icon: <Code2 aria-hidden="true" size={19} strokeWidth={2.25} absoluteStrokeWidth />,
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
      icon: <Activity aria-hidden="true" size={19} strokeWidth={2.25} absoluteStrokeWidth />,
      value: runKm,
      label: `Strava km i ${currentYear}`,
      color: "var(--ds-color-brand2-base-default)",
      extra: runningStats?.activitiesError ? (
        <Paragraph data-size="xs" style={{ margin: 0, opacity: 0.78 }}>
          Aktiviteter utilgjengelig
        </Paragraph>
      ) : topRuns.length > 0 ? (
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
          style={cardStyle}
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
