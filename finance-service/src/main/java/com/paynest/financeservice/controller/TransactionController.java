package com.paynest.financeservice.controller;

import com.paynest.financeservice.dto.TransactionRequest;
import com.paynest.financeservice.dto.TransactionResponse;
import com.paynest.financeservice.exception.InvalidRequestException;
import com.paynest.financeservice.exception.UnauthorizedAccessException;
import com.paynest.financeservice.security.CustomUserDetails;
import com.paynest.financeservice.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/finance/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @Valid @RequestBody TransactionRequest request) {

        Long userId = resolveUserId(userDetails, headerUserId);
        TransactionResponse response = transactionService.createTransaction(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> getUserTransactions(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {

        Long userId = resolveUserId(userDetails, headerUserId);
        Page<TransactionResponse> response = transactionService.getUserTransactions(userId, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @PathVariable("id") Long id) {

        Long userId = resolveUserId(userDetails, headerUserId);
        TransactionResponse response = transactionService.getTransactionById(userId, id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @PathVariable("id") Long id) {

        Long userId = resolveUserId(userDetails, headerUserId);
        transactionService.deleteTransaction(userId, id);
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
