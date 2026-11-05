package com.veterinary.research.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExcelAnalysisDTO {
    private String fileName;
    private Long fileSize;
    private String fileType;
    private String tempToken;
    private Integer totalSheets;
    private Integer totalRows;
    private Integer totalColumns;
    @Builder.Default
    private List<SheetAnalysisDTO> sheets = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SheetAnalysisDTO {
        private String sheetName;
        private Integer totalRows;
        private Integer totalColumns;
        @Builder.Default
        private List<FieldAnalysisDTO> fields = new ArrayList<>();
        @Builder.Default
        private List<String> emptyColumns = new ArrayList<>();
        @Builder.Default
        private List<String> duplicateColumns = new ArrayList<>();
        @Builder.Default
        private List<Map<String, Object>> sampleRecords = new ArrayList<>();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FieldAnalysisDTO {
        private String fieldName;
        private String fieldLabel;
        private String headerName;
        private String dataType; // String, Integer, Decimal, Date, Boolean
        private Integer columnPosition;
        private Boolean isRequired;
        @Builder.Default
        private List<String> sampleValues = new ArrayList<>();
        private boolean empty;
        private boolean duplicate;

        public String getFieldLabel() {
            if (fieldLabel != null && !fieldLabel.isBlank()) return fieldLabel;
            if (headerName != null && !headerName.isBlank()) return headerName;
            return fieldName;
        }

        public String getHeaderName() {
            if (headerName != null && !headerName.isBlank()) return headerName;
            if (fieldLabel != null && !fieldLabel.isBlank()) return fieldLabel;
            return fieldName;
        }
    }
}

