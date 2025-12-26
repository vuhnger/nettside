import BentoGrid from "@/components/home/BentoGrid";

export default function Home() {
  return (
    <div
      className="min-h-screen pt-20 pb-8 px-4"
      style={{ backgroundColor: 'var(--ds-color-neutral-background-default)' }}
    >
      <BentoGrid />
    </div>
  );
}
