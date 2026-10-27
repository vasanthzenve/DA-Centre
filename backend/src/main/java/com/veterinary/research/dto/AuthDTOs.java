package com.veterinary.research.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

public class AuthDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginRequest {
        @NotBlank(message = "Username or email is required")
        private String username;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterRequest {
        @NotBlank(message = "Username is required")
        private String username;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String mobileNumber;

        @NotBlank(message = "Password is required")
        private String password;

        private String fullName;
        private String role;
        private String department;
        private String region;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminCreateUserRequest {
        @NotBlank(message = "Username is required")
        private String username;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        private String fullName;
        private String mobileNumber;
        private String role;
        private String accountStatus;
        private Boolean active;
        private String department;
        private String region;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;
        private String type;
        private Long id;
        private String customUserId;
        private String username;
        private String email;
        private String mobileNumber;
        private String fullName;
        private String role;
        private String accountStatus;
        private boolean active;
        private String message;
        private String sessionToken;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HeartbeatRequest {
        private String sessionToken;
        private Long durationSeconds;
    }
}
