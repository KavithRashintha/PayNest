package com.paynest.financeservice.service;

import com.paynest.financeservice.dto.TransactionRequest;
import com.paynest.financeservice.dto.TransactionResponse;
import com.paynest.financeservice.entity.Account;
import com.paynest.financeservice.entity.Category;
import com.paynest.financeservice.entity.Transaction;
import com.paynest.financeservice.exception.InsufficientBalanceException;
import com.paynest.financeservice.exception.InvalidRequestException;
import com.paynest.financeservice.exception.ResourceNotFoundException;
import com.paynest.financeservice.exception.UnauthorizedAccessException;
import com.paynest.financeservice.mapper.TransactionMapper;
import com.paynest.financeservice.model.AccountType;
import com.paynest.financeservice.model.TransactionType;
import com.paynest.financeservice.repository.AccountRepository;
import com.paynest.financeservice.repository.CategoryRepository;
import com.paynest.financeservice.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final AccountService accountService;
    private final CategoryService categoryService;

    @Transactional
    public TransactionResponse createTransaction(Long userId, TransactionRequest request) {
        Account account = accountService.getAccountEntity(userId, request.getAccountId());
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryService.getCategoryEntity(userId, request.getCategoryId());
        }

        Account toAccount = null;
        if (request.getType() == TransactionType.TRANSFER) {
            if (request.getToAccountId() == null) {
                throw new InvalidRequestException("Target account ID (toAccountId) is required for transfer transactions");
            }
            if (request.getAccountId().equals(request.getToAccountId())) {
                throw new InvalidRequestException("Source and destination accounts must be different");
            }
            toAccount = accountService.getAccountEntity(userId, request.getToAccountId());
        }

        // Adjust Account Balances
        applyBalanceAdjustment(account, toAccount, request.getType(), request.getAmount());

        Transaction transaction = Transaction.builder()
                .userId(userId)
                .account(account)
                .category(category)
                .toAccount(toAccount)
                .amount(request.getAmount())
                .type(request.getType())
                .title(request.getTitle())
                .description(request.getDescription())
                .transactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDateTime.now())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return TransactionMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getUserTransactions(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return transactionRepository.findByUserIdOrderByTransactionDateDesc(userId, pageable)
                .map(TransactionMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long userId, Long transactionId) {
        Transaction transaction = getTransactionEntity(userId, transactionId);
        return TransactionMapper.toResponse(transaction);
    }

    @Transactional
    public void deleteTransaction(Long userId, Long transactionId) {
        Transaction transaction = getTransactionEntity(userId, transactionId);
        revertBalanceAdjustment(transaction.getAccount(), transaction.getToAccount(), transaction.getType(), transaction.getAmount());
        transactionRepository.delete(transaction);
    }

    private Transaction getTransactionEntity(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + transactionId));
        if (!transaction.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("You do not have permission to access this transaction");
        }
        return transaction;
    }

    private void applyBalanceAdjustment(Account account, Account toAccount, TransactionType type, BigDecimal amount) {
        if (type == TransactionType.INCOME) {
            account.setBalance(account.getBalance().add(amount));
            accountRepository.save(account);
        } else if (type == TransactionType.EXPENSE) {
            account.setBalance(account.getBalance().subtract(amount));
            accountRepository.save(account);
        } else if (type == TransactionType.TRANSFER) {
            account.setBalance(account.getBalance().subtract(amount));
            toAccount.setBalance(toAccount.getBalance().add(amount));
            accountRepository.save(account);
            accountRepository.save(toAccount);
        }
    }

    private void revertBalanceAdjustment(Account account, Account toAccount, TransactionType type, BigDecimal amount) {
        if (type == TransactionType.INCOME) {
            account.setBalance(account.getBalance().subtract(amount));
            accountRepository.save(account);
        } else if (type == TransactionType.EXPENSE) {
            account.setBalance(account.getBalance().add(amount));
            accountRepository.save(account);
        } else if (type == TransactionType.TRANSFER && toAccount != null) {
            account.setBalance(account.getBalance().add(amount));
            toAccount.setBalance(toAccount.getBalance().subtract(amount));
            accountRepository.save(account);
            accountRepository.save(toAccount);
        }
    }
}
