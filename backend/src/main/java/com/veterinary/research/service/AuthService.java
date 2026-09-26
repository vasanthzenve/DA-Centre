package com.veterinary.research.service;

import com.veterinary.research.dto.AuthDTOs;

public interface AuthService {
    AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest request);
    AuthDTOs.AuthResponse register(AuthDTOs.RegisterRequest request);
    AuthDTOs.AuthResponse getCurrentUser(String username);
}
