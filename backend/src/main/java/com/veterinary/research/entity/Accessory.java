package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "accessories", indexes = {
        @Index(name = "idx_accessories_created_at", columnList = "created_at"),
        @Index(name = "idx_accessories_category", columnList = "category"),
        @Index(name = "idx_accessories_sub_cat", columnList = "sub_category"),
        @Index(name = "idx_accessories_pet_type", columnList = "pet_type"),
        @Index(name = "idx_accessories_price", columnList = "price")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Accessory extends BaseEntity {

    @Column(name = "business_name", length = 500)
    private String businessName;

    @Column(name = "category", length = 255)
    private String category;

    @Column(name = "sub_category", length = 255)
    private String subCategory;

    @Column(name = "pet_type", length = 255)
    private String petType;

    @Column(name = "product_description", columnDefinition = "TEXT")
    private String productDescription;

    @Column(name = "price", precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "availability", length = 100)
    private String availability;

    @Column(name = "review_count")
    private Integer reviewCount;

    @Column(name = "website", columnDefinition = "TEXT")
    private String website;

    @Column(name = "product_url", columnDefinition = "TEXT")
    private String productUrl;
}
