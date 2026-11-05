package com.veterinary.research.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateModuleRequest {

    @NotBlank(message = "Sidebar Name is required")
    private String sidebarName;

    private String moduleSlug;

    private String description;

    private String tempToken;

    private String selectedSheetName;

    private List<ExcelAnalysisDTO.FieldAnalysisDTO> customFields;

    private String createdBy;
}

