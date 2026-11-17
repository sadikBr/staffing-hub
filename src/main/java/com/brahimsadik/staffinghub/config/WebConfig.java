package com.brahimsadik.staffinghub.config;

import java.io.IOException;
import java.time.Duration;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.web.method.HandlerTypePredicate;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

/**
 * One deployable for API and frontend:
 * <ul>
 * <li>every REST controller is served under {@code /api} (e.g. {@code /api/employees});</li>
 * <li>the frontend (built into {@code classpath:/static}) is served for everything else. Any unknown non-API path
 * returns {@code index.html}, so that the frontend's own routes (e.g. {@code /employees/123}) work on reload.</li>
 * </ul>
 */
@Configuration(proxyBeanMethods = false)
public class WebConfig implements WebMvcConfigurer {

    public static final String API_PREFIX = "/api";

    private static final String CONTROLLERS_PACKAGE = "com.brahimsadik.staffinghub.controllers";

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer.addPathPrefix(API_PREFIX, HandlerTypePredicate.forBasePackage(CONTROLLERS_PACKAGE));
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Vite puts a content hash in every asset file name, so they can be cached forever.
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable());

        // Everything else: the file if it exists, otherwise the frontend's index.html (never cached, so that a new
        // deployment is picked up immediately).
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.noCache())
                .resourceChain(true)
                .addResolver(new SinglePageAppResourceResolver());
    }

    private static final class SinglePageAppResourceResolver extends PathResourceResolver {

        @Override
        protected Resource getResource(String resourcePath, Resource location) throws IOException {
            final var requested = location.createRelative(resourcePath);
            if (requested.exists() && requested.isReadable()) {
                return requested;
            }
            // Unknown API or tooling paths must stay 404s, not return the frontend.
            if (resourcePath.startsWith("api/") || resourcePath.startsWith("actuator")
                    || resourcePath.startsWith("v3/") || resourcePath.startsWith("swagger-ui")
                    || resourcePath.startsWith("assets/")) {
                return null;
            }
            final var index = new ClassPathResource("static/index.html");
            return index.exists() ? index : null;
        }

    }

}
