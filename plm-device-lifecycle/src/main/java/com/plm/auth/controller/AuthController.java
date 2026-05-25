package com.plm.auth.controller;

import com.plm.auth.dto.AuthDTO;
import com.plm.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login and user management")
public class AuthController {

    private final AuthService authService;

    // POST /register - public
    @PostMapping("/register")
    @Operation(summary = "Register a new user (public)",
            description = "Creates account with USER role. Returns JWT immediately.")
    public ResponseEntity<AuthDTO.AuthResponse> register(
            @Valid @RequestBody AuthDTO.RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    // POST /login public
    @PostMapping("/login")
    @Operation(summary = "Login (public)",
            description = "Returns JWT valid for 24h. Use as: Authorization: Bearer <token>")
    public ResponseEntity<AuthDTO.AuthResponse> login(
            @Valid @RequestBody AuthDTO.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // GET /me - USER + ADMIN
    @GetMapping("/me")
    @Operation(summary = "Get my profile (USER, ADMIN)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<AuthDTO.UserResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.getProfile(userDetails.getUsername()));
    }

    // GET /users - ADMIN only
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users (ADMIN only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<AuthDTO.UserResponse>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    // PATCH /users/{id}/promote - ADMIN only
    @PatchMapping("/users/{id}/promote")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Promote user to ADMIN (ADMIN only)",
            description = "Changes a USER's role to ADMIN.")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<AuthDTO.UserResponse> promoteToAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(authService.promoteToAdmin(id));
    }

    // PATCH /users/{id}/demote - ADMIN only
    @PatchMapping("/users/{id}/demote")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Demote ADMIN to USER (ADMIN only)",
            description = "Changes an ADMIN's role back to USER.")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<AuthDTO.UserResponse> demoteToUser(@PathVariable Long id) {
        return ResponseEntity.ok(authService.demoteToUser(id));
    }
}