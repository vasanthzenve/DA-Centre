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
public class HygieneProductDTO {

    private Long id;

    @NotBlank(message = "Product Name is required")
    @JsonProperty("Product Name")
    @JsonAlias({"productName", "product_name"})
    private String productName;

    @JsonProperty("Brand Name")
    @JsonAlias({"brandName", "brand_name"})
    private String brandName;

    @JsonProperty("Product Category")
    @JsonAlias({"productCategory", "product_category"})
    private String productCategory;

    @JsonProperty("Sub Category")
    @JsonAlias({"subCategory", "sub_category"})
    private String subCategory;

    @JsonProperty("Pet Type")
    @JsonAlias({"petType", "pet_type"})
    private String petType;

    @JsonProperty("Formulation")
    @JsonAlias({"formulation"})
    private String formulation;

    @JsonProperty("Dosage")
    @JsonAlias({"dosage"})
    private String dosage;

    @JsonProperty("Price")
    @JsonAlias({"price"})
    private BigDecimal price;

    @JsonProperty("Pack Size")
    @JsonAlias({"packSize", "pack_size"})
    private String packSize;

    @JsonProperty("Manufacturer")
    @JsonAlias({"manufacturer"})
    private String manufacturer;

    @JsonProperty("Availability")
    @JsonAlias({"availability"})
    private String availability;

    @JsonProperty("Rating")
    @JsonAlias({"rating"})
    private BigDecimal rating;

    @JsonProperty("Reviews Count")
    @JsonAlias({"reviewsCount", "reviews_count"})
    private Integer reviewsCount;

    @JsonProperty("Product Link")
    @JsonAlias({"productLink", "product_link"})
    private String productLink;

    @JsonProperty("Product URL")
    @JsonAlias({"productUrl", "product_url"})
    private String productUrl;

    @JsonProperty("Status")
    @JsonAlias({"status"})
    private String status;

    @JsonProperty("createdAt")
    @JsonAlias({"created_at"})
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    @JsonAlias({"updated_at"})
    private LocalDateTime updatedAt;
}
