package com.veterinary.research.mapper;

import com.veterinary.research.dto.*;
import com.veterinary.research.dto.FashionDesignerDTO;
import com.veterinary.research.dto.FashionInstituteDTO;
import com.veterinary.research.dto.CourierTier1DTO;
import com.veterinary.research.dto.PetManufacturerDTO;
import com.veterinary.research.entity.FashionDesigner;
import com.veterinary.research.entity.FashionInstitute;
import com.veterinary.research.entity.CourierTier1;
import com.veterinary.research.entity.PetManufacturer;
import com.veterinary.research.entity.HumanPetLab;
import com.veterinary.research.entity.Livestock;
import com.veterinary.research.entity.PhilippinesPetProduct;
import com.veterinary.research.entity.Poultry;
import com.veterinary.research.dto.HumanPetLabDTO;
import com.veterinary.research.dto.LivestockDTO;
import com.veterinary.research.dto.PhilippinesPetProductDTO;
import com.veterinary.research.dto.PoultryDTO;
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

    // FashionDesigner
    public FashionDesignerDTO toDTO(FashionDesigner entity) {
        if (entity == null) return null;
        return FashionDesignerDTO.builder()
                .id(entity.getId())
                .designerName(entity.getDesignerName())
                .brandName(entity.getBrandName())
                .specification(entity.getSpecification())
                .city(entity.getCity())
                .state(entity.getState())
                .country(entity.getCountry())
                .websiteAddress(entity.getWebsiteAddress())
                .officialEmail(entity.getOfficialEmail())
                .mobileNumber(entity.getMobileNumber())
                .pincode(entity.getPincode())
                .studioAddress(entity.getStudioAddress())
                .yearOfEstablishment(entity.getYearOfEstablishment())
                .verificationStatus(entity.getVerificationStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public FashionDesigner toEntity(FashionDesignerDTO dto) {
        if (dto == null) return null;
        return FashionDesigner.builder()
                .designerName(dto.getDesignerName())
                .brandName(dto.getBrandName())
                .specification(dto.getSpecification())
                .city(dto.getCity())
                .state(dto.getState())
                .country(dto.getCountry())
                .websiteAddress(dto.getWebsiteAddress())
                .officialEmail(dto.getOfficialEmail())
                .mobileNumber(dto.getMobileNumber())
                .pincode(dto.getPincode())
                .studioAddress(dto.getStudioAddress())
                .yearOfEstablishment(dto.getYearOfEstablishment())
                .verificationStatus(dto.getVerificationStatus())
                .build();
    }

    public void updateEntity(FashionDesigner entity, FashionDesignerDTO dto) {
        if (entity == null || dto == null) return;
        entity.setDesignerName(dto.getDesignerName());
        entity.setBrandName(dto.getBrandName());
        entity.setSpecification(dto.getSpecification());
        entity.setCity(dto.getCity());
        entity.setState(dto.getState());
        entity.setCountry(dto.getCountry());
        entity.setWebsiteAddress(dto.getWebsiteAddress());
        entity.setOfficialEmail(dto.getOfficialEmail());
        entity.setMobileNumber(dto.getMobileNumber());
        entity.setPincode(dto.getPincode());
        entity.setStudioAddress(dto.getStudioAddress());
        entity.setYearOfEstablishment(dto.getYearOfEstablishment());
        entity.setVerificationStatus(dto.getVerificationStatus());
    }

    // FashionInstitute
    public FashionInstituteDTO toDTO(FashionInstitute entity) {
        if (entity == null) return null;
        return FashionInstituteDTO.builder()
                .id(entity.getId())
                .state(entity.getState())
                .city(entity.getCity())
                .area(entity.getArea())
                .instituteName(entity.getInstituteName())
                .address(entity.getAddress())
                .pincode(entity.getPincode())
                .phoneNo(entity.getPhoneNo())
                .website(entity.getWebsite())
                .emailId(entity.getEmailId())
                .mapLocation(entity.getMapLocation())
                .placeId(entity.getPlaceId())
                .verificationStatus(entity.getVerificationStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public FashionInstitute toEntity(FashionInstituteDTO dto) {
        if (dto == null) return null;
        return FashionInstitute.builder()
                .state(dto.getState())
                .city(dto.getCity())
                .area(dto.getArea())
                .instituteName(dto.getInstituteName())
                .address(dto.getAddress())
                .pincode(dto.getPincode())
                .phoneNo(dto.getPhoneNo())
                .website(dto.getWebsite())
                .emailId(dto.getEmailId())
                .mapLocation(dto.getMapLocation())
                .placeId(dto.getPlaceId())
                .verificationStatus(dto.getVerificationStatus())
                .build();
    }

    public void updateEntity(FashionInstitute entity, FashionInstituteDTO dto) {
        if (entity == null || dto == null) return;
        entity.setState(dto.getState());
        entity.setCity(dto.getCity());
        entity.setArea(dto.getArea());
        entity.setInstituteName(dto.getInstituteName());
        entity.setAddress(dto.getAddress());
        entity.setPincode(dto.getPincode());
        entity.setPhoneNo(dto.getPhoneNo());
        entity.setWebsite(dto.getWebsite());
        entity.setEmailId(dto.getEmailId());
        entity.setMapLocation(dto.getMapLocation());
        entity.setPlaceId(dto.getPlaceId());
        entity.setVerificationStatus(dto.getVerificationStatus());
    }

    // CourierTier1
    public CourierTier1DTO toDTO(CourierTier1 entity) {
        if (entity == null) return null;
        return CourierTier1DTO.builder()
                .id(entity.getId())
                .state(entity.getState())
                .city(entity.getCity())
                .companyName(entity.getCompanyName())
                .address(entity.getAddress())
                .pincode(entity.getPincode())
                .phoneNumber(entity.getPhoneNumber())
                .rating(entity.getRating())
                .services(entity.getServices())
                .website(entity.getWebsite())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public CourierTier1 toEntity(CourierTier1DTO dto) {
        if (dto == null) return null;
        return CourierTier1.builder()
                .state(dto.getState())
                .city(dto.getCity())
                .companyName(dto.getCompanyName())
                .address(dto.getAddress())
                .pincode(dto.getPincode())
                .phoneNumber(dto.getPhoneNumber())
                .rating(dto.getRating())
                .services(dto.getServices())
                .website(dto.getWebsite())
                .build();
    }

    public void updateEntity(CourierTier1 entity, CourierTier1DTO dto) {
        if (entity == null || dto == null) return;
        entity.setState(dto.getState());
        entity.setCity(dto.getCity());
        entity.setCompanyName(dto.getCompanyName());
        entity.setAddress(dto.getAddress());
        entity.setPincode(dto.getPincode());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setRating(dto.getRating());
        entity.setServices(dto.getServices());
        entity.setWebsite(dto.getWebsite());
    }

    // PetManufacturer
    public PetManufacturerDTO toDTO(PetManufacturer entity) {
        if (entity == null) return null;
        return PetManufacturerDTO.builder()
                .id(entity.getId())
                .country(entity.getCountry())
                .manufacturerName(entity.getManufacturerName())
                .manufacturerAddress(entity.getManufacturerAddress())
                .productCategory(entity.getProductCategory())
                .mobileNumber(entity.getMobileNumber())
                .emailId(entity.getEmailId())
                .website(entity.getWebsite())
                .exportCountries(entity.getExportCountries())
                .sourceUrl(entity.getSourceUrl())
                .verification(entity.getVerification())
                .analyst(entity.getAnalyst())
                .command(entity.getCommand())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public PetManufacturer toEntity(PetManufacturerDTO dto) {
        if (dto == null) return null;
        return PetManufacturer.builder()
                .country(dto.getCountry())
                .manufacturerName(dto.getManufacturerName())
                .manufacturerAddress(dto.getManufacturerAddress())
                .productCategory(dto.getProductCategory())
                .mobileNumber(dto.getMobileNumber())
                .emailId(dto.getEmailId())
                .website(dto.getWebsite())
                .exportCountries(dto.getExportCountries())
                .sourceUrl(dto.getSourceUrl())
                .verification(dto.getVerification())
                .analyst(dto.getAnalyst())
                .command(dto.getCommand())
                .build();
    }

    public void updateEntity(PetManufacturer entity, PetManufacturerDTO dto) {
        if (entity == null || dto == null) return;
        entity.setCountry(dto.getCountry());
        entity.setManufacturerName(dto.getManufacturerName());
        entity.setManufacturerAddress(dto.getManufacturerAddress());
        entity.setProductCategory(dto.getProductCategory());
        entity.setMobileNumber(dto.getMobileNumber());
        entity.setEmailId(dto.getEmailId());
        entity.setWebsite(dto.getWebsite());
        entity.setExportCountries(dto.getExportCountries());
        entity.setSourceUrl(dto.getSourceUrl());
        entity.setVerification(dto.getVerification());
        entity.setAnalyst(dto.getAnalyst());
        entity.setCommand(dto.getCommand());
    }

    // HumanPetLab
    public HumanPetLabDTO toDTO(HumanPetLab entity) {
        if (entity == null) return null;
        return HumanPetLabDTO.builder()
                .id(entity.getId())
                .state(entity.getState())
                .city(entity.getCity())
                .laboratoryName(entity.getLaboratoryName())
                .laboratoryAddress(entity.getLaboratoryAddress())
                .contactNumber(entity.getContactNumber())
                .emailId(entity.getEmailId())
                .laboratoryType(entity.getLaboratoryType())
                .testingServices(entity.getTestingServices())
                .animalTypesCovered(entity.getAnimalTypesCovered())
                .website(entity.getWebsite())
                .googleMapsLink(entity.getGoogleMapsLink())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public HumanPetLab toEntity(HumanPetLabDTO dto) {
        if (dto == null) return null;
        return HumanPetLab.builder()
                .state(dto.getState())
                .city(dto.getCity())
                .laboratoryName(dto.getLaboratoryName())
                .laboratoryAddress(dto.getLaboratoryAddress())
                .contactNumber(dto.getContactNumber())
                .emailId(dto.getEmailId())
                .laboratoryType(dto.getLaboratoryType())
                .testingServices(dto.getTestingServices())
                .animalTypesCovered(dto.getAnimalTypesCovered())
                .website(dto.getWebsite())
                .googleMapsLink(dto.getGoogleMapsLink())
                .build();
    }

    public void updateEntity(HumanPetLab entity, HumanPetLabDTO dto) {
        if (entity == null || dto == null) return;
        entity.setState(dto.getState());
        entity.setCity(dto.getCity());
        entity.setLaboratoryName(dto.getLaboratoryName());
        entity.setLaboratoryAddress(dto.getLaboratoryAddress());
        entity.setContactNumber(dto.getContactNumber());
        entity.setEmailId(dto.getEmailId());
        entity.setLaboratoryType(dto.getLaboratoryType());
        entity.setTestingServices(dto.getTestingServices());
        entity.setAnimalTypesCovered(dto.getAnimalTypesCovered());
        entity.setWebsite(dto.getWebsite());
        entity.setGoogleMapsLink(dto.getGoogleMapsLink());
    }

    // Livestock
    public LivestockDTO toDTO(Livestock entity) {
        if (entity == null) return null;
        return LivestockDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .livestockType(entity.getLivestockType())
                .farmType(entity.getFarmType())
                .contactNumber(entity.getContactNumber())
                .email(entity.getEmail())
                .website(entity.getWebsite())
                .address(entity.getAddress())
                .area(entity.getArea())
                .district(entity.getDistrict())
                .state(entity.getState())
                .pincode(entity.getPincode())
                .services(entity.getServices())
                .rating(entity.getRating())
                .reviewsCount(entity.getReviewsCount())
                .businessStatus(entity.getBusinessStatus())
                .googleMaps(entity.getGoogleMaps())
                .sourceUrl(entity.getSourceUrl())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public Livestock toEntity(LivestockDTO dto) {
        if (dto == null) return null;
        return Livestock.builder()
                .name(dto.getName())
                .livestockType(dto.getLivestockType())
                .farmType(dto.getFarmType())
                .contactNumber(dto.getContactNumber())
                .email(dto.getEmail())
                .website(dto.getWebsite())
                .address(dto.getAddress())
                .area(dto.getArea())
                .district(dto.getDistrict())
                .state(dto.getState())
                .pincode(dto.getPincode())
                .services(dto.getServices())
                .rating(dto.getRating())
                .reviewsCount(dto.getReviewsCount())
                .businessStatus(dto.getBusinessStatus())
                .googleMaps(dto.getGoogleMaps())
                .sourceUrl(dto.getSourceUrl())
                .build();
    }

    public void updateEntity(Livestock entity, LivestockDTO dto) {
        if (entity == null || dto == null) return;
        entity.setName(dto.getName());
        entity.setLivestockType(dto.getLivestockType());
        entity.setFarmType(dto.getFarmType());
        entity.setContactNumber(dto.getContactNumber());
        entity.setEmail(dto.getEmail());
        entity.setWebsite(dto.getWebsite());
        entity.setAddress(dto.getAddress());
        entity.setArea(dto.getArea());
        entity.setDistrict(dto.getDistrict());
        entity.setState(dto.getState());
        entity.setPincode(dto.getPincode());
        entity.setServices(dto.getServices());
        entity.setRating(dto.getRating());
        entity.setReviewsCount(dto.getReviewsCount());
        entity.setBusinessStatus(dto.getBusinessStatus());
        entity.setGoogleMaps(dto.getGoogleMaps());
        entity.setSourceUrl(dto.getSourceUrl());
    }

    // PhilippinesPetProduct
    public PhilippinesPetProductDTO toDTO(PhilippinesPetProduct entity) {
        if (entity == null) return null;
        return PhilippinesPetProductDTO.builder()
                .id(entity.getId())
                .country(entity.getCountry())
                .productName(entity.getProductName())
                .brandName(entity.getBrandName())
                .productDescription(entity.getProductDescription())
                .minimumPricePhp(entity.getMinimumPricePhp())
                .maximumPricePhp(entity.getMaximumPricePhp())
                .currentSellingPricePhp(entity.getCurrentSellingPricePhp())
                .availability(entity.getAvailability())
                .marketplaceName(entity.getMarketplaceName())
                .productUrl(entity.getProductUrl())
                .productImageUrl(entity.getProductImageUrl())
                .sourceUrl(entity.getSourceUrl())
                .command(entity.getCommand())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public PhilippinesPetProduct toEntity(PhilippinesPetProductDTO dto) {
        if (dto == null) return null;
        return PhilippinesPetProduct.builder()
                .country(dto.getCountry())
                .productName(dto.getProductName())
                .brandName(dto.getBrandName())
                .productDescription(dto.getProductDescription())
                .minimumPricePhp(dto.getMinimumPricePhp())
                .maximumPricePhp(dto.getMaximumPricePhp())
                .currentSellingPricePhp(dto.getCurrentSellingPricePhp())
                .availability(dto.getAvailability())
                .marketplaceName(dto.getMarketplaceName())
                .productUrl(dto.getProductUrl())
                .productImageUrl(dto.getProductImageUrl())
                .sourceUrl(dto.getSourceUrl())
                .command(dto.getCommand())
                .build();
    }

    public void updateEntity(PhilippinesPetProduct entity, PhilippinesPetProductDTO dto) {
        if (entity == null || dto == null) return;
        entity.setCountry(dto.getCountry());
        entity.setProductName(dto.getProductName());
        entity.setBrandName(dto.getBrandName());
        entity.setProductDescription(dto.getProductDescription());
        entity.setMinimumPricePhp(dto.getMinimumPricePhp());
        entity.setMaximumPricePhp(dto.getMaximumPricePhp());
        entity.setCurrentSellingPricePhp(dto.getCurrentSellingPricePhp());
        entity.setAvailability(dto.getAvailability());
        entity.setMarketplaceName(dto.getMarketplaceName());
        entity.setProductUrl(dto.getProductUrl());
        entity.setProductImageUrl(dto.getProductImageUrl());
        entity.setSourceUrl(dto.getSourceUrl());
        entity.setCommand(dto.getCommand());
    }

    // Poultry
    public PoultryDTO toDTO(Poultry entity) {
        if (entity == null) return null;
        return PoultryDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .category(entity.getCategory())
                .subCategory(entity.getSubCategory())
                .phone(entity.getPhone())
                .website(entity.getWebsite())
                .address(entity.getAddress())
                .area(entity.getArea())
                .district(entity.getDistrict())
                .state(entity.getState())
                .pincode(entity.getPincode())
                .businessTag(entity.getBusinessTag())
                .rating(entity.getRating())
                .reviews(entity.getReviews())
                .status(entity.getStatus())
                .source(entity.getSource())
                .mapsLink(entity.getMapsLink())
                .analyst(entity.getAnalyst())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public Poultry toEntity(PoultryDTO dto) {
        if (dto == null) return null;
        return Poultry.builder()
                .name(dto.getName())
                .category(dto.getCategory())
                .subCategory(dto.getSubCategory())
                .phone(dto.getPhone())
                .website(dto.getWebsite())
                .address(dto.getAddress())
                .area(dto.getArea())
                .district(dto.getDistrict())
                .state(dto.getState())
                .pincode(dto.getPincode())
                .businessTag(dto.getBusinessTag())
                .rating(dto.getRating())
                .reviews(dto.getReviews())
                .status(dto.getStatus())
                .source(dto.getSource())
                .mapsLink(dto.getMapsLink())
                .analyst(dto.getAnalyst())
                .notes(dto.getNotes())
                .build();
    }

    public void updateEntity(Poultry entity, PoultryDTO dto) {
        if (entity == null || dto == null) return;
        entity.setName(dto.getName());
        entity.setCategory(dto.getCategory());
        entity.setSubCategory(dto.getSubCategory());
        entity.setPhone(dto.getPhone());
        entity.setWebsite(dto.getWebsite());
        entity.setAddress(dto.getAddress());
        entity.setArea(dto.getArea());
        entity.setDistrict(dto.getDistrict());
        entity.setState(dto.getState());
        entity.setPincode(dto.getPincode());
        entity.setBusinessTag(dto.getBusinessTag());
        entity.setRating(dto.getRating());
        entity.setReviews(dto.getReviews());
        entity.setStatus(dto.getStatus());
        entity.setSource(dto.getSource());
        entity.setMapsLink(dto.getMapsLink());
        entity.setAnalyst(dto.getAnalyst());
        entity.setNotes(dto.getNotes());
    }

}
