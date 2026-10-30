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
public class PetManufacturerDTO {

    private Long id;

    @JsonProperty("country")
    @JsonAlias({"country", "Country"})
    private String country;

    @NotBlank(message = "Manufacturer Name is required")
    @JsonProperty("Manufacturer_Name")
    @JsonAlias({"manufacturerName", "manufacturer_name", "Manufacturer Name", "Manufacturer_Name"})
    private String manufacturerName;

    @JsonProperty("Manufacturer_Address")
    @JsonAlias({"manufacturerAddress", "manufacturer_address", "Manufacturer Address", "address", "Address"})
    private String manufacturerAddress;

    @JsonProperty("Product_Category")
    @JsonAlias({"productCategory", "product_category", "Product Category", "category", "Product_Category"})
    private String productCategory;

    @JsonProperty("Mobile_Number")
    @JsonAlias({"mobileNumber", "mobile_number", "Mobile Number", "mobile", "phone", "Mobile_Number"})
    private String mobileNumber;

    @JsonProperty("Email_ID")
    @JsonAlias({"emailId", "email_id", "Email ID", "email", "Email_ID"})
    private String emailId;

    @JsonProperty("Website")
    @JsonAlias({"website", "Website"})
    private String website;

    @JsonProperty("Export Countries")
    @JsonAlias({"exportCountries", "export_countries", "Export Countries", "exportCountriesList"})
    private String exportCountries;

    @JsonProperty("Source URL")
    @JsonAlias({"sourceUrl", "source_url", "Source URL", "source"})
    private String sourceUrl;

    @JsonProperty("Verification")
    @JsonAlias({"verification", "Verification"})
    private String verification;

    @JsonProperty("Analyst")
    @JsonAlias({"analyst", "Analyst"})
    private String analyst;

    @JsonProperty("command")
    @JsonAlias({"command", "Command", "notes"})
    private String command;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

