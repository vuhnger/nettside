import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/query-client";
import ApiStatusLink from "./ApiStatusLink";
import { apiStatusQueryOptions } from "./queries";

const PrefetchedApiStatusLink = async () => {
  const queryClient = createQueryClient(false);
  await queryClient.prefetchQuery(apiStatusQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ApiStatusLink />
    </HydrationBoundary>
  );
};

export default PrefetchedApiStatusLink;
