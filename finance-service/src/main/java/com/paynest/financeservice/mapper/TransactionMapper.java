package com.paynest.financeservice.mapper;

import com.paynest.financeservice.dto.TransactionResponse;
import com.paynest.financeservice.entity.Transaction;

public class TransactionMapper {

    public static TransactionResponse toResponse(Transaction entity) {
        if (entity == null) return null;
        return TransactionResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .accountId(entity.getAccount() != null ? entity.getAccount().getId() : null)
                .accountName(entity.getAccount() != null ? entity.getAccount().getName() : null)
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : null)
                .categoryIcon(entity.getCategory() != null ? entity.getCategory().getIcon() : null)
                .categoryColor(entity.getCategory() != null ? entity.getCategory().getColor() : null)
                .toAccountId(entity.getToAccount() != null ? entity.getToAccount().getId() : null)
                .toAccountName(entity.getToAccount() != null ? entity.getToAccount().getName() : null)
                .amount(entity.getAmount())
                .type(entity.getType())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .transactionDate(entity.getTransactionDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
