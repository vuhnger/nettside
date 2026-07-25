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
  const heatmap = data && data.cells.length > 0 ? data : null;

  const statusMessage = () => {
    if (isPending) return "Henter løpedata...";
    if (isError) return "Fikk ikke tak i løpedataen akkurat nå. Prøv igjen senere.";
    if (!heatmap) return "Ingen turer å vise ennå.";
    // Kartet står for seg selv visuelt, så her trengs bare bekreftelsen på at
    // ventingen er over. Tallene ligger i teksten under kartet.
    return "Kartet er klart.";
  };

  // Tallene beskriver all løpingen, ikke det kartet viser: `activityCount` teller
  // også tredemølleturer, som ikke har GPS og dermed ingen geometri å tegne. De
  // står derfor som en egen opplysning framfor «varmekart over N turer», som
  // ville vært en påstand om kartet som ikke holder.
  const summary = heatmap
    ? `Varmekart over løpeturene mine. ${heatmap.activityCount} turer og ${formatKm(
        heatmap.totalDistanceM,
      )} kilometer til sammen.`
    : null;

  return (
    <>
      {/*
        Live-regionen står montert i alle tilstander. Byttet fra venting til feil
        eller ferdig kart skjer etter at siden er lest opp, og en region som først
        dukker opp sammen med meldingen blir ikke annonsert i det hele tatt.
      */}
      <div role="status" aria-busy={isPending}>
        {heatmap ? (
          <span className="sr-only">{statusMessage()}</span>
        ) : (
          <MapPlaceholder>{statusMessage()}</MapPlaceholder>
        )}
      </div>

      {heatmap && summary && (
        <figure style={{ margin: 0 }}>
          {/*
            Lerretet har ikke noe innhold en skjermleser kan lese, og
            oppsummeringen under er uansett den informasjonen kartet formidler.
            Den dobles derfor som tilgjengelig navn framfor at kartet blir et
            tomt element.
          */}
          <HeatmapMap heatmap={heatmap} label={summary} />
          <figcaption>
            <Paragraph
              data-size="sm"
              style={{ marginTop: "0.75rem", marginBottom: 0, color: "var(--ds-color-neutral-text-subtle)" }}
            >
              {summary} Kartet åpner over Oslo, der jeg løper mest — zoom ut for turer
              lenger unna. Jo sterkere farge, jo flere turer har gått samme vei. Turer
              uten GPS vises ikke, og området rundt hjemmet mitt er filtrert bort.
            </Paragraph>
          </figcaption>
        </figure>
      )}
    </>
  );
};

export default RunningHeatmap;
