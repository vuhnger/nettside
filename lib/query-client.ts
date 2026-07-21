import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = (retry: boolean | number = 1) =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry,
        refetchOnWindowFocus: false,
      },
    },
  });
