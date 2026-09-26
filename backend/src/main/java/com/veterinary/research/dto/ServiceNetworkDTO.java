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
public class ServiceNetworkDTO {

    private Long id;

    @NotBlank(message = "Business Name is required")
    @JsonProperty("Business Name")
    @JsonAlias({"businessName", "business_name"})
    private String businessName;

    @JsonProperty("Service Type")
    @JsonAlias({"serviceType", "service_type"})
    private String serviceType;

    @JsonProperty("State")
    @JsonAlias({"state"})
    private String state;

    @JsonProperty("District / Region")
    @JsonAlias({"districtRegion", "district_region"})
    private String districtRegion;

    @JsonProperty("Area")
    @JsonAlias({"area"})
    private String area;

    @JsonProperty("Address")
    @JsonAlias({"address"})
    private String address;

    @JsonProperty("City / Region")
    @JsonAlias({"cityRegion", "city_region"})
    private String cityRegion;

    @JsonProperty("Contact Number")
    @JsonAlias({"contactNumber", "contact_number"})
    private String contactNumber;

    @JsonProperty("Website / Social Media")
    @JsonAlias({"websiteSocialMedia", "website_social_media"})
    private String websiteSocialMedia;

    @JsonProperty("Rating")
    @JsonAlias({"rating"})
    private BigDecimal rating;

    @JsonProperty("Google Maps / Source URL")
    @JsonAlias({"googleMapsSourceUrl", "google_maps_source_url"})
    private String googleMapsSourceUrl;

    @JsonProperty("Booking URL / Booking Contact")
    @JsonAlias({"bookingUrlContact", "booking_url_contact"})
    private String bookingUrlContact;

    @JsonProperty("createdAt")
    @JsonAlias({"created_at"})
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    @JsonAlias({"updated_at"})
    private LocalDateTime updatedAt;
}
