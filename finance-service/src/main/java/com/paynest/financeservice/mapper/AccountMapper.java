package com.paynest.financeservice.mapper;

import com.paynest.financeservice.dto.AccountRequest;
import com.paynest.financeservice.dto.AccountResponse;
import com.paynest.financeservice.entity.Account;

import java.math.BigDecimal;

public class AccountMapper {

    public static Account toEntity(AccountRequest request, Long userId) {
        return Account.builder()
                .userId(userId)
                .name(request.getName())
                .type(request.getType())
                .balance(request.getBalance() != null ? request.getBalance() : BigDecimal.ZERO)
                .currency(request.getCurrency() != null ? request.getCurrency() : "LKR")
                .build();
    }

    public static AccountResponse toResponse(Account entity) {
        if (entity == null) return null;
        return AccountResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .name(entity.getName())
                .type(entity.getType())
                .balance(entity.getBalance())
                .currency(entity.getCurrency())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
