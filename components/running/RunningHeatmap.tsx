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

/**
 * Lerretet har ikke noe innhold en skjermleser kan lese, så uten et navn blir
 * kartet et tomt element. Holdes kort og usynlig — det er en merkelapp, ikke en
 * bildetekst.
 */
const MAP_LABEL = "Varmekart over løpeturene mine";

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
    // Sier bevisst «hentet», ikke «klart»: kartbiblioteket lastes som en egen
    // chunk, så spørringen kan være ferdig mens lerretet ennå viser
    // reservevisningen. Å melde kartet klart før det er tegnet ville sendt en
    // skjermleserbruker til et element som ikke finnes enda.
    return "Løpedataen er hentet.";
  };

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

      {heatmap && <HeatmapMap heatmap={heatmap} label={MAP_LABEL} />}
    </>
  );
};

export default RunningHeatmap;
