package com.paynest.financeservice.controller;

import com.paynest.financeservice.dto.BudgetAlertResponse;
import com.paynest.financeservice.exception.InvalidRequestException;
import com.paynest.financeservice.exception.UnauthorizedAccessException;
import com.paynest.financeservice.security.CustomUserDetails;
import com.paynest.financeservice.service.BudgetAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/finance/alerts")
@RequiredArgsConstructor
public class BudgetAlertController {

    private final BudgetAlertService budgetAlertService;

    @GetMapping
    public ResponseEntity<List<BudgetAlertResponse>> getAlerts(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "unreadOnly", defaultValue = "false") boolean unreadOnly) {

        Long userId = resolveUserId(userDetails, headerUserId);
        List<BudgetAlertResponse> alerts = unreadOnly
                ? budgetAlertService.getUnreadUserAlerts(userId)
                : budgetAlertService.getUserAlerts(userId);
        return ResponseEntity.ok(alerts);
    }

    @PutMapping("/{alertId}/read")
    public ResponseEntity<Void> markAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @PathVariable Long alertId) {

        Long userId = resolveUserId(userDetails, headerUserId);
        budgetAlertService.markAlertAsRead(userId, alertId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {

        Long userId = resolveUserId(userDetails, headerUserId);
        budgetAlertService.markAllAlertsAsRead(userId);
        return ResponseEntity.ok().build();
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
