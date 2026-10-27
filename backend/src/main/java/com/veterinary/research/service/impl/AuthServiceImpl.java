package com.veterinary.research.service.impl;

import com.veterinary.research.dto.AuthDTOs;
import com.veterinary.research.entity.User;
import com.veterinary.research.entity.UserLoginSession;
import com.veterinary.research.repository.UserLoginSessionRepository;
import com.veterinary.research.repository.UserRepository;
import com.veterinary.research.security.JwtTokenProvider;
import com.veterinary.research.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final UserLoginSessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Override
    @Transactional
    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest request, String ipAddress, String userAgent) {
        String identifier = request.getUsername().trim();

        // 1. Locate user by username or email
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        // 2. Validate account status
        if ("PENDING_APPROVAL".equalsIgnoreCase(user.getAccountStatus())) {
            throw new IllegalArgumentException(
                    "Your account registration is currently pending administrator approval. Please wait for an administrator to approve your account before logging in.");
        }

        if ("REJECTED".equalsIgnoreCase(user.getAccountStatus())) {
            throw new IllegalArgumentException(
                    "Your account registration was reviewed and rejected by the administrator.");
        }

        if (!user.isActive()) {
            throw new IllegalArgumentException("Your account is deactivated. Please contact the administrator.");
        }

        // 3. Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        // 4. Authenticate in Spring Security context
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 5. Generate JWT token
        String jwt = tokenProvider.generateToken(authentication);

        // 6. Update user login stats
        user.setTotalLoginCount((user.getTotalLoginCount()) + 1L);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // 7. Track User Activity Session
        String sessionToken = UUID.randomUUID().toString();
        UserLoginSession session = UserLoginSession.builder()
                .sessionToken(sessionToken)
                .userId(user.getId())
                .customUserId(user.getCustomUserId() != null ? user.getCustomUserId() : "DAC-USR-" + user.getId())
                .userEmail(user.getEmail())
                .userRole(user.getRole())
                .loginTime(LocalDateTime.now())
                .lastActiveTime(LocalDateTime.now())
                .durationSeconds(0L)
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .userAgent(userAgent != null ? (userAgent.length() > 250 ? userAgent.substring(0, 250) : userAgent)
                        : "DA-Centre-Client")
                .status("ACTIVE")
                .build();
        sessionRepository.save(session);

        return AuthDTOs.AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .customUserId(user.getCustomUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .fullName(user.getFullName())
                .role(user.getRole())
                .accountStatus(user.getAccountStatus())
                .active(user.isActive())
                .sessionToken(sessionToken)
                .message("Login successful")
                .build();
    }

    @Override
    @Transactional
    public AuthDTOs.AuthResponse register(AuthDTOs.RegisterRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already in use");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }

        long count = userRepository.count();
        String customId = String.format("DAC-USR-%04d", count + 101);

        // New registrations always require Administrator Approval
        User user = User.builder()
                .customUserId(customId)
                .username(username)
                .email(email)
                .mobileNumber(request.getMobileNumber() != null ? request.getMobileNumber().trim() : null)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(
                        request.getFullName() != null && !request.getFullName().isBlank() ? request.getFullName().trim()
                                : username)
                .role("USER")
                .accountStatus("PENDING_APPROVAL")
                .active(false) // Inactive until Admin approval
                .department(request.getDepartment())
                .region(request.getRegion())
                .totalLoginCount(0L)
                .build();

        userRepository.save(user);
        log.info("New user registered and queued for Admin Approval: {} ({})", user.getEmail(), user.getCustomUserId());

        return AuthDTOs.AuthResponse.builder()
                .id(user.getId())
                .customUserId(user.getCustomUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .fullName(user.getFullName())
                .role(user.getRole())
                .accountStatus(user.getAccountStatus())
                .active(false)
                .message(
                        "Registration submitted successfully! Your account is pending administrator approval. Once approved, you can sign in to DA Centre.")
                .build();
    }

    @Override
    public AuthDTOs.AuthResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return AuthDTOs.AuthResponse.builder()
                .id(user.getId())
                .customUserId(user.getCustomUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .fullName(user.getFullName())
                .role(user.getRole())
                .accountStatus(user.getAccountStatus())
                .active(user.isActive())
                .build();
    }

    @Override
    @Transactional
    public void heartbeat(String sessionToken, Long durationSeconds) {
        if (sessionToken == null || sessionToken.isBlank())
            return;
        Optional<UserLoginSession> sessionOpt = sessionRepository.findBySessionToken(sessionToken);
        if (sessionOpt.isPresent()) {
            UserLoginSession session = sessionOpt.get();
            session.setLastActiveTime(LocalDateTime.now());
            if (durationSeconds != null && durationSeconds > 0) {
                session.setDurationSeconds(durationSeconds);
            } else {
                session.setDurationSeconds(
                        (session.getDurationSeconds() != null ? session.getDurationSeconds() : 0L) + 30L);
            }
            sessionRepository.save(session);
        }
    }

    @Override
    @Transactional
    public void logoutSession(String sessionToken) {
        if (sessionToken == null || sessionToken.isBlank())
            return;
        Optional<UserLoginSession> sessionOpt = sessionRepository.findBySessionToken(sessionToken);
        if (sessionOpt.isPresent()) {
            UserLoginSession session = sessionOpt.get();
            session.setStatus("CLOSED");
            session.setEndTime(LocalDateTime.now());
            sessionRepository.save(session);
        }
    }
}
