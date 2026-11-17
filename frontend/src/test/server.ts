import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

/** Fake API for component tests. Tests add the handlers they need with `server.use(...)`. */
export const server = setupServer(
  http.get('*/api/roles', () => HttpResponse.json([])),
  http.get('*/api/technologies', () => HttpResponse.json([])),
);
