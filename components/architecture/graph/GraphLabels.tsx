import type { LayoutNode } from "@/lib/architecture-layout";

import { LABEL_COLOR } from "./colors";
import type { GraphElements } from "./useGraphLayout";

const MONOSPACE = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

type Props = {
  nodes: readonly LayoutNode[];
  elements: GraphElements;
  active: string | null;
  /** Filer med minst så mange importører viser navnet sitt uten hover. */
  labelThreshold: number;
};

/**
 * Filnavnene.
 *
 * Alle navnene rendres alltid, og de som ikke skal synes står med opacity 0.
 * Alternativet - å montere og avmontere tekst ved hover - ville gjort at
 * `useGraphLayout` skrev posisjoner til elementer som ikke fantes.
 */
const GraphLabels = ({ nodes, elements, active, labelThreshold }: Props) => (
  <>
    {nodes.map((node, index) => {
      const visible = node.id === active || node.inDegree >= labelThreshold;
      return (
        <text
          key={node.id}
          ref={(element) => {
            elements.labels.current[index] = element;
          }}
          textAnchor="middle"
          fill={LABEL_COLOR}
          // Glorie i bakgrunnsfargen. Uten den leses navnene rett oppå noder og
          // streker, og en tett graf har ingen tomme flater å legge tekst i.
          // `paint-order` gjør at omrisset males under bokstavene, ikke over.
          stroke="var(--ds-color-neutral-background-default)"
          strokeWidth={3}
          strokeLinejoin="round"
          paintOrder="stroke"
          // Må settes eksplisitt: `fill-opacity` gjelder ikke omrisset, så uten
          // dette malte glorien til alle de skjulte navnene hull i nodene under.
          strokeOpacity={visible ? 1 : 0}
          fillOpacity={visible ? (node.id === active ? 1 : 0.65) : 0}
          fontSize={node.id === active ? 13 : 11}
          fontFamily={MONOSPACE}
          fontWeight={node.id === active ? 700 : 500}
        >
          {node.id}
        </text>
      );
    })}
  </>
);

export default GraphLabels;
