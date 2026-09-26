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
            default -> "Export.xlsx";
        };
    }
}
