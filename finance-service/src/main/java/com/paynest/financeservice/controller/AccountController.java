package com.paynest.financeservice.controller;

import com.paynest.financeservice.dto.AccountRequest;
import com.paynest.financeservice.dto.AccountResponse;
import com.paynest.financeservice.exception.InvalidRequestException;
import com.paynest.financeservice.exception.UnauthorizedAccessException;
import com.paynest.financeservice.security.CustomUserDetails;
import com.paynest.financeservice.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/finance/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @Valid @RequestBody AccountRequest request) {

        Long userId = resolveUserId(userDetails, headerUserId);
        AccountResponse response = accountService.createAccount(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getUserAccounts(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {

        Long userId = resolveUserId(userDetails, headerUserId);
        List<AccountResponse> response = accountService.getUserAccounts(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccountById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @PathVariable("id") Long id) {

        Long userId = resolveUserId(userDetails, headerUserId);
        AccountResponse response = accountService.getAccountById(userId, id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> updateAccount(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @PathVariable("id") Long id,
            @Valid @RequestBody AccountRequest request) {

        Long userId = resolveUserId(userDetails, headerUserId);
        AccountResponse response = accountService.updateAccount(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @PathVariable("id") Long id) {

        Long userId = resolveUserId(userDetails, headerUserId);
        accountService.deleteAccount(userId, id);
        return ResponseEntity.noContent().build();
    }

    private Long resolveUserId(CustomUserDetails userDetails, String headerUserId) {
        if (userDetails != null && userDetails.getId() != null) {
            return userDetails.getId();
        }
        if (headerUserId != null && !headerUserId.isBlank()) {
            try {
                return Long.parseLong(headerUserId);
            } catch (NumberFormatException e) {
                throw new InvalidRequestException("Invalid X-User-Id header format");
            }
        }
        throw new UnauthorizedAccessException("User authentication required");
    }
}
