package com.paynest.financeservice.controller;

import com.paynest.financeservice.dto.CategoryRequest;
import com.paynest.financeservice.dto.CategoryResponse;
import com.paynest.financeservice.exception.InvalidRequestException;
import com.paynest.financeservice.exception.UnauthorizedAccessException;
import com.paynest.financeservice.model.CategoryType;
import com.paynest.financeservice.security.CustomUserDetails;
import com.paynest.financeservice.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/finance/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "type", required = false) CategoryType type) {

        Long userId = resolveUserId(userDetails, headerUserId);
        List<CategoryResponse> response = categoryService.getAllCategoriesForUser(userId, type);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @Valid @RequestBody CategoryRequest request) {

        Long userId = resolveUserId(userDetails, headerUserId);
        CategoryResponse response = categoryService.createCustomCategory(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @PathVariable("id") Long id) {

        Long userId = resolveUserId(userDetails, headerUserId);
        categoryService.deleteCategory(userId, id);
        return ResponseEntity.noContent().build();
    }

    private Long resolveUserId(CustomUserDetails userDetails, String headerUserId) {
        if (userDetails != null && userDetails.getId() != null) {
            return userDetails.getId();
        }
        if (headerUserId != null && !headerUserId.isBlank()) {
            try {
                return Long.parseLong(headerUserId);
            } catch (NumberFormatException e) {
                throw new InvalidRequestException("Invalid X-User-Id header format");
            }
        }
        throw new UnauthorizedAccessException("User authentication required");
    }
}
