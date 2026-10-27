package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "data_deletion_requests", indexes = {
        @Index(name = "idx_del_status", columnList = "status"),
        @Index(name = "idx_del_user_id", columnList = "user_id"),
        @Index(name = "idx_del_data_type", columnList = "data_type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataDeletionRequest extends BaseEntity {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_custom_id", length = 50)
    private String userCustomId;

    @Column(name = "user_email", length = 150)
    private String userEmail;

    @Column(name = "user_name", length = 150)
    private String userName;

    @Column(name = "data_type", nullable = false, length = 100)
    private String dataType; // e.g. "Doctor", "FoodProduct", "HygieneProduct", "Accessory", "MarketResearch", "VeterinaryEcosystem", "ServiceNetwork", "WelfareNetwork"

    @Column(name = "data_id", nullable = false)
    private Long dataId;

    @Column(name = "data_title", length = 255)
    private String dataTitle;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by_email", length = 150)
    private String reviewedByEmail;

    @Column(name = "admin_notes", length = 500)
    private String adminNotes;

    @Column(name = "auto_deleted")
    @Builder.Default
    private Boolean autoDeleted = false;
}
