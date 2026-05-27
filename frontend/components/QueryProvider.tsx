'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Re-fetch when the tab regains focus — fixes the "need to refresh" issue
            refetchOnWindowFocus: true,
            // Re-fetch when the network reconnects
            refetchOnReconnect: true,
            // Keep data fresh for 30 seconds, then re-fetch in background
            staleTime: 30_000,
            // Auto-refresh every 60 seconds
            refetchInterval: 60_000,
            retry: 2,
          },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
