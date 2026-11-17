package com.brahimsadik.staffinghub.config;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.jspecify.annotations.Nullable;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AssignableTypeFilter;
import org.springframework.stereotype.Component;
import org.springframework.util.ClassUtils;

import io.swagger.v3.oas.models.OpenAPI;

/**
 * Makes the API description say which response fields are always present, so that generated clients (the
 * frontend's TypeScript types) do not treat every field as optional.
 * <p>
 * Every field of a response record is required, except those annotated {@link Nullable}. Request records already
 * declare what is required through their validation annotations, so they are left untouched.
 */
@Component
public class OpenApiRequiredFieldsCustomizer implements OpenApiCustomizer {

    private static final String DTOS_PACKAGE = "com.brahimsadik.staffinghub.dtos";

    private final Map<String, Class<?>> responseRecords = findResponseRecords();

    @Override
    public void customise(OpenAPI openApi) {
        if (openApi.getComponents() == null || openApi.getComponents().getSchemas() == null) {
            return;
        }
        openApi.getComponents().getSchemas().forEach((name, schema) -> {
            if (schema.getProperties() == null) {
                return;
            }
            final var record = responseRecords.get(name);
            if (record != null) {
                final var required = new ArrayList<String>();
                for (final var component : record.getRecordComponents()) {
                    final var nullable = component.getAnnotatedType().isAnnotationPresent(Nullable.class)
                            || component.isAnnotationPresent(Nullable.class);
                    if (!nullable && schema.getProperties().containsKey(component.getName())) {
                        required.add(component.getName());
                    }
                }
                schema.setRequired(required);
            } else if (name.startsWith("PagedModel") || name.equals("PageMetadata")) {
                // Spring Data's paging envelope: always complete.
                schema.setRequired(new ArrayList<>(schema.getProperties().keySet()));
            }
        });
    }

    private static Map<String, Class<?>> findResponseRecords() {
        final var scanner = new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new AssignableTypeFilter(Record.class));
        final var records = new HashMap<String, Class<?>>();
        for (final var candidate : scanner.findCandidateComponents(DTOS_PACKAGE)) {
            final var type = ClassUtils.resolveClassName(candidate.getBeanClassName(),
                    OpenApiRequiredFieldsCustomizer.class.getClassLoader());
            if (!type.getSimpleName().endsWith("Request") && !type.getSimpleName().endsWith("Criteria")) {
                records.put(type.getSimpleName(), type);
            }
        }
        return records;
    }

}
