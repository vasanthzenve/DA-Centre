package com.veterinary.research.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SidebarModuleDTO {
    private Long id;
    private String sidebarName;
    private String moduleSlug;
    private String description;
    private String uploadedFileName;
    private String filePath;
    private Integer totalSheets;
    private Integer totalRows;
    private Integer totalColumns;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status;
    private List<String> sheetNames;
    private List<SidebarFieldDTO> fields;
}

