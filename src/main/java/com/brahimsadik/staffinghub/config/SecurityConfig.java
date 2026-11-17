package com.brahimsadik.staffinghub.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.SupplierJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Every API call ({@code /api/**}) needs a valid access token (a JWT) from the company's OpenID Connect provider, sent
 * as {@code Authorization: Bearer <token>}. The API is stateless: no sessions, no cookies, hence no CSRF protection
 * needed. The frontend's files, its runtime configuration, the API docs and the health check stay public: the
 * frontend itself sends users to the login provider.
 * <p>
 * What each user may do comes from a role claim of their token (see {@link AppRole} and {@link RoleClaimConverter}):
 * viewers read, staffers also manage people and missions, admins also manage reference data.
 */
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(StaffingSecurityProperties.class)
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    /** The only API endpoint reachable without a token: it tells the frontend how to log in. */
    private static final String PUBLIC_API_CONFIG = WebConfig.API_PREFIX + "/config";

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, StaffingSecurityProperties properties)
            throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        if (!properties.enabled()) {
            log.warn("SECURITY IS DISABLED: every endpoint is open. This must only happen in local development.");
            http.authorizeHttpRequests(requests -> requests.anyRequest().permitAll());
            return http.build();
        }

        final var api = WebConfig.API_PREFIX;
        http.authorizeHttpRequests(requests -> requests
                .requestMatchers(PUBLIC_API_CONFIG).permitAll()
                // Everyone logged in can read everything.
                .requestMatchers(HttpMethod.GET, api + "/**").authenticated()
                // Reference data and deleting people: admins only.
                .requestMatchers(api + "/customers/**", api + "/roles/**", api + "/technologies/**", api + "/skills/**")
                .hasRole(AppRole.ADMIN.name())
                .requestMatchers(HttpMethod.DELETE, api + "/employees/*").hasRole(AppRole.ADMIN.name())
                // Every other change (employees, absences, missions, assignments, needs): staffers and admins.
                .requestMatchers(api + "/**").hasRole(AppRole.STAFFER.name())
                .anyRequest().permitAll())
                .oauth2ResourceServer(resourceServer -> resourceServer
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter(properties))));
        return http.build();
    }

    /** Turns the role claim of the access token into authorities (see {@link RoleClaimConverter}). */
    static JwtAuthenticationConverter jwtAuthenticationConverter(StaffingSecurityProperties properties) {
        final var converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new RoleClaimConverter(properties));
        return converter;
    }

    /**
     * Validates tokens against the issuer's published keys. Built lazily, on the first request, so that the
     * application starts even if the login provider is briefly unreachable.
     */
    @Bean
    JwtDecoder jwtDecoder(StaffingSecurityProperties properties) {
        if (properties.enabled() && (properties.issuerUri() == null || properties.issuerUri().isBlank())) {
            throw new IllegalStateException("""
                    Security is enabled but no login provider is configured. Set the OIDC_ISSUER_URI environment \
                    variable (e.g. https://login.microsoftonline.com/<tenant-id>/v2.0), or run locally with the \
                    'dev' profile.""");
        }

        return new SupplierJwtDecoder(() -> {
            final var decoder = NimbusJwtDecoder.withIssuerLocation(properties.issuerUri()).build();
            OAuth2TokenValidator<Jwt> validator = JwtValidators.createDefaultWithIssuer(properties.issuerUri());
            if (properties.audience() != null && !properties.audience().isBlank()) {
                validator = new DelegatingOAuth2TokenValidator<>(validator, audienceValidator(properties.audience()));
            }
            decoder.setJwtValidator(validator);
            return decoder;
        });
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(StaffingSecurityProperties properties) {
        final var configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(properties.allowedOrigins());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setExposedHeaders(List.of("Location"));

        final var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private static OAuth2TokenValidator<Jwt> audienceValidator(String audience) {
        final var error = new OAuth2Error("invalid_token", "The token was not issued for this API", null);
        return jwt -> jwt.getAudience() != null && jwt.getAudience().contains(audience)
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(error);
    }

}
