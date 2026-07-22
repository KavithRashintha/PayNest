package com.paynest.userservice.service;

import com.paynest.userservice.dto.UpdateProfileRequest;
import com.paynest.userservice.dto.UserResponse;
import com.paynest.userservice.entity.User;
import com.paynest.userservice.exception.ResourceNotFoundException;
import com.paynest.userservice.mapper.UserMapper;
import com.paynest.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public UserResponse getUserProfile(Long userId) {
        User user = findUserById(userId);
        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateUserProfile(Long userId, UpdateProfileRequest request) {
        User user = findUserById(userId);

        if (StringUtils.hasText(request.getFullName())) {
            user.setFullName(request.getFullName());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (StringUtils.hasText(request.getCurrency())) {
            user.setCurrency(request.getCurrency());
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toUserResponse(updatedUser);
    }

    @Transactional(readOnly = true)
    public User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }
}
