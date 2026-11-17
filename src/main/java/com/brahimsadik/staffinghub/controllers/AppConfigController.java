package com.brahimsadik.staffinghub.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.brahimsadik.staffinghub.config.StaffingSecurityProperties;
import com.brahimsadik.staffinghub.dtos.app.AppConfigResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@Tag(name = "Application", description = "Runtime configuration for the frontend.")
@RequiredArgsConstructor
public class AppConfigController {

    private final StaffingSecurityProperties securityProperties;

    @GetMapping("/config")
    @SecurityRequirements
    @Operation(summary = "How the frontend should log users in (public)")
    public AppConfigResponse config() {
        return new AppConfigResponse(securityProperties.enabled(), securityProperties.issuerUri(),
                securityProperties.clientId(), securityProperties.scope());
    }

}
