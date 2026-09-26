package com.veterinary.research.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "veterinary_ecosystem", indexes = {
        @Index(name = "idx_ve_created_at", columnList = "created_at"),
        @Index(name = "idx_ve_state", columnList = "state"),
        @Index(name = "idx_ve_city", columnList = "city"),
        @Index(name = "idx_ve_state_city", columnList = "state, city"),
        @Index(name = "idx_ve_business_status", columnList = "business_status"),
        @Index(name = "idx_ve_rating", columnList = "rating")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VeterinaryEcosystem extends BaseEntity {

    @Column(name = "state", length = 255)
    private String state;

    @Column(name = "city", length = 255)
    private String city;

    @Column(name = "area", columnDefinition = "TEXT")
    private String area;

    @Column(name = "hospital_name", length = 500)
    private String hospitalName;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "phone_number", length = 255)
    private String phoneNumber;

    @Column(name = "website", columnDefinition = "TEXT")
    private String website;

    @Column(name = "opening_hours", columnDefinition = "TEXT")
    private String openingHours;

    @Column(name = "rating", precision = 5, scale = 2)
    private BigDecimal rating;

    @Column(name = "reviews")
    private Integer reviews;

    @Column(name = "business_status", length = 100)
    private String businessStatus;

    @Column(name = "google_maps", columnDefinition = "TEXT")
    private String googleMaps;

    @Column(name = "place_id", length = 255)
    private String placeId;

    @Column(name = "service", columnDefinition = "TEXT")
    private String service;

    @Column(name = "online_verification", length = 100)
    private String onlineVerification;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "fashion_supply", columnDefinition = "TEXT")
    private String fashionSupply;

    @Column(name = "analyst", length = 255)
    private String analyst;

    @Column(name = "date")
    private LocalDate date;
}
