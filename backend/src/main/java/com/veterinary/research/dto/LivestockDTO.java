package com.veterinary.research.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LivestockDTO {

    private Long id;

    @NotBlank(message = "Farm or Livestock Name is required")
    @JsonProperty("Name")
    @JsonAlias({"name", "farmName"})
    private String name;

    @JsonProperty("Livestock_Type")
    @JsonAlias({"livestockType", "livestock_type", "Livestock Type", "type"})
    private String livestockType;

    @JsonProperty("Farm_Type")
    @JsonAlias({"farmType", "farm_type", "Farm Type"})
    private String farmType;

    @JsonProperty("Contact_Number")
    @JsonAlias({"contactNumber", "contact_number", "Contact Number", "phone"})
    private String contactNumber;

    @JsonProperty("Email")
    @JsonAlias({"email", "Email_ID"})
    private String email;

    @JsonProperty("Website")
    @JsonAlias({"website", "web"})
    private String website;

    @JsonProperty("Address")
    @JsonAlias({"address"})
    private String address;

    @JsonProperty("Area")
    @JsonAlias({"area"})
    private String area;

    @JsonProperty("District")
    @JsonAlias({"district"})
    private String district;

    @JsonProperty("State")
    @JsonAlias({"state"})
    private String state;

    @JsonProperty("Pincode")
    @JsonAlias({"pincode"})
    private String pincode;

    @JsonProperty("Services")
    @JsonAlias({"services"})
    private String services;

    @JsonProperty("Rating")
    @JsonAlias({"rating"})
    private BigDecimal rating;

    @JsonProperty("Reviews_Count")
    @JsonAlias({"reviewsCount", "reviews_count", "Reviews Count", "reviews"})
    private Integer reviewsCount;

    @JsonProperty("Business_Status")
    @JsonAlias({"businessStatus", "business_status", "Business Status", "status"})
    private String businessStatus;

    @JsonProperty("Google_Maps")
    @JsonAlias({"googleMaps", "google_maps", "Google Maps", "mapsLink"})
    private String googleMaps;

    @JsonProperty("Source_URL")
    @JsonAlias({"sourceUrl", "source_url", "Source URL", "source"})
    private String sourceUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

