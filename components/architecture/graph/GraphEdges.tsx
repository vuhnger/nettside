import type { LayoutEdge } from "@/lib/architecture-layout";

import { EDGE_ACTIVE_COLOR, EDGE_COLOR } from "./colors";
import type { GraphElements } from "./useGraphLayout";

/**
 * Pilspissene er egne markører og ikke `context-stroke`, som ikke er støttet
 * bredt nok ennå. `userSpaceOnUse` gjør at spissen har samme størrelse uansett
 * strektykkelse, så en markert kant ikke får en uforholdsmessig stor pil.
 */
const ArrowHeads = () => (
  <defs>
    <marker
      id="graph-arrow"
      viewBox="0 0 8 8"
      refX="7"
      refY="4"
      markerWidth="7"
      markerHeight="7"
      markerUnits="userSpaceOnUse"
      orient="auto"
    >
      <path d="M0,0 L8,4 L0,8 z" fill={EDGE_COLOR} fillOpacity="0.55" />
    </marker>
    <marker
      id="graph-arrow-active"
      viewBox="0 0 8 8"
      refX="7"
      refY="4"
      markerWidth="9"
      markerHeight="9"
      markerUnits="userSpaceOnUse"
      orient="auto"
    >
      <path d="M0,0 L8,4 L0,8 z" fill={EDGE_ACTIVE_COLOR} />
    </marker>
  </defs>
);

type Props = {
  edges: readonly LayoutEdge[];
  elements: GraphElements;
  active: string | null;
  hasActive: boolean;
};

/** Kantene. Koordinatene skrives av `useGraphLayout`, ikke her. */
const GraphEdges = ({ edges, elements, active, hasActive }: Props) => (
  <>
    <ArrowHeads />
    {edges.map((edge, index) => {
      const highlighted = hasActive && (edge.from === active || edge.to === active);
      const dimmed = hasActive && !highlighted;
      return (
        <line
          key={`${edge.from}->${edge.to}`}
          ref={(element) => {
            elements.edges.current[index] = element;
          }}
          stroke={highlighted ? EDGE_ACTIVE_COLOR : EDGE_COLOR}
          strokeOpacity={!hasActive ? 0.32 : highlighted ? 0.9 : 0.07}
          strokeWidth={highlighted ? 1.6 : 1}
          // Dempede kanter mister pilspissen: 127 piler mens noe annet er
          // markert er bare støy.
          markerEnd={
            dimmed
              ? undefined
              : `url(#${highlighted ? "graph-arrow-active" : "graph-arrow"})`
          }
        />
      );
    })}
  </>
);

export default GraphEdges;
