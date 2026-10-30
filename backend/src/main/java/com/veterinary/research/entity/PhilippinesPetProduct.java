package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "philippines_pet_products", indexes = {
        @Index(name = "idx_ph_pet_products_created_at", columnList = "created_at"),
        @Index(name = "idx_ph_pet_products_name", columnList = "product_name"),
        @Index(name = "idx_ph_pet_products_brand", columnList = "brand_name"),
        @Index(name = "idx_ph_pet_products_marketplace", columnList = "marketplace_name"),
        @Index(name = "idx_ph_pet_products_price", columnList = "current_selling_price_php")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhilippinesPetProduct extends BaseEntity {

    @Column(name = "country", length = 150)
    private String country;

    @Column(name = "product_name", length = 500)
    private String productName;

    @Column(name = "brand_name", length = 255)
    private String brandName;

    @Column(name = "product_description", columnDefinition = "TEXT")
    private String productDescription;

    @Column(name = "minimum_price_php", precision = 12, scale = 2)
    private BigDecimal minimumPricePhp;

    @Column(name = "maximum_price_php", precision = 12, scale = 2)
    private BigDecimal maximumPricePhp;

    @Column(name = "current_selling_price_php", precision = 12, scale = 2)
    private BigDecimal currentSellingPricePhp;

    @Column(name = "availability", length = 100)
    private String availability;

    @Column(name = "marketplace_name", length = 255)
    private String marketplaceName;

    @Column(name = "product_url", columnDefinition = "TEXT")
    private String productUrl;

    @Column(name = "product_image_url", columnDefinition = "TEXT")
    private String productImageUrl;

    @Column(name = "source_url", columnDefinition = "TEXT")
    private String sourceUrl;

    @Column(name = "command", columnDefinition = "TEXT")
    private String command;
}

