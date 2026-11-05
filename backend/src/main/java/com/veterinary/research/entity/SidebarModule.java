package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sidebar_modules", indexes = {
        @Index(name = "idx_sidebar_modules_slug", columnList = "module_slug", unique = true),
        @Index(name = "idx_sidebar_modules_name", columnList = "sidebar_name"),
        @Index(name = "idx_sidebar_modules_status", columnList = "status"),
        @Index(name = "idx_sidebar_modules_created_at", columnList = "created_at DESC")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SidebarModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sidebar_name", nullable = false, length = 255)
    private String sidebarName;

    @Column(name = "module_slug", nullable = false, unique = true, length = 255)
    private String moduleSlug;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "uploaded_file_name", length = 500)
    private String uploadedFileName;

    @Column(name = "file_path", length = 1000)
    private String filePath;

    @Column(name = "total_sheets")
    @Builder.Default
    private Integer totalSheets = 1;

    @Column(name = "total_rows")
    @Builder.Default
    private Integer totalRows = 0;

    @Column(name = "total_columns")
    @Builder.Default
    private Integer totalColumns = 0;

    @Column(name = "created_by", length = 255)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "status", length = 50)
    @Builder.Default
    private String status = "ACTIVE";

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = "ACTIVE";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

