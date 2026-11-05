package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sidebar_records", indexes = {
        @Index(name = "idx_sidebar_records_module", columnList = "module_id"),
        @Index(name = "idx_sidebar_records_module_sheet", columnList = "module_id, sheet_name"),
        @Index(name = "idx_sidebar_records_row", columnList = "module_id, row_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SidebarRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "module_id", nullable = false)
    private Long moduleId;

    @Column(name = "sheet_name", length = 255)
    @Builder.Default
    private String sheetName = "Sheet1";

    @Column(name = "`row_number`", nullable = false)
    private Integer rowNumber;

    @Lob
    @Column(name = "row_data", nullable = false, columnDefinition = "LONGTEXT")
    private String rowData;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (sheetName == null || sheetName.isBlank()) sheetName = "Sheet1";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

