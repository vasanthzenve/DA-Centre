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
public class FoodProductDTO {

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

    @JsonProperty("Life Stage")
    @JsonAlias({"lifeStage", "life_stage"})
    private String lifeStage;

    @JsonProperty("Breed Size")
    @JsonAlias({"breedSize", "breed_size"})
    private String breedSize;

    @JsonProperty("Dietary Type")
    @JsonAlias({"dietaryType", "dietary_type"})
    private String dietaryType;

    @JsonProperty("Formulation")
    @JsonAlias({"formulation"})
    private String formulation;

    @JsonProperty("Pack Size")
    @JsonAlias({"packSize", "pack_size"})
    private String packSize;

    @JsonProperty("Price")
    @JsonAlias({"price"})
    private BigDecimal price;

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

    @JsonProperty("Website / Marketplace")
    @JsonAlias({"websiteMarketplace", "website_marketplace"})
    private String websiteMarketplace;

    @JsonProperty("Product URL")
    @JsonAlias({"productUrl", "product_url"})
    private String productUrl;

    @JsonProperty("Source URL")
    @JsonAlias({"sourceUrl", "source_url"})
    private String sourceUrl;

    @JsonProperty("Address")
    @JsonAlias({"address"})
    private String address;

    @JsonProperty("createdAt")
    @JsonAlias({"created_at"})
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    @JsonAlias({"updated_at"})
    private LocalDateTime updatedAt;
}
