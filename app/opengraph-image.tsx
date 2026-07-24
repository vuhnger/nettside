import { ImageResponse } from "next/og";

import { minimumSpanningTree, type Point } from "@/lib/mst";

export const alt = "Victor Uhnger - Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Deterministisk PRNG slik at OG-bildet blir likt for hver build.
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Sprer et fast antall noder utover flaten med litt avstand mellom seg.
const buildNodes = (): Point[] => {
  const random = mulberry32(20240724);
  const nodeCount = 16;
  const margin = 70;
  const minDistance = 110;
  const nodes: Point[] = [];

  for (let index = 0; index < nodeCount; index += 1) {
    let point: Point = { x: 0, y: 0 };
    let attempts = 0;
    do {
      point = {
        x: margin + random() * (size.width - margin * 2),
        y: margin + random() * (size.height - margin * 2),
      };
      attempts += 1;
    } while (
      attempts < 60 &&
      nodes.some((node) => Math.hypot(node.x - point.x, node.y - point.y) < minDistance)
    );
    nodes.push(point);
  }

  return nodes;
};

export default function OpenGraphImage() {
  const nodes = buildNodes();
  const edges = minimumSpanningTree(nodes);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        <svg
          width={size.width}
          height={size.height}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {edges.map((edge, index) => (
            <line
              key={`edge-${index}`}
              x1={nodes[edge.a].x}
              y1={nodes[edge.a].y}
              x2={nodes[edge.b].x}
              y2={nodes[edge.b].y}
              stroke="#3b82f6"
              strokeOpacity={0.5}
              strokeWidth={2.5}
            />
          ))}
          {nodes.map((node, index) => (
            <circle
              key={`node-${index}`}
              cx={node.x}
              cy={node.y}
              r={7}
              fill="#0f172a"
              stroke="#3b82f6"
              strokeOpacity={0.85}
              strokeWidth={2}
            />
          ))}
        </svg>

        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "80px",
            right: "80px",
            bottom: "80px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <svg width="72" height="72" viewBox="0 0 32 32" fill="none">
              <g
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9,8 17,16 9,24" />
                <line x1="20" y1="24" x2="26" y2="24" />
              </g>
            </svg>
            <span style={{ color: "#94a3b8", fontSize: "34px", fontWeight: 600 }}>
              vuhnger.dev
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <span style={{ color: "#f8fafc", fontSize: "84px", fontWeight: 800 }}>
              Victor Uhnger
            </span>
            <span style={{ color: "#cbd5e1", fontSize: "40px", fontWeight: 500 }}>
              Master i systemarkitektur og fullstack-utvikler
            </span>
          </div>

          <div
            style={{
              height: "8px",
              width: "220px",
              borderRadius: "9999px",
              backgroundColor: "#3b82f6",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
