package com.plm.auth.dto;

import com.plm.auth.entity.User.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

public class AuthDTO {

    // Register request
    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 60, message = "Name must be 2–60 characters")
        private String name;

        @Email(message = "Must be a valid email")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
    }

    // Login request
    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {

        @Email(message = "Must be a valid email")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    // Auth response (returned on register + login)
    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;
        private String type;        // "Bearer"
        private Long id;
        private String name;
        private String email;
        private Role role;
        private LocalDateTime createdAt;
    }

    // User profile response
    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserResponse {
        private Long id;
        private String name;
        private String email;
        private Role role;
        private LocalDateTime createdAt;
    }
}