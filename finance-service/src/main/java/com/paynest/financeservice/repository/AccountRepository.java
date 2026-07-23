package com.paynest.financeservice.repository;

import com.paynest.financeservice.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByUserIdOrderByIdAsc(Long userId);

    Optional<Account> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT SUM(a.balance) FROM Account a WHERE a.userId = :userId")
    BigDecimal getTotalBalanceByUserId(@Param("userId") Long userId);
}
