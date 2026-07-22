package com.paynest.gateway;

import com.paynest.gateway.config.AppConfig;
import com.paynest.gateway.config.JwtProperties;
import com.paynest.gateway.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Lightweight slice test — loads only our custom beans (JwtUtil, JwtProperties, AppConfig)
 * without starting the full reactive web server or gateway routing infrastructure.
 * This avoids the Netty/ServerProperties dependency chain in Spring Cloud Gateway
 * auto-configuration that requires a live server environment.
 */
@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = {AppConfig.class, JwtUtil.class})
@EnableConfigurationProperties(JwtProperties.class)
@TestPropertySource(properties = {
        // 256-bit Base64 secret for tests — must be ≥32 decoded bytes for HMAC-SHA256
        "paynest.jwt.secret=dGVzdC1zZWNyZXQtZm9yLXVuaXQtdGVzdHMtbXVzdC1iZS0yNTYtYml0cw==",
        "paynest.jwt.public-paths=/api/users/auth/register,/api/users/auth/login,/api/users/auth/refresh"
})
class GatewayApplicationTests {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private JwtProperties jwtProperties;

    @Test
    void contextLoads() {
        // Custom beans wired correctly
        assertThat(jwtUtil).isNotNull();
        assertThat(jwtProperties.getSecret()).isNotBlank();
    }

    @Test
    void publicPathsAreConfigured() {
        assertThat(jwtProperties.getPublicPaths())
                .isNotEmpty()
                .contains("/api/users/auth/register", "/api/users/auth/login");
    }

    @Test
    void invalidTokenReturnsFalse() {
        assertThat(jwtUtil.isValid("not.a.valid.token")).isFalse();
    }

    @Test
    void emptyTokenReturnsFalse() {
        assertThat(jwtUtil.isValid("")).isFalse();
    }
}
