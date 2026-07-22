package com.paynest.gateway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Binds the {@code paynest.jwt.*} block from application.yml.
 * Shared between {@link JwtUtil} and {@link com.paynest.gateway.filter.JwtAuthenticationFilter}.
 */
@Data
@Component
@ConfigurationProperties(prefix = "paynest.jwt")
public class JwtProperties {

    /** Base-64 encoded HMAC-SHA256 secret — must match the value in user-service. */
    private String secret;

    /** Paths that are allowed through without a valid JWT (e.g. login, register). */
    private List<String> publicPaths = List.of();
}
