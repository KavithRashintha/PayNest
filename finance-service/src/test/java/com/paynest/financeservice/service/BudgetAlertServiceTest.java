package com.paynest.financeservice.service;

import com.paynest.financeservice.dto.BudgetAlertResponse;
import com.paynest.financeservice.entity.Budget;
import com.paynest.financeservice.entity.BudgetAlert;
import com.paynest.financeservice.entity.Category;
import com.paynest.financeservice.event.TransactionCreatedEvent;
import com.paynest.financeservice.model.AlertLevel;
import com.paynest.financeservice.model.TransactionType;
import com.paynest.financeservice.repository.BudgetAlertRepository;
import com.paynest.financeservice.repository.BudgetRepository;
import com.paynest.financeservice.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetAlertServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private BudgetAlertRepository budgetAlertRepository;

    @InjectMocks
    private BudgetAlertService budgetAlertService;

    private Category diningCategory;
    private Budget diningBudget;

    @BeforeEach
    void setUp() {
        diningCategory = Category.builder()
                .id(10L)
                .name("Food & Dining")
                .build();

        diningBudget = Budget.builder()
                .id(1L)
                .userId(100L)
                .category(diningCategory)
                .amountLimit(new BigDecimal("10000.00"))
                .startDate(LocalDate.now().withDayOfMonth(1))
                .endDate(LocalDate.now().plusMonths(1).withDayOfMonth(1).minusDays(1))
                .build();
    }

    @Test
    void processTransactionForBudgetAlert_WhenExceeded_GeneratesExceededAlert() {
        TransactionCreatedEvent event = TransactionCreatedEvent.builder()
                .transactionId(50L)
                .userId(100L)
                .categoryId(10L)
                .amount(new BigDecimal("2000.00"))
                .type(TransactionType.EXPENSE)
                .title("Fine Dining")
                .transactionDate(LocalDateTime.now())
                .build();

        when(budgetRepository.findActiveBudgetsByUserId(eq(100L), any(LocalDate.class)))
                .thenReturn(List.of(diningBudget));
        when(transactionRepository.getSpentAmountForCategoryInPeriod(eq(100L), eq(10L), any(), any()))
                .thenReturn(new BigDecimal("10500.00")); // Exceeded 10,000 limit

        budgetAlertService.processTransactionForBudgetAlert(event);

        ArgumentCaptor<BudgetAlert> alertCaptor = ArgumentCaptor.forClass(BudgetAlert.class);
        verify(budgetAlertRepository, times(1)).save(alertCaptor.capture());

        BudgetAlert savedAlert = alertCaptor.getValue();
        assertEquals(AlertLevel.EXCEEDED, savedAlert.getAlertLevel());
        assertEquals(100L, savedAlert.getUserId());
        assertEquals(10L, savedAlert.getCategoryId());
        assertTrue(savedAlert.getPercentageUsed() >= 100.0);
    }

    @Test
    void processTransactionForBudgetAlert_WhenWarningThresholdReached_GeneratesWarningAlert() {
        TransactionCreatedEvent event = TransactionCreatedEvent.builder()
                .transactionId(51L)
                .userId(100L)
                .categoryId(10L)
                .amount(new BigDecimal("1500.00"))
                .type(TransactionType.EXPENSE)
                .title("Groceries")
                .transactionDate(LocalDateTime.now())
                .build();

        when(budgetRepository.findActiveBudgetsByUserId(eq(100L), any(LocalDate.class)))
                .thenReturn(List.of(diningBudget));
        when(transactionRepository.getSpentAmountForCategoryInPeriod(eq(100L), eq(10L), any(), any()))
                .thenReturn(new BigDecimal("8500.00")); // 85% of 10,000

        budgetAlertService.processTransactionForBudgetAlert(event);

        ArgumentCaptor<BudgetAlert> alertCaptor = ArgumentCaptor.forClass(BudgetAlert.class);
        verify(budgetAlertRepository, times(1)).save(alertCaptor.capture());

        BudgetAlert savedAlert = alertCaptor.getValue();
        assertEquals(AlertLevel.WARNING, savedAlert.getAlertLevel());
        assertEquals(85.0, savedAlert.getPercentageUsed());
    }

    @Test
    void processTransactionForBudgetAlert_WhenIncome_IgnoresAlert() {
        TransactionCreatedEvent event = TransactionCreatedEvent.builder()
                .transactionId(52L)
                .userId(100L)
                .categoryId(10L)
                .amount(new BigDecimal("50000.00"))
                .type(TransactionType.INCOME)
                .title("Salary")
                .transactionDate(LocalDateTime.now())
                .build();

        budgetAlertService.processTransactionForBudgetAlert(event);

        verify(budgetRepository, never()).findActiveBudgetsByUserId(any(), any());
        verify(budgetAlertRepository, never()).save(any());
    }
}
