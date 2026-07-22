package com.paynest.gateway.exception;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebExceptionHandler;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;

/**
 * Catches unhandled exceptions from the gateway (e.g. downstream service unavailable,
 * route not found) and returns a clean JSON error payload instead of the default
 * Spring Webflux HTML error page.
 *
 * <p>Order(-2) ensures this runs before the default Spring Boot handler (order -1).
 */
@Slf4j
@Order(-2)
@Component
@RequiredArgsConstructor
public class GatewayExceptionHandler implements WebExceptionHandler {

    private final ObjectMapper objectMapper;

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        ServerHttpResponse response = exchange.getResponse();

        HttpStatus status;
        String message;

        if (ex instanceof ResponseStatusException rse) {
            status  = HttpStatus.valueOf(rse.getStatusCode().value());
            message = rse.getReason() != null ? rse.getReason() : rse.getMessage();
        } else {
            // Catches connection-refused / timeout to downstream services
            log.error("Unhandled gateway exception for path {}: {}",
                    exchange.getRequest().getURI().getPath(), ex.getMessage(), ex);
            status  = HttpStatus.SERVICE_UNAVAILABLE;
            message = "The requested service is temporarily unavailable. Please try again later.";
        }

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
            bytes = "{\"error\":\"Internal Server Error\"}".getBytes(StandardCharsets.UTF_8);
        }

        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }
}
