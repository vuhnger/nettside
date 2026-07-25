import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Heading } from "@digdir/designsystemet-react";
import { isRunningHeatmapEnabled } from "@/lib/features";
import { createQueryClient } from "@/lib/query-client";
import RunningHeatmap from "@/components/running/RunningHeatmap";
import { runningHeatmapQueryOptions } from "@/components/running/queries";

export const metadata: Metadata = {
  title: "Løping",
  description:
    "",
};

export default async function RunningPage() {
  // Er bryteren av, skal ruten ikke finnes. `notFound` framfor en redirect eller
  // en «kommer snart»-side: en avslått funksjon skal ikke kunne oppdages ved å
  // gjette på adressen, og den skal ikke ligge i indeksen.
  if (!isRunningHeatmapEnabled) notFound();

  const queryClient = createQueryClient(false);

  // Aggregatet er den tyngste responsen på siden. Hentes den på serveren, står
  // kartet ferdig med data i det klientkoden tar over, framfor å vise en tom
  // boks mens nettleseren gjør sitt eget kall.
  await queryClient.prefetchQuery(runningHeatmapQueryOptions());

  return (
    <div
      className="relative min-h-screen overflow-hidden pt-20 pb-16 px-4"
      style={{ backgroundColor: "var(--ds-color-neutral-background-default)" }}
    >
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-6">
          <Heading data-size="lg" style={{ marginBottom: "0.25rem" }}>
            Løping
          </Heading>
        </div>

        <HydrationBoundary state={dehydrate(queryClient)}>
          <RunningHeatmap />
        </HydrationBoundary>
      </div>
    </div>
  );
}
