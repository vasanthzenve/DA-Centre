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
public class FashionInstituteDTO {

    private Long id;

    @JsonProperty("state")
    @JsonAlias({"state", "State"})
    private String state;

    @JsonProperty("City")
    @JsonAlias({"city", "City"})
    private String city;

    @JsonProperty("Area")
    @JsonAlias({"area", "Area"})
    private String area;

    @NotBlank(message = "Institute Name is required")
    @JsonProperty("Institute_Name")
    @JsonAlias({"instituteName", "institute_name", "Institute Name", "Institute_Name"})
    private String instituteName;

    @JsonProperty("Address")
    @JsonAlias({"address", "Address"})
    private String address;

    @JsonProperty("Pincode")
    @JsonAlias({"pincode", "Pincode", "pin", "Pin"})
    private String pincode;

    @JsonProperty("Phone_No")
    @JsonAlias({"phoneNo", "phone_no", "Phone No", "Phone Number", "phone", "Phone_No"})
    private String phoneNo;

    @JsonProperty("Website")
    @JsonAlias({"website", "Website"})
    private String website;

    @JsonProperty("Email_ID")
    @JsonAlias({"emailId", "email_id", "Email ID", "Email_ID", "email"})
    private String emailId;

    @JsonProperty("Map_Location")
    @JsonAlias({"mapLocation", "map_location", "Map Location", "Map_Location", "maps"})
    private String mapLocation;

    @JsonProperty("Place_ID")
    @JsonAlias({"placeId", "place_id", "Place ID", "Place_ID"})
    private String placeId;

    @JsonProperty("Verification_status")
    @JsonAlias({
            "verificationStatus",
            "verification_status",
            "Verification_status",
            "Verification status",
            "verification"
    })
    private String verificationStatus;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

