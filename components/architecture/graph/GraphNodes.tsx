import type { Runtime } from "@/lib/architecture";
import type { LayoutNode } from "@/lib/architecture-layout";

import { LAYER_FILL, LAYER_STROKE } from "./colors";
import { nodeRadius } from "./summary";
import type { GraphElements } from "./useGraphLayout";

type Props = {
  nodes: readonly LayoutNode[];
  runtimeOf: ReadonlyMap<string, Runtime>;
  elements: GraphElements;
  active: string | null;
  activeSet: ReadonlySet<string> | null;
  onActivate: (id: string | null) => void;
};

/** Nodene. Koordinatene skrives av `useGraphLayout`, ikke her. */
const GraphNodes = ({
  nodes,
  runtimeOf,
  elements,
  active,
  activeSet,
  onActivate,
}: Props) => (
  <>
    {nodes.map((node, index) => {
      const dimmed = activeSet !== null && !activeSet.has(node.id);
      const isClient = runtimeOf.get(node.id) === "client";
      return (
        <circle
          key={node.id}
          ref={(element) => {
            elements.nodes.current[index] = element;
          }}
          r={nodeRadius(node.inDegree)}
          // Farge sier hvilket lag filen ligger i, fylt eller åpen sier om den
          // havner i nettleseren. To kanaler, så ingen av dem trenger å bære to
          // betydninger samtidig.
          fill={isClient ? LAYER_FILL[node.layer] : "none"}
          fillOpacity={0.9}
          // Omrisset bærer kontrasten mot bakgrunnen, og er hele fargen på de
          // åpne servernodene.
          stroke={LAYER_STROKE[node.layer]}
          strokeWidth={node.id === active ? 2.5 : isClient ? 1 : 1.8}
          opacity={dimmed ? 0.18 : 1}
          // Hover direkte på grafen. Nodene får ikke tabindex: 85 tabstopp i en
          // SVG er ubrukelig navigasjon, og hover viser bare filnavnet, som ikke
          // er informasjon `aria-label` mangler.
          onMouseEnter={() => onActivate(node.id)}
          onMouseLeave={() => onActivate(null)}
          style={{ cursor: "pointer" }}
        />
      );
    })}
  </>
);

export default GraphNodes;
