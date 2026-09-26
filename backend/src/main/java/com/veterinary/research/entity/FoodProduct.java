package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "food_products", indexes = {
        @Index(name = "idx_food_created_at", columnList = "created_at"),
        @Index(name = "idx_food_brand_name", columnList = "brand_name"),
        @Index(name = "idx_food_category", columnList = "product_category"),
        @Index(name = "idx_food_sub_cat", columnList = "sub_category"),
        @Index(name = "idx_food_pet_type", columnList = "pet_type"),
        @Index(name = "idx_food_life_stage", columnList = "life_stage"),
        @Index(name = "idx_food_price", columnList = "price"),
        @Index(name = "idx_food_rating", columnList = "rating")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodProduct extends BaseEntity {

    @Column(name = "product_name", columnDefinition = "TEXT")
    private String productName;

    @Column(name = "brand_name", length = 255)
    private String brandName;

    @Column(name = "product_category", length = 255)
    private String productCategory;

    @Column(name = "sub_category", length = 255)
    private String subCategory;

    @Column(name = "pet_type", length = 255)
    private String petType;

    @Column(name = "life_stage", length = 255)
    private String lifeStage;

    @Column(name = "breed_size", length = 255)
    private String breedSize;

    @Column(name = "dietary_type", columnDefinition = "TEXT")
    private String dietaryType;

    @Column(name = "formulation", columnDefinition = "TEXT")
    private String formulation;

    @Column(name = "pack_size", length = 255)
    private String packSize;

    @Column(name = "price", precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "manufacturer", length = 255)
    private String manufacturer;

    @Column(name = "availability", length = 100)
    private String availability;

    @Column(name = "rating", precision = 5, scale = 2)
    private BigDecimal rating;

    @Column(name = "reviews_count")
    private Integer reviewsCount;

    @Column(name = "website_marketplace", columnDefinition = "TEXT")
    private String websiteMarketplace;

    @Column(name = "product_url", columnDefinition = "TEXT")
    private String productUrl;

    @Column(name = "source_url", columnDefinition = "TEXT")
    private String sourceUrl;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;
}
