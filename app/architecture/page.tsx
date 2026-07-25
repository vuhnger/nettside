import type { Metadata } from "next";

import ArchitectureGraph from "@/components/architecture/ArchitectureGraph";

export const metadata: Metadata = {
  title: "Arkitektur",
  description:
    "Importgrafen til denne nettsiden, generert fra kildekoden. Viser hvilke filer som avhenger av hverandre, og hvilke av dem som havner i nettleserbunten.",
};

export default function ArchitecturePage() {
  return (
    <div
      className="min-h-screen px-4 pt-20 pb-12"
      style={{ backgroundColor: "var(--ds-color-neutral-background-default)" }}
    >
      <div className="mx-auto max-w-6xl">
        <ArchitectureGraph />
      </div>
    </div>
  );
}
