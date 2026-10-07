package com.paynest.financeservice.service;

import com.paynest.financeservice.dto.BudgetAlertResponse;
import com.paynest.financeservice.entity.Budget;
import com.paynest.financeservice.entity.BudgetAlert;
import com.paynest.financeservice.event.TransactionCreatedEvent;
import com.paynest.financeservice.model.AlertLevel;
import com.paynest.financeservice.model.TransactionType;
import com.paynest.financeservice.repository.BudgetAlertRepository;
import com.paynest.financeservice.repository.BudgetRepository;
import com.paynest.financeservice.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetAlertService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetAlertRepository budgetAlertRepository;

    @Transactional
    public void processTransactionForBudgetAlert(TransactionCreatedEvent event) {
        if (event == null || event.getType() != TransactionType.EXPENSE || event.getCategoryId() == null) {
            return;
        }

        Long userId = event.getUserId();
        Long categoryId = event.getCategoryId();
        LocalDate today = LocalDate.now();

        List<Budget> activeBudgets = budgetRepository.findActiveBudgetsByUserId(userId, today);

        for (Budget budget : activeBudgets) {
            if (budget.getCategory() != null && budget.getCategory().getId().equals(categoryId)) {
                LocalDateTime startDateTime = budget.getStartDate().atStartOfDay();
                LocalDateTime endDateTime = budget.getEndDate().atTime(LocalTime.MAX);

                BigDecimal spent = transactionRepository.getSpentAmountForCategoryInPeriod(
                        userId, categoryId, startDateTime, endDateTime);
                if (spent == null) {
                    spent = BigDecimal.ZERO;
                }

                BigDecimal limit = budget.getAmountLimit();
                if (limit == null || limit.compareTo(BigDecimal.ZERO) <= 0) {
                    continue;
                }

                double percentageUsed = spent.multiply(BigDecimal.valueOf(100))
                        .divide(limit, 2, RoundingMode.HALF_UP)
                        .doubleValue();

                String categoryName = budget.getCategory().getName();

                if (percentageUsed >= 100.0) {
                    String message = String.format(
                            "Budget Exceeded! You have spent %s of your %s limit for %s (%.1f%% used).",
                            spent, limit, categoryName, percentageUsed
                    );

                    BudgetAlert alert = BudgetAlert.builder()
                            .userId(userId)
                            .budgetId(budget.getId())
                            .categoryId(categoryId)
                            .categoryName(categoryName)
                            .budgetLimit(limit)
                            .currentSpent(spent)
                            .percentageUsed(percentageUsed)
                            .alertLevel(AlertLevel.EXCEEDED)
                            .message(message)
                            .isRead(false)
                            .build();

                    budgetAlertRepository.save(alert);
                    log.warn("🚨 [KAFKA BUDGET ALERT] User {}: {} - {}", userId, AlertLevel.EXCEEDED, message);
                } else if (percentageUsed >= 80.0) {
                    String message = String.format(
                            "Budget Warning: You have reached %.1f%% of your %s limit for %s (%s spent).",
                            percentageUsed, limit, categoryName, spent
                    );

                    BudgetAlert alert = BudgetAlert.builder()
                            .userId(userId)
                            .budgetId(budget.getId())
                            .categoryId(categoryId)
                            .categoryName(categoryName)
                            .budgetLimit(limit)
                            .currentSpent(spent)
                            .percentageUsed(percentageUsed)
                            .alertLevel(AlertLevel.WARNING)
                            .message(message)
                            .isRead(false)
                            .build();

                    budgetAlertRepository.save(alert);
                    log.info("⚠️ [KAFKA BUDGET ALERT] User {}: {} - {}", userId, AlertLevel.WARNING, message);
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public List<BudgetAlertResponse> getUserAlerts(Long userId) {
        return budgetAlertRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BudgetAlertResponse> getUnreadUserAlerts(Long userId) {
        return budgetAlertRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAlertAsRead(Long userId, Long alertId) {
        budgetAlertRepository.findById(alertId).ifPresent(alert -> {
            if (alert.getUserId().equals(userId)) {
                alert.setIsRead(true);
                budgetAlertRepository.save(alert);
            }
        });
    }

    @Transactional
    public void markAllAlertsAsRead(Long userId) {
        List<BudgetAlert> unread = budgetAlertRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(alert -> alert.setIsRead(true));
        budgetAlertRepository.saveAll(unread);
    }

    private BudgetAlertResponse toResponse(BudgetAlert alert) {
        return BudgetAlertResponse.builder()
                .id(alert.getId())
                .userId(alert.getUserId())
                .budgetId(alert.getBudgetId())
                .categoryId(alert.getCategoryId())
                .categoryName(alert.getCategoryName())
                .budgetLimit(alert.getBudgetLimit())
                .currentSpent(alert.getCurrentSpent())
                .percentageUsed(alert.getPercentageUsed())
                .alertLevel(alert.getAlertLevel())
                .message(alert.getMessage())
                .isRead(alert.getIsRead())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}
