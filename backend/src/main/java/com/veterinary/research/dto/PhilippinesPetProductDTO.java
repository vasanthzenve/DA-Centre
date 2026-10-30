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
public class PhilippinesPetProductDTO {

    private Long id;

    @JsonProperty("Country")
    @JsonAlias({"country"})
    private String country;

    @NotBlank(message = "Product Name is required")
    @JsonProperty("Product Name")
    @JsonAlias({"productName", "product_name", "Product_Name"})
    private String productName;

    @JsonProperty("Brand Name")
    @JsonAlias({"brandName", "brand_name", "Brand_Name"})
    private String brandName;

    @JsonProperty("Product Description")
    @JsonAlias({"productDescription", "product_description", "Product_Description", "description"})
    private String productDescription;

    @JsonProperty("Minimum Price (PHP)")
    @JsonAlias({"minimumPricePhp", "minimum_price_php", "minPrice", "Minimum Price"})
    private BigDecimal minimumPricePhp;

    @JsonProperty("Maximum Price (PHP)")
    @JsonAlias({"maximumPricePhp", "maximum_price_php", "maxPrice", "Maximum Price"})
    private BigDecimal maximumPricePhp;

    @JsonProperty("Current Selling Price (PHP)")
    @JsonAlias({"currentSellingPricePhp", "current_selling_price_php", "price", "sellingPrice", "Current Selling Price"})
    private BigDecimal currentSellingPricePhp;

    @JsonProperty("Availability")
    @JsonAlias({"availability"})
    private String availability;

    @JsonProperty("Marketplace Name")
    @JsonAlias({"marketplaceName", "marketplace_name", "Marketplace_Name", "marketplace"})
    private String marketplaceName;

    @JsonProperty("Product URL")
    @JsonAlias({"productUrl", "product_url", "Product_URL"})
    private String productUrl;

    @JsonProperty("Product Image URL")
    @JsonAlias({"productImageUrl", "product_image_url", "Product_Image_URL", "imageUrl"})
    private String productImageUrl;

    @JsonProperty("Source URL")
    @JsonAlias({"sourceUrl", "source_url", "Source_URL"})
    private String sourceUrl;

    @JsonProperty("Command")
    @JsonAlias({"command", "Command", "comments"})
    private String command;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

