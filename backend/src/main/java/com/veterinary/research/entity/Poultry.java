package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "poultry", indexes = {
        @Index(name = "idx_poultry_created_at", columnList = "created_at"),
        @Index(name = "idx_poultry_name", columnList = "name"),
        @Index(name = "idx_poultry_category", columnList = "category"),
        @Index(name = "idx_poultry_district", columnList = "district"),
        @Index(name = "idx_poultry_state", columnList = "state")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Poultry extends BaseEntity {

    @Column(name = "name", length = 500)
    private String name;

    @Column(name = "category", length = 255)
    private String category;

    @Column(name = "sub_category", length = 255)
    private String subCategory;

    @Column(name = "phone", length = 100)
    private String phone;

    @Column(name = "website", columnDefinition = "TEXT")
    private String website;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "area", length = 255)
    private String area;

    @Column(name = "district", length = 255)
    private String district;

    @Column(name = "state", length = 255)
    private String state;

    @Column(name = "pincode", length = 50)
    private String pincode;

    @Column(name = "business_tag", length = 255)
    private String businessTag;

    @Column(name = "rating", precision = 3, scale = 1)
    private BigDecimal rating;

    @Column(name = "reviews", length = 100)
    private String reviews;

    @Column(name = "status", length = 100)
    private String status;

    @Column(name = "source", length = 255)
    private String source;

    @Column(name = "maps_link", columnDefinition = "TEXT")
    private String mapsLink;

    @Column(name = "analyst", length = 255)
    private String analyst;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}

