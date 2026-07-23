package com.paynest.financeservice.controller;

import com.paynest.financeservice.dto.BudgetRequest;
import com.paynest.financeservice.dto.BudgetResponse;
import com.paynest.financeservice.dto.BudgetStatusResponse;
import com.paynest.financeservice.exception.InvalidRequestException;
import com.paynest.financeservice.exception.UnauthorizedAccessException;
import com.paynest.financeservice.security.CustomUserDetails;
import com.paynest.financeservice.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/finance/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @Valid @RequestBody BudgetRequest request) {

        Long userId = resolveUserId(userDetails, headerUserId);
        BudgetResponse response = budgetService.createBudget(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getUserBudgets(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {

        Long userId = resolveUserId(userDetails, headerUserId);
        List<BudgetResponse> response = budgetService.getUserBudgets(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<List<BudgetStatusResponse>> getActiveBudgetsStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {

        Long userId = resolveUserId(userDetails, headerUserId);
        List<BudgetStatusResponse> response = budgetService.getActiveBudgetsStatus(userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @PathVariable("id") Long id) {

        Long userId = resolveUserId(userDetails, headerUserId);
        budgetService.deleteBudget(userId, id);
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
