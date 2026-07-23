package com.paynest.financeservice.repository;

import com.paynest.financeservice.entity.Category;
import com.paynest.financeservice.model.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("SELECT c FROM Category c WHERE c.isSystemDefault = true OR c.userId = :userId ORDER BY c.name ASC")
    List<Category> findAllAvailableForUser(@Param("userId") Long userId);

    @Query("SELECT c FROM Category c WHERE (c.isSystemDefault = true OR c.userId = :userId) AND c.type = :type ORDER BY c.name ASC")
    List<Category> findAllAvailableForUserAndType(@Param("userId") Long userId, @Param("type") CategoryType type);

    Optional<Category> findByIdAndUserId(Long id, Long userId);
}
