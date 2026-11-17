package com.brahimsadik.staffinghub.config;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** The source of "today" for date-based rules, so that tests can control it. */
@Configuration(proxyBeanMethods = false)
public class ClockConfig {

    @Bean
    Clock clock() {
        return Clock.systemDefaultZone();
    }

}
