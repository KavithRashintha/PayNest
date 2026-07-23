package com.paynest.financeservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String headerUserId = request.getHeader("X-User-Id");
            String headerEmail = request.getHeader("X-User-Email");

            if (StringUtils.hasText(headerUserId)) {
                // Gateway validated JWT and passed user details via headers
                Long userId = Long.parseLong(headerUserId);
                String email = StringUtils.hasText(headerEmail) ? headerEmail : "user_" + userId + "@paynest.com";
                CustomUserDetails userDetails = new CustomUserDetails(userId, email);
                setAuthentication(request, userDetails);
            } else {
                // Check Bearer token directly if request didn't come via gateway header
                String token = getJwtFromRequest(request);
                if (StringUtils.hasText(token) && jwtProvider.isValid(token)) {
                    Long userId = Long.parseLong(jwtProvider.extractUserId(token));
                    String email = jwtProvider.extractEmail(token);
                    CustomUserDetails userDetails = new CustomUserDetails(userId, email);
                    setAuthentication(request, userDetails);
                }
            }
        } catch (Exception e) {
            log.error("Could not set user authentication in Security Context: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private void setAuthentication(HttpServletRequest request, CustomUserDetails userDetails) {
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
