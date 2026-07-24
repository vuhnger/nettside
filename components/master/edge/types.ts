export type Mode = "k8s" | "kubeedge" | "edgemesh";

export type NodeId = "cloud" | "edge-a" | "edge-b" | "edge-c";

export type EdgeNode = {
  id: NodeId;
  label: string;
  type: "cloud" | "edge";
  position: { x: number; y: number };
};

export type EdgeLink = {
  id: string;
  from: NodeId;
  to: NodeId;
  kind: "cloud" | "mesh";
};

export type Particle = {
  id: string;
  from: NodeId;
  to: NodeId;
  duration: number;
  delay: number;
  dropAt: number | null;
  stutter: boolean;
  color: string;
};
