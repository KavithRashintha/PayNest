package com.paynest.financeservice.service;

import com.paynest.financeservice.dto.AccountRequest;
import com.paynest.financeservice.dto.AccountResponse;
import com.paynest.financeservice.entity.Account;
import com.paynest.financeservice.exception.ResourceNotFoundException;
import com.paynest.financeservice.exception.UnauthorizedAccessException;
import com.paynest.financeservice.mapper.AccountMapper;
import com.paynest.financeservice.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    @Transactional
    public AccountResponse createAccount(Long userId, AccountRequest request) {
        Account account = AccountMapper.toEntity(request, userId);
        Account savedAccount = accountRepository.save(account);
        return AccountMapper.toResponse(savedAccount);
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getUserAccounts(Long userId) {
        return accountRepository.findByUserIdOrderByIdAsc(userId)
                .stream()
                .map(AccountMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccountById(Long userId, Long accountId) {
        Account account = getAccountEntity(userId, accountId);
        return AccountMapper.toResponse(account);
    }

    @Transactional
    public AccountResponse updateAccount(Long userId, Long accountId, AccountRequest request) {
        Account account = getAccountEntity(userId, accountId);
        account.setName(request.getName());
        account.setType(request.getType());
        if (request.getCurrency() != null) {
            account.setCurrency(request.getCurrency());
        }
        if (request.getBalance() != null) {
            account.setBalance(request.getBalance());
        }
        Account updated = accountRepository.save(account);
        return AccountMapper.toResponse(updated);
    }

    @Transactional
    public void deleteAccount(Long userId, Long accountId) {
        Account account = getAccountEntity(userId, accountId);
        accountRepository.delete(account);
    }

    public Account getAccountEntity(Long userId, Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + accountId));
        if (!account.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("You do not have permission to access this account");
        }
        return account;
    }
}
