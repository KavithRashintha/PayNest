package com.paynest.userservice.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "paynest.jwt")
public class JwtProperties {

    /** Base-64 encoded HMAC-SHA256 secret. */
    private String secret;

    /** Access token expiration in milliseconds (default 15 mins). */
    private long expiration = 900000;

    /** Refresh token expiration in milliseconds (default 7 days). */
    private long refreshExpiration = 604800000;
}
