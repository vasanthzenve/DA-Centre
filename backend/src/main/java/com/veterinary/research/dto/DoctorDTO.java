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
public class DoctorDTO {

    private Long id;

    @NotBlank(message = "Doctor Name is required")
    @JsonProperty("Doctor Name")
    @JsonAlias({"doctorName", "doctor_name"})
    private String doctorName;

    @JsonProperty("Qualification")
    @JsonAlias({"qualification"})
    private String qualification;

    @JsonProperty("Specialist")
    @JsonAlias({"specialist"})
    private String specialist;

    @JsonProperty("Experience")
    @JsonAlias({"experience"})
    private String experience;

    @JsonProperty("Location")
    @JsonAlias({"location"})
    private String location;

    @JsonProperty("Hospital")
    @JsonAlias({"hospital"})
    private String hospital;

    @JsonProperty("Address")
    @JsonAlias({"address"})
    private String address;

    @JsonProperty("Fee")
    @JsonAlias({"fee"})
    private BigDecimal fee;

    @JsonProperty("Working hrs")
    @JsonAlias({"workingHours", "working_hrs"})
    private String workingHours;

    @JsonProperty("Doctor URL")
    @JsonAlias({"doctorUrl", "doctor_url"})
    private String doctorUrl;

    @JsonProperty("createdAt")
    @JsonAlias({"created_at"})
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    @JsonAlias({"updated_at"})
    private LocalDateTime updatedAt;
}
