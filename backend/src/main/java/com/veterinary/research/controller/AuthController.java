package com.veterinary.research.controller;

import com.veterinary.research.dto.ApiResponse;
import com.veterinary.research.dto.AuthDTOs;
import com.veterinary.research.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDTOs.AuthResponse>> login(
            @Valid @RequestBody AuthDTOs.LoginRequest request,
            HttpServletRequest servletRequest) {
        String ipAddress = servletRequest.getRemoteAddr();
        String userAgent = servletRequest.getHeader("User-Agent");
        AuthDTOs.AuthResponse response = authService.login(request, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthDTOs.AuthResponse>> register(
            @Valid @RequestBody AuthDTOs.RegisterRequest request) {
        AuthDTOs.AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthDTOs.AuthResponse>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.ok(ApiResponse.success(null));
        }
        AuthDTOs.AuthResponse response = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<ApiResponse<String>> heartbeat(@RequestBody AuthDTOs.HeartbeatRequest request) {
        if (request != null && request.getSessionToken() != null) {
            authService.heartbeat(request.getSessionToken(), request.getDurationSeconds());
        }
        return ResponseEntity.ok(ApiResponse.success("Session heartbeat updated", "OK"));
    }

    @PostMapping("/logout-session")
    public ResponseEntity<ApiResponse<String>> logoutSession(@RequestParam(required = false) String sessionToken) {
        if (sessionToken != null) {
            authService.logoutSession(sessionToken);
        }
        return ResponseEntity.ok(ApiResponse.success("Session closed", "OK"));
    }
}
