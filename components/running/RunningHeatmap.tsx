"use client";

import dynamic from "next/dynamic";
import { Paragraph } from "@digdir/designsystemet-react";
import { useQuery } from "@tanstack/react-query";
import { runningHeatmapQueryOptions } from "./queries";

/**
 * Kartbiblioteket er tungt og rører DOM-et med én gang, så det holdes utenfor
 * serverrenderingen og lastes først når kartet faktisk skal vises.
 */
const HeatmapMap = dynamic(() => import("./HeatmapMap"), {
  ssr: false,
  loading: () => <MapPlaceholder>Laster kart...</MapPlaceholder>,
});

const formatKm = (meters: number) =>
  new Intl.NumberFormat("no-NO", { maximumFractionDigits: 0 }).format(meters / 1000);

const MapPlaceholder = ({ children }: { children: React.ReactNode }) => (
  <div
    className="flex h-[60vh] min-h-[380px] w-full items-center justify-center"
    style={{
      borderRadius: "0.5rem",
      border: "2px solid var(--ds-color-neutral-border-strong)",
      backgroundColor: "var(--ds-color-neutral-background-tinted)",
    }}
  >
    <Paragraph data-size="sm" style={{ margin: 0 }}>
      {children}
    </Paragraph>
  </div>
);

const RunningHeatmap = () => {
  const { data, isPending, isError } = useQuery(runningHeatmapQueryOptions());

  if (isPending) {
    return (
      <div aria-busy="true">
        <MapPlaceholder>Henter løpedata...</MapPlaceholder>
      </div>
    );
  }

  if (isError) {
    return (
      <MapPlaceholder>
        Fikk ikke tak i løpedataen akkurat nå. Prøv igjen senere.
      </MapPlaceholder>
    );
  }

  if (data.cells.length === 0) {
    return <MapPlaceholder>Ingen turer å vise ennå.</MapPlaceholder>;
  }

  const summary = `Varmekart over ${data.activityCount} løpeturer, til sammen ${formatKm(
    data.totalDistanceM,
  )} kilometer.`;

  return (
    <figure style={{ margin: 0 }}>
      {/*
        Lerretet har ikke noe innhold en skjermleser kan lese, og oppsummeringen
        under er uansett den informasjonen kartet formidler. Den dobles derfor
        som tilgjengelig navn framfor at kartet blir et tomt element.
      */}
      <HeatmapMap heatmap={data} label={summary} />
      <figcaption>
        <Paragraph
          data-size="sm"
          style={{ marginTop: "0.75rem", marginBottom: 0, color: "var(--ds-color-neutral-text-subtle)" }}
        >
          {summary} Jo sterkere farge, jo flere turer har gått samme vei. Området rundt
          hjemmet mitt er filtrert bort.
        </Paragraph>
      </figcaption>
    </figure>
  );
};

export default RunningHeatmap;
