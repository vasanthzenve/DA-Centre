package com.veterinary.research.controller;

import com.veterinary.research.dto.ApiResponse;
import com.veterinary.research.dto.AuthDTOs;
import com.veterinary.research.entity.DataDeletionRequest;
import com.veterinary.research.entity.User;
import com.veterinary.research.entity.UserLoginSession;
import com.veterinary.research.repository.*;
import com.veterinary.research.util.ClientIpUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class AdminManagementController {

    private final UserRepository userRepository;
    private final UserLoginSessionRepository sessionRepository;
    private final DataDeletionRequestRepository deletionRequestRepository;
    private final ChatbotMessageRepository chatbotMessageRepository;
    private final PasswordEncoder passwordEncoder;

    // Entity Repositories for Automatic Deletion
    private final DoctorRepository doctorRepository;
    private final FoodProductRepository foodProductRepository;
    private final HygieneProductRepository hygieneProductRepository;
    private final AccessoryRepository accessoryRepository;
    private final MarketResearchRepository marketResearchRepository;
    private final VeterinaryEcosystemRepository ecosystemRepository;
    private final ServiceNetworkRepository serviceNetworkRepository;
    private final WelfareNetworkRepository welfareNetworkRepository;

    /**
     * Admin Dashboard Statistics: Total users, spend time, activities, pending items, live IP telemetry
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats(HttpServletRequest servletRequest) {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByAccountStatus("ACTIVE");
        long pendingUsers = userRepository.countByAccountStatus("PENDING_APPROVAL");
        long rejectedUsers = userRepository.countByAccountStatus("REJECTED");

        long totalSessions = sessionRepository.count();
        long activeSessionsNow = sessionRepository.countActiveSessionsSince(LocalDateTime.now().minusMinutes(5));
        Long totalSpendSeconds = sessionRepository.sumTotalDurationSeconds();
        if (totalSpendSeconds == null)
            totalSpendSeconds = 0L;

        long pendingDeletions = deletionRequestRepository.countByStatus("PENDING");
        long approvedDeletions = deletionRequestRepository.countByStatus("APPROVED");
        long totalQueries = chatbotMessageRepository.count();
        long unreadQueries = chatbotMessageRepository.countByIsReadFalseAndSender("USER");

        String adminIp = ClientIpUtil.getClientIpAddress(servletRequest);
        String adminNetworkType = ClientIpUtil.getNetworkType(adminIp);

        // Fetch currently active user sessions for live IP monitoring
        List<UserLoginSession> allSessions = sessionRepository.findTop100ByOrderByLoginTimeDesc();
        List<Map<String, Object>> activeUsersList = new ArrayList<>();
        Set<Long> seenUserIds = new HashSet<>();

        for (UserLoginSession s : allSessions) {
            if ("ACTIVE".equalsIgnoreCase(s.getStatus())
                    && s.getLastActiveTime() != null
                    && s.getLastActiveTime().isAfter(LocalDateTime.now().minusMinutes(15))
                    && !seenUserIds.contains(s.getUserId())) {
                seenUserIds.add(s.getUserId());
                Map<String, Object> uInfo = new HashMap<>();
                uInfo.put("userId", s.getUserId());
                uInfo.put("customUserId", s.getCustomUserId());
                uInfo.put("email", s.getUserEmail());
                uInfo.put("role", s.getUserRole());
                uInfo.put("currentIpAddress", ClientIpUtil.sanitizeIp(s.getIpAddress()));
                uInfo.put("networkType", ClientIpUtil.getNetworkType(s.getIpAddress()));
                uInfo.put("lastActiveTime", s.getLastActiveTime());
                uInfo.put("durationSeconds", s.getDurationSeconds());
                activeUsersList.add(uInfo);
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("pendingUsers", pendingUsers);
        stats.put("rejectedUsers", rejectedUsers);
        stats.put("totalSessions", totalSessions);
        stats.put("activeSessionsNow", activeSessionsNow);
        stats.put("totalSpendSeconds", totalSpendSeconds);
        stats.put("formattedSpendTime", formatDuration(totalSpendSeconds));
        stats.put("pendingDeletions", pendingDeletions);
        stats.put("approvedDeletions", approvedDeletions);
        stats.put("totalQueries", totalQueries);
        stats.put("unreadQueries", unreadQueries);
        stats.put("adminCurrentIp", adminIp);
        stats.put("adminNetworkType", adminNetworkType);
        stats.put("activeOnlineUsers", activeUsersList);

        return ResponseEntity.ok(ApiResponse.success("Admin dashboard stats retrieved", stats));
    }

    /**
     * List users (with optional status filter) with resolved IP telemetry
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getUsers(@RequestParam(required = false) String status) {
        List<User> users;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            users = userRepository.findByAccountStatusOrderByCreatedAtDesc(status.toUpperCase());
        } else {
            users = userRepository.findAllByOrderByCreatedAtDesc();
        }

        for (User u : users) {
            boolean needsSave = false;
            if (u.getLastIpAddress() == null || u.getLastIpAddress().isBlank()) {
                List<UserLoginSession> userSessions = sessionRepository.findByUserIdOrderByLoginTimeDesc(u.getId());
                if (!userSessions.isEmpty() && userSessions.get(0).getIpAddress() != null) {
                    u.setLastIpAddress(ClientIpUtil.sanitizeIp(userSessions.get(0).getIpAddress()));
                    needsSave = true;
                } else {
                    u.setLastIpAddress("127.0.0.1");
                    needsSave = true;
                }
            } else {
                u.setLastIpAddress(ClientIpUtil.sanitizeIp(u.getLastIpAddress()));
            }

            if (u.getRegistrationIpAddress() == null || u.getRegistrationIpAddress().isBlank()) {
                u.setRegistrationIpAddress(u.getLastIpAddress());
                needsSave = true;
            } else {
                u.setRegistrationIpAddress(ClientIpUtil.sanitizeIp(u.getRegistrationIpAddress()));
            }

            if (needsSave) {
                userRepository.save(u);
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }

    /**
     * List users pending approval with registration IP addresses
     */
    @GetMapping("/users/pending")
    public ResponseEntity<ApiResponse<List<User>>> getPendingUsers() {
        List<User> pending = userRepository.findByAccountStatusOrderByCreatedAtDesc("PENDING_APPROVAL");
        for (User u : pending) {
            if (u.getRegistrationIpAddress() == null || u.getRegistrationIpAddress().isBlank()) {
                u.setRegistrationIpAddress(u.getLastIpAddress() != null ? ClientIpUtil.sanitizeIp(u.getLastIpAddress()) : "127.0.0.1");
            } else {
                u.setRegistrationIpAddress(ClientIpUtil.sanitizeIp(u.getRegistrationIpAddress()));
            }
        }
        return ResponseEntity.ok(ApiResponse.success("Pending users retrieved", pending));
    }

    /**
     * Admin approves a user registration
     */
    @PostMapping("/users/{id}/approve")
    @Transactional
    public ResponseEntity<ApiResponse<User>> approveUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        user.setAccountStatus("ACTIVE");
        user.setActive(true);
        User saved = userRepository.save(user);
        log.info("Admin approved user: {} ({})", saved.getEmail(), saved.getCustomUserId());

        return ResponseEntity.ok(ApiResponse.success("User successfully approved. Account is now active.", saved));
    }

    /**
     * Admin rejects a user registration
     */
    @PostMapping("/users/{id}/reject")
    @Transactional
    public ResponseEntity<ApiResponse<User>> rejectUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        user.setAccountStatus("REJECTED");
        user.setActive(false);
        User saved = userRepository.save(user);
        log.info("Admin rejected user: {} ({})", saved.getEmail(), saved.getCustomUserId());

        return ResponseEntity.ok(ApiResponse.success("User registration rejected.", saved));
    }

    /**
     * Admin directly creates a new user account
     */
    @PostMapping("/users")
    @Transactional
    public ResponseEntity<ApiResponse<User>> createUser(
            @Valid @RequestBody AuthDTOs.AdminCreateUserRequest request,
            HttpServletRequest servletRequest) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Username '" + username + "' is already in use by another account."));
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Email address '" + email + "' is already in use by another account."));
        }

        String role = (request.getRole() != null && request.getRole().toUpperCase().contains("ADMIN")) ? "ADMIN"
                : "USER";
        String status = (request.getAccountStatus() != null && !request.getAccountStatus().isBlank())
                ? request.getAccountStatus().toUpperCase()
                : "ACTIVE";

        boolean isActive = !"REJECTED".equalsIgnoreCase(status)
                && !"SUSPENDED".equalsIgnoreCase(status)
                && !"PENDING_APPROVAL".equalsIgnoreCase(status);

        if (request.getActive() != null) {
            isActive = request.getActive();
        }

        // Generate unique custom User ID (e.g. DAC-ADM-0105 or DAC-USR-0105)
        String prefix = "ADMIN".equalsIgnoreCase(role) ? "DAC-ADM-" : "DAC-USR-";
        long count = userRepository.count();
        String customId = String.format("%s%04d", prefix, count + 101);

        String fullName = (request.getFullName() != null && !request.getFullName().isBlank())
                ? request.getFullName().trim()
                : username;

        String clientIp = ClientIpUtil.getClientIpAddress(servletRequest);

        User user = User.builder()
                .customUserId(customId)
                .username(username)
                .email(email)
                .mobileNumber(request.getMobileNumber() != null ? request.getMobileNumber().trim() : null)
                .password(passwordEncoder.encode(request.getPassword().trim()))
                .fullName(fullName)
                .role(role)
                .accountStatus(status)
                .active(isActive)
                .department(request.getDepartment() != null ? request.getDepartment().trim() : null)
                .region(request.getRegion() != null ? request.getRegion().trim() : null)
                .totalLoginCount(0L)
                .registrationIpAddress(clientIp)
                .lastIpAddress(clientIp)
                .build();

        User saved = userRepository.save(user);
        log.info("Admin created new user account: {} ({}, role={}, ip={})", saved.getEmail(), saved.getCustomUserId(),
                saved.getRole(), clientIp);

        return ResponseEntity.ok(ApiResponse.success("User account created successfully", saved));
    }

    /**
     * Admin deletes a user account
     */
    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        if ("dacentreadmin@gmail.com".equalsIgnoreCase(user.getEmail())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Root administrator account cannot be deleted."));
        }

        userRepository.delete(user);
        log.info("Admin deleted user account: id={}, email={}", id, user.getEmail());
        return ResponseEntity.ok(ApiResponse.success("User account deleted successfully", "User deleted"));
    }

    /**
     * Admin updates user status (e.g. ACTIVE, SUSPENDED)
     */
    @PutMapping("/users/{id}/status")
    @Transactional
    public ResponseEntity<ApiResponse<User>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        if ("dacentreadmin@gmail.com".equalsIgnoreCase(user.getEmail()) && !"ACTIVE".equalsIgnoreCase(status)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Root administrator cannot be deactivated."));
        }

        user.setAccountStatus(status.toUpperCase());
        user.setActive("ACTIVE".equalsIgnoreCase(status));
        User saved = userRepository.save(user);

        log.info("Admin updated user #{} status to: {}", id, status);
        return ResponseEntity.ok(ApiResponse.success("User status updated to " + status, saved));
    }

    /**
     * List recent user activities and session spend times with sanitized IP addresses
     */
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<UserLoginSession>>> getSessions() {
        List<UserLoginSession> sessions = sessionRepository.findTop100ByOrderByLoginTimeDesc();
        for (UserLoginSession s : sessions) {
            s.setIpAddress(ClientIpUtil.sanitizeIp(s.getIpAddress()));
        }
        return ResponseEntity.ok(ApiResponse.success("User sessions and spend times retrieved", sessions));
    }

    /**
     * Get Admin / Client current IP telemetry
     */
    @GetMapping("/current-ip")
    public ResponseEntity<ApiResponse<Map<String, String>>> getCurrentIp(HttpServletRequest servletRequest) {
        String ipAddress = ClientIpUtil.getClientIpAddress(servletRequest);
        String networkType = ClientIpUtil.getNetworkType(ipAddress);
        Map<String, String> data = new HashMap<>();
        data.put("ip", ipAddress);
        data.put("networkType", networkType);
        return ResponseEntity.ok(ApiResponse.success("Admin IP detected", data));
    }

    /**
     * List data deletion requests
     */
    @GetMapping("/data-deletions")
    public ResponseEntity<ApiResponse<List<DataDeletionRequest>>> getDataDeletions(
            @RequestParam(required = false) String status) {
        List<DataDeletionRequest> requests;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            requests = deletionRequestRepository.findByStatusOrderByRequestedAtDesc(status.toUpperCase());
        } else {
            requests = deletionRequestRepository.findAllByOrderByRequestedAtDesc();
        }
        return ResponseEntity.ok(ApiResponse.success("Data deletion requests retrieved", requests));
    }

    /**
     * Admin approves deletion: AUTOMATICALLY DELETES THE RECORD FROM DACENTRE
     */
    @PostMapping("/data-deletions/{id}/approve")
    @Transactional
    public ResponseEntity<ApiResponse<DataDeletionRequest>> approveDataDeletion(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "dacentreadmin@gmail.com") String adminEmail) {
        DataDeletionRequest request = deletionRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Deletion request not found with id: " + id));

        if ("APPROVED".equalsIgnoreCase(request.getStatus())) {
            return ResponseEntity.ok(ApiResponse.success("Request has already been approved and deleted.", request));
        }

        // Automatic deletion from DA Centre repository
        boolean deleted = executeAutomaticDeletion(request.getDataType(), request.getDataId());

        request.setStatus("APPROVED");
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewedByEmail(adminEmail);
        request.setAutoDeleted(deleted);
        DataDeletionRequest saved = deletionRequestRepository.save(request);

        log.info("Admin approved deletion request #{}. Target [{}:{}] automatic delete status: {}",
                id, request.getDataType(), request.getDataId(), deleted);

        return ResponseEntity
                .ok(ApiResponse.success("Deletion approved. Data record automatically deleted from DA Centre.", saved));
    }

    /**
     * Admin rejects deletion
     */
    @PostMapping("/data-deletions/{id}/reject")
    @Transactional
    public ResponseEntity<ApiResponse<DataDeletionRequest>> rejectDataDeletion(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "dacentreadmin@gmail.com") String adminEmail,
            @RequestBody(required = false) Map<String, String> body) {
        DataDeletionRequest request = deletionRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Deletion request not found with id: " + id));

        request.setStatus("REJECTED");
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewedByEmail(adminEmail);
        if (body != null && body.containsKey("reason")) {
            request.setAdminNotes(body.get("reason"));
        }
        DataDeletionRequest saved = deletionRequestRepository.save(request);
        log.info("Admin rejected deletion request #{}", id);

        return ResponseEntity.ok(ApiResponse.success("Deletion request rejected. Record was retained.", saved));
    }

    private boolean executeAutomaticDeletion(String dataType, Long dataId) {
        if (dataType == null || dataId == null)
            return false;
        String type = dataType.trim().toLowerCase();

        try {
            if (type.contains("doctor")) {
                doctorRepository.deleteById(dataId);
                return true;
            } else if (type.contains("food")) {
                foodProductRepository.deleteById(dataId);
                return true;
            } else if (type.contains("hygiene")) {
                hygieneProductRepository.deleteById(dataId);
                return true;
            } else if (type.contains("accessory") || type.contains("accessories")) {
                accessoryRepository.deleteById(dataId);
                return true;
            } else if (type.contains("marketresearch") || type.contains("research")) {
                marketResearchRepository.deleteById(dataId);
                return true;
            } else if (type.contains("ecosystem")) {
                ecosystemRepository.deleteById(dataId);
                return true;
            } else if (type.contains("servicenetwork") || type.contains("service")) {
                serviceNetworkRepository.deleteById(dataId);
                return true;
            } else if (type.contains("welfarenetwork") || type.contains("welfare")) {
                welfareNetworkRepository.deleteById(dataId);
                return true;
            } else {
                log.warn("Unknown dataType for automatic deletion: {}", dataType);
                return false;
            }
        } catch (Exception e) {
            log.error("Failed to automatically delete data [{}:{}]: {}", dataType, dataId, e.getMessage());
            return false;
        }
    }

    private String formatDuration(long seconds) {
        if (seconds <= 0)
            return "0 mins";
        long hours = seconds / 3600;
        long minutes = (seconds % 3600) / 60;
        long remSeconds = seconds % 60;
        if (hours > 0) {
            return String.format("%d hr %d min", hours, minutes);
        } else if (minutes > 0) {
            return String.format("%d min %d sec", minutes, remSeconds);
        } else {
            return String.format("%d sec", remSeconds);
        }
    }
}
