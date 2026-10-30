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
public class PoultryDTO {

    private Long id;

    @NotBlank(message = "Poultry Farm / Facility Name is required")
    @JsonProperty("Name")
    @JsonAlias({"name", "poultryName"})
    private String name;

    @JsonProperty("Category")
    @JsonAlias({"category"})
    private String category;

    @JsonProperty("Sub_Category")
    @JsonAlias({"subCategory", "sub_category", "Sub Category"})
    private String subCategory;

    @JsonProperty("Phone")
    @JsonAlias({"phone", "phoneNo", "mobile"})
    private String phone;

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

    @JsonProperty("Business_Tag")
    @JsonAlias({"businessTag", "business_tag", "Business Tag", "tag"})
    private String businessTag;

    @JsonProperty("Rating")
    @JsonAlias({"rating"})
    private BigDecimal rating;

    @JsonProperty("Reviews")
    @JsonAlias({"reviews", "reviewsCount"})
    private String reviews;

    @JsonProperty("Status")
    @JsonAlias({"status", "businessStatus"})
    private String status;

    @JsonProperty("Source")
    @JsonAlias({"source", "sourceUrl"})
    private String source;

    @JsonProperty("Maps_Link")
    @JsonAlias({"mapsLink", "maps_link", "Maps Link", "googleMaps"})
    private String mapsLink;

    @JsonProperty("Analyst")
    @JsonAlias({"analyst", "_"})
    private String analyst;

    @JsonProperty("Notes")
    @JsonAlias({"notes", "command", "comments"})
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

