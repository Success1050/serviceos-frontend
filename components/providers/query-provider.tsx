"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 3, // 3 minutes stale time
            gcTime: 1000 * 60 * 15,    // 15 minutes garbage collection time
            refetchOnWindowFocus: true,
            retry: (failureCount, error: any) => {
              if (error?.response?.status === 401 || error?.response?.status === 403 || error?.response?.status === 404) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export default QueryProvider;
