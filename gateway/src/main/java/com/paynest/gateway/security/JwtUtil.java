package com.paynest.gateway.security;

import com.paynest.gateway.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;

/**
 * Stateless JWT utility used by the gateway to:
 * <ul>
 *   <li>Validate the incoming Bearer token signature and expiry.</li>
 *   <li>Extract the {@code sub} (user ID) and {@code email} claims for downstream propagation.</li>
 * </ul>
 * This class does NOT issue tokens — that is the responsibility of the user-service.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtUtil {

    private final JwtProperties jwtProperties;

    private SecretKey signingKey;

    @PostConstruct
    public void init() {
        byte[] keyBytes = Base64.getDecoder().decode(jwtProperties.getSecret());
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Validates the token signature, structure, and expiry.
     *
     * @param token the raw JWT string (without the "Bearer " prefix)
     * @return {@code true} if the token is valid; {@code false} otherwise
     */
    public boolean isValid(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Extracts the user ID from the {@code sub} claim.
     *
     * @param token validated JWT
     * @return user ID as a String
     */
    public String extractUserId(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * Extracts the email from the {@code email} claim.
     *
     * @param token validated JWT
     * @return user email
     */
    public String extractEmail(String token) {
        return getClaims(token).get("email", String.class);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
