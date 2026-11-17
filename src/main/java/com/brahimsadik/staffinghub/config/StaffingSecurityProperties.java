package com.brahimsadik.staffinghub.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Security settings, under {@code staffing.security}.
 *
 * @param enabled        when false (dev profile only!), every endpoint is open
 * @param issuerUri      the OpenID Connect issuer of the company's login provider (Microsoft Entra ID, Google,
 *                       Keycloak, ...). Access tokens must be signed by it.
 * @param audience       when set, access tokens must be issued for this audience (e.g. the API's client id)
 * @param allowedOrigins browser origins allowed to call the API from another domain (e.g. the frontend's URL)
 * @param clientId       the client id the frontend uses to log users in with the provider
 * @param scope          the scopes the frontend requests (space-separated)
 */
@ConfigurationProperties("staffing.security")
public record StaffingSecurityProperties(
        @DefaultValue("true") boolean enabled,
        String issuerUri,
        String audience,
        @DefaultValue List<String> allowedOrigins,
        String clientId,
        @DefaultValue("openid profile email") String scope) {
}
