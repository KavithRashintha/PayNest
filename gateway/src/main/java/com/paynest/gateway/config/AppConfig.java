package com.paynest.gateway.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

/**
 * General application-level beans:
 * <ul>
 *   <li>Enables {@link JwtProperties} binding.</li>
 *   <li>Provides a shared {@link ObjectMapper} configured for ISO-8601 timestamps.</li>
 * </ul>
 */
@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class AppConfig {

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
}
