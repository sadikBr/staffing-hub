package com.brahimsadik.staffinghub.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

class RoleClaimConverterTests {

    private static final StaffingSecurityProperties ENTRA = properties("roles", AppRole.VIEWER);
    private static final StaffingSecurityProperties KEYCLOAK = properties("realm_access.roles", AppRole.STAFFER);

    @Test
    void mapsTheRoleClaimToTheHighestMatchingRole() {
        assertThat(roleOf(ENTRA, Map.of("roles", List.of("staffing-staffer", "staffing-admin")))).isEqualTo(AppRole.ADMIN);
        assertThat(roleOf(ENTRA, Map.of("roles", List.of("staffing-staffer")))).isEqualTo(AppRole.STAFFER);
        assertThat(roleOf(ENTRA, Map.of("roles", "staffing-admin other"))).isEqualTo(AppRole.ADMIN);
    }

    @Test
    void usesTheDefaultRoleWhenNothingMatches() {
        assertThat(roleOf(ENTRA, Map.of("roles", List.of("something-else")))).isEqualTo(AppRole.VIEWER);
        assertThat(roleOf(ENTRA, Map.of())).isEqualTo(AppRole.VIEWER);
        assertThat(roleOf(KEYCLOAK, Map.of("realm_access", Map.of("roles", List.of())))).isEqualTo(AppRole.STAFFER);
    }

    @Test
    void readsNestedClaimsAndGrantsIncludedRoles() {
        final var jwt = jwt(Map.of("realm_access", Map.of("roles", List.of("staffing-admin"))));
        assertThat(new RoleClaimConverter(KEYCLOAK).convert(jwt)).extracting(GrantedAuthority::getAuthority)
                .containsExactly("ROLE_VIEWER", "ROLE_STAFFER", "ROLE_ADMIN");
    }

    private static AppRole roleOf(StaffingSecurityProperties properties, Map<String, Object> claims) {
        return new RoleClaimConverter(properties).roleOf(jwt(claims));
    }

    private static Jwt jwt(Map<String, Object> claims) {
        final var builder = Jwt.withTokenValue("token").header("alg", "none").claim("sub", "user")
                .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(60));
        claims.forEach(builder::claim);
        return builder.build();
    }

    private static StaffingSecurityProperties properties(String claim, AppRole defaultRole) {
        return new StaffingSecurityProperties(true, "https://issuer", null, List.of(), null, "openid", claim,
                List.of("staffing-admin"), List.of("staffing-staffer"), defaultRole);
    }

}
