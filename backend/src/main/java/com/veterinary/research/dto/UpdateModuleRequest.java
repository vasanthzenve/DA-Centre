package com.veterinary.research.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateModuleRequest {

    @NotBlank(message = "Sidebar Name is required")
    private String sidebarName;

    private String description;

    private String status;
}

