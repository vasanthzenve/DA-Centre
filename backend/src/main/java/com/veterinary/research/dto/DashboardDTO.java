package com.veterinary.research.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {

    private long totalRecords;
    private long totalCoreRecords;
    private long totalMarketResearch;
    private long totalVeterinaryHospitals;
    private long totalHygieneProducts;
    private long totalFoodProducts;
    private long totalAccessories;
    private long totalServices;
    private long totalDoctors;
    private long totalWelfareOrganizations;
    private long totalFashionDesigners;
    private long totalDiagnosticLabs;
    private long totalFashionInstitutes;
    private long totalCourierTier1;
    private long totalPetManufacturers;
    private long totalPhilippinesPetProducts;
    private long totalLivestock;
    private long totalPoultry;
    private long totalDynamicRecords;
    private long totalDynamicModules;
    private List<CustomModuleSummaryDTO> customModules;

    private List<ChartItem> researchByState;
    private List<ChartItem> hospitalsByCity;
    private List<ChartItem> marketplaceByCategory;
    private List<ChartItem> doctorsBySpecialist;
    private List<ChartItem> servicesByRegion;
    private List<ChartItem> welfareByState;

    private List<ActivityItem> recentActivity;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChartItem {
        private String name;
        private long value;
        private String extra;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomModuleSummaryDTO {
        private Long id;
        private String name;
        private String slug;
        private long recordCount;
        private String fileName;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActivityItem {
        private String id;
        private String module;
        private String title;
        private String action;
        private String user;
        private LocalDateTime timestamp;
    }
}
