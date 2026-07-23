package com.paynest.financeservice.service;

import com.paynest.financeservice.dto.TransactionRequest;
import com.paynest.financeservice.dto.TransactionResponse;
import com.paynest.financeservice.entity.Account;
import com.paynest.financeservice.entity.Category;
import com.paynest.financeservice.entity.Transaction;
import com.paynest.financeservice.model.AccountType;
import com.paynest.financeservice.model.CategoryType;
import com.paynest.financeservice.model.TransactionType;
import com.paynest.financeservice.repository.AccountRepository;
import com.paynest.financeservice.repository.CategoryRepository;
import com.paynest.financeservice.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private AccountService accountService;

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private TransactionService transactionService;

    private Account sampleAccount;
    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleAccount = Account.builder()
                .id(1L)
                .userId(100L)
                .name("Savings Account")
                .type(AccountType.BANK)
                .balance(new BigDecimal("1000.00"))
                .currency("LKR")
                .build();

        sampleCategory = Category.builder()
                .id(10L)
                .name("Salary")
                .type(CategoryType.INCOME)
                .isSystemDefault(true)
                .build();
    }

    @Test
    void createIncomeTransaction_Success() {
        TransactionRequest request = TransactionRequest.builder()
                .accountId(1L)
                .categoryId(10L)
                .amount(new BigDecimal("500.00"))
                .type(TransactionType.INCOME)
                .title("Monthly Salary")
                .transactionDate(LocalDateTime.now())
                .build();

        Transaction savedTransaction = Transaction.builder()
                .id(50L)
                .userId(100L)
                .account(sampleAccount)
                .category(sampleCategory)
                .amount(new BigDecimal("500.00"))
                .type(TransactionType.INCOME)
                .title("Monthly Salary")
                .transactionDate(request.getTransactionDate())
                .build();

        when(accountService.getAccountEntity(100L, 1L)).thenReturn(sampleAccount);
        when(categoryService.getCategoryEntity(100L, 10L)).thenReturn(sampleCategory);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);

        TransactionResponse response = transactionService.createTransaction(100L, request);

        assertNotNull(response);
        assertEquals("Monthly Salary", response.getTitle());
        assertEquals(TransactionType.INCOME, response.getType());
        assertEquals(new BigDecimal("500.00"), response.getAmount());
        assertEquals(new BigDecimal("1500.00"), sampleAccount.getBalance());
        verify(accountRepository, times(1)).save(sampleAccount);
    }
}
