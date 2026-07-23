package com.paynest.financeservice.service;

import com.paynest.financeservice.dto.CategorySpendSummary;
import com.paynest.financeservice.dto.FinancialSummaryResponse;
import com.paynest.financeservice.dto.TransactionResponse;
import com.paynest.financeservice.mapper.TransactionMapper;
import com.paynest.financeservice.model.TransactionType;
import com.paynest.financeservice.repository.AccountRepository;
import com.paynest.financeservice.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public FinancialSummaryResponse getFinancialSummary(Long userId) {
        BigDecimal totalBalance = accountRepository.getTotalBalanceByUserId(userId);
        if (totalBalance == null) {
            totalBalance = BigDecimal.ZERO;
        }

        // Current month date range
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(LocalTime.MAX);

        BigDecimal monthlyIncome = transactionRepository.getTotalAmountByUserIdAndTypeAndDateRange(
                userId, TransactionType.INCOME, startOfMonth, endOfMonth);
        if (monthlyIncome == null) {
            monthlyIncome = BigDecimal.ZERO;
        }

        BigDecimal monthlyExpense = transactionRepository.getTotalAmountByUserIdAndTypeAndDateRange(
                userId, TransactionType.EXPENSE, startOfMonth, endOfMonth);
        if (monthlyExpense == null) {
            monthlyExpense = BigDecimal.ZERO;
        }

        BigDecimal netSavings = monthlyIncome.subtract(monthlyExpense);

        // Category Expense breakdown
        List<Object[]> rawCategoryData = transactionRepository.getCategoryExpenseBreakdown(userId, startOfMonth, endOfMonth);
        List<CategorySpendSummary> categoryExpenses = new ArrayList<>();

        for (Object[] row : rawCategoryData) {
            Long categoryId = (Long) row[0];
            String categoryName = (String) row[1];
            String icon = (String) row[2];
            String color = (String) row[3];
            BigDecimal totalSpent = (BigDecimal) row[4];

            double percentage = 0.0;
            if (monthlyExpense.compareTo(BigDecimal.ZERO) > 0) {
                percentage = totalSpent.multiply(BigDecimal.valueOf(100))
                        .divide(monthlyExpense, 2, RoundingMode.HALF_UP)
                        .doubleValue();
            }

            categoryExpenses.add(CategorySpendSummary.builder()
                    .categoryId(categoryId)
                    .categoryName(categoryName)
                    .icon(icon)
                    .color(color)
                    .totalSpent(totalSpent)
                    .percentageOfTotal(percentage)
                    .build());
        }

        // Recent 5 transactions
        List<TransactionResponse> recentTransactions = transactionRepository
                .findByUserIdOrderByTransactionDateDesc(userId, PageRequest.of(0, 5))
                .getContent()
                .stream()
                .map(TransactionMapper::toResponse)
                .collect(Collectors.toList());

        return FinancialSummaryResponse.builder()
                .totalBalance(totalBalance)
                .monthlyIncome(monthlyIncome)
                .monthlyExpense(monthlyExpense)
                .netSavings(netSavings)
                .categoryExpenses(categoryExpenses)
                .recentTransactions(recentTransactions)
                .build();
    }
}
