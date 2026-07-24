import type { EdgeLink, EdgeNode, Mode } from "./types";

export const MODES: { value: Mode; label: string; shortLabel: string }[] = [
  { value: "k8s", label: "Standard K8s", shortLabel: "K8s" },
  { value: "kubeedge", label: "KubeEdge basis", shortLabel: "KubeEdge" },
  { value: "edgemesh", label: "KubeEdge mesh", shortLabel: "EdgeMesh" },
];

/** Sky-noden på toppen kobler til hver kant-node; kant-nodene danner en mesh. */
export const LINKS: EdgeLink[] = [
  { id: "cloud-a", from: "cloud", to: "edge-a", kind: "cloud" },
  { id: "cloud-b", from: "cloud", to: "edge-b", kind: "cloud" },
  { id: "cloud-c", from: "cloud", to: "edge-c", kind: "cloud" },
  { id: "mesh-ab", from: "edge-a", to: "edge-b", kind: "mesh" },
  { id: "mesh-bc", from: "edge-b", to: "edge-c", kind: "mesh" },
  { id: "mesh-ca", from: "edge-c", to: "edge-a", kind: "mesh" },
];

/** Plasserer sky- og kant-nodene relativt til kartets størrelse. */
export const createNodes = (width: number, height: number): EdgeNode[] => {
  const safeWidth = width || 1;
  const safeHeight = height || 1;
  const compact = safeWidth < 420;
  const topY = safeHeight * (compact ? 0.18 : 0.16);
  const edgeY = safeHeight * (compact ? 0.7 : 0.68);
  const bottomY = safeHeight * (compact ? 0.86 : 0.84);

  return [
    { id: "cloud", label: "CloudCore", type: "cloud", position: { x: safeWidth * 0.5, y: topY } },
    { id: "edge-a", label: "OpenWrt-ruter", type: "edge", position: { x: safeWidth * 0.2, y: edgeY } },
    { id: "edge-b", label: "OpenWrt-ruter", type: "edge", position: { x: safeWidth * 0.8, y: edgeY } },
    { id: "edge-c", label: "OpenWrt-ruter", type: "edge", position: { x: safeWidth * 0.5, y: bottomY } },
  ];
};
