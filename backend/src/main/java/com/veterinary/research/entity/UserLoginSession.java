package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_login_sessions", indexes = {
        @Index(name = "idx_sess_token", columnList = "session_token"),
        @Index(name = "idx_sess_user_id", columnList = "user_id"),
        @Index(name = "idx_sess_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserLoginSession extends BaseEntity {

    @Column(name = "session_token", nullable = false, unique = true, length = 100)
    private String sessionToken;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "custom_user_id", length = 50)
    private String customUserId;

    @Column(name = "user_email", length = 150)
    private String userEmail;

    @Column(name = "user_role", length = 30)
    private String userRole;

    @Column(name = "login_time", nullable = false)
    private LocalDateTime loginTime;

    @Column(name = "last_active_time", nullable = false)
    private LocalDateTime lastActiveTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "duration_seconds")
    @Builder.Default
    private Long durationSeconds = 0L;

    @Column(name = "ip_address", length = 60)
    private String ipAddress;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, CLOSED, EXPIRED
}
