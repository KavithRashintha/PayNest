package com.paynest.userservice;

import com.paynest.userservice.dto.RegisterRequest;
import com.paynest.userservice.dto.UserResponse;
import com.paynest.userservice.entity.User;
import com.paynest.userservice.mapper.UserMapper;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class UserServiceApplicationTests {

    private final UserMapper userMapper = new UserMapper();

    @Test
    void userMapperMapsEntityToResponse() {
        User user = User.builder()
                .id(1L)
                .email("test@example.com")
                .fullName("Test User")
                .currency("LKR")
                .createdAt(LocalDateTime.now())
                .build();

        UserResponse response = userMapper.toUserResponse(user);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        assertThat(response.getFullName()).isEqualTo("Test User");
        assertThat(response.getCurrency()).isEqualTo("LKR");
    }

    @Test
    void registerRequestBuilding() {
        RegisterRequest request = RegisterRequest.builder()
                .email("new@example.com")
                .password("password123")
                .fullName("New User")
                .currency("LKR")
                .build();

        assertThat(request.getEmail()).isEqualTo("new@example.com");
        assertThat(request.getPassword()).isEqualTo("password123");
    }
}
