package com.paynest.financeservice.mapper;

import com.paynest.financeservice.dto.BudgetResponse;
import com.paynest.financeservice.entity.Budget;

public class BudgetMapper {

    public static BudgetResponse toResponse(Budget entity) {
        if (entity == null) return null;
        return BudgetResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : null)
                .categoryIcon(entity.getCategory() != null ? entity.getCategory().getIcon() : null)
                .categoryColor(entity.getCategory() != null ? entity.getCategory().getColor() : null)
                .amountLimit(entity.getAmountLimit())
                .period(entity.getPeriod())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
