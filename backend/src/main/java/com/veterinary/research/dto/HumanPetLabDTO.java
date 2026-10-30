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
public class HumanPetLabDTO {

    private Long id;

    @JsonProperty("State")
    @JsonAlias({"state", "State"})
    private String state;

    @JsonProperty("City")
    @JsonAlias({"city", "City"})
    private String city;

    @NotBlank(message = "Laboratory Name is required")
    @JsonProperty("Laboratory_Name")
    @JsonAlias({"laboratoryName", "laboratory_name", "Laboratory Name"})
    private String laboratoryName;

    @JsonProperty("Laboratory_Address")
    @JsonAlias({"laboratoryAddress", "laboratory_address", "Laboratory Address", "address"})
    private String laboratoryAddress;

    @JsonProperty("Contact_Number")
    @JsonAlias({"contactNumber", "contact_number", "Contact Number", "phone"})
    private String contactNumber;

    @JsonProperty("Email_ID")
    @JsonAlias({"emailId", "email_id", "Email ID", "Email_ID", "email"})
    private String emailId;

    @JsonProperty("Laboratory_Type")
    @JsonAlias({"laboratoryType", "laboratory_type", "Laboratory Type", "type"})
    private String laboratoryType;

    @JsonProperty("Testing_Services")
    @JsonAlias({"testingServices", "testing_services", "Testing Services", "services"})
    private String testingServices;

    @JsonProperty("Animal_Types_Covered_(N/A_for_Human_Labs)")
    @JsonAlias({
            "animalTypesCovered",
            "animal_types_covered",
            "Animal_Types_Covered",
            "Animal Types Covered (N/A for Human Labs)",
            "animalTypes"
    })
    private String animalTypesCovered;

    @JsonProperty("website")
    @JsonAlias({"Website", "website"})
    private String website;

    @JsonProperty("Google_Maps_Link")
    @JsonAlias({"googleMapsLink", "google_maps_link", "Google Maps Link", "mapsLink"})
    private String googleMapsLink;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

