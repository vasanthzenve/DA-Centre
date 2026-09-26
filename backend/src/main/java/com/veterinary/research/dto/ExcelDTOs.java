package com.veterinary.research.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

public class ExcelDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InvalidRowInfo {
        private int rowNumber;
        private List<String> errors;
        private Map<String, Object> rowData;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExcelPreviewResponse {
        private String sheetName;
        private int totalRows;
        private int validCount;
        private int invalidCount;
        private List<String> detectedHeaders;
        private List<Map<String, Object>> previewRows;
        private List<InvalidRowInfo> invalidRows;
        private String importToken; // temporary cache or encoded token if needed
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExcelConfirmRequest {
        private List<Map<String, Object>> validRows;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExportRequest {
        @Builder.Default
        private String scope = "all"; // "all", "filtered", "selected"
        private List<Long> selectedIds;
        private Map<String, String> filters;
        private String search;
    }
}
