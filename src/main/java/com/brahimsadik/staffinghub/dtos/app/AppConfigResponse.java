package com.brahimsadik.staffinghub.dtos.app;

import org.jspecify.annotations.Nullable;

/**
 * What the frontend needs to know at startup. When {@code authEnabled} is false (dev profile), no login happens.
 *
 * @param authority the OpenID Connect issuer to log in with
 * @param clientId  the frontend's client id at that issuer
 * @param scope     the scopes to request, space-separated
 */
public record AppConfigResponse(boolean authEnabled, @Nullable String authority, @Nullable String clientId, String scope) {
}
