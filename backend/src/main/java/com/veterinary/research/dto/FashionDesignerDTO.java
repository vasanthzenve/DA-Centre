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
public class FashionDesignerDTO {

    private Long id;

    @NotBlank(message = "Designer Name is required")
    @JsonProperty("Designer_Name")
    @JsonAlias({"designerName", "designer_name", "Designer Name"})
    private String designerName;

    @JsonProperty("Brand_Name")
    @JsonAlias({"brandName", "brand_name", "Brand Name"})
    private String brandName;

    @JsonProperty("Specification")
    @JsonAlias({"specification", "Specification"})
    private String specification;

    @JsonProperty("City")
    @JsonAlias({"city", "City"})
    private String city;

    @JsonProperty("State")
    @JsonAlias({"state", "State"})
    private String state;

    @JsonProperty("Country")
    @JsonAlias({"country", "Country"})
    private String country;

    @JsonProperty("Website_Address")
    @JsonAlias({"websiteAddress", "website_address", "Website Address", "website", "Website"})
    private String websiteAddress;

    @JsonProperty("Official_Email")
    @JsonAlias({"officialEmail", "official_email", "Official Email", "email", "Official_Email"})
    private String officialEmail;

    @JsonProperty("Mobile_Number")
    @JsonAlias({"mobileNumber", "mobile_number", "Mobile Number", "mobile", "phone", "Phone"})
    private String mobileNumber;

    @JsonProperty("Pincode")
    @JsonAlias({"pincode", "Pincode", "pin", "Pin"})
    private String pincode;

    @JsonProperty("Studio_Address")
    @JsonAlias({"studioAddress", "studio_address", "Studio Address", "address", "Address"})
    private String studioAddress;

    @JsonProperty("Year_of_Establishment")
    @JsonAlias({"yearOfEstablishment", "year_of_establishment", "Year of Establishment", "Year_of_Establishment", "year"})
    private String yearOfEstablishment;

    @JsonProperty("Mobile/website_verification")
    @JsonAlias({
            "verificationStatus",
            "verification_status",
            "Mobile/website_verification",
            "Mobile/website verification",
            "verification"
    })
    private String verificationStatus;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

