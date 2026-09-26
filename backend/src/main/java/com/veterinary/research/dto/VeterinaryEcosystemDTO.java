package com.veterinary.research.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VeterinaryEcosystemDTO {

    private Long id;

    @JsonProperty("State")
    @JsonAlias({"state"})
    private String state;

    @JsonProperty("City")
    @JsonAlias({"city"})
    private String city;

    @JsonProperty("Area")
    @JsonAlias({"area"})
    private String area;

    @NotBlank(message = "Hospital Name is required")
    @JsonProperty("Hospital Name")
    @JsonAlias({"hospitalName", "hospital_name"})
    private String hospitalName;

    @JsonProperty("Address")
    @JsonAlias({"address"})
    private String address;

    @JsonProperty("Phone Number")
    @JsonAlias({"phoneNumber", "phone_number"})
    private String phoneNumber;

    @JsonProperty("Website")
    @JsonAlias({"website"})
    private String website;

    @JsonProperty("Opening Hours")
    @JsonAlias({"openingHours", "opening_hours"})
    private String openingHours;

    @JsonProperty("Rating")
    @JsonAlias({"rating"})
    private BigDecimal rating;

    @JsonProperty("Reviews")
    @JsonAlias({"reviews"})
    private Integer reviews;

    @JsonProperty("Business Status")
    @JsonAlias({"businessStatus", "business_status"})
    private String businessStatus;

    @JsonProperty("Google Maps")
    @JsonAlias({"googleMaps", "google_maps"})
    private String googleMaps;

    @JsonProperty("Place ID")
    @JsonAlias({"placeId", "place_id"})
    private String placeId;

    @JsonProperty("Service")
    @JsonAlias({"service"})
    private String service;

    @JsonProperty("Online Verification")
    @JsonAlias({"onlineVerification", "online_verification"})
    private String onlineVerification;

    @JsonProperty("Comment")
    @JsonAlias({"comment"})
    private String comment;

    @JsonProperty("Fashion supply")
    @JsonAlias({"fashionSupply", "fashion_supply"})
    private String fashionSupply;

    @JsonProperty("Analyst")
    @JsonAlias({"analyst"})
    private String analyst;

    @JsonProperty("Date")
    @JsonAlias({"date"})
    private LocalDate date;

    @JsonProperty("createdAt")
    @JsonAlias({"created_at"})
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    @JsonAlias({"updated_at"})
    private LocalDateTime updatedAt;
}
