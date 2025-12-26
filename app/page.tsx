import BentoGrid from "@/components/home/BentoGrid";
import MstVisualization from "@/components/home/MstVisualization";

export default function Home() {
  return (
    <div
      className="relative isolate min-h-screen overflow-hidden pt-16 pb-6 px-4"
      style={{ backgroundColor: 'var(--ds-color-neutral-background-default)' }}
    >
      <MstVisualization />
      <div className="relative z-10">
        <BentoGrid />
      </div>
    </div>
  );
}
