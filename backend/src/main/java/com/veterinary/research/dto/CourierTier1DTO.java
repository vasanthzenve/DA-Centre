package com.veterinary.research.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourierTier1DTO {

    private Long id;

    @JsonProperty("State")
    @JsonAlias({"state", "State"})
    private String state;

    @JsonProperty("City")
    @JsonAlias({"city", "City"})
    private String city;

    @NotBlank(message = "Company Name is required")
    @JsonProperty("Company Name")
    @JsonAlias({"companyName", "company_name", "Company Name", "Company_Name"})
    private String companyName;

    @JsonProperty("Address")
    @JsonAlias({"address", "Address"})
    private String address;

    @JsonProperty("Pincode")
    @JsonAlias({"pincode", "Pincode", "pin", "Pin"})
    private String pincode;

    @JsonProperty("Phone Number")
    @JsonAlias({"phoneNumber", "phone_number", "Phone Number", "phone", "Phone"})
    private String phoneNumber;

    @JsonProperty("Rating")
    @JsonAlias({"rating", "Rating"})
    private Double rating;

    @JsonProperty("Services")
    @JsonAlias({"services", "Services"})
    private String services;

    @JsonProperty("Website")
    @JsonAlias({"website", "Website"})
    private String website;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

