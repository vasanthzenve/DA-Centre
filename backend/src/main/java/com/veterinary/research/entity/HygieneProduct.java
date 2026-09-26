package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "hygiene_products", indexes = {
        @Index(name = "idx_hygiene_created_at", columnList = "created_at"),
        @Index(name = "idx_hygiene_brand_name", columnList = "brand_name"),
        @Index(name = "idx_hygiene_category", columnList = "product_category"),
        @Index(name = "idx_hygiene_sub_cat", columnList = "sub_category"),
        @Index(name = "idx_hygiene_pet_type", columnList = "pet_type"),
        @Index(name = "idx_hygiene_price", columnList = "price"),
        @Index(name = "idx_hygiene_rating", columnList = "rating")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HygieneProduct extends BaseEntity {

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

    @Column(name = "formulation", columnDefinition = "TEXT")
    private String formulation;

    @Column(name = "dosage", columnDefinition = "TEXT")
    private String dosage;

    @Column(name = "price", precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "pack_size", length = 255)
    private String packSize;

    @Column(name = "manufacturer", length = 255)
    private String manufacturer;

    @Column(name = "availability", length = 100)
    private String availability;

    @Column(name = "rating", precision = 5, scale = 2)
    private BigDecimal rating;

    @Column(name = "reviews_count")
    private Integer reviewsCount;

    @Column(name = "product_link", columnDefinition = "TEXT")
    private String productLink;

    @Column(name = "product_url", columnDefinition = "TEXT")
    private String productUrl;

    @Column(name = "status", length = 100)
    private String status;
}
