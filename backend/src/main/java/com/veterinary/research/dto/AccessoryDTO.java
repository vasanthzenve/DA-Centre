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
public class AccessoryDTO {

    private Long id;

    @NotBlank(message = "Business Name is required")
    @JsonProperty("Business Name")
    @JsonAlias({"businessName", "business_name"})
    private String businessName;

    @JsonProperty("Category")
    @JsonAlias({"category"})
    private String category;

    @JsonProperty("Sub Category")
    @JsonAlias({"subCategory", "sub_category"})
    private String subCategory;

    @JsonProperty("Pet Type")
    @JsonAlias({"petType", "pet_type"})
    private String petType;

    @JsonProperty("Product Description")
    @JsonAlias({"productDescription", "product_description"})
    private String productDescription;

    @JsonProperty("Price")
    @JsonAlias({"price"})
    private BigDecimal price;

    @JsonProperty("Availability")
    @JsonAlias({"availability"})
    private String availability;

    @JsonProperty("Review Count")
    @JsonAlias({"reviewCount", "review_count"})
    private Integer reviewCount;

    @JsonProperty("Website")
    @JsonAlias({"website"})
    private String website;

    @JsonProperty("Product URL")
    @JsonAlias({"productUrl", "product_url"})
    private String productUrl;

    @JsonProperty("createdAt")
    @JsonAlias({"created_at"})
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    @JsonAlias({"updated_at"})
    private LocalDateTime updatedAt;
}
