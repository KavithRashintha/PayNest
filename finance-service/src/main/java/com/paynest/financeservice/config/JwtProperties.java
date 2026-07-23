package com.paynest.financeservice.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "paynest.jwt")
public class JwtProperties {
    private String secret;
    private long expiration;
    private long refreshExpiration;
}
