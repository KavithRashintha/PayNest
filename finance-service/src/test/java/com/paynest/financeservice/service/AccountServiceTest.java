package com.paynest.financeservice.service;

import com.paynest.financeservice.dto.AccountRequest;
import com.paynest.financeservice.dto.AccountResponse;
import com.paynest.financeservice.entity.Account;
import com.paynest.financeservice.exception.ResourceNotFoundException;
import com.paynest.financeservice.model.AccountType;
import com.paynest.financeservice.repository.AccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private AccountService accountService;

    private Account sampleAccount;

    @BeforeEach
    void setUp() {
        sampleAccount = Account.builder()
                .id(1L)
                .userId(100L)
                .name("Savings Account")
                .type(AccountType.BANK)
                .balance(new BigDecimal("5000.00"))
                .currency("LKR")
                .build();
    }

    @Test
    void createAccount_Success() {
        AccountRequest request = AccountRequest.builder()
                .name("Savings Account")
                .type(AccountType.BANK)
                .balance(new BigDecimal("5000.00"))
                .currency("LKR")
                .build();

        when(accountRepository.save(any(Account.class))).thenReturn(sampleAccount);

        AccountResponse response = accountService.createAccount(100L, request);

        assertNotNull(response);
        assertEquals("Savings Account", response.getName());
        assertEquals(AccountType.BANK, response.getType());
        assertEquals(new BigDecimal("5000.00"), response.getBalance());
        verify(accountRepository, times(1)).save(any(Account.class));
    }

    @Test
    void getUserAccounts_Success() {
        when(accountRepository.findByUserIdOrderByIdAsc(100L)).thenReturn(List.of(sampleAccount));

        List<AccountResponse> responses = accountService.getUserAccounts(100L);

        assertEquals(1, responses.size());
        assertEquals("Savings Account", responses.get(0).getName());
        verify(accountRepository, times(1)).findByUserIdOrderByIdAsc(100L);
    }

    @Test
    void getAccountById_NotFound_ThrowsException() {
        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> accountService.getAccountById(100L, 99L));
    }
}
