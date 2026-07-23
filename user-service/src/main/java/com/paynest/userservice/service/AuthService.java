package com.paynest.userservice.service;

import com.paynest.userservice.dto.AuthResponse;
import com.paynest.userservice.dto.LoginRequest;
import com.paynest.userservice.dto.RefreshTokenRequest;
import com.paynest.userservice.dto.RegisterRequest;
import com.paynest.userservice.dto.UserResponse;
import com.paynest.userservice.entity.User;
import com.paynest.userservice.exception.InvalidCredentialsException;
import com.paynest.userservice.exception.UserAlreadyExistsException;
import com.paynest.userservice.mapper.UserMapper;
import com.paynest.userservice.repository.UserRepository;
import com.paynest.userservice.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final UserMapper userMapper;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already in use: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .currency(request.getCurrency() != null ? request.getCurrency() : "LKR")
                .build();

        User savedUser = userRepository.save(user);
        return createAuthResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return createAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!jwtProvider.isValid(refreshToken) || !jwtProvider.isRefreshToken(refreshToken)) {
            throw new InvalidCredentialsException("Invalid or expired refresh token");
        }

        Long userId = Long.parseLong(jwtProvider.extractUserId(refreshToken));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidCredentialsException("User not found for refresh token"));

        return createAuthResponse(user);
    }

    private AuthResponse createAuthResponse(User user) {
        String accessToken = jwtProvider.generateAccessToken(user);
        String refreshToken = jwtProvider.generateRefreshToken(user);
        UserResponse userResponse = userMapper.toUserResponse(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }
}
