import { Heading } from "@digdir/designsystemet-react";

import AStarVisualization from "@/components/home/AStarVisualization";

export default function NotFound() {
  return (
    <main
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-24"
      style={{ backgroundColor: "var(--ds-color-neutral-background-default)" }}
    >
      <AStarVisualization />

      <div className="relative z-10 text-center">
        <Heading data-size="lg" style={{ margin: 0 }}>
          Oops, denne siden finnes ikke!
        </Heading>
      </div>
    </main>
  );
}
