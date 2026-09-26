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
public class MarketResearchDTO {

    private Long id;

    @JsonProperty("States")
    @JsonAlias({"states"})
    private String states;

    @NotBlank(message = "Company is required")
    @JsonProperty("Company")
    @JsonAlias({"company"})
    private String company;

    @JsonProperty("Founded")
    @JsonAlias({"founded"})
    private String founded;

    @JsonProperty("Cities")
    @JsonAlias({"cities"})
    private String cities;

    @JsonProperty("Model")
    @JsonAlias({"model"})
    private String model;

    @JsonProperty("Scale")
    @JsonAlias({"scale"})
    private String scale;

    @JsonProperty("Funding")
    @JsonAlias({"funding"})
    private String funding;

    @JsonProperty("Service")
    @JsonAlias({"service"})
    private String service;

    @JsonProperty("Revenue")
    @JsonAlias({"revenue"})
    private String revenue;

    @JsonProperty("Target Segment")
    @JsonAlias({"targetSegment", "target_segment"})
    private String targetSegment;

    @JsonProperty("Price")
    @JsonAlias({"price"})
    private String price;

    @JsonProperty("Product")
    @JsonAlias({"product"})
    private String product;

    @JsonProperty("Technology")
    @JsonAlias({"technology"})
    private String technology;

    @JsonProperty("createdAt")
    @JsonAlias({"created_at"})
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    @JsonAlias({"updated_at"})
    private LocalDateTime updatedAt;
}
