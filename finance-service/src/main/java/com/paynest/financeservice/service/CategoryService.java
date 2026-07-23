package com.paynest.financeservice.service;

import com.paynest.financeservice.dto.CategoryRequest;
import com.paynest.financeservice.dto.CategoryResponse;
import com.paynest.financeservice.entity.Category;
import com.paynest.financeservice.exception.InvalidRequestException;
import com.paynest.financeservice.exception.ResourceNotFoundException;
import com.paynest.financeservice.exception.UnauthorizedAccessException;
import com.paynest.financeservice.mapper.CategoryMapper;
import com.paynest.financeservice.model.CategoryType;
import com.paynest.financeservice.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategoriesForUser(Long userId, CategoryType type) {
        List<Category> categories;
        if (type != null) {
            categories = categoryRepository.findAllAvailableForUserAndType(userId, type);
        } else {
            categories = categoryRepository.findAllAvailableForUser(userId);
        }
        return categories.stream()
                .map(CategoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCustomCategory(Long userId, CategoryRequest request) {
        Category category = CategoryMapper.toEntity(request, userId);
        Category savedCategory = categoryRepository.save(category);
        return CategoryMapper.toResponse(savedCategory);
    }

    @Transactional
    public void deleteCategory(Long userId, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        if (Boolean.TRUE.equals(category.getIsSystemDefault())) {
            throw new InvalidRequestException("System default categories cannot be deleted");
        }

        if (!userId.equals(category.getUserId())) {
            throw new UnauthorizedAccessException("You do not have permission to delete this category");
        }

        categoryRepository.delete(category);
    }

    public Category getCategoryEntity(Long userId, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        if (!Boolean.TRUE.equals(category.getIsSystemDefault()) && !userId.equals(category.getUserId())) {
            throw new UnauthorizedAccessException("You do not have permission to access this category");
        }
        return category;
    }
}
