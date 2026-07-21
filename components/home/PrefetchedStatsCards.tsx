import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/query-client";
import StatsCards from "./StatsCards";
import {
  codingStatsQueryOptions,
  runningActivitiesQueryOptions,
  runningDistanceQueryOptions,
} from "./queries";

const PrefetchedStatsCards = async () => {
  const currentYear = new Date().getFullYear();
  const queryClient = createQueryClient(false);

  await Promise.all([
    queryClient.prefetchQuery(runningDistanceQueryOptions()),
    queryClient.prefetchQuery(runningActivitiesQueryOptions(currentYear)),
    queryClient.prefetchQuery(codingStatsQueryOptions()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StatsCards currentYear={currentYear} />
    </HydrationBoundary>
  );
};

export default PrefetchedStatsCards;
