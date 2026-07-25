import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Heading, Paragraph } from "@digdir/designsystemet-react";
import { createQueryClient } from "@/lib/query-client";
import RunningHeatmap from "@/components/running/RunningHeatmap";
import { runningHeatmapQueryOptions } from "@/components/running/queries";

export const metadata: Metadata = {
  title: "Løping",
  description:
    "Varmekart over alle løpeturene mine, aggregert fra Strava. Jo sterkere farge, jo flere turer har gått samme vei.",
};

export default async function RunningPage() {
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
          <Paragraph data-size="sm" style={{ margin: 0, color: "var(--ds-color-neutral-text-default)" }}>
            Hver tur jeg har logget på Strava, lagt oppå hverandre. Rutene er slått sammen
            til et rutenett på serveren, så kartet viser hvor ofte jeg har løpt et sted -
            ikke enkeltturer.
          </Paragraph>
        </div>

        <HydrationBoundary state={dehydrate(queryClient)}>
          <RunningHeatmap />
        </HydrationBoundary>
      </div>
    </div>
  );
}
