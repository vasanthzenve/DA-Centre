package com.veterinary.research.service.impl;

import com.veterinary.research.dto.DashboardDTO;
import com.veterinary.research.repository.*;
import com.veterinary.research.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final MarketResearchRepository marketResearchRepository;
    private final VeterinaryEcosystemRepository veterinaryEcosystemRepository;
    private final HygieneProductRepository hygieneProductRepository;
    private final FoodProductRepository foodProductRepository;
    private final AccessoryRepository accessoryRepository;
    private final ServiceNetworkRepository serviceNetworkRepository;
    private final DoctorRepository doctorRepository;
    private final WelfareNetworkRepository welfareNetworkRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard_stats", key = "'all'", unless = "#result == null")
    public DashboardDTO getDashboardData() {
        long totalMarketResearch = marketResearchRepository.count();
        long totalHospitals = veterinaryEcosystemRepository.count();
        long totalHygiene = hygieneProductRepository.count();
        long totalFood = foodProductRepository.count();
        long totalAccessories = accessoryRepository.count();
        long totalServices = serviceNetworkRepository.count();
        long totalDoctors = doctorRepository.count();
        long totalWelfare = welfareNetworkRepository.count();

        // 1. Research by State
        List<DashboardDTO.ChartItem> researchByState = new ArrayList<>();
        List<Map<String, Object>> stateData = marketResearchRepository.countByStateGroup();
        for (Map<String, Object> map : stateData) {
            String state = String.valueOf(map.get("state"));
            long count = ((Number) map.get("count")).longValue();
            researchByState.add(new DashboardDTO.ChartItem(state, count, null));
        }

        // 2. Hospitals by City
        List<DashboardDTO.ChartItem> hospitalsByCity = new ArrayList<>();
        List<Map<String, Object>> cityData = veterinaryEcosystemRepository.countByCityGroup();
        for (Map<String, Object> map : cityData) {
            String city = String.valueOf(map.get("city"));
            long count = ((Number) map.get("count")).longValue();
            hospitalsByCity.add(new DashboardDTO.ChartItem(city, count, null));
        }

        // 3. Marketplace Products by Category (Combined Hygiene, Food, Accessories)
        List<DashboardDTO.ChartItem> marketplaceByCategory = List.of(
                new DashboardDTO.ChartItem("Hygiene Products", totalHygiene, "Hygiene"),
                new DashboardDTO.ChartItem("Food Products", totalFood, "Food"),
                new DashboardDTO.ChartItem("Accessories", totalAccessories, "Accessories")
        );

        // 4. Doctors by Specialist
        List<DashboardDTO.ChartItem> doctorsBySpecialist = new ArrayList<>();
        List<Map<String, Object>> specialistData = doctorRepository.countBySpecialistGroup();
        for (Map<String, Object> map : specialistData) {
            String specialist = String.valueOf(map.get("specialist"));
            long count = ((Number) map.get("count")).longValue();
            doctorsBySpecialist.add(new DashboardDTO.ChartItem(specialist, count, null));
        }

        // 5. Services by Region
        List<DashboardDTO.ChartItem> servicesByRegion = new ArrayList<>();
        List<Map<String, Object>> regionData = serviceNetworkRepository.countByRegionGroup();
        for (Map<String, Object> map : regionData) {
            String region = String.valueOf(map.get("region"));
            long count = ((Number) map.get("count")).longValue();
            servicesByRegion.add(new DashboardDTO.ChartItem(region, count, null));
        }

        // 6. Welfare Organizations by State
        List<DashboardDTO.ChartItem> welfareByState = new ArrayList<>();
        List<Map<String, Object>> welfareStateData = welfareNetworkRepository.countByStateGroup();
        for (Map<String, Object> map : welfareStateData) {
            String state = String.valueOf(map.get("state"));
            long count = ((Number) map.get("count")).longValue();
            welfareByState.add(new DashboardDTO.ChartItem(state, count, null));
        }

        // Recent Activity (derived from newest records across modules)
        List<DashboardDTO.ActivityItem> activityItems = new ArrayList<>();

        veterinaryEcosystemRepository.findAll(PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "createdAt")))
                .forEach(h -> activityItems.add(DashboardDTO.ActivityItem.builder()
                        .id("HOSP-" + h.getId())
                        .module("Veterinary Ecosystem")
                        .title(h.getHospitalName())
                        .action("Added Hospital")
                        .user("Dr. Analyst")
                        .timestamp(h.getCreatedAt())
                        .build()));

        marketResearchRepository.findAll(PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "createdAt")))
                .forEach(m -> activityItems.add(DashboardDTO.ActivityItem.builder()
                        .id("RES-" + m.getId())
                        .module("Market Research")
                        .title(m.getCompany())
                        .action("Published Research")
                        .user("Research Lead")
                        .timestamp(m.getCreatedAt())
                        .build()));

        doctorRepository.findAll(PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "createdAt")))
                .forEach(d -> activityItems.add(DashboardDTO.ActivityItem.builder()
                        .id("DOC-" + d.getId())
                        .module("Doctor Directory")
                        .title(d.getDoctorName() + " (" + d.getSpecialist() + ")")
                        .action("Verified Profile")
                        .user("Chief Medical Officer")
                        .timestamp(d.getCreatedAt())
                        .build()));

        hygieneProductRepository.findAll(PageRequest.of(0, 2, Sort.by(Sort.Direction.DESC, "createdAt")))
                .forEach(p -> activityItems.add(DashboardDTO.ActivityItem.builder()
                        .id("HYG-" + p.getId())
                        .module("Marketplace Hygiene")
                        .title(p.getProductName())
                        .action("Listed Product")
                        .user("Catalog Specialist")
                        .timestamp(p.getCreatedAt())
                        .build()));

        activityItems.sort((a, b) -> {
            if (a.getTimestamp() == null || b.getTimestamp() == null) return 0;
            return b.getTimestamp().compareTo(a.getTimestamp());
        });

        return DashboardDTO.builder()
                .totalMarketResearch(totalMarketResearch)
                .totalVeterinaryHospitals(totalHospitals)
                .totalHygieneProducts(totalHygiene)
                .totalFoodProducts(totalFood)
                .totalAccessories(totalAccessories)
                .totalServices(totalServices)
                .totalDoctors(totalDoctors)
                .totalWelfareOrganizations(totalWelfare)
                .researchByState(researchByState)
                .hospitalsByCity(hospitalsByCity)
                .marketplaceByCategory(marketplaceByCategory)
                .doctorsBySpecialist(doctorsBySpecialist)
                .servicesByRegion(servicesByRegion)
                .welfareByState(welfareByState)
                .recentActivity(activityItems)
                .build();
    }
}
