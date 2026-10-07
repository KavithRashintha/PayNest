package com.paynest.financeservice.event;

import com.paynest.financeservice.model.TransactionType;
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
public class TransactionCreatedEvent {
    private Long transactionId;
    private Long userId;
    private Long accountId;
    private Long categoryId;
    private String categoryName;
    private BigDecimal amount;
    private TransactionType type;
    private String title;
    private LocalDateTime transactionDate;
}
