import { Link as NextLink } from "next-view-transitions";
import { Card, Heading, Paragraph } from "@digdir/designsystemet-react";
import { Activity } from "lucide-react";
import { rasterizeCells } from "@/lib/heatmap";
import type { RunningHeatmap } from "@/services/api/heatmap";

// Omtrent kvadratisk, fordi utstrekningen på turene er det. Et bredere utsnitt
// ville bare lagt til tom luft på sidene.
const TEASER_WIDTH = 300;
const TEASER_HEIGHT = 260;

/**
 * Rutestørrelsen i piksler. En 15-meters celle er uansett mindre enn en piksel
 * i denne størrelsen, så å tegne hver enkelt ville lagt tusenvis av elementer i
 * HTML-en uten å endre hva man ser.
 */
const TEASER_PIXEL_SIZE = 3;

const formatKm = (meters: number) =>
  new Intl.NumberFormat("no-NO", { maximumFractionDigits: 0 }).format(meters / 1000);

const cardStyle = {
  padding: "0.75rem",
  height: "100%",
  backgroundColor: "color-mix(in srgb, var(--ds-color-neutral-background-default) 85%, transparent)",
  border: "2px solid var(--ds-color-accent-base-default)",
  boxShadow: "var(--accent-shadow)",
  cursor: "pointer",
};

const HeatmapTeaser = ({ heatmap }: { heatmap: RunningHeatmap }) => {
  const points = rasterizeCells(
    heatmap.cells,
    heatmap.bounds,
    TEASER_WIDTH,
    TEASER_HEIGHT,
    TEASER_PIXEL_SIZE,
  );

  return (
    <NextLink
      href="/running"
      aria-label="Løping"
      className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-color-accent-base-default)] focus-visible:ring-offset-2"
    >
      <Card
        className="relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-sm motion-reduce:transform-none"
        style={cardStyle}
      >
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="order-2 sm:order-1">
            <div className="flex items-center gap-2">
              <Activity
                aria-hidden="true"
                size={19}
                strokeWidth={2.25}
                absoluteStrokeWidth
                style={{ color: "var(--ds-color-accent-base-default)" }}
              />
              <Heading
                data-size="xs"
                style={{ margin: 0, color: "var(--ds-color-accent-base-default)" }}
              >
                Løping
              </Heading>
            </div>
            <Paragraph
              data-size="xs"
              style={{ margin: "0.25rem 0 0", color: "var(--ds-color-neutral-text-default)" }}
            >
              {heatmap.activityCount} turer · {formatKm(heatmap.totalDistanceM)} km
            </Paragraph>
            <Paragraph
              data-size="xs"
              style={{ margin: 0, color: "var(--ds-color-neutral-text-subtle)", opacity: 0.78 }}
            >
              Se hele varmekartet
            </Paragraph>
          </div>

          {/*
            Dekorativt: alt kartet forteller står allerede i teksten ved siden av,
            så en skjermleser skal hoppe over det framfor å få en beskrivelse til.
          */}
          <svg
            className="order-1 h-28 w-auto sm:order-2 sm:h-32"
            viewBox={`0 0 ${TEASER_WIDTH} ${TEASER_HEIGHT}`}
            aria-hidden="true"
            focusable="false"
          >
            {points.map((point) => (
              <circle
                key={`${point.x}:${point.y}`}
                cx={point.x}
                cy={point.y}
                r={TEASER_PIXEL_SIZE / 2}
                fill="var(--ds-color-accent-base-default)"
                // Gjentatte ruter lyser sterkere, akkurat som i det store kartet.
                fillOpacity={(0.25 + 0.75 * point.weight).toFixed(2)}
              />
            ))}
          </svg>
        </div>
      </Card>
    </NextLink>
  );
};

export default HeatmapTeaser;
