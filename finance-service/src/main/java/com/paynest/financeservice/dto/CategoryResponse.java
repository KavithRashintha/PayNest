package com.paynest.financeservice.dto;

import com.paynest.financeservice.model.CategoryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private Long userId;
    private String name;
    private CategoryType type;
    private String icon;
    private String color;
    private Boolean isSystemDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
