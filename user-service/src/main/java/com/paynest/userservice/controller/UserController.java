package com.paynest.userservice.controller;

import com.paynest.userservice.dto.UpdateProfileRequest;
import com.paynest.userservice.dto.UserResponse;
import com.paynest.userservice.exception.InvalidCredentialsException;
import com.paynest.userservice.security.CustomUserDetails;
import com.paynest.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getCurrentUserProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {

        Long userId = resolveUserId(userDetails, headerUserId);
        UserResponse response = userService.getUserProfile(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateCurrentUserProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @Valid @RequestBody UpdateProfileRequest request) {

        Long userId = resolveUserId(userDetails, headerUserId);
        UserResponse response = userService.updateUserProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable("id") Long id) {
        UserResponse response = userService.getUserProfile(id);
        return ResponseEntity.ok(response);
    }

    private Long resolveUserId(CustomUserDetails userDetails, String headerUserId) {
        if (userDetails != null) {
            return userDetails.getId();
        }
        if (headerUserId != null && !headerUserId.isBlank()) {
            try {
                return Long.parseLong(headerUserId);
            } catch (NumberFormatException e) {
                throw new InvalidCredentialsException("Invalid X-User-Id header format");
            }
        }
        throw new InvalidCredentialsException("User authentication required");
    }
}
