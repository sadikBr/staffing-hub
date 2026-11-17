package com.brahimsadik.staffinghub.config;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;

/** Interactive API docs: Swagger UI at /swagger-ui.html, OpenAPI spec at /v3/api-docs. */
@Configuration
@OpenAPIDefinition(info = @Info(title = "Staffing Hub API", version = "v1",
        description = "Manage employees, their roles, technologies and skills, and customers."))
public class OpenApiConfig {
}
