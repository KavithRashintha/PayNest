package com.paynest.financeservice.service;

import com.paynest.financeservice.dto.BudgetRequest;
import com.paynest.financeservice.dto.BudgetResponse;
import com.paynest.financeservice.dto.BudgetStatusResponse;
import com.paynest.financeservice.entity.Budget;
import com.paynest.financeservice.entity.Category;
import com.paynest.financeservice.exception.ResourceNotFoundException;
import com.paynest.financeservice.exception.UnauthorizedAccessException;
import com.paynest.financeservice.mapper.BudgetMapper;
import com.paynest.financeservice.repository.BudgetRepository;
import com.paynest.financeservice.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
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
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryService categoryService;
    private final TransactionRepository transactionRepository;

    @Transactional
    public BudgetResponse createBudget(Long userId, BudgetRequest request) {
        Category category = categoryService.getCategoryEntity(userId, request.getCategoryId());

        Budget budget = Budget.builder()
                .userId(userId)
                .category(category)
                .amountLimit(request.getAmountLimit())
                .period(request.getPeriod())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        Budget saved = budgetRepository.save(budget);
        return BudgetMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> getUserBudgets(Long userId) {
        return budgetRepository.findByUserIdOrderByStartDateDesc(userId)
                .stream()
                .map(BudgetMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BudgetStatusResponse> getActiveBudgetsStatus(Long userId) {
        LocalDate now = LocalDate.now();
        List<Budget> activeBudgets = budgetRepository.findActiveBudgetsByUserId(userId, now);

        return activeBudgets.stream().map(budget -> {
            LocalDateTime startDateTime = budget.getStartDate().atStartOfDay();
            LocalDateTime endDateTime = budget.getEndDate().atTime(LocalTime.MAX);

            BigDecimal spent = transactionRepository.getSpentAmountForCategoryInPeriod(
                    userId, budget.getCategory().getId(), startDateTime, endDateTime);

            if (spent == null) {
                spent = BigDecimal.ZERO;
            }

            BigDecimal remaining = budget.getAmountLimit().subtract(spent);
            double percentageUsed = 0.0;
            if (budget.getAmountLimit().compareTo(BigDecimal.ZERO) > 0) {
                percentageUsed = spent.multiply(BigDecimal.valueOf(100))
                        .divide(budget.getAmountLimit(), 2, RoundingMode.HALF_UP)
                        .doubleValue();
            }

            boolean isExceeded = spent.compareTo(budget.getAmountLimit()) > 0;

            return BudgetStatusResponse.builder()
                    .budget(BudgetMapper.toResponse(budget))
                    .spentAmount(spent)
                    .remainingAmount(remaining)
                    .percentageUsed(percentageUsed)
                    .isExceeded(isExceeded)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + budgetId));

        if (!budget.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("You do not have permission to delete this budget");
        }

        budgetRepository.delete(budget);
    }
}
