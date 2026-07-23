package com.paynest.financeservice.mapper;

import com.paynest.financeservice.dto.CategoryRequest;
import com.paynest.financeservice.dto.CategoryResponse;
import com.paynest.financeservice.entity.Category;

public class CategoryMapper {

    public static Category toEntity(CategoryRequest request, Long userId) {
        return Category.builder()
                .userId(userId)
                .name(request.getName())
                .type(request.getType())
                .icon(request.getIcon())
                .color(request.getColor())
                .isSystemDefault(false)
                .build();
    }

    public static CategoryResponse toResponse(Category entity) {
        if (entity == null) return null;
        return CategoryResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .name(entity.getName())
                .type(entity.getType())
                .icon(entity.getIcon())
                .color(entity.getColor())
                .isSystemDefault(entity.getIsSystemDefault())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
