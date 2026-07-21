import BentoGrid from "@/components/home/BentoGrid";
import LazyMstVisualization from "@/components/home/LazyMstVisualization";

export default function Home() {
  return (
    <div
      className="relative isolate min-h-screen overflow-hidden pt-16 pb-6 px-4"
      style={{ backgroundColor: 'var(--ds-color-neutral-background-default)' }}
    >
      <LazyMstVisualization />
      <div className="relative z-10">
        <BentoGrid />
      </div>
    </div>
  );
}
