package com.veterinary.research.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SidebarFieldDTO {
    private Long id;
    private Long moduleId;
    private String sheetName;
    private String fieldName;
    private String fieldLabel;
    private String dataType;
    private Integer columnPosition;
    private Boolean isRequired;
    private List<String> sampleValues;
}

