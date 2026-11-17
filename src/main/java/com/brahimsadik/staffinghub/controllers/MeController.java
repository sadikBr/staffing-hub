package com.brahimsadik.staffinghub.controllers;

import java.util.Arrays;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.brahimsadik.staffinghub.config.AppRole;
import com.brahimsadik.staffinghub.config.StaffingSecurityProperties;
import com.brahimsadik.staffinghub.dtos.me.MeResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@Tag(name = "Application", description = "Runtime configuration for the frontend.")
@RequiredArgsConstructor
public class MeController {

    private final StaffingSecurityProperties securityProperties;

    @GetMapping("/me")
    @Operation(summary = "The current user's role and what they may do")
    public MeResponse me(Authentication authentication) {
        // Security off (dev profile): everyone can do everything.
        final var role = !securityProperties.enabled() || authentication == null ? AppRole.ADMIN
                : authentication.getAuthorities().stream().map(authority -> authority.getAuthority())
                        .flatMap(authority -> Arrays.stream(AppRole.values())
                                .filter(candidate -> authority.equals("ROLE_" + candidate.name())))
                        .max(Enum::compareTo).orElse(AppRole.VIEWER);
        return new MeResponse(role, role.compareTo(AppRole.STAFFER) >= 0, role == AppRole.ADMIN);
    }

}
