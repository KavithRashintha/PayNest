package com.paynest.financeservice.repository;

import com.paynest.financeservice.entity.BudgetAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetAlertRepository extends JpaRepository<BudgetAlert, Long> {
    List<BudgetAlert> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<BudgetAlert> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
}
