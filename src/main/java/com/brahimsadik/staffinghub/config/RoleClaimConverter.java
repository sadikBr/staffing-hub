package com.brahimsadik.staffinghub.config;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Gives each user an {@link AppRole} from a claim of their access token. The claim can be nested, written with dots
 * (Keycloak: {@code realm_access.roles}); Microsoft Entra ID puts app roles in {@code roles}. Its values are compared
 * with the configured admin and staffer role names; users with neither get the default role.
 */
public class RoleClaimConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private final StaffingSecurityProperties properties;

    public RoleClaimConverter(StaffingSecurityProperties properties) {
        this.properties = properties;
    }

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        return roleOf(jwt).authorities().stream().<GrantedAuthority>map(SimpleGrantedAuthority::new).toList();
    }

    public AppRole roleOf(Jwt jwt) {
        final var values = claimValues(jwt.getClaims(), properties.rolesClaim());
        if (values.stream().anyMatch(properties.adminRoles()::contains)) {
            return AppRole.ADMIN;
        }
        if (values.stream().anyMatch(properties.stafferRoles()::contains)) {
            return AppRole.STAFFER;
        }
        return properties.defaultRole();
    }

    /** The string values at the dotted path: a list of strings, or a single (space or comma separated) string. */
    static List<String> claimValues(Map<String, Object> claims, String path) {
        Object current = claims;
        for (final var key : path.split("\\.")) {
            if (!(current instanceof Map<?, ?> map)) {
                return List.of();
            }
            current = map.get(key);
        }
        if (current instanceof Collection<?> collection) {
            return collection.stream().map(String::valueOf).toList();
        }
        if (current instanceof String string) {
            return List.of(string.split("[\\s,]+"));
        }
        return List.of();
    }

}
