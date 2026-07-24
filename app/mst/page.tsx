import type { Metadata } from "next";
import MstVisualization from "@/components/home/MstVisualization";

export const metadata: Metadata = {
  title: "MST",
  description:
    "Interaktiv visualisering av et minimum spanning tree (MST) - en av datastrukturene bak den visuelle identiteten på siden.",
};

export default function MstPage() {
  return (
    <div
      className="relative isolate min-h-screen overflow-hidden"
      style={{ backgroundColor: "var(--ds-color-neutral-background-default)" }}
    >
      <MstVisualization />
    </div>
  );
}
