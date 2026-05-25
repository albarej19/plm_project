package com.plm.auth.service;

import com.plm.auth.dto.AuthDTO;
import com.plm.auth.entity.User;
import com.plm.auth.entity.User.Role;
import com.plm.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // Register (always creates USER role)
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email '" + request.getEmail() + "' is already registered.");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();
        User saved = userRepository.save(user);
        log.info("New user registered: {} (role: USER)", saved.getEmail());
        return toAuthResponse(saved, jwtService.generateToken(saved));
    }

    // Login
    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            throw new IllegalArgumentException("Invalid email or password.");
        }
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        log.info("User logged in: {} (role: {})", user.getEmail(), user.getRole());
        return toAuthResponse(user, jwtService.generateToken(user));
    }

    // Get current user profile
    public AuthDTO.UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toUserResponse(user);
    }

    // Get all users (ADMIN only)
    public List<AuthDTO.UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    //  Promote user to ADMIN (ADMIN only)
    public AuthDTO.UserResponse promoteToAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        if (user.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("User is already an ADMIN.");
        }
        user.setRole(Role.ADMIN);
        User saved = userRepository.save(user);
        log.info("User {} promoted to ADMIN", saved.getEmail());
        return toUserResponse(saved);
    }

    // Demote ADMIN to USER (ADMIN only)
    public AuthDTO.UserResponse demoteToUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        if (user.getRole() == Role.USER) {
            throw new IllegalArgumentException("User already has USER role.");
        }
        user.setRole(Role.USER);
        User saved = userRepository.save(user);
        log.info("User {} demoted to USER", saved.getEmail());
        return toUserResponse(saved);
    }

    // Mappers
    private AuthDTO.AuthResponse toAuthResponse(User user, String token) {
        return AuthDTO.AuthResponse.builder()
                .token(token).type("Bearer")
                .id(user.getId()).name(user.getName())
                .email(user.getEmail()).role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public AuthDTO.UserResponse toUserResponse(User user) {
        return AuthDTO.UserResponse.builder()
                .id(user.getId()).name(user.getName())
                .email(user.getEmail()).role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}