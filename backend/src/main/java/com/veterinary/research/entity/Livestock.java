package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "livestock", indexes = {
        @Index(name = "idx_livestock_created_at", columnList = "created_at"),
        @Index(name = "idx_livestock_name", columnList = "name"),
        @Index(name = "idx_livestock_type", columnList = "livestock_type"),
        @Index(name = "idx_livestock_state", columnList = "state"),
        @Index(name = "idx_livestock_district", columnList = "district"),
        @Index(name = "idx_livestock_rating", columnList = "rating")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Livestock extends BaseEntity {

    @Column(name = "name", length = 500)
    private String name;

    @Column(name = "livestock_type", length = 255)
    private String livestockType;

    @Column(name = "farm_type", length = 255)
    private String farmType;

    @Column(name = "contact_number", length = 100)
    private String contactNumber;

    @Column(name = "email", length = 255)
    private String email;

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

    @Column(name = "services", columnDefinition = "TEXT")
    private String services;

    @Column(name = "rating", precision = 3, scale = 1)
    private BigDecimal rating;

    @Column(name = "reviews_count")
    private Integer reviewsCount;

    @Column(name = "business_status", length = 100)
    private String businessStatus;

    @Column(name = "google_maps", columnDefinition = "TEXT")
    private String googleMaps;

    @Column(name = "source_url", columnDefinition = "TEXT")
    private String sourceUrl;
}

