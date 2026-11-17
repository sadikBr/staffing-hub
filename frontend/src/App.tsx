import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { ApiError } from './api/errors';
import { AuthRoot } from './auth/AuthRoot';
import { PermissionsProvider } from './auth/PermissionsProvider';
import { createRouter } from './router';
import { cssVariablesResolver, theme } from './theme';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        // Retrying a 4xx (not found, forbidden...) cannot help.
        retry: (failureCount, error) => !(error instanceof ApiError && error.status < 500) && failureCount < 2,
      },
    },
  });
}

export function App() {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} defaultColorScheme="auto">
        <DatesProvider settings={{ firstDayOfWeek: 1 }}>
          <ModalsProvider>
            <Notifications position="bottom-right" />
            <AuthRoot>
              <PermissionsProvider>
                <Routes />
              </PermissionsProvider>
            </AuthRoot>
          </ModalsProvider>
        </DatesProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

/** Created only once logged in, so that the router starts from the URL restored after login. */
function Routes() {
  const [router] = useState(createRouter);
  return <RouterProvider router={router} />;
}
