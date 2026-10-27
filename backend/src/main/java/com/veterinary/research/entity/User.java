package com.veterinary.research.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_custom_id", columnList = "custom_user_id"),
        @Index(name = "idx_users_role", columnList = "role"),
        @Index(name = "idx_users_status", columnList = "account_status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(name = "custom_user_id", length = 50)
    private String customUserId;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "mobile_number", length = 30)
    private String mobileNumber;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(name = "full_name", length = 150)
    private String fullName;

    @Column(length = 50)
    @Builder.Default
    private String role = "ROLE_USER"; // ROLE_ADMIN or ROLE_USER

    @Column(name = "account_status", nullable = false, length = 30)
    @Builder.Default
    private String accountStatus = "ACTIVE"; // PENDING_APPROVAL, ACTIVE, REJECTED, SUSPENDED, DELETED

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "total_login_count")
    @Builder.Default
    private Long totalLoginCount = 0L;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "region", length = 100)
    private String region;

    @Column(name = "last_ip_address", length = 60)
    private String lastIpAddress;

    @Column(name = "registration_ip_address", length = 60)
    private String registrationIpAddress;

    public long getTotalLoginCount() {
        return totalLoginCount != null ? totalLoginCount : 0L;
    }

    public String getLastIpAddress() {
        return lastIpAddress;
    }

    public void setLastIpAddress(String lastIpAddress) {
        this.lastIpAddress = lastIpAddress;
    }

    public String getRegistrationIpAddress() {
        return registrationIpAddress;
    }

    public void setRegistrationIpAddress(String registrationIpAddress) {
        this.registrationIpAddress = registrationIpAddress;
    }
}
