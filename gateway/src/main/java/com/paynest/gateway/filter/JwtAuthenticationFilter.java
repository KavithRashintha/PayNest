package com.paynest.gateway.filter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.paynest.gateway.config.JwtProperties;
import com.paynest.gateway.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;

/**
 * Global reactive web filter that:
 * <ol>
 *   <li>Skips JWT validation for configured public paths (login, register, refresh).</li>
 *   <li>Requires a valid {@code Authorization: Bearer <token>} header on all other paths.</li>
 *   <li>On success — mutates the downstream request by adding:
 *       <ul>
 *         <li>{@code X-User-Id}    — the user's database ID (subject claim)</li>
 *         <li>{@code X-User-Email} — the user's email claim</li>
 *       </ul>
 *   </li>
 *   <li>On failure — short-circuits with a structured JSON 401 response so the
 *       downstream services are never reached.</li>
 * </ol>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements WebFilter {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    private final JwtUtil jwtUtil;
    private final JwtProperties jwtProperties;
    private final ObjectMapper objectMapper;

    // -------------------------------------------------------------------------
    // Filter entry point
    // -------------------------------------------------------------------------

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        if (isPublicPath(path)) {
            log.debug("Skipping JWT filter for public path: {}", path);
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            log.warn("Missing or malformed Authorization header for path: {}", path);
            return writeErrorResponse(exchange, HttpStatus.UNAUTHORIZED,
                    "Missing or malformed Authorization header");
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        if (!jwtUtil.isValid(token)) {
            log.warn("Invalid or expired JWT for path: {}", path);
            return writeErrorResponse(exchange, HttpStatus.UNAUTHORIZED,
                    "Token is invalid or has expired");
        }

        // Token is valid — extract claims and propagate to downstream services
        String userId = jwtUtil.extractUserId(token);
        String email  = jwtUtil.extractEmail(token);

        log.debug("Authenticated userId={} on path={}", userId, path);

        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header("X-User-Id",    userId)
                .header("X-User-Email", email)
                // Strip the original Authorization header from internal traffic
                // (downstream services re-validate using X-User-Id)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Returns true if the request path matches any configured public-path pattern.
     * Supports Ant-style wildcards (e.g. {@code /api/users/auth/**}).
     */
    private boolean isPublicPath(String path) {
        return jwtProperties.getPublicPaths().stream()
                .anyMatch(pattern -> PATH_MATCHER.match(pattern, path));
    }

    /**
     * Writes a structured JSON error response and terminates the reactive chain.
     */
    private Mono<Void> writeErrorResponse(ServerWebExchange exchange,
                                          HttpStatus status,
                                          String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "timestamp", Instant.now().toString(),
                "status",    status.value(),
                "error",     status.getReasonPhrase(),
                "message",   message,
                "path",      exchange.getRequest().getURI().getPath()
        );

        byte[] bytes;
        try {
            bytes = objectMapper.writeValueAsBytes(body);
        } catch (JsonProcessingException e) {
            bytes = ("{\"error\":\"Internal Server Error\"}").getBytes(StandardCharsets.UTF_8);
        }

        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }
}
