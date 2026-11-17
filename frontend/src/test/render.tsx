import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation, type Location } from 'react-router';
import { cssVariablesResolver, theme } from '@/theme';

/**
 * Renders a page with every provider the app has, at the given URL. Uses a MemoryRouter: React Router's data routers
 * build fetch Requests on navigation, which fail under jsdom.
 */
export function renderPage(element: ReactElement, { path = '/', url = '/' }: { path?: string; url?: string } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const location: { current?: Location } = {};
  const result = render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver}>
        <ModalsProvider>
          <Notifications />
          <MemoryRouter initialEntries={[url]}>
            <LocationSpy target={location} />
            <Routes>
              <Route path={path} element={element} />
            </Routes>
          </MemoryRouter>
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>,
  );
  return { ...result, location };
}

function LocationSpy({ target }: { target: { current?: Location } }) {
  target.current = useLocation();
  return null;
}
