package com.brahimsadik.staffinghub.config;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;

/**
 * Interactive API docs: Swagger UI at /swagger-ui.html, OpenAPI spec at /v3/api-docs. When security is enabled, use
 * the "Authorize" button to paste an access token.
 */
@Configuration
@OpenAPIDefinition(info = @Info(title = "Staffing Hub API", version = "v1",
        description = "Manage employees, their roles, technologies and skills, customers, and missions."),
        security = @SecurityRequirement(name = "bearer"))
@SecurityScheme(name = "bearer", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT",
        description = "An access token from the company's login provider.")
public class OpenApiConfig {
}
