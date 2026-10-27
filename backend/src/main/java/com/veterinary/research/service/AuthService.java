package com.veterinary.research.service;

import com.veterinary.research.dto.AuthDTOs;

public interface AuthService {
    AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest request, String ipAddress, String userAgent);

    AuthDTOs.AuthResponse register(AuthDTOs.RegisterRequest request);

    AuthDTOs.AuthResponse getCurrentUser(String username);

    void heartbeat(String sessionToken, Long durationSeconds);

    void logoutSession(String sessionToken);
}
