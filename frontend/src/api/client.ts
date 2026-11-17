import createClient from 'openapi-fetch';
import type { paths } from './schema';

/** Typed client for the backend API (types generated from its OpenAPI description). */
// Same origin as the page: the API is served by the same application (or proxied to it in development).
export const api = createClient<paths>({
  baseUrl: window.location.origin,
  // Looked up on every call (not captured once), so that test tools can intercept requests.
  fetch: (request) => globalThis.fetch(request),
});

type AccessTokenProvider = () => Promise<string | null>;
type UnauthorizedHandler = () => void;

let accessTokenProvider: AccessTokenProvider = async () => null;
let unauthorizedHandler: UnauthorizedHandler = () => {};

/** Called by the auth layer once the user is logged in (not called at all when login is disabled). */
export function configureApiAuth(provider: AccessTokenProvider, onUnauthorized: UnauthorizedHandler) {
  accessTokenProvider = provider;
  unauthorizedHandler = onUnauthorized;
}

api.use({
  async onRequest({ request }) {
    const token = await accessTokenProvider();
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    return request;
  },
  onResponse({ response }) {
    if (response.status === 401) {
      unauthorizedHandler();
    }
    return response;
  },
});
