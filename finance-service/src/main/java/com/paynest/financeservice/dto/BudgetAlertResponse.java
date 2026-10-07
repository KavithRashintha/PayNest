package com.paynest.financeservice.dto;

import com.paynest.financeservice.model.AlertLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetAlertResponse {
    private Long id;
    private Long userId;
    private Long budgetId;
    private Long categoryId;
    private String categoryName;
    private BigDecimal budgetLimit;
    private BigDecimal currentSpent;
    private Double percentageUsed;
    private AlertLevel alertLevel;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
