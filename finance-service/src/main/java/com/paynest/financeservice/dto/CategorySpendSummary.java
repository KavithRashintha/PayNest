package com.paynest.financeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorySpendSummary {
    private Long categoryId;
    private String categoryName;
    private String icon;
    private String color;
    private BigDecimal totalSpent;
    private double percentageOfTotal;
}
