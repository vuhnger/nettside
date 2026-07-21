import BentoGrid from "@/components/home/BentoGrid";
import HomeVisualization from "@/components/home/HomeVisualization";

export default function Home() {
  return (
    <div
      className="relative isolate min-h-screen overflow-hidden pt-16 pb-6 px-4"
      style={{ backgroundColor: 'var(--ds-color-neutral-background-default)' }}
    >
      <HomeVisualization />
      <div className="relative z-10">
        <BentoGrid />
      </div>
    </div>
  );
}
