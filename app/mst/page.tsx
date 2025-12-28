import MstVisualization from "@/components/home/MstVisualization";

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
