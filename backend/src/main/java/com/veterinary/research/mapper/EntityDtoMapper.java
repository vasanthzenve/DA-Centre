package com.veterinary.research.mapper;

import com.veterinary.research.dto.*;
import com.veterinary.research.entity.*;
import org.springframework.stereotype.Component;

@Component
public class EntityDtoMapper {

    // MarketResearch
    public MarketResearchDTO toDTO(MarketResearch entity) {
        if (entity == null) return null;
        return MarketResearchDTO.builder()
                .id(entity.getId())
                .states(entity.getStates())
                .company(entity.getCompany())
                .founded(entity.getFounded())
                .cities(entity.getCities())
                .model(entity.getModel())
                .scale(entity.getScale())
                .funding(entity.getFunding())
                .service(entity.getService())
                .revenue(entity.getRevenue())
                .targetSegment(entity.getTargetSegment())
                .price(entity.getPrice())
                .product(entity.getProduct())
                .technology(entity.getTechnology())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public MarketResearch toEntity(MarketResearchDTO dto) {
        if (dto == null) return null;
        return MarketResearch.builder()
                .states(dto.getStates())
                .company(dto.getCompany())
                .founded(dto.getFounded())
                .cities(dto.getCities())
                .model(dto.getModel())
                .scale(dto.getScale())
                .funding(dto.getFunding())
                .service(dto.getService())
                .revenue(dto.getRevenue())
                .targetSegment(dto.getTargetSegment())
                .price(dto.getPrice())
                .product(dto.getProduct())
                .technology(dto.getTechnology())
                .build();
    }

    public void updateEntity(MarketResearch entity, MarketResearchDTO dto) {
        if (entity == null || dto == null) return;
        entity.setStates(dto.getStates());
        entity.setCompany(dto.getCompany());
        entity.setFounded(dto.getFounded());
        entity.setCities(dto.getCities());
        entity.setModel(dto.getModel());
        entity.setScale(dto.getScale());
        entity.setFunding(dto.getFunding());
        entity.setService(dto.getService());
        entity.setRevenue(dto.getRevenue());
        entity.setTargetSegment(dto.getTargetSegment());
        entity.setPrice(dto.getPrice());
        entity.setProduct(dto.getProduct());
        entity.setTechnology(dto.getTechnology());
    }

    // VeterinaryEcosystem
    public VeterinaryEcosystemDTO toDTO(VeterinaryEcosystem entity) {
        if (entity == null) return null;
        return VeterinaryEcosystemDTO.builder()
                .id(entity.getId())
                .state(entity.getState())
                .city(entity.getCity())
                .area(entity.getArea())
                .hospitalName(entity.getHospitalName())
                .address(entity.getAddress())
                .phoneNumber(entity.getPhoneNumber())
                .website(entity.getWebsite())
                .openingHours(entity.getOpeningHours())
                .rating(entity.getRating())
                .reviews(entity.getReviews())
                .businessStatus(entity.getBusinessStatus())
                .googleMaps(entity.getGoogleMaps())
                .placeId(entity.getPlaceId())
                .service(entity.getService())
                .onlineVerification(entity.getOnlineVerification())
                .comment(entity.getComment())
                .fashionSupply(entity.getFashionSupply())
                .analyst(entity.getAnalyst())
                .date(entity.getDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public VeterinaryEcosystem toEntity(VeterinaryEcosystemDTO dto) {
        if (dto == null) return null;
        return VeterinaryEcosystem.builder()
                .state(dto.getState())
                .city(dto.getCity())
                .area(dto.getArea())
                .hospitalName(dto.getHospitalName())
                .address(dto.getAddress())
                .phoneNumber(dto.getPhoneNumber())
                .website(dto.getWebsite())
                .openingHours(dto.getOpeningHours())
                .rating(dto.getRating())
                .reviews(dto.getReviews())
                .businessStatus(dto.getBusinessStatus())
                .googleMaps(dto.getGoogleMaps())
                .placeId(dto.getPlaceId())
                .service(dto.getService())
                .onlineVerification(dto.getOnlineVerification())
                .comment(dto.getComment())
                .fashionSupply(dto.getFashionSupply())
                .analyst(dto.getAnalyst())
                .date(dto.getDate())
                .build();
    }

    public void updateEntity(VeterinaryEcosystem entity, VeterinaryEcosystemDTO dto) {
        if (entity == null || dto == null) return;
        entity.setState(dto.getState());
        entity.setCity(dto.getCity());
        entity.setArea(dto.getArea());
        entity.setHospitalName(dto.getHospitalName());
        entity.setAddress(dto.getAddress());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setWebsite(dto.getWebsite());
        entity.setOpeningHours(dto.getOpeningHours());
        entity.setRating(dto.getRating());
        entity.setReviews(dto.getReviews());
        entity.setBusinessStatus(dto.getBusinessStatus());
        entity.setGoogleMaps(dto.getGoogleMaps());
        entity.setPlaceId(dto.getPlaceId());
        entity.setService(dto.getService());
        entity.setOnlineVerification(dto.getOnlineVerification());
        entity.setComment(dto.getComment());
        entity.setFashionSupply(dto.getFashionSupply());
        entity.setAnalyst(dto.getAnalyst());
        entity.setDate(dto.getDate());
    }

    // HygieneProduct
    public HygieneProductDTO toDTO(HygieneProduct entity) {
        if (entity == null) return null;
        return HygieneProductDTO.builder()
                .id(entity.getId())
                .productName(entity.getProductName())
                .brandName(entity.getBrandName())
                .productCategory(entity.getProductCategory())
                .subCategory(entity.getSubCategory())
                .petType(entity.getPetType())
                .formulation(entity.getFormulation())
                .dosage(entity.getDosage())
                .price(entity.getPrice())
                .packSize(entity.getPackSize())
                .manufacturer(entity.getManufacturer())
                .availability(entity.getAvailability())
                .rating(entity.getRating())
                .reviewsCount(entity.getReviewsCount())
                .productLink(entity.getProductLink())
                .productUrl(entity.getProductUrl())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public HygieneProduct toEntity(HygieneProductDTO dto) {
        if (dto == null) return null;
        return HygieneProduct.builder()
                .productName(dto.getProductName())
                .brandName(dto.getBrandName())
                .productCategory(dto.getProductCategory())
                .subCategory(dto.getSubCategory())
                .petType(dto.getPetType())
                .formulation(dto.getFormulation())
                .dosage(dto.getDosage())
                .price(dto.getPrice())
                .packSize(dto.getPackSize())
                .manufacturer(dto.getManufacturer())
                .availability(dto.getAvailability())
                .rating(dto.getRating())
                .reviewsCount(dto.getReviewsCount())
                .productLink(dto.getProductLink())
                .productUrl(dto.getProductUrl())
                .status(dto.getStatus())
                .build();
    }

    public void updateEntity(HygieneProduct entity, HygieneProductDTO dto) {
        if (entity == null || dto == null) return;
        entity.setProductName(dto.getProductName());
        entity.setBrandName(dto.getBrandName());
        entity.setProductCategory(dto.getProductCategory());
        entity.setSubCategory(dto.getSubCategory());
        entity.setPetType(dto.getPetType());
        entity.setFormulation(dto.getFormulation());
        entity.setDosage(dto.getDosage());
        entity.setPrice(dto.getPrice());
        entity.setPackSize(dto.getPackSize());
        entity.setManufacturer(dto.getManufacturer());
        entity.setAvailability(dto.getAvailability());
        entity.setRating(dto.getRating());
        entity.setReviewsCount(dto.getReviewsCount());
        entity.setProductLink(dto.getProductLink());
        entity.setProductUrl(dto.getProductUrl());
        entity.setStatus(dto.getStatus());
    }

    // FoodProduct
    public FoodProductDTO toDTO(FoodProduct entity) {
        if (entity == null) return null;
        return FoodProductDTO.builder()
                .id(entity.getId())
                .productName(entity.getProductName())
                .brandName(entity.getBrandName())
                .productCategory(entity.getProductCategory())
                .subCategory(entity.getSubCategory())
                .petType(entity.getPetType())
                .lifeStage(entity.getLifeStage())
                .breedSize(entity.getBreedSize())
                .dietaryType(entity.getDietaryType())
                .formulation(entity.getFormulation())
                .packSize(entity.getPackSize())
                .price(entity.getPrice())
                .manufacturer(entity.getManufacturer())
                .availability(entity.getAvailability())
                .rating(entity.getRating())
                .reviewsCount(entity.getReviewsCount())
                .websiteMarketplace(entity.getWebsiteMarketplace())
                .productUrl(entity.getProductUrl())
                .sourceUrl(entity.getSourceUrl())
                .address(entity.getAddress())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public FoodProduct toEntity(FoodProductDTO dto) {
        if (dto == null) return null;
        return FoodProduct.builder()
                .productName(dto.getProductName())
                .brandName(dto.getBrandName())
                .productCategory(dto.getProductCategory())
                .subCategory(dto.getSubCategory())
                .petType(dto.getPetType())
                .lifeStage(dto.getLifeStage())
                .breedSize(dto.getBreedSize())
                .dietaryType(dto.getDietaryType())
                .formulation(dto.getFormulation())
                .packSize(dto.getPackSize())
                .price(dto.getPrice())
                .manufacturer(dto.getManufacturer())
                .availability(dto.getAvailability())
                .rating(dto.getRating())
                .reviewsCount(dto.getReviewsCount())
                .websiteMarketplace(dto.getWebsiteMarketplace())
                .productUrl(dto.getProductUrl())
                .sourceUrl(dto.getSourceUrl())
                .address(dto.getAddress())
                .build();
    }

    public void updateEntity(FoodProduct entity, FoodProductDTO dto) {
        if (entity == null || dto == null) return;
        entity.setProductName(dto.getProductName());
        entity.setBrandName(dto.getBrandName());
        entity.setProductCategory(dto.getProductCategory());
        entity.setSubCategory(dto.getSubCategory());
        entity.setPetType(dto.getPetType());
        entity.setLifeStage(dto.getLifeStage());
        entity.setBreedSize(dto.getBreedSize());
        entity.setDietaryType(dto.getDietaryType());
        entity.setFormulation(dto.getFormulation());
        entity.setPackSize(dto.getPackSize());
        entity.setPrice(dto.getPrice());
        entity.setManufacturer(dto.getManufacturer());
        entity.setAvailability(dto.getAvailability());
        entity.setRating(dto.getRating());
        entity.setReviewsCount(dto.getReviewsCount());
        entity.setWebsiteMarketplace(dto.getWebsiteMarketplace());
        entity.setProductUrl(dto.getProductUrl());
        entity.setSourceUrl(dto.getSourceUrl());
        entity.setAddress(dto.getAddress());
    }

    // Accessory
    public AccessoryDTO toDTO(Accessory entity) {
        if (entity == null) return null;
        return AccessoryDTO.builder()
                .id(entity.getId())
                .businessName(entity.getBusinessName())
                .category(entity.getCategory())
                .subCategory(entity.getSubCategory())
                .petType(entity.getPetType())
                .productDescription(entity.getProductDescription())
                .price(entity.getPrice())
                .availability(entity.getAvailability())
                .reviewCount(entity.getReviewCount())
                .website(entity.getWebsite())
                .productUrl(entity.getProductUrl())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public Accessory toEntity(AccessoryDTO dto) {
        if (dto == null) return null;
        return Accessory.builder()
                .businessName(dto.getBusinessName())
                .category(dto.getCategory())
                .subCategory(dto.getSubCategory())
                .petType(dto.getPetType())
                .productDescription(dto.getProductDescription())
                .price(dto.getPrice())
                .availability(dto.getAvailability())
                .reviewCount(dto.getReviewCount())
                .website(dto.getWebsite())
                .productUrl(dto.getProductUrl())
                .build();
    }

    public void updateEntity(Accessory entity, AccessoryDTO dto) {
        if (entity == null || dto == null) return;
        entity.setBusinessName(dto.getBusinessName());
        entity.setCategory(dto.getCategory());
        entity.setSubCategory(dto.getSubCategory());
        entity.setPetType(dto.getPetType());
        entity.setProductDescription(dto.getProductDescription());
        entity.setPrice(dto.getPrice());
        entity.setAvailability(dto.getAvailability());
        entity.setReviewCount(dto.getReviewCount());
        entity.setWebsite(dto.getWebsite());
        entity.setProductUrl(dto.getProductUrl());
    }

    // ServiceNetwork
    public ServiceNetworkDTO toDTO(ServiceNetwork entity) {
        if (entity == null) return null;
        return ServiceNetworkDTO.builder()
                .id(entity.getId())
                .businessName(entity.getBusinessName())
                .serviceType(entity.getServiceType())
                .state(entity.getState())
                .districtRegion(entity.getDistrictRegion())
                .area(entity.getArea())
                .address(entity.getAddress())
                .cityRegion(entity.getCityRegion())
                .contactNumber(entity.getContactNumber())
                .websiteSocialMedia(entity.getWebsiteSocialMedia())
                .rating(entity.getRating())
                .googleMapsSourceUrl(entity.getGoogleMapsSourceUrl())
                .bookingUrlContact(entity.getBookingUrlContact())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public ServiceNetwork toEntity(ServiceNetworkDTO dto) {
        if (dto == null) return null;
        return ServiceNetwork.builder()
                .businessName(dto.getBusinessName())
                .serviceType(dto.getServiceType())
                .state(dto.getState())
                .districtRegion(dto.getDistrictRegion())
                .area(dto.getArea())
                .address(dto.getAddress())
                .cityRegion(dto.getCityRegion())
                .contactNumber(dto.getContactNumber())
                .websiteSocialMedia(dto.getWebsiteSocialMedia())
                .rating(dto.getRating())
                .googleMapsSourceUrl(dto.getGoogleMapsSourceUrl())
                .bookingUrlContact(dto.getBookingUrlContact())
                .build();
    }

    public void updateEntity(ServiceNetwork entity, ServiceNetworkDTO dto) {
        if (entity == null || dto == null) return;
        entity.setBusinessName(dto.getBusinessName());
        entity.setServiceType(dto.getServiceType());
        entity.setState(dto.getState());
        entity.setDistrictRegion(dto.getDistrictRegion());
        entity.setArea(dto.getArea());
        entity.setAddress(dto.getAddress());
        entity.setCityRegion(dto.getCityRegion());
        entity.setContactNumber(dto.getContactNumber());
        entity.setWebsiteSocialMedia(dto.getWebsiteSocialMedia());
        entity.setRating(dto.getRating());
        entity.setGoogleMapsSourceUrl(dto.getGoogleMapsSourceUrl());
        entity.setBookingUrlContact(dto.getBookingUrlContact());
    }

    // Doctor
    public DoctorDTO toDTO(Doctor entity) {
        if (entity == null) return null;
        return DoctorDTO.builder()
                .id(entity.getId())
                .doctorName(entity.getDoctorName())
                .qualification(entity.getQualification())
                .specialist(entity.getSpecialist())
                .experience(entity.getExperience())
                .location(entity.getLocation())
                .hospital(entity.getHospital())
                .address(entity.getAddress())
                .fee(entity.getFee())
                .workingHours(entity.getWorkingHours())
                .doctorUrl(entity.getDoctorUrl())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public Doctor toEntity(DoctorDTO dto) {
        if (dto == null) return null;
        return Doctor.builder()
                .doctorName(dto.getDoctorName())
                .qualification(dto.getQualification())
                .specialist(dto.getSpecialist())
                .experience(dto.getExperience())
                .location(dto.getLocation())
                .hospital(dto.getHospital())
                .address(dto.getAddress())
                .fee(dto.getFee())
                .workingHours(dto.getWorkingHours())
                .doctorUrl(dto.getDoctorUrl())
                .build();
    }

    public void updateEntity(Doctor entity, DoctorDTO dto) {
        if (entity == null || dto == null) return;
        entity.setDoctorName(dto.getDoctorName());
        entity.setQualification(dto.getQualification());
        entity.setSpecialist(dto.getSpecialist());
        entity.setExperience(dto.getExperience());
        entity.setLocation(dto.getLocation());
        entity.setHospital(dto.getHospital());
        entity.setAddress(dto.getAddress());
        entity.setFee(dto.getFee());
        entity.setWorkingHours(dto.getWorkingHours());
        entity.setDoctorUrl(dto.getDoctorUrl());
    }

    // WelfareNetwork
    public WelfareNetworkDTO toDTO(WelfareNetwork entity) {
        if (entity == null) return null;
        return WelfareNetworkDTO.builder()
                .id(entity.getId())
                .businessName(entity.getBusinessName())
                .serviceType(entity.getServiceType())
                .state(entity.getState())
                .districtRegion(entity.getDistrictRegion())
                .area(entity.getArea())
                .address(entity.getAddress())
                .cityRegion(entity.getCityRegion())
                .contactNumber(entity.getContactNumber())
                .websiteSocialMedia(entity.getWebsiteSocialMedia())
                .rating(entity.getRating())
                .googleMapsSourceUrl(entity.getGoogleMapsSourceUrl())
                .bookingUrlContact(entity.getBookingUrlContact())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public WelfareNetwork toEntity(WelfareNetworkDTO dto) {
        if (dto == null) return null;
        return WelfareNetwork.builder()
                .businessName(dto.getBusinessName())
                .serviceType(dto.getServiceType())
                .state(dto.getState())
                .districtRegion(dto.getDistrictRegion())
                .area(dto.getArea())
                .address(dto.getAddress())
                .cityRegion(dto.getCityRegion())
                .contactNumber(dto.getContactNumber())
                .websiteSocialMedia(dto.getWebsiteSocialMedia())
                .rating(dto.getRating())
                .googleMapsSourceUrl(dto.getGoogleMapsSourceUrl())
                .bookingUrlContact(dto.getBookingUrlContact())
                .build();
    }

    public void updateEntity(WelfareNetwork entity, WelfareNetworkDTO dto) {
        if (entity == null || dto == null) return;
        entity.setBusinessName(dto.getBusinessName());
        entity.setServiceType(dto.getServiceType());
        entity.setState(dto.getState());
        entity.setDistrictRegion(dto.getDistrictRegion());
        entity.setArea(dto.getArea());
        entity.setAddress(dto.getAddress());
        entity.setCityRegion(dto.getCityRegion());
        entity.setContactNumber(dto.getContactNumber());
        entity.setWebsiteSocialMedia(dto.getWebsiteSocialMedia());
        entity.setRating(dto.getRating());
        entity.setGoogleMapsSourceUrl(dto.getGoogleMapsSourceUrl());
        entity.setBookingUrlContact(dto.getBookingUrlContact());
    }
}
