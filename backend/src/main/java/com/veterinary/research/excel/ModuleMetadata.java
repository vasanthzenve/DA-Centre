package com.veterinary.research.excel;

import lombok.Builder;
import lombok.Getter;

import java.util.*;

public class ModuleMetadata {

    @Getter
    @Builder
    public static class FieldDefinition {
        private String businessName;   // Exact business name for header & UI
        private String entityProperty; // Java entity camelCase property
        private FieldType type;
        private boolean required;
        @Builder.Default
        private int maxLength = -1;    // -1 = unlimited (TEXT). Set to VARCHAR length for string columns.
    }

    public enum FieldType {
        STRING,
        DECIMAL,
        INTEGER,
        DATE
    }

    public static final List<FieldDefinition> MARKET_RESEARCH_FIELDS = List.of(
            FieldDefinition.builder().businessName("States").entityProperty("states").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Company").entityProperty("company").type(FieldType.STRING).required(true).maxLength(255).build(),
            FieldDefinition.builder().businessName("Founded").entityProperty("founded").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Cities").entityProperty("cities").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Model").entityProperty("model").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Scale").entityProperty("scale").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Funding").entityProperty("funding").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Service").entityProperty("service").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Revenue").entityProperty("revenue").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Target Segment").entityProperty("targetSegment").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Price").entityProperty("price").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Product").entityProperty("product").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Technology").entityProperty("technology").type(FieldType.STRING).maxLength(255).build()
    );

    public static final List<FieldDefinition> VETERINARY_ECOSYSTEM_FIELDS = List.of(
            FieldDefinition.builder().businessName("State").entityProperty("state").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("City").entityProperty("city").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Area").entityProperty("area").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Hospital Name").entityProperty("hospitalName").type(FieldType.STRING).required(true).maxLength(500).build(),
            FieldDefinition.builder().businessName("Address").entityProperty("address").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Phone Number").entityProperty("phoneNumber").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Website").entityProperty("website").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Opening Hours").entityProperty("openingHours").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Rating").entityProperty("rating").type(FieldType.DECIMAL).build(),
            FieldDefinition.builder().businessName("Reviews").entityProperty("reviews").type(FieldType.INTEGER).build(),
            FieldDefinition.builder().businessName("Business Status").entityProperty("businessStatus").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Google Maps").entityProperty("googleMaps").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Place ID").entityProperty("placeId").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Service").entityProperty("service").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Online Verification").entityProperty("onlineVerification").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Comment").entityProperty("comment").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Fashion supply").entityProperty("fashionSupply").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Analyst").entityProperty("analyst").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Date").entityProperty("date").type(FieldType.DATE).build()
    );

    public static final List<FieldDefinition> HYGIENE_FIELDS = List.of(
            FieldDefinition.builder().businessName("Product Name").entityProperty("productName").type(FieldType.STRING).required(true).maxLength(255).build(),
            FieldDefinition.builder().businessName("Brand Name").entityProperty("brandName").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Product Category").entityProperty("productCategory").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Sub Category").entityProperty("subCategory").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Pet Type").entityProperty("petType").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Formulation").entityProperty("formulation").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Dosage").entityProperty("dosage").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Price").entityProperty("price").type(FieldType.DECIMAL).build(),
            FieldDefinition.builder().businessName("Pack Size").entityProperty("packSize").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Manufacturer").entityProperty("manufacturer").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Availability").entityProperty("availability").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Rating").entityProperty("rating").type(FieldType.DECIMAL).build(),
            FieldDefinition.builder().businessName("Reviews Count").entityProperty("reviewsCount").type(FieldType.INTEGER).build(),
            FieldDefinition.builder().businessName("Product Link").entityProperty("productLink").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Product URL").entityProperty("productUrl").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Status").entityProperty("status").type(FieldType.STRING).maxLength(100).build()
    );

    public static final List<FieldDefinition> FOOD_FIELDS = List.of(
            FieldDefinition.builder().businessName("Product Name").entityProperty("productName").type(FieldType.STRING).required(true).maxLength(255).build(),
            FieldDefinition.builder().businessName("Brand Name").entityProperty("brandName").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Product Category").entityProperty("productCategory").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Sub Category").entityProperty("subCategory").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Pet Type").entityProperty("petType").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Life Stage").entityProperty("lifeStage").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Breed Size").entityProperty("breedSize").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Dietary Type").entityProperty("dietaryType").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Formulation").entityProperty("formulation").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Pack Size").entityProperty("packSize").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Price").entityProperty("price").type(FieldType.DECIMAL).build(),
            FieldDefinition.builder().businessName("Manufacturer").entityProperty("manufacturer").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Availability").entityProperty("availability").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Rating").entityProperty("rating").type(FieldType.DECIMAL).build(),
            FieldDefinition.builder().businessName("Reviews Count").entityProperty("reviewsCount").type(FieldType.INTEGER).build(),
            FieldDefinition.builder().businessName("Website / Marketplace").entityProperty("websiteMarketplace").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Product URL").entityProperty("productUrl").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Source URL").entityProperty("sourceUrl").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Address").entityProperty("address").type(FieldType.STRING).build()
    );

    public static final List<FieldDefinition> ACCESSORY_FIELDS = List.of(
            FieldDefinition.builder().businessName("Business Name").entityProperty("businessName").type(FieldType.STRING).required(true).maxLength(255).build(),
            FieldDefinition.builder().businessName("Category").entityProperty("category").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Sub Category").entityProperty("subCategory").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Pet Type").entityProperty("petType").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Product Description").entityProperty("productDescription").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Price").entityProperty("price").type(FieldType.DECIMAL).build(),
            FieldDefinition.builder().businessName("Availability").entityProperty("availability").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Review Count").entityProperty("reviewCount").type(FieldType.INTEGER).build(),
            FieldDefinition.builder().businessName("Website").entityProperty("website").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Product URL").entityProperty("productUrl").type(FieldType.STRING).build()
    );

    public static final List<FieldDefinition> SERVICE_NETWORK_FIELDS = List.of(
            FieldDefinition.builder().businessName("Business Name").entityProperty("businessName").type(FieldType.STRING).required(true).maxLength(255).build(),
            FieldDefinition.builder().businessName("Service Type").entityProperty("serviceType").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("State").entityProperty("state").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("District / Region").entityProperty("districtRegion").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Area").entityProperty("area").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Address").entityProperty("address").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("City / Region").entityProperty("cityRegion").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Contact Number").entityProperty("contactNumber").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Website / Social Media").entityProperty("websiteSocialMedia").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Rating").entityProperty("rating").type(FieldType.DECIMAL).build(),
            FieldDefinition.builder().businessName("Google Maps / Source URL").entityProperty("googleMapsSourceUrl").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Booking URL / Booking Contact").entityProperty("bookingUrlContact").type(FieldType.STRING).build()
    );

    public static final List<FieldDefinition> DOCTOR_FIELDS = List.of(
            FieldDefinition.builder().businessName("Doctor Name").entityProperty("doctorName").type(FieldType.STRING).required(true).maxLength(255).build(),
            FieldDefinition.builder().businessName("Qualification").entityProperty("qualification").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Specialist").entityProperty("specialist").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Experience").entityProperty("experience").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Location").entityProperty("location").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Hospital").entityProperty("hospital").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Address").entityProperty("address").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Fee").entityProperty("fee").type(FieldType.DECIMAL).build(),
            FieldDefinition.builder().businessName("Working hrs").entityProperty("workingHours").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Doctor URL").entityProperty("doctorUrl").type(FieldType.STRING).build()
    );

    public static final List<FieldDefinition> WELFARE_NETWORK_FIELDS = List.of(
            FieldDefinition.builder().businessName("Business Name").entityProperty("businessName").type(FieldType.STRING).required(true).maxLength(255).build(),
            FieldDefinition.builder().businessName("Service Type").entityProperty("serviceType").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("State").entityProperty("state").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("District / Region").entityProperty("districtRegion").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Area").entityProperty("area").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Address").entityProperty("address").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("City / Region").entityProperty("cityRegion").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Contact Number").entityProperty("contactNumber").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Website / Social Media").entityProperty("websiteSocialMedia").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Rating").entityProperty("rating").type(FieldType.DECIMAL).build(),
            FieldDefinition.builder().businessName("Google Maps / Source URL").entityProperty("googleMapsSourceUrl").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Booking URL / Booking Contact").entityProperty("bookingUrlContact").type(FieldType.STRING).build()
    );

    
    public static final List<FieldDefinition> FASHION_DESIGNER_FIELDS = List.of(
            FieldDefinition.builder().businessName("Designer_Name").entityProperty("designerName").type(FieldType.STRING).required(true).maxLength(255).build(),
            FieldDefinition.builder().businessName("Brand_Name").entityProperty("brandName").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Specification").entityProperty("specification").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("City").entityProperty("city").type(FieldType.STRING).maxLength(150).build(),
            FieldDefinition.builder().businessName("State").entityProperty("state").type(FieldType.STRING).maxLength(150).build(),
            FieldDefinition.builder().businessName("Country").entityProperty("country").type(FieldType.STRING).maxLength(150).build(),
            FieldDefinition.builder().businessName("Website_Address").entityProperty("websiteAddress").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Official_Email").entityProperty("officialEmail").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Mobile_Number").entityProperty("mobileNumber").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Pincode").entityProperty("pincode").type(FieldType.STRING).maxLength(50).build(),
            FieldDefinition.builder().businessName("Studio_Address").entityProperty("studioAddress").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Year_of_Establishment").entityProperty("yearOfEstablishment").type(FieldType.STRING).maxLength(50).build(),
            FieldDefinition.builder().businessName("Mobile/website_verification").entityProperty("verificationStatus").type(FieldType.STRING).maxLength(100).build()
    );

    public static final List<FieldDefinition> FASHION_INSTITUTE_FIELDS = List.of(
            FieldDefinition.builder().businessName("state").entityProperty("state").type(FieldType.STRING).maxLength(150).build(),
            FieldDefinition.builder().businessName("City").entityProperty("city").type(FieldType.STRING).maxLength(150).build(),
            FieldDefinition.builder().businessName("Area").entityProperty("area").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Institute_Name").entityProperty("instituteName").type(FieldType.STRING).required(true).maxLength(500).build(),
            FieldDefinition.builder().businessName("Address").entityProperty("address").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Pincode").entityProperty("pincode").type(FieldType.STRING).maxLength(50).build(),
            FieldDefinition.builder().businessName("Phone_No").entityProperty("phoneNo").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Website").entityProperty("website").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Email_ID").entityProperty("emailId").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Map_Location").entityProperty("mapLocation").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Place_ID").entityProperty("placeId").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Verification_status").entityProperty("verificationStatus").type(FieldType.STRING).maxLength(100).build()
    );

    public static final List<FieldDefinition> COURIER_TIER1_FIELDS = List.of(
            FieldDefinition.builder().businessName("State").entityProperty("state").type(FieldType.STRING).maxLength(150).build(),
            FieldDefinition.builder().businessName("City").entityProperty("city").type(FieldType.STRING).maxLength(150).build(),
            FieldDefinition.builder().businessName("Company Name").entityProperty("companyName").type(FieldType.STRING).required(true).maxLength(500).build(),
            FieldDefinition.builder().businessName("Address").entityProperty("address").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Pincode").entityProperty("pincode").type(FieldType.STRING).maxLength(50).build(),
            FieldDefinition.builder().businessName("Phone Number").entityProperty("phoneNumber").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Rating").entityProperty("rating").type(FieldType.DECIMAL).build(),
            FieldDefinition.builder().businessName("Services").entityProperty("services").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Website").entityProperty("website").type(FieldType.STRING).build()
    );

    public static final List<FieldDefinition> PET_MANUFACTURER_FIELDS = List.of(
            FieldDefinition.builder().businessName("country").entityProperty("country").type(FieldType.STRING).maxLength(150).build(),
            FieldDefinition.builder().businessName("Manufacturer_Name").entityProperty("manufacturerName").type(FieldType.STRING).required(true).maxLength(500).build(),
            FieldDefinition.builder().businessName("Manufacturer_Address").entityProperty("manufacturerAddress").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Product_Category").entityProperty("productCategory").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Mobile_Number").entityProperty("mobileNumber").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Email_ID").entityProperty("emailId").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Website").entityProperty("website").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Export Countries").entityProperty("exportCountries").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Source URL").entityProperty("sourceUrl").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Verification").entityProperty("verification").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Analyst").entityProperty("analyst").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("command").entityProperty("command").type(FieldType.STRING).build()
    );

    public static final List<FieldDefinition> HUMAN_PET_LAB_FIELDS = List.of(
            FieldDefinition.builder().businessName("State").entityProperty("state").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("City").entityProperty("city").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Laboratory_Name").entityProperty("laboratoryName").type(FieldType.STRING).required(true).maxLength(500).build(),
            FieldDefinition.builder().businessName("Laboratory_Address").entityProperty("laboratoryAddress").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Contact_Number").entityProperty("contactNumber").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Email_ID").entityProperty("emailId").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Laboratory_Type").entityProperty("laboratoryType").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Testing_Services").entityProperty("testingServices").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Animal_Types_Covered_(N/A_for_Human_Labs)").entityProperty("animalTypesCovered").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("website").entityProperty("website").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Google_Maps_Link").entityProperty("googleMapsLink").type(FieldType.STRING).build()
    );

    public static final List<FieldDefinition> LIVESTOCK_FIELDS = List.of(
            FieldDefinition.builder().businessName("Name").entityProperty("name").type(FieldType.STRING).required(true).maxLength(500).build(),
            FieldDefinition.builder().businessName("Livestock_Type").entityProperty("livestockType").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Farm_Type").entityProperty("farmType").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Contact_Number").entityProperty("contactNumber").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Email").entityProperty("email").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Website").entityProperty("website").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Address").entityProperty("address").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Area").entityProperty("area").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("District").entityProperty("district").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("State").entityProperty("state").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Pincode").entityProperty("pincode").type(FieldType.STRING).maxLength(50).build(),
            FieldDefinition.builder().businessName("Services").entityProperty("services").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Rating").entityProperty("rating").type(FieldType.DECIMAL).build(),
            FieldDefinition.builder().businessName("Reviews_Count").entityProperty("reviewsCount").type(FieldType.INTEGER).build(),
            FieldDefinition.builder().businessName("Business_Status").entityProperty("businessStatus").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Google_Maps").entityProperty("googleMaps").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Source_URL").entityProperty("sourceUrl").type(FieldType.STRING).build()
    );

    public static final List<FieldDefinition> PHILIPPINES_PET_PRODUCTS_FIELDS = List.of(
            FieldDefinition.builder().businessName("Country").entityProperty("country").type(FieldType.STRING).maxLength(150).build(),
            FieldDefinition.builder().businessName("Product Name").entityProperty("productName").type(FieldType.STRING).required(true).maxLength(500).build(),
            FieldDefinition.builder().businessName("Brand Name").entityProperty("brandName").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Product Description").entityProperty("productDescription").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Minimum Price (PHP)").entityProperty("minimumPricePhp").type(FieldType.DECIMAL).build(),
            FieldDefinition.builder().businessName("Maximum Price (PHP)").entityProperty("maximumPricePhp").type(FieldType.DECIMAL).build(),
            FieldDefinition.builder().businessName("Current Selling Price (PHP)").entityProperty("currentSellingPricePhp").type(FieldType.DECIMAL).build(),
            FieldDefinition.builder().businessName("Availability").entityProperty("availability").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Marketplace Name").entityProperty("marketplaceName").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Product URL").entityProperty("productUrl").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Product Image URL").entityProperty("productImageUrl").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Source URL").entityProperty("sourceUrl").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Command").entityProperty("command").type(FieldType.STRING).build()
    );

    public static final List<FieldDefinition> POULTRY_FIELDS = List.of(
            FieldDefinition.builder().businessName("Name").entityProperty("name").type(FieldType.STRING).required(true).maxLength(500).build(),
            FieldDefinition.builder().businessName("Category").entityProperty("category").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Sub_Category").entityProperty("subCategory").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Phone").entityProperty("phone").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Website").entityProperty("website").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Address").entityProperty("address").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Area").entityProperty("area").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("District").entityProperty("district").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("State").entityProperty("state").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Pincode").entityProperty("pincode").type(FieldType.STRING).maxLength(50).build(),
            FieldDefinition.builder().businessName("Business_Tag").entityProperty("businessTag").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Rating").entityProperty("rating").type(FieldType.DECIMAL).build(),
            FieldDefinition.builder().businessName("Reviews").entityProperty("reviews").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Status").entityProperty("status").type(FieldType.STRING).maxLength(100).build(),
            FieldDefinition.builder().businessName("Source").entityProperty("source").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Maps_Link").entityProperty("mapsLink").type(FieldType.STRING).build(),
            FieldDefinition.builder().businessName("Analyst").entityProperty("analyst").type(FieldType.STRING).maxLength(255).build(),
            FieldDefinition.builder().businessName("Notes").entityProperty("notes").type(FieldType.STRING).build()
    );

    public static String normalizeModule(String module) {
        if (module == null) return "";
        String norm = module.toLowerCase().trim()
                .replace("&", "")
                .replace("-", "_")
                .replaceAll("\\s+", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_|_$", "");
        if (norm.contains("market") || norm.contains("research")) return "market_research";
        if (norm.contains("veterinary") || norm.contains("hospital") || norm.contains("ecosystem")) return "veterinary_ecosystem";
        if (norm.contains("hygiene")) return "hygiene_products";
        if (norm.contains("food") || norm.contains("nutrition")) return "food_products";
        if (norm.contains("access")) return "accessories";
        if (norm.contains("service")) return "service_network";
        if (norm.contains("doc")) return "doctors";
        if (norm.contains("welfare")) return "welfare_network";
        if (norm.contains("fashion_design") || norm.contains("designer")) return "fashion_designers";
        if (norm.contains("fashion_inst") || norm.contains("institute")) return "fashion_institutes";
        if (norm.contains("courier")) return "courier_tier1";
        if (norm.contains("manufacturer") || norm.contains("mfg")) return "pet_manufacturers";
        if (norm.contains("lab") || norm.contains("diagnostic")) return "human_pet_labs";
        if (norm.contains("livestock") || norm.contains("cattle") || norm.contains("dairy")) return "livestock";
        if (norm.contains("philippine") || norm.contains("php") || norm.contains("shopee")) return "philippines_pet_products";
        if (norm.contains("poultry") || norm.contains("chicken") || norm.contains("hatchery")) return "poultry";
        return norm;
    }

    public static List<FieldDefinition> getFieldsForModule(String module) {
        if (module == null) return Collections.emptyList();
        String norm = normalizeModule(module);
        return switch (norm) {
            case "market_research" -> MARKET_RESEARCH_FIELDS;
            case "veterinary_ecosystem" -> VETERINARY_ECOSYSTEM_FIELDS;
            case "hygiene_products" -> HYGIENE_FIELDS;
            case "food_products" -> FOOD_FIELDS;
            case "accessories" -> ACCESSORY_FIELDS;
            case "service_network" -> SERVICE_NETWORK_FIELDS;
            case "doctors" -> DOCTOR_FIELDS;
            case "welfare_network" -> WELFARE_NETWORK_FIELDS;
            case "fashion_designers" -> FASHION_DESIGNER_FIELDS;
            case "fashion_institutes" -> FASHION_INSTITUTE_FIELDS;
            case "courier_tier1" -> COURIER_TIER1_FIELDS;
            case "pet_manufacturers" -> PET_MANUFACTURER_FIELDS;
            case "human_pet_labs" -> HUMAN_PET_LAB_FIELDS;
            case "livestock" -> LIVESTOCK_FIELDS;
            case "philippines_pet_products" -> PHILIPPINES_PET_PRODUCTS_FIELDS;
            case "poultry" -> POULTRY_FIELDS;
            default -> Collections.emptyList();
        };
    }

    public static String getExportFilename(String module) {
        if (module == null) return "Export.xlsx";
        String norm = normalizeModule(module);
        return switch (norm) {
            case "market_research" -> "Market Research.xlsx";
            case "veterinary_ecosystem" -> "Veterinary Ecosystem.xlsx";
            case "hygiene_products" -> "Hygiene Products.xlsx";
            case "food_products" -> "Food Products.xlsx";
            case "accessories" -> "Accessories.xlsx";
            case "service_network" -> "Service Network.xlsx";
            case "doctors" -> "Doctors.xlsx";
            case "welfare_network" -> "Welfare Network.xlsx";
            case "fashion_designers" -> "Fashion Designers.xlsx";
            case "fashion_institutes" -> "Fashion Institutes.xlsx";
            case "courier_tier1" -> "Courier Tier 1.xlsx";
            case "pet_manufacturers" -> "Pet Manufacturers.xlsx";
            case "human_pet_labs" -> "Human and Pet Labs.xlsx";
            case "livestock" -> "Livestock.xlsx";
            case "philippines_pet_products" -> "Philippines Pet Products.xlsx";
            case "poultry" -> "Poultry.xlsx";
            default -> "Export.xlsx";
        };
    }
}
