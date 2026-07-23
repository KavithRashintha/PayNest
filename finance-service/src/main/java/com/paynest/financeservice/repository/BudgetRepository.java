package com.paynest.financeservice.repository;

import com.paynest.financeservice.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserIdOrderByStartDateDesc(Long userId);

    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND :currentDate BETWEEN b.startDate AND b.endDate")
    List<Budget> findActiveBudgetsByUserId(@Param("userId") Long userId, @Param("currentDate") LocalDate currentDate);
}
