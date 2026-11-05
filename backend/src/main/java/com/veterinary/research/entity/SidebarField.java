package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sidebar_fields", indexes = {
        @Index(name = "idx_sidebar_fields_module", columnList = "module_id"),
        @Index(name = "idx_sidebar_fields_module_sheet", columnList = "module_id, sheet_name"),
        @Index(name = "idx_sidebar_fields_pos", columnList = "module_id, column_position")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SidebarField {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "module_id", nullable = false)
    private Long moduleId;

    @Column(name = "sheet_name", length = 255)
    @Builder.Default
    private String sheetName = "Sheet1";

    @Column(name = "field_name", nullable = false, length = 255)
    private String fieldName;

    @Column(name = "field_label", nullable = false, length = 255)
    private String fieldLabel;

    @Column(name = "data_type", nullable = false, length = 50)
    @Builder.Default
    private String dataType = "String";

    @Column(name = "column_position", nullable = false)
    private Integer columnPosition;

    @Column(name = "is_required")
    @Builder.Default
    private Boolean isRequired = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    @PreUpdate
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (sheetName == null || sheetName.isBlank()) sheetName = "Sheet1";
        if (dataType == null || dataType.isBlank()) dataType = "String";
        if (isRequired == null) isRequired = false;
        if (fieldLabel == null || fieldLabel.isBlank()) {
            fieldLabel = (fieldName != null && !fieldName.isBlank()) ? fieldName : ("Column_" + (columnPosition != null ? (columnPosition + 1) : 1));
        }
        if (fieldName == null || fieldName.isBlank()) {
            fieldName = fieldLabel.toLowerCase().replaceAll("[^a-z0-9_]", "_");
        }
    }
}

